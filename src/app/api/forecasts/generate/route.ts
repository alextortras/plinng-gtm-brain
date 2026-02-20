import { NextResponse } from 'next/server';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import { getFunnelMetrics } from '@/lib/queries/funnel-metrics';
import { getAccountScores } from '@/lib/queries/account-scores';
import { getRepKpis } from '@/lib/queries/rep-kpis';
import { insertForecasts } from '@/lib/queries/forecasts';
import { computeConversionRates } from '@/lib/forecast/conversion-rates';
import { calculateForecasts } from '@/lib/forecast/scenarios';
import { generateDealExplanations } from '@/lib/forecast/explainer';

export async function POST() {
  try {
    await getAuthenticatedUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  try {
    // Fetch all data needed for forecasting
    const [metrics, scores, kpis] = await Promise.all([
      getFunnelMetrics({ limit: 10000 }),
      getAccountScores({ limit: 1000 }),
      getRepKpis({ role: 'csm', limit: 1000 }),
    ]);

    // Compute conversion rates from historical data
    const conversionRates = computeConversionRates(metrics);

    // Compute average GRR from CSM metrics for renewal forecasting
    const grrValues = kpis
      .map((k) => k.grr)
      .filter((v): v is number => v !== null)
      .map(Number);
    const avgGrr = grrValues.length > 0
      ? grrValues.reduce((s, v) => s + v, 0) / grrValues.length
      : 0.92; // default GRR

    // Calculate all forecast segments
    const segments = calculateForecasts(metrics, scores, conversionRates, avgGrr);

    // Generate deal explanations
    const explanations = await generateDealExplanations(scores);

    // Prepare forecast records with shared generation timestamp
    const generatedAt = new Date().toISOString();
    const forecastRecords = segments.map((segment) => ({
      generated_at: generatedAt,
      scenario: segment.scenario,
      revenue_type: segment.revenue_type,
      funnel_stage: segment.funnel_stage,
      motion: segment.motion,
      market: segment.market,
      channel: segment.channel,
      projected_revenue: segment.projected_revenue,
      conversion_rate_used: segment.conversion_rate_used,
      pipeline_included: segment.pipeline_included,
      deal_count: segment.deal_count,
      explanations: explanations
        .filter((e) => e.likelihood > 0)
        .slice(0, 5)
        .map((e) => ({
          account_id: e.account_id,
          explanation: e.explanation,
          likelihood: e.likelihood,
        })),
    }));

    // Store forecasts
    await insertForecasts(forecastRecords);

    return NextResponse.json({
      data: {
        generated_at: generatedAt,
        segments: forecastRecords,
        explanations,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
