import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getAuthenticatedUser, AuthError } from '@/lib/auth';
import { getFunnelMetrics } from '@/lib/queries/funnel-metrics';
import { getAccountScores } from '@/lib/queries/account-scores';
import { getRepKpis } from '@/lib/queries/rep-kpis';
import { getActiveStrategyConfig } from '@/lib/queries/strategy-config';
import { buildSystemPrompt } from '@/lib/brain/system-prompt';
import {
  summarizeFunnelMetrics,
  summarizeAccountScores,
  summarizeRepKpis,
  buildDataContext,
} from '@/lib/brain/data-summarizer';
import { Market, SalesMotion, FunnelStage } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    await getAuthenticatedUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: e.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    throw e;
  }

  // Parse optional filters from request body
  let filters: { market?: Market; motion?: SalesMotion; stage?: FunnelStage } = {};
  try {
    const body = await request.json();
    filters = body ?? {};
  } catch {
    // Empty body is fine — no filters applied
  }

  try {
    // Fetch data in parallel
    const [strategyConfig, funnelMetrics, accountScores, repKpis] = await Promise.all([
      getActiveStrategyConfig(),
      getFunnelMetrics({
        market: filters.market,
        motion: filters.motion,
        stage: filters.stage,
        limit: 500,
      }),
      getAccountScores({ limit: 200 }),
      getRepKpis({ limit: 500 }),
    ]);

    // Summarize data for the LLM
    const funnelSummary = summarizeFunnelMetrics(funnelMetrics);
    const scoreSummary = summarizeAccountScores(accountScores);
    const repSummary = summarizeRepKpis(repKpis);
    const dataContext = buildDataContext(funnelSummary, scoreSummary, repSummary);

    // Build strategy-aware system prompt
    const systemPrompt = buildSystemPrompt(strategyConfig);

    // Stream the response
    const result = streamText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze the following GTM data and produce your insights as a JSON array.

${dataContext}

Return ONLY a valid JSON array of insight objects. No markdown, no explanation outside the JSON.`,
        },
      ],
      temperature: 0.3,
    });

    return result.toTextStreamResponse();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
