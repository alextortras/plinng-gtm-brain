// ============================================================
// Demo Mode Mock Data for Plinng GTM Brain
// Generates realistic, deterministic data for all endpoints
// Enable with NEXT_PUBLIC_DEMO_MODE=true
// ============================================================

import type {
  DailyFunnelMetric,
  RepKpi,
  RevenueForecast,
  StrategyConfig,
  AccountScore,
  FunnelStage,
  SalesMotion,
  Market,
  ForecastScenario,
  RevenueType,
  ScoreType,
} from '@/types/database';
import type { BrainInsight } from '@/lib/brain/insights';
import type { FunnelConfig, PeriodType } from '@/lib/funnel-config';

// --- Seeded PRNG (mulberry32) for deterministic values ---

function createRng(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

function rngInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rngRange(rng, min, max + 1));
}

// --- Constants ---

const STAGES: FunnelStage[] = [
  'awareness', 'education', 'selection', 'commit',
  'onboarding', 'impact', 'growth', 'advocacy',
];

const MOTIONS: SalesMotion[] = ['outbound', 'partners', 'paid_ads', 'organic', 'plg'];

const MARKETS: Market[] = ['us', 'spain'];

const SCENARIOS: ForecastScenario[] = ['best_case', 'commit', 'most_likely'];

const REVENUE_TYPES: RevenueType[] = ['new_business', 'expansion', 'renewals'];

// --- Rep Names (matches seed.sql UUIDs) ---

export const REP_NAMES: Record<string, string> = {
  'a1000000-0000-0000-0000-000000000001': 'Maria Lopez',
  'a1000000-0000-0000-0000-000000000002': 'James Chen',
  'a1000000-0000-0000-0000-000000000003': 'Sofia Martinez',
  'a1000000-0000-0000-0000-000000000004': 'Alex Johnson',
  'a1000000-0000-0000-0000-000000000005': 'Elena Garcia',
  'a1000000-0000-0000-0000-000000000006': 'Ryan Patel',
  'a1000000-0000-0000-0000-000000000007': 'Ana Ruiz',
  'a1000000-0000-0000-0000-000000000008': 'David Kim',
  'a1000000-0000-0000-0000-000000000009': 'Laura Santos',
};

const SDR_IDS = [
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000003',
];

const AE_IDS = [
  'a1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000006',
];

const CSM_IDS = [
  'a1000000-0000-0000-0000-000000000007',
  'a1000000-0000-0000-0000-000000000008',
  'a1000000-0000-0000-0000-000000000009',
];

// --- Date helpers ---

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function isoNow(): string {
  return new Date().toISOString();
}

// --- Generators (computed once, cached) ---

let _funnelMetrics: DailyFunnelMetric[] | null = null;

function generateFunnelMetrics(): DailyFunnelMetric[] {
  if (_funnelMetrics) return _funnelMetrics;

  const rng = createRng(42);
  const rows: DailyFunnelMetric[] = [];
  let idCounter = 1;

  const stageFactors: Record<FunnelStage, number> = {
    awareness: 1.0, education: 0.7, selection: 0.45, commit: 0.25,
    onboarding: 0.2, impact: 0.18, growth: 0.1, advocacy: 0.05,
  };
  const motionFactors: Record<SalesMotion, number> = {
    paid_ads: 1.2, outbound: 1.0, organic: 0.8, partners: 0.6, plg: 0.5,
  };
  const marketFactors: Record<Market, number> = { us: 1.0, spain: 0.65 };
  const stageConvBase: Record<FunnelStage, [number, number]> = {
    awareness: [0.65, 0.10], education: [0.60, 0.10], selection: [0.50, 0.10],
    commit: [0.45, 0.15], onboarding: [0.80, 0.15], impact: [0.75, 0.15],
    growth: [0.30, 0.15], advocacy: [0.20, 0.10],
  };
  const spendPerLead: Record<SalesMotion, [number, number]> = {
    paid_ads: [25, 20], outbound: [10, 10], partners: [5, 8], organic: [2, 3], plg: [1.5, 2.5],
  };
  const pipelineMultiplier: Record<FunnelStage, number> = {
    awareness: 3.0, education: 2.5, selection: 2.0, commit: 1.5,
    onboarding: 1.0, impact: 0.8, growth: 1.2, advocacy: 0.5,
  };

  // Generate 14 days of data
  for (let day = 1; day <= 14; day++) {
    const date = daysAgo(day);
    for (const stage of STAGES) {
      for (const motion of MOTIONS) {
        for (const market of MARKETS) {
          const noise = 0.8 + rng() * 0.4;
          const baseleads = 50;
          const leads = Math.max(1, Math.round(
            baseleads * stageFactors[stage] * motionFactors[motion] * marketFactors[market] * noise
          ));

          const [convBase, convRange] = stageConvBase[stage];
          const conv = +(convBase + rng() * convRange).toFixed(4);

          const rev = +(leads * (80 + rng() * 50)).toFixed(2);

          const [spBase, spRange] = spendPerLead[motion];
          const spend = +(leads * (spBase + rng() * spRange)).toFixed(2);

          const cac = +(leads > 0 ? spend / leads : 0).toFixed(2);
          const pipeline = +(rev * pipelineMultiplier[stage]).toFixed(2);

          rows.push({
            id: `mock-fm-${idCounter++}`,
            date,
            funnel_stage: stage,
            motion,
            market,
            leads_count: leads,
            conversion_rate: conv,
            revenue: rev,
            spend,
            cac,
            pipeline_value: pipeline,
            created_at: isoNow(),
            updated_at: isoNow(),
          });
        }
      }
    }
  }

  _funnelMetrics = rows;
  return rows;
}

