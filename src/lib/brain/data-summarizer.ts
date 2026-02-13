import { DailyFunnelMetric, AccountScore, RepKpi } from '@/types/database';

interface MetricSummary {
  market: string;
  motion: string;
  stage: string;
  avg_leads: number;
  avg_conversion: number;
  total_revenue: number;
  total_spend: number;
  avg_cac: number;
  total_pipeline: number;
  days: number;
}

interface ScoreSummary {
  account_id: string;
  score_type: string;
  latest_score: number;
  trend: string;
  is_stalled: boolean;
  stalled_days: number | null;
}

interface RepSummary {
  rep_name: string;
  role: string;
  key_metrics: Record<string, number | null>;
  days: number;
}

export function summarizeFunnelMetrics(metrics: DailyFunnelMetric[]): MetricSummary[] {
  const groups = new Map<string, DailyFunnelMetric[]>();

  for (const row of metrics) {
    const key = `${row.market}|${row.motion}|${row.funnel_stage}`;
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }

  const summaries: MetricSummary[] = [];

  for (const [key, rows] of groups) {
    const [market, motion, stage] = key.split('|');
    const n = rows.length;

    summaries.push({
      market,
      motion,
      stage,
      avg_leads: Math.round(rows.reduce((s, r) => s + r.leads_count, 0) / n),
      avg_conversion: Number((rows.reduce((s, r) => s + Number(r.conversion_rate), 0) / n).toFixed(4)),
      total_revenue: Number(rows.reduce((s, r) => s + Number(r.revenue), 0).toFixed(2)),
      total_spend: Number(rows.reduce((s, r) => s + Number(r.spend), 0).toFixed(2)),
      avg_cac: Number((rows.reduce((s, r) => s + Number(r.cac), 0) / n).toFixed(2)),
      total_pipeline: Number(rows.reduce((s, r) => s + Number(r.pipeline_value), 0).toFixed(2)),
      days: n,
    });
  }

  return summaries;
}

export function summarizeAccountScores(scores: AccountScore[]): ScoreSummary[] {
  const byAccount = new Map<string, AccountScore[]>();

  for (const score of scores) {
    const key = `${score.account_id}|${score.score_type}`;
    const group = byAccount.get(key) ?? [];
    group.push(score);
    byAccount.set(key, group);
  }

  const summaries: ScoreSummary[] = [];

  for (const [, rows] of byAccount) {
    const sorted = rows.sort(
      (a, b) => new Date(b.score_date).getTime() - new Date(a.score_date).getTime()
    );
    const latest = sorted[0];
    const oldest = sorted[sorted.length - 1];

    const scoreDiff = Number(latest.score_value) - Number(oldest.score_value);
    let trend = 'stable';
    if (scoreDiff > 5) trend = 'improving';
    else if (scoreDiff < -5) trend = 'declining';

    let stalledDays: number | null = null;
    if (latest.is_stalled && latest.stalled_since) {
      stalledDays = Math.round(
        (Date.now() - new Date(latest.stalled_since).getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    summaries.push({
      account_id: latest.account_id,
      score_type: latest.score_type,
      latest_score: Number(latest.score_value),
      trend,
      is_stalled: latest.is_stalled,
      stalled_days: stalledDays,
    });
  }

  return summaries;
}

export function summarizeRepKpis(kpis: RepKpi[]): RepSummary[] {
  const byRep = new Map<string, RepKpi[]>();

  for (const kpi of kpis) {
    const group = byRep.get(kpi.user_id) ?? [];
    group.push(kpi);
    byRep.set(kpi.user_id, group);
  }

  const summaries: RepSummary[] = [];

  for (const [userId, rows] of byRep) {
    const n = rows.length;
    const role = rows[0].rep_role;

    const avg = (vals: (number | null)[]): number | null => {
      const valid = vals.filter((v): v is number => v !== null);
      if (valid.length === 0) return null;
      return Number((valid.reduce((s, v) => s + v, 0) / valid.length).toFixed(2));
    };

    let keyMetrics: Record<string, number | null> = {};

    if (role === 'sdr') {
      keyMetrics = {
        avg_sals_generated: avg(rows.map((r) => r.sals_generated)),
        avg_lead_to_sal_rate: avg(rows.map((r) => r.lead_to_sal_conversion_rate)),
        total_arr_from_sals: Number(
          rows.reduce((s, r) => s + (Number(r.arr_from_sals) || 0), 0).toFixed(2)
        ),
      };
    } else if (role === 'ae') {
      keyMetrics = {
        total_arr_closed_won: Number(
          rows.reduce((s, r) => s + (Number(r.arr_closed_won) || 0), 0).toFixed(2)
        ),
        total_arr_expansion: Number(
          rows.reduce((s, r) => s + (Number(r.arr_expansion) || 0), 0).toFixed(2)
        ),
        avg_sal_to_cw_rate: avg(rows.map((r) => r.sal_to_closed_won_rate)),
        avg_trailing_churn: avg(rows.map((r) => r.trailing_churn_rate)),
      };
    } else {
      keyMetrics = {
        avg_grr: avg(rows.map((r) => r.grr)),
        avg_churn_rate: avg(rows.map((r) => r.churn_rate)),
        avg_resolution_rate: avg(rows.map((r) => r.retention_deal_resolution_rate)),
        avg_health_score: avg(rows.map((r) => r.account_health_score)),
      };
    }

    summaries.push({
      rep_name: userId,
      role,
      key_metrics: keyMetrics,
      days: n,
    });
  }

  return summaries;
}

export function buildDataContext(
  funnelSummary: MetricSummary[],
  scoreSummary: ScoreSummary[],
  repSummary: RepSummary[]
): string {
  return `## Recent Funnel Metrics (aggregated)
${JSON.stringify(funnelSummary, null, 2)}

## Account Scores (latest per account)
${JSON.stringify(scoreSummary, null, 2)}

## Rep Performance (period averages)
${JSON.stringify(repSummary, null, 2)}`;
}
