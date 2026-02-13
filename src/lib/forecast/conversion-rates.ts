import { DailyFunnelMetric, FunnelStage, Market, SalesMotion } from '@/types/database';

export interface ConversionStats {
  mean: number;
  median: number;
  p75: number;
  count: number;
}

export interface ConversionRateMap {
  [key: string]: ConversionStats;
}

function computeStats(values: number[]): ConversionStats {
  if (values.length === 0) {
    return { mean: 0, median: 0, p75: 0, count: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((s, v) => s + v, 0) / n;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  const p75Index = Math.floor(n * 0.75);
  const p75 = sorted[Math.min(p75Index, n - 1)];

  return { mean, median, p75, count: n };
}

function makeKey(stage: FunnelStage, motion: SalesMotion, market: Market): string {
  return `${stage}|${motion}|${market}`;
}

export function parseKey(key: string): { stage: FunnelStage; motion: SalesMotion; market: Market } {
  const [stage, motion, market] = key.split('|');
  return {
    stage: stage as FunnelStage,
    motion: motion as SalesMotion,
    market: market as Market,
  };
}

/**
 * Compute historical conversion rate statistics grouped by stage/motion/market.
 * Returns mean, median, and 75th percentile for each combination.
 */
export function computeConversionRates(metrics: DailyFunnelMetric[]): ConversionRateMap {
  const groups = new Map<string, number[]>();

  for (const m of metrics) {
    const key = makeKey(m.funnel_stage, m.motion, m.market);
    const rates = groups.get(key) ?? [];
    rates.push(Number(m.conversion_rate));
    groups.set(key, rates);
  }

  const result: ConversionRateMap = {};
  for (const [key, rates] of groups) {
    result[key] = computeStats(rates);
  }

  return result;
}

/**
 * Get the pipeline value aggregated by stage/motion/market.
 */
export function aggregatePipeline(
  metrics: DailyFunnelMetric[]
): Map<string, { totalPipeline: number; totalRevenue: number; avgLeads: number; days: number }> {
  const groups = new Map<string, DailyFunnelMetric[]>();

  for (const m of metrics) {
    const key = makeKey(m.funnel_stage, m.motion, m.market);
    const rows = groups.get(key) ?? [];
    rows.push(m);
    groups.set(key, rows);
  }

  const result = new Map<string, { totalPipeline: number; totalRevenue: number; avgLeads: number; days: number }>();

  for (const [key, rows] of groups) {
    const totalPipeline = rows.reduce((s, r) => s + Number(r.pipeline_value), 0);
    const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue), 0);
    const avgLeads = rows.reduce((s, r) => s + r.leads_count, 0) / rows.length;
    result.set(key, { totalPipeline, totalRevenue, avgLeads, days: rows.length });
  }

  return result;
}