let _repKpis: RepKpi[] | null = null;

function generateRepKpis(): RepKpi[] {
  if (_repKpis) return _repKpis;

  const rng = createRng(123);
  const rows: RepKpi[] = [];
  let idCounter = 1;

  // Performance tiers per rep (makes leaderboards interesting)
  const sdrTiers = [1.3, 1.0, 0.75]; // Maria is top, Sofia underperforms
  const aeTiers = [1.2, 1.0, 0.85];  // Alex leads, Ryan trails
  const csmTiers = [1.15, 1.0, 0.9]; // Ana is best, Laura lower

  for (let day = 1; day <= 30; day++) {
    const date = daysAgo(day);

    // SDRs
    SDR_IDS.forEach((repId, i) => {
      const tier = sdrTiers[i];
      const sals = Math.round(rngRange(rng, 2, 8) * tier);
      const l2sRate = +(rngRange(rng, 0.10, 0.25) * tier).toFixed(4);
      const arrFromSals = +(sals * rngRange(rng, 80, 130) * 12).toFixed(2);

      rows.push({
        id: `mock-kpi-${idCounter++}`,
        user_id: repId,
        rep_role: 'sdr',
        date,
        sals_generated: sals,
        lead_to_sal_conversion_rate: Math.min(l2sRate, 0.35),
        arr_from_sals: arrFromSals,
        arr_closed_won: null,
        arr_expansion: null,
        sal_to_closed_won_rate: null,
        trailing_churn_rate: null,
        grr: null,
        churn_rate: null,
        retention_deal_resolution_rate: null,
        account_health_score: null,
        created_at: isoNow(),
        updated_at: isoNow(),
      });
    });

    // AEs
    AE_IDS.forEach((repId, i) => {
      const tier = aeTiers[i];
      const dealsWon = rngInt(rng, 0, 3);
      const arrCw = +(dealsWon * rngRange(rng, 80, 130) * 12 * tier).toFixed(2);
      const arrExp = +(rngRange(rng, 50, 500) * tier).toFixed(2);
      const s2cwRate = +(rngRange(rng, 0.15, 0.35) * tier).toFixed(4);
      const churn = +(rngRange(rng, 0.01, 0.05) / tier).toFixed(4);

      rows.push({
        id: `mock-kpi-${idCounter++}`,
        user_id: repId,
        rep_role: 'ae',
        date,
        sals_generated: null,
        lead_to_sal_conversion_rate: null,
        arr_from_sals: null,
        arr_closed_won: arrCw,
        arr_expansion: arrExp,
        sal_to_closed_won_rate: Math.min(s2cwRate, 0.45),
        trailing_churn_rate: churn,
        grr: null,
        churn_rate: null,
        retention_deal_resolution_rate: null,
        account_health_score: null,
        created_at: isoNow(),
        updated_at: isoNow(),
      });
    });

    // CSMs
    CSM_IDS.forEach((repId, i) => {
      const tier = csmTiers[i];
      const grr = +(rngRange(rng, 0.88, 0.98) * tier).toFixed(4);
      const churn = +(rngRange(rng, 0.01, 0.05) / tier).toFixed(4);
      const resolution = +(rngRange(rng, 0.60, 0.90) * tier).toFixed(4);
      const health = +(rngRange(rng, 55, 95) * tier).toFixed(2);

      rows.push({
        id: `mock-kpi-${idCounter++}`,
        user_id: repId,
        rep_role: 'csm',
        date,
        sals_generated: null,
        lead_to_sal_conversion_rate: null,
        arr_from_sals: null,
        arr_closed_won: null,
        arr_expansion: null,
        sal_to_closed_won_rate: null,
        trailing_churn_rate: null,
        grr: Math.min(grr, 1.0),
        churn_rate: churn,
        retention_deal_resolution_rate: Math.min(resolution, 1.0),
        account_health_score: Math.min(health, 100),
        created_at: isoNow(),
        updated_at: isoNow(),
      });
    });
  }

  _repKpis = rows;
  return rows;
}

