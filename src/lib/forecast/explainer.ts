import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { AccountScore } from '@/types/database';

export interface DealExplanation {
  account_id: string;
  explanation: string;
  likelihood: number;
}

/**
 * Generate natural-language explanations for the top deals contributing to the forecast.
 * Uses Claude to explain why each deal is likely or unlikely to close.
 */
export async function generateDealExplanations(
  scores: AccountScore[],
  topN: number = 10
): Promise<DealExplanation[]> {
  // Get latest score per account for deal_momentum type
  const latestScores = new Map<string, AccountScore>();
  for (const score of scores) {
    if (score.score_type !== 'deal_momentum') continue;
    const existing = latestScores.get(score.account_id);
    if (!existing || new Date(score.score_date) > new Date(existing.score_date)) {
      latestScores.set(score.account_id, score);
    }
  }

  // Sort by score value descending and take top N
  const topDeals = Array.from(latestScores.values())
    .sort((a, b) => Number(b.score_value) - Number(a.score_value))
    .slice(0, topN);

  if (topDeals.length === 0) {
    return [];
  }

  const dealSummaries = topDeals.map((deal) => ({
    account_id: deal.account_id,
    score: Number(deal.score_value),
    is_stalled: deal.is_stalled,
    stalled_since: deal.stalled_since,
    factors: deal.contributing_factors,
  }));

  try {
    const result = await streamText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      system: `You are a B2B SaaS revenue analyst. Generate concise deal likelihood explanations.
For each deal, explain in 1-2 sentences why it is likely or unlikely to close based on the provided data.
Return a JSON array of objects with "account_id", "explanation", and "likelihood" (0-100) fields.
Return ONLY the JSON array, no other text.`,
      messages: [
        {
          role: 'user',
          content: `Analyze these deals and explain their likelihood to close:\n${JSON.stringify(dealSummaries, null, 2)}`,
        },
      ],
      temperature: 0.2,
    });

    let accumulated = '';
    for await (const chunk of result.textStream) {
      accumulated += chunk;
    }

    // Parse the AI response
    try {
      const parsed = JSON.parse(accumulated);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          account_id: String(item.account_id),
          explanation: String(item.explanation),
          likelihood: Number(item.likelihood),
        }));
      }
    } catch {
      // Try to extract array from response
      const match = accumulated.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => ({
            account_id: String(item.account_id),
            explanation: String(item.explanation),
            likelihood: Number(item.likelihood),
          }));
        }
      }
    }
  } catch {
    // If AI call fails, generate basic explanations from data
  }

  // Fallback: generate explanations from data without AI
  return topDeals.map((deal) => {
    const score = Number(deal.score_value);
    let explanation: string;

    if (deal.is_stalled) {
      explanation = `Deal stalled since ${deal.stalled_since ?? 'unknown date'}. Score: ${score}/100. No active next step recorded.`;
    } else if (score > 70) {
      explanation = `High momentum (${score}/100). Strong pipeline velocity and active engagement signals.`;
    } else if (score > 40) {
      explanation = `Moderate momentum (${score}/100). Progressing but may need attention to accelerate.`;
    } else {
      explanation = `Low momentum (${score}/100). At risk of stalling or loss without intervention.`;
    }

    return {
      account_id: deal.account_id,
      explanation,
      likelihood: score,
    };
  });
}
