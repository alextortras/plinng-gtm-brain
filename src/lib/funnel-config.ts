export type MetricFormat = 'number' | 'currency' | 'percent';

export interface FunnelRow {
  key: string;
  label: string;
  format: MetricFormat;
  group: 'volume' | 'conversion' | 'cost' | 'customers' | 'rates' | 'growth' | 'contraction' | 'summary';
  /** How to summarise across periods: 'sum' (default) or 'avg' */
  summary?: 'sum' | 'avg';
}

export interface FunnelConfig {
  rows: FunnelRow[];
}

export type PeriodType = 'daily' | 'weekly' | 'monthly';

// ---- Acquisition: Paid Ads (SLG default) ----

const PAID_ADS_FUNNEL: FunnelConfig = {
  rows: [
    { key: 'leads', label: 'Leads', format: 'number', group: 'volume' },
    { key: 'sql', label: 'SQL', format: 'number', group: 'volume' },
    { key: 'sal', label: 'SAL', format: 'number', group: 'volume' },
    { key: 'win', label: 'Win', format: 'number', group: 'volume' },
    { key: 'mrr', label: 'MRR', format: 'currency', group: 'volume' },
    { key: 'lead_to_sql', label: '% Lead → SQL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'sql_to_sal', label: '% SQL → SAL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'sal_to_win', label: '% SAL → Win', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'overall_conv', label: '% Lead → Win', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'investment', label: '€ Investment', format: 'currency', group: 'cost' },
    { key: 'cpl', label: 'CPL', format: 'currency', group: 'cost', summary: 'avg' },
    { key: 'cpsql', label: 'CPSQL', format: 'currency', group: 'cost', summary: 'avg' },
    { key: 'cpsal', label: 'CPSAL', format: 'currency', group: 'cost', summary: 'avg' },
    { key: 'cac', label: 'CAC', format: 'currency', group: 'cost', summary: 'avg' },
  ],
};

// ---- Acquisition: PLG ----