let _forecasts: RevenueForecast[] | null = null;

function generateForecasts(): RevenueForecast[] {
  if (_forecasts) return _forecasts;

  const rng = createRng(456);
  const rows: RevenueForecast[] = [];
  let idCounter = 1;

  const scenarioMultiplier: Record<ForecastScenario, number> = {
    best_case: 1.35,
    commit: 1.0,
    most_likely: 0.82,
  };

  const revenueTypeBase: Record<RevenueType, number> = {
    new_business: 18000,
    expansion: 8500,
    renewals: 12000,
  };

  const motionWeight: Record<SalesMotion, number> = {
    paid_ads: 0.30, outbound: 0.25, organic: 0.20, partners: 0.15, plg: 0.10,
  };

  const marketWeight: Record<Market, number> = { us: 0.60, spain: 0.40 };

  // Deal explanations (attached to the first forecast row)
  const dealExplanations = [
    { account_id: 'ACCT-0003', explanation: 'Strong ICP match in home services. Demo completed, champion identified. Expected close within 2 weeks.', likelihood: 85 },
    { account_id: 'ACCT-0007', explanation: 'Multi-location HVAC company expanding into new markets. High product usage, expansion deal in negotiation.', likelihood: 72 },
    { account_id: 'ACCT-0012', explanation: 'Deal stalled for 10 days — no next step scheduled. Needs executive outreach to re-engage.', likelihood: 35 },
    { account_id: 'ACCT-0015', explanation: 'Renewal at risk: product usage dropped 40% last month. CSM escalation recommended.', likelihood: 48 },
    { account_id: 'ACCT-0019', explanation: 'Plumbing franchise chain evaluating Plinng for 12 locations. Large ACV potential, early-stage qualification.', likelihood: 55 },
    { account_id: 'ACCT-0022', explanation: 'Current customer with 98% usage score. Upsell opportunity for premium tier, champion is ready.', likelihood: 90 },
  ];

  let isFirst = true;

  for (const scenario of SCENARIOS) {
    for (const rt of REVENUE_TYPES) {
      for (const motion of MOTIONS) {
        for (const market of MARKETS) {
          const base = revenueTypeBase[rt] * motionWeight[motion] * marketWeight[market];
          const noise = rngRange(rng, 0.85, 1.15);
          const projected = +(base * scenarioMultiplier[scenario] * noise).toFixed(2);
          const convRate = +(rngRange(rng, 0.15, 0.45)).toFixed(4);
          const pipeline = +(projected * rngRange(rng, 1.8, 3.0)).toFixed(2);
          const deals = rngInt(rng, 2, 15);

          rows.push({
            id: `mock-fc-${idCounter++}`,
            generated_at: isoNow(),
            scenario,
            revenue_type: rt,
            motion,
            market,
            projected_revenue: projected,
            conversion_rate_used: convRate,
            pipeline_included: pipeline,
            deal_count: deals,
            explanations: isFirst ? dealExplanations : [],
            created_at: isoNow(),
          });

          isFirst = false;
        }
      }
    }
  }

  _forecasts = rows;
  return rows;
}

let _accountScores: AccountScore[] | null = null;

