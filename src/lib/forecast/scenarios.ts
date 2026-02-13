import {
  ConversionRateMap,
  parseKey,
  aggregatePipeline,
} from './conversion-rates';
import { getRevenueType, FORECASTABLE_STAGES } from './revenue-types';
import {
  DailyFunnelMetric,
  AccountScore,
  ForecastScenario,
  RevenueType,
  SalesMotion,
  Market,
} from '@/types/database';

export interface ForecastSegment {
  scenario: ForecastScenario;
  revenue_type: RevenueType;
  motion: SalesMotion;
  market: Market;
  projected_revenue: number;
  conversion_rate_used: number;
  pipeline_included: number;
  deal_count: number;
}

/**
 * Generates all forecast segments for a given scenario using the appropriate
 * conversion rate selector and pipeline filter.
 */
function generateScenarioSegments(
  scenario: ForecastScenario,
  conversionRates: ConversionRateMap,
  pipeline: Map<string, { totalPipeline: number; totalRevenue: number; avgLeads: number; days: number }>,
  momentumScores: Map<string, number>,
  avgGrr: number
): ForecastSegment[] {
  const segments: ForecastSegment[] = [];

  for (const [key, stats] of Object.entries(conversionRates)) {
    const { stage, motion, market } = parseKey(key);

    // Only forecast from revenue-producing stages
    if (!FORECASTABLE_STAGES.includes(stage)) continue;

    const revenueType = getRevenueType(stage);
    if (!revenueType) continue;

    const pipelineData = pipeline.get(key);
    if (!pipelineData) continue;

    // Select conversion rate based on scenario
    let convRate: number;
    let pipelineMultiplier = 1.0;

    switch (scenario) {
      case 'best_case':
        // Optimistic: use 75th percentile conversion, include all pipeline
        convRate = stats.p75;
        pipelineMultiplier = 1.0;
        break;

      case 'commit':
        // Conservative: median conversion, only high-momentum pipeline
        convRate = stats.median;
        // Reduce pipeline based on proportion of high-momentum deals
        pipelineMultiplier = getHighMomentumRatio(momentumScores);
        break;

      case 'most_likely':
        // Balanced: mean conversion with momentum weighting
        convRate = stats.mean;
        pipelineMultiplier = getMomentumWeightedRatio(momentumScores);
        break;
    }

    // Calculate projected revenue
    let projectedRevenue = pipelineData.totalPipeline * convRate * pipelineMultiplier;

    // For renewals, apply GRR adjustment
    if (revenueType === 'renewals') {
      projectedRevenue *= avgGrr;
    }

    // Project forward 90 days based on daily run rate
    const dailyRate = projectedRevenue / Math.max(pipelineData.days, 1);
    const projected90Day = dailyRate * 90;

    segments.push({
      scenario,
      revenue_type: revenueType,
      motion,
      market,
      projected_revenue: Math.round(projected90Day * 100) / 100,
      conversion_rate_used: Math.round(convRate * 10000) / 10000,
      pipeline_included: Math.round(pipelineData.totalPipeline * pipelineMultiplier * 100) / 100,
      deal_count: Math.round(pipelineData.avgLeads * pipelineMultiplier),
    });
  }

  return segments;
}

/**
 * Ratio of deals with momentum score > 70 (for Commit scenario)
 */
function getHighMomentumRatio(scores: Map<string, number>): number {
  if (scores.size === 0) return 0.5; // default if no scores
  const high = Array.from(scores.values()).filter((s) => s > 70).length;
  return Math.max(0.1, high / scores.size);
}

/**
 * Weighted ratio based on momentum distribution (for Most Likely scenario)
 */
function getMomentumWeightedRatio(scores: Map<string, number>): number {
  if (scores.size === 0) return 0.6; // default
  const avgScore = Array.from(scores.values()).reduce((s, v) => s + v, 0) / scores.size;
  return Math.max(0.2, Math.min(1.0, avgScore / 100));
}

/**
 * Main forecast calculation function.
 * Returns segments for all three scenarios.
 */
export function calculateForecasts(
  metrics: DailyFunnelMetric[],
  scores: AccountScore[],
  conversionRates: ConversionRateMap,
  avgGrr: number
): ForecastSegment[] {
  const pipeline = aggregatePipeline(metrics);

  // Build momentum score map from deal_momentum scores
  const momentumScores = new Map<string, number>();
  for (const score of scores) {
    if (score.score_type === 'deal_momentum') {
      momentumScores.set(score.account_id, Number(score.score_value));
    }
  }

  const scenarios: ForecastScenario[] = ['best_case', 'commit', 'most_likely'];
  const allSegments: ForecastSegment[] = [];

  for (const scenario of scenarios) {
    const segments = generateScenarioSegments(
      scenario,
      conversionRates,
      pipeline,
      momentumScores,
      avgGrr
    );
    allSegments.push(...segments);
  }

  return allSegments;
}