const PLG_FUNNEL: FunnelConfig = {
  rows: [
    { key: 'users', label: 'Users', format: 'number', group: 'volume' },
    { key: 'hand_risers', label: 'Hand-Risers', format: 'number', group: 'volume' },
    { key: 'signups', label: 'SignUps', format: 'number', group: 'volume' },
    { key: 'pql', label: 'PQL', format: 'number', group: 'volume' },
    { key: 'pqa', label: 'PQA', format: 'number', group: 'volume' },
    { key: 'win', label: 'Win', format: 'number', group: 'volume' },
    { key: 'mrr', label: 'MRR', format: 'currency', group: 'volume' },
    { key: 'user_to_hr', label: '% User → HR', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'hr_to_signup', label: '% HR → SignUp', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'signup_to_pql', label: '% SignUp → PQL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pql_to_pqa', label: '% PQL → PQA', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pqa_to_win', label: '% PQA → Win', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'overall_conv', label: '% User → Win', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'investment', label: '€ Investment', format: 'currency', group: 'cost' },
    { key: 'cpu', label: 'CPU', format: 'currency', group: 'cost', summary: 'avg' },
    { key: 'cphr', label: 'CPHR', format: 'currency', group: 'cost', summary: 'avg' },
    { key: 'cps', label: 'CPS', format: 'currency', group: 'cost', summary: 'avg' },
    { key: 'cppql', label: 'CPPQL', format: 'currency', group: 'cost', summary: 'avg' },
    { key: 'cppqa', label: 'CPPQA', format: 'currency', group: 'cost', summary: 'avg' },
    { key: 'cac', label: 'CAC', format: 'currency', group: 'cost', summary: 'avg' },
  ],
};

// ---- Acquisition: Outbound SLG (no € Investment) ----

const OUTBOUND_SLG_FUNNEL: FunnelConfig = {
  rows: [
    { key: 'prospect', label: 'Prospect', format: 'number', group: 'volume' },
    { key: 'leads', label: 'Lead', format: 'number', group: 'volume' },
    { key: 'sql', label: 'SQL', format: 'number', group: 'volume' },
    { key: 'sal', label: 'SAL', format: 'number', group: 'volume' },
    { key: 'win', label: 'Win', format: 'number', group: 'volume' },
    { key: 'mrr', label: 'MRR', format: 'currency', group: 'volume' },
    { key: 'prospect_to_lead', label: '% Prospect → Lead', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'lead_to_sql', label: '% Lead → SQL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'sql_to_sal', label: '% SQL → SAL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'sal_to_win', label: '% SAL → Win', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'overall_conv', label: '% Prospect → Win', format: 'percent', group: 'conversion', summary: 'avg' },
  ],
};

// ---- Acquisition: Outbound PLG (no € Investment, with Outreach first stage) ----

const OUTBOUND_PLG_FUNNEL: FunnelConfig = {
  rows: [
    { key: 'outreach', label: 'Outreach', format: 'number', group: 'volume' },
    { key: 'users', label: 'Users', format: 'number', group: 'volume' },
    { key: 'hand_risers', label: 'Hand-Risers', format: 'number', group: 'volume' },
    { key: 'signups', label: 'SignUps', format: 'number', group: 'volume' },
    { key: 'pql', label: 'PQL', format: 'number', group: 'volume' },
    { key: 'pqa', label: 'PQA', format: 'number', group: 'volume' },
    { key: 'win', label: 'Win', format: 'number', group: 'volume' },
    { key: 'mrr', label: 'MRR', format: 'currency', group: 'volume' },
    { key: 'outreach_to_user', label: '% Outreach → User', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'user_to_hr', label: '% User → HR', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'hr_to_signup', label: '% HR → SignUp', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'signup_to_pql', label: '% SignUp → PQL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pql_to_pqa', label: '% PQL → PQA', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pqa_to_win', label: '% PQA → Win', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'overall_conv', label: '% Outreach → Win', format: 'percent', group: 'conversion', summary: 'avg' },
  ],
};

// ---- Acquisition: Organic PLG (PLG-like, no € Investment) ----

const ORGANIC_PLG_FUNNEL: FunnelConfig = {
  rows: [
    { key: 'users', label: 'Users', format: 'number', group: 'volume' },
    { key: 'hand_risers', label: 'Hand-Risers', format: 'number', group: 'volume' },
    { key: 'signups', label: 'SignUps', format: 'number', group: 'volume' },
    { key: 'pql', label: 'PQL', format: 'number', group: 'volume' },
    { key: 'pqa', label: 'PQA', format: 'number', group: 'volume' },
    { key: 'win', label: 'Win', format: 'number', group: 'volume' },
    { key: 'mrr', label: 'MRR', format: 'currency', group: 'volume' },
    { key: 'user_to_hr', label: '% User → HR', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'hr_to_signup', label: '% HR → SignUp', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'signup_to_pql', label: '% SignUp → PQL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pql_to_pqa', label: '% PQL → PQA', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pqa_to_win', label: '% PQA → Win', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'overall_conv', label: '% User → Win', format: 'percent', group: 'conversion', summary: 'avg' },
  ],
};

// ---- Acquisition: Organic SLG (SLG-like, no € Investment) ----

const ORGANIC_SLG_FUNNEL: FunnelConfig = {
  rows: [
    { key: 'leads', label: 'Leads', format: 'number', group: 'volume' },
    { key: 'sql', label: 'SQL', format: 'number', group: 'volume' },
    { key: 'sal', label: 'SAL', format: 'number', group: 'volume' },
    { key: 'win', label: 'Win', format: 'number', group: 'volume' },
    { key: 'mrr', label: 'MRR', format: 'currency', group: 'volume' },
    { key: 'lead_to_sql', label: '% Lead → SQL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'sql_to_sal', label: '% SQL → SAL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'sal_to_win', label: '% SAL → Win', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'overall_conv', label: '% Lead → Win', format: 'percent', group: 'conversion', summary: 'avg' },
  ],
};

// Partners = same structure as Outbound
const PARTNERS_SLG_FUNNEL = OUTBOUND_SLG_FUNNEL;
const PARTNERS_PLG_FUNNEL = OUTBOUND_PLG_FUNNEL;

// ---- Acquisition: All Motions (blended) ----

const ALL_MOTIONS_ACQUISITION: FunnelConfig = {
  rows: [
    { key: 'first_stage_entries', label: 'Users', format: 'number', group: 'volume' },
    { key: 'win', label: 'Wins', format: 'number', group: 'volume' },
    { key: 'mrr', label: 'MRR', format: 'currency', group: 'volume' },
    { key: 'first_to_win', label: '% Users → Win', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'total_investment', label: 'Total Investment', format: 'currency', group: 'cost' },
    { key: 'blended_cac', label: 'Blended CAC', format: 'currency', group: 'cost', summary: 'avg' },
  ],
};

// ---- Lookup maps ----

const MOTION_FUNNELS: Record<string, FunnelConfig> = {
  paid_ads: PAID_ADS_FUNNEL,
  outbound: OUTBOUND_SLG_FUNNEL,
  organic: ORGANIC_SLG_FUNNEL,
  partners: PARTNERS_SLG_FUNNEL,
  plg: PLG_FUNNEL,
};

// ---- Retention ----

export const RETENTION_CONFIG: FunnelConfig = {
  rows: [
    { key: 'active_clients', label: 'Active Clients', format: 'number', group: 'customers', summary: 'avg' },
    { key: 'new_clients', label: 'New Clients', format: 'number', group: 'customers' },
    { key: 'churned_clients', label: 'Churned Clients', format: 'number', group: 'customers' },
    { key: 'net_new_clients', label: 'Net New Clients', format: 'number', group: 'customers' },
    { key: 'logo_churn_rate', label: '% Logo Churn Rate', format: 'percent', group: 'rates', summary: 'avg' },
    { key: 'revenue_churn_rate', label: '% Revenue Churn Rate', format: 'percent', group: 'rates', summary: 'avg' },
    { key: 'nrr', label: 'NRR', format: 'percent', group: 'rates', summary: 'avg' },
    { key: 'grr', label: 'GRR', format: 'percent', group: 'rates', summary: 'avg' },
  ],
};

// ---- Expansion ----

export const EXPANSION_CONFIG: FunnelConfig = {
  rows: [
    { key: 'upsell_mrr', label: 'Upsell MRR', format: 'currency', group: 'growth' },
    { key: 'crosssell_mrr', label: 'CrossSell MRR', format: 'currency', group: 'growth' },
    { key: 'expansion_mrr', label: 'Expansion MRR', format: 'currency', group: 'growth' },
    { key: 'downsell_mrr', label: 'Downsell MRR', format: 'currency', group: 'contraction' },
    { key: 'crosssell_churn_mrr', label: 'CrossSell Churn MRR', format: 'currency', group: 'contraction' },
    { key: 'contraction_mrr', label: 'Contraction MRR', format: 'currency', group: 'contraction' },
    { key: 'net_expansion_mrr', label: 'Net Expansion MRR', format: 'currency', group: 'summary' },
    { key: 'expansion_rate', label: 'Expansion Rate', format: 'percent', group: 'summary', summary: 'avg' },
  ],
};

/** Whether a motion has paid investment (determines CAC vs Conversion Rate in KPIs) */
export function isPaidMotion(motion: string): boolean {
  if (!motion) return true; // "All" defaults to showing CAC
  return motion === 'paid_ads';
}

/** Get the funnel config for a phase + motion combination */
export function getPhaseFunnel(phase: string, motion: string): FunnelConfig {
  if (phase === 'retention') return RETENTION_CONFIG;
  if (phase === 'expansion') return EXPANSION_CONFIG;
  if (!motion) return ALL_MOTIONS_ACQUISITION;
  return MOTION_FUNNELS[motion] ?? ALL_MOTIONS_ACQUISITION;
}