function generateAccountScores(): AccountScore[] {
  if (_accountScores) return _accountScores;

  const rng = createRng(789);
  const rows: AccountScore[] = [];
  let idCounter = 1;

  for (let acct = 1; acct <= 25; acct++) {
    const accountId = `ACCT-${String(acct).padStart(4, '0')}`;

    let scoreType: ScoreType;
    let baseScore: number;

    if (acct <= 8) {
      scoreType = 'sdr_propensity';
      baseScore = rngRange(rng, 40, 80);
    } else if (acct <= 16) {
      scoreType = 'deal_momentum';
      baseScore = rngRange(rng, 30, 80);
    } else {
      scoreType = 'csm_health';
      baseScore = rngRange(rng, 50, 90);
    }

    // Weekly snapshots over 12 weeks
    for (let week = 0; week < 12; week++) {
      const drift = (12 - week) * rngRange(rng, -0.3, 0.5);
      const score = Math.min(100, Math.max(0, baseScore + drift));

      const isStalled = scoreType === 'deal_momentum' && acct >= 10 && acct <= 13 && rng() > 0.5;

      rows.push({
        id: `mock-as-${idCounter++}`,
        account_id: accountId,
        score_type: scoreType,
        score_value: +(isStalled ? Math.min(score, 25) : score).toFixed(2),
        score_date: daysAgo(week * 7),
        is_stalled: isStalled,
        stalled_since: isStalled ? daysAgo(week * 7 + rngInt(rng, 3, 14)) : null,
        contributing_factors: scoreType === 'sdr_propensity'
          ? { icp_match: 'home_services', engagement_signals: +(rng() * 10).toFixed(1), company_size: rngInt(rng, 1, 4) }
          : scoreType === 'deal_momentum'
          ? { stage_velocity_days: rngInt(rng, 3, 28), has_next_step: !isStalled, deal_size: +(80 + rng() * 50).toFixed(2) }
          : { product_usage_score: +(rng() * 100).toFixed(1), days_since_last_login: rngInt(rng, 1, 30), support_tickets_open: rngInt(rng, 0, 5) },
        created_at: isoNow(),
      });
    }
  }

  _accountScores = rows;
  return rows;
}

// --- Static data ---

const MOCK_STRATEGY_CONFIG: StrategyConfig = {
  id: 'mock-config-001',
  mode: 'maximize_efficiency',
  max_cac_payback_months: 6,
  max_churn_rate: 0.05,
  arpa_min: 80,
  arpa_max: 130,
  is_active: true,
  updated_by: null,
  created_at: isoNow(),
  updated_at: isoNow(),
};

export const MOCK_BRAIN_INSIGHTS: BrainInsight[] = [
  {
    category: 'strategic',
    urgency: 'high',
    headline: 'Paid Ads CAC exceeding 6-month payback threshold in Spain',
    detail: 'Spain paid_ads CAC has averaged €38/lead over the last 14 days, implying a 7.2-month payback at current ARPA. This breaches the configured 6-month guardrail. Consider reallocating budget to outbound or partners in the Spain market, which show 40% lower CAC.',
    stage: 'awareness',
    market: 'spain',
  },
  {
    category: 'tactical',
    urgency: 'high',
    headline: '4 deals stalled in Selection stage — no next step scheduled',
    detail: 'Accounts ACCT-0010 through ACCT-0013 have been stuck in the Selection stage for 10+ days with no scheduled next step. Deal momentum scores have dropped below 25. Recommend immediate AE outreach with a compelling case study or executive sponsor introduction.',
    stage: 'selection',
    market: 'all',
  },
  {
    category: 'strategic',
    urgency: 'medium',
    headline: 'PLG motion showing 2.3x higher conversion in Onboarding',
    detail: 'Product-led growth accounts convert from Onboarding to Impact at 92% vs. 75% for outbound. While PLG volume is low (8% of total leads), these accounts show 15% higher retention at 90 days. Consider increasing PLG investment to capture this efficiency gain.',
    stage: 'onboarding',
    market: 'all',
  },
  {
    category: 'tactical',
    urgency: 'medium',
    headline: 'Maria Lopez leading SDR team with 30% higher SAL volume',
    detail: 'Maria has generated 156 SALs in the last 30 days vs. team average of 120. Her lead-to-SAL conversion rate is 28%, significantly above the 18% team average. Recommend peer shadowing sessions to transfer her qualification techniques to James and Sofia.',
    stage: 'education',
    market: 'us',
  },
  {
    category: 'strategic',
    urgency: 'low',
    headline: 'US market outperforming Spain by 55% in pipeline generation',
    detail: 'US pipeline value is €2.1M vs. Spain at €1.35M over the last 14 days. While this aligns with the 60/40 market split strategy, Spain Awareness-stage conversion (67%) is slightly higher than US (65%), suggesting untapped potential if Spain volume increases.',
    stage: 'awareness',
    market: 'us',
  },
  {
    category: 'tactical',
    urgency: 'low',
    headline: 'Renewal health scores trending up — GRR at 94.2%',
    detail: 'CSM team Gross Revenue Retention averaged 94.2% over the past 30 days, well above the 88% floor. Ana Ruiz is the standout at 96.8% GRR. Only 2 accounts show churn risk (product usage score below 30). Proactive outreach scheduled for both.',
    stage: 'growth',
    market: 'all',
  },
];

// --- Mock data registry with param filtering ---

type MockResolver = (url: string) => unknown;

function parseParams(url: string): URLSearchParams {
  const qIndex = url.indexOf('?');
  if (qIndex === -1) return new URLSearchParams();
  return new URLSearchParams(url.slice(qIndex));
}

const MOCK_REGISTRY: Record<string, MockResolver> = {
  '/api/funnel-metrics': (url) => {
    const params = parseParams(url);
    let data = generateFunnelMetrics();
    const market = params.get('market');
    const motion = params.get('motion');
    const stage = params.get('stage');
    const from = params.get('from');
    const to = params.get('to');
    if (market) data = data.filter((m) => m.market === market);
    if (motion) data = data.filter((m) => m.motion === motion);
    if (stage) data = data.filter((m) => m.funnel_stage === stage);
    if (from) data = data.filter((m) => m.date >= from);
    if (to) data = data.filter((m) => m.date <= to);
    return data;
  },

  '/api/rep-kpis': (url) => {
    const params = parseParams(url);
    let data = generateRepKpis();
    const role = params.get('role');
    if (role) data = data.filter((k) => k.rep_role === role);
    return data;
  },

  '/api/forecasts': () => {
    return generateForecasts();
  },

  '/api/strategy-config': () => {
    return MOCK_STRATEGY_CONFIG;
  },

  '/api/account-scores': () => {
    return generateAccountScores();
  },
};

/**
 * Check if demo mode is enabled.
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

/**
 * Resolve mock data for a given URL, or null if no mock is registered.
 */
export function resolveMockData(fullUrl: string): unknown | null {
  // Extract the path portion (before query string)
  // Handle both full URLs (http://localhost:3001/api/...) and paths (/api/...)
  let path = fullUrl.split('?')[0];
  
  // If it's a full URL, extract just the pathname
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(fullUrl);
      path = url.pathname;
    } catch {
      // If URL parsing fails, continue with the original path
    }
  }

  const resolver = MOCK_REGISTRY[path];
  if (!resolver) return null;
  return resolver(fullUrl);
}

// --- Phase metrics table mock data ---

export interface PhaseTableData {
  columns: string[];
  values: Record<string, Record<string, number>>;
}

function generatePeriodColumns(period: PeriodType, from?: string, to?: string): string[] {
  // End date: `to` or today
  const end = to ? new Date(to + 'T00:00:00') : new Date();
  // Start date: `from`, or a default lookback
  let start: Date;
  if (from) {
    start = new Date(from + 'T00:00:00');
  } else {
    start = new Date(end);
    if (period === 'daily') start.setDate(start.getDate() - 6);
    else if (period === 'weekly') start.setDate(start.getDate() - 5 * 7);
    else start.setMonth(start.getMonth() - 5);
  }

  const cols: string[] = [];

  if (period === 'daily') {
    const d = new Date(start);
    while (d <= end) {
      cols.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      d.setDate(d.getDate() + 1);
    }
  } else if (period === 'weekly') {
    // Snap start to Monday
    const d = new Date(start);
    const day = d.getDay();
    d.setDate(d.getDate() - ((day + 6) % 7));
    while (d <= end) {
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
      cols.push(`W${weekNum}`);
      d.setDate(d.getDate() + 7);
    }
  } else {
    const d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d <= end) {
      cols.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      d.setMonth(d.getMonth() + 1);
    }
  }

  return cols;
}

export function generatePhaseTableData(
  config: FunnelConfig,
  period: PeriodType,
  phase: string,
  from?: string,
  to?: string,
  seed: number = 42,
): PhaseTableData {
  const rng = createRng(seed);
  const columns = generatePeriodColumns(period, from, to);
  const values: Record<string, Record<string, number>> = {};

  for (const row of config.rows) {
    values[row.key] = {};
  }

  const pMul = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;

  // --- Retention ---
  if (phase === 'retention') {
    for (const col of columns) {
      values['active_clients'][col] = Math.round(rngRange(rng, 180, 260));
      values['churn_rate'][col] = rngRange(rng, 0.02, 0.05);
      values['nrr'][col] = rngRange(rng, 0.95, 1.15);
      values['grr'][col] = rngRange(rng, 0.88, 0.98);
    }
    return { columns, values };
  }

  // --- Expansion ---
  if (phase === 'expansion') {
    for (const col of columns) {
      const upsell = Math.round(rngRange(rng, 3000, 8000) * pMul);
      const crosssell = Math.round(rngRange(rng, 1000, 4000) * pMul);
      const expansion = upsell + crosssell;
      const downsell = Math.round(rngRange(rng, 500, 2000) * pMul);
      const crosssellChurn = Math.round(rngRange(rng, 200, 1000) * pMul);
      const contraction = downsell + crosssellChurn;

      values['upsell_mrr'][col] = upsell;
      values['crosssell_mrr'][col] = crosssell;
      values['expansion_mrr'][col] = expansion;
      values['downsell_mrr'][col] = downsell;
      values['crosssell_churn_mrr'][col] = crosssellChurn;
      values['contraction_mrr'][col] = contraction;
      values['net_expansion_mrr'][col] = expansion - contraction;
    }
    return { columns, values };
  }

  // --- Acquisition: All Motions (blended) ---
  if (config.rows.some((r) => r.key === 'first_stage_entries')) {
    for (const col of columns) {
      const firstStage = Math.round(rngRange(rng, 800, 1600) * pMul);
      const wins = Math.round(firstStage * rngRange(rng, 0.08, 0.18));
      const investment = Math.round(rngRange(rng, 5000, 15000) * pMul);

      const arpu = rngRange(rng, 80, 130);
      const mrr = Math.round(wins * arpu);

      values['first_stage_entries'][col] = firstStage;
      values['win'][col] = wins;
      values['mrr'][col] = mrr;
      values['first_to_win'][col] = firstStage > 0 ? wins / firstStage : 0;
      values['total_investment'][col] = investment;
      values['blended_cac'][col] = wins > 0 ? investment / wins : 0;
    }
    return { columns, values };
  }

  // --- Acquisition: Specific motion ---
  const volumeRows = config.rows.filter((r) => r.group === 'volume' && r.format === 'number');
  const investmentRow = config.rows.find((r) => r.key === 'investment');
  const conversionRows = config.rows.filter((r) => r.group === 'conversion');
  const costRows = config.rows.filter((r) => r.group === 'cost');

  for (const col of columns) {
    // Investment (if present)
    let investment = 0;
    if (investmentRow) {
      investment = Math.round(rngRange(rng, 1000, 3000) * pMul);
      values[investmentRow.key][col] = investment;
    }

    // Volume funnel — each stage decays from the previous
    let prev = Math.round(rngRange(rng, 150, 400) * pMul);
    const volValues: number[] = [];

    for (let i = 0; i < volumeRows.length; i++) {
      values[volumeRows[i].key][col] = prev;
      volValues.push(prev);
      if (i < volumeRows.length - 1) {
        prev = Math.max(1, Math.round(prev * rngRange(rng, 0.3, 0.6)));
      }
    }

    // MRR — wins * ARPU (80-130 EUR per business rules)
    const wins = volValues[volValues.length - 1] ?? 0;
    const arpu = rngRange(rng, 80, 130);
    values['mrr'][col] = Math.round(wins * arpu);

    // Conversions — derived from consecutive volume rows
    for (let i = 0; i < conversionRows.length && i < volValues.length - 1; i++) {
      values[conversionRows[i].key][col] = volValues[i] > 0 ? volValues[i + 1] / volValues[i] : 0;
    }

    // Costs — investment / each volume stage
    if (investment > 0) {
      for (let i = 0; i < costRows.length && i < volValues.length; i++) {
        values[costRows[i].key][col] = volValues[i] > 0 ? investment / volValues[i] : 0;
      }
    }
  }

  return { columns, values };
}

// --- Acquisition KPIs (monthly, with MoM comparison) ---

export interface AcquisitionKpis {
  newArr: number;
  newArrChange: number;
  arpu: number;
  arpuChange: number;
  cacOrConversion: number;
  cacOrConversionChange: number;
  isPaid: boolean;
  /** Paid channels: CAC payback in months */
  paybackMonths: number;
  paybackChange: number;
  /** Non-paid channels: avg days from first stage to win */
  salesCycleDays: number;
  salesCycleChange: number;
}

export function generateAcquisitionKpis(
  config: FunnelConfig,
  phase: string,
  isPaid: boolean,
  from?: string,
  to?: string,
): AcquisitionKpis {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);

  const hasDateFilter = !!from || !!to;
  const periodFrom = hasDateFilter ? (from || lastMonthStart) : thisMonthStart;
  const periodTo = hasDateFilter ? (to || now.toISOString().slice(0, 10)) : now.toISOString().slice(0, 10);

  const thisData = generatePhaseTableData(config, 'monthly', phase, periodFrom, periodTo, 42);
  const lastData = generatePhaseTableData(config, 'monthly', phase, lastMonthStart, lastMonthEnd, 99);

  const sumKey = (data: PhaseTableData, key: string) => {
    return data.columns.reduce((s, col) => s + (data.values[key]?.[col] ?? 0), 0);
  };

  const isBlended = config.rows.some((r) => r.key === 'first_stage_entries');
  const firstStageKey = isBlended ? 'first_stage_entries' : (config.rows.find((r) => r.group === 'volume' && r.format === 'number')?.key ?? 'leads');
  const investmentKey = isBlended ? 'total_investment' : 'investment';

  // This period
  const thisMrr = sumKey(thisData, 'mrr');
  const thisWins = sumKey(thisData, 'win');
  const thisFirstStage = sumKey(thisData, firstStageKey);
  const thisInvestment = sumKey(thisData, investmentKey);

  // Last month
  const lastMrr = sumKey(lastData, 'mrr');
  const lastWins = sumKey(lastData, 'win');
  const lastFirstStage = sumKey(lastData, firstStageKey);
  const lastInvestment = sumKey(lastData, investmentKey);

  // New ARR
  const newArr = thisMrr * 12;
  const lastArr = lastMrr * 12;
  const newArrChange = lastArr > 0 ? (newArr - lastArr) / lastArr : 0;

  // ARPU
  const arpu = thisWins > 0 ? thisMrr / thisWins : 0;
  const lastArpu = lastWins > 0 ? lastMrr / lastWins : 0;
  const arpuChange = lastArpu > 0 ? (arpu - lastArpu) / lastArpu : 0;

  // CAC or Conversion Rate
  let cacOrConversion: number;
  let cacOrConversionChange: number;

  if (isPaid) {
    cacOrConversion = thisWins > 0 ? thisInvestment / thisWins : 0;
    const lastCac = lastWins > 0 ? lastInvestment / lastWins : 0;
    cacOrConversionChange = lastCac > 0 ? (cacOrConversion - lastCac) / lastCac : 0;
  } else {
    cacOrConversion = thisFirstStage > 0 ? thisWins / thisFirstStage : 0;
    const lastConv = lastFirstStage > 0 ? lastWins / lastFirstStage : 0;
    cacOrConversionChange = lastConv > 0 ? (cacOrConversion - lastConv) / lastConv : 0;
  }

  // Payback (paid channels)
  const paybackMonths = arpu > 0 && isPaid ? cacOrConversion / arpu : 0;
  const lastPayback = lastArpu > 0 && isPaid ? (lastWins > 0 ? lastInvestment / lastWins : 0) / lastArpu : 0;
  const paybackChange = lastPayback > 0 ? (paybackMonths - lastPayback) / lastPayback : 0;

  // Sales Cycle (non-paid channels) — deterministic mock based on funnel depth
  const volumeStages = config.rows.filter((r) => r.group === 'volume' && r.format === 'number').length;
  const cycleRng = createRng(77);
  const baseDays = 12 + volumeStages * 5; // more stages → longer cycle
  const salesCycleDays = baseDays + rngRange(cycleRng, -3, 8);
  const lastCycleDays = baseDays + rngRange(cycleRng, -3, 8);
  const salesCycleChange = lastCycleDays > 0 ? (salesCycleDays - lastCycleDays) / lastCycleDays : 0;

  return {
    newArr,
    newArrChange,
    arpu,
    arpuChange,
    cacOrConversion,
    cacOrConversionChange,
    isPaid,
    paybackMonths,
    paybackChange,
    salesCycleDays,
    salesCycleChange,
  };
}
