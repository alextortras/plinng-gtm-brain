export type MetricFormat = 'number' | 'currency' | 'percent';

export interface FunnelRow {
  key: string;
  label: string;
  format: MetricFormat;
  group: 'volume' | 'conversion' | 'cost';
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
    { key: 'investment', label: '€ Investment', format: 'currency', group: 'volume' },
    { key: 'leads', label: 'Leads', format: 'number', group: 'volume' },
    { key: 'sql', label: 'SQL', format: 'number', group: 'volume' },
    { key: 'sal', label: 'SAL', format: 'number', group: 'volume' },
    { key: 'win', label: 'Win', format: 'number', group: 'volume' },
    { key: 'lead_to_sql', label: '% Lead → SQL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'sql_to_sal', label: '% SQL → SAL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'sal_to_win', label: '% SAL → Win', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'cpl', label: 'CPL', format: 'currency', group: 'cost', summary: 'avg' },
    { key: 'cpsql', label: 'CPSQL', format: 'currency', group: 'cost', summary: 'avg' },
    { key: 'cpsal', label: 'CPSAL', format: 'currency', group: 'cost', summary: 'avg' },
    { key: 'cac', label: 'CAC', format: 'currency', group: 'cost', summary: 'avg' },
  ],
};

// ---- Acquisition: PLG ----

const PLG_FUNNEL: FunnelConfig = {
  rows: [
    { key: 'investment', label: '€ Investment', format: 'currency', group: 'volume' },
    { key: 'users', label: 'Users', format: 'number', group: 'volume' },
    { key: 'hand_risers', label: 'Hand-Risers', format: 'number', group: 'volume' },
    { key: 'signups', label: 'SignUps', format: 'number', group: 'volume' },
    { key: 'pql', label: 'PQL', format: 'number', group: 'volume' },
    { key: 'pqa', label: 'PQA', format: 'number', group: 'volume' },
    { key: 'win', label: 'Win', format: 'number', group: 'volume' },
    { key: 'user_to_hr', label: '% User → HR', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'hr_to_signup', label: '% HR → SignUp', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'signup_to_pql', label: '% SignUp → PQL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pql_to_pqa', label: '% PQL → PQA', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pqa_to_win', label: '% PQA → Win', format: 'percent', group: 'conversion', summary: 'avg' },
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
    { key: 'prospect_to_lead', label: '% Prospect → Lead', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'lead_to_sql', label: '% Lead → SQL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'sql_to_sal', label: '% SQL → SAL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'sal_to_win', label: '% SAL → Win', format: 'percent', group: 'conversion', summary: 'avg' },
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
    { key: 'outreach_to_user', label: '% Outreach → User', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'user_to_hr', label: '% User → HR', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'hr_to_signup', label: '% HR → SignUp', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'signup_to_pql', label: '% SignUp → PQL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pql_to_pqa', label: '% PQL → PQA', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pqa_to_win', label: '% PQA → Win', format: 'percent', group: 'conversion', summary: 'avg' },
  ],
};

// ---- Acquisition: Organic (PLG-like, no € Investment) ----

const ORGANIC_FUNNEL: FunnelConfig = {
  rows: [
    { key: 'users', label: 'Users', format: 'number', group: 'volume' },
    { key: 'hand_risers', label: 'Hand-Risers', format: 'number', group: 'volume' },
    { key: 'signups', label: 'SignUps', format: 'number', group: 'volume' },
    { key: 'pql', label: 'PQL', format: 'number', group: 'volume' },
    { key: 'pqa', label: 'PQA', format: 'number', group: 'volume' },
    { key: 'win', label: 'Win', format: 'number', group: 'volume' },
    { key: 'user_to_hr', label: '% User → HR', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'hr_to_signup', label: '% HR → SignUp', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'signup_to_pql', label: '% SignUp → PQL', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pql_to_pqa', label: '% PQL → PQA', format: 'percent', group: 'conversion', summary: 'avg' },
    { key: 'pqa_to_win', label: '% PQA → Win', format: 'percent', group: 'conversion', summary: 'avg' },
  ],
};

// Partners = same structure as Outbound
const PARTNERS_SLG_FUNNEL = OUTBOUND_SLG_FUNNEL;
const PARTNERS_PLG_FUNNEL = OUTBOUND_PLG_FUNNEL;

// ---- Lookup maps ----

export const ACQUISITION_FUNNELS: Record<string, FunnelConfig> = {
  paid_ads: PAID_ADS_FUNNEL,
  plg: PLG_FUNNEL,
  outbound_slg: OUTBOUND_SLG_FUNNEL,
  outbound_plg: OUTBOUND_PLG_FUNNEL,
  organic: ORGANIC_FUNNEL,
  partners_slg: PARTNERS_SLG_FUNNEL,
  partners_plg: PARTNERS_PLG_FUNNEL,
};

// ---- Retention ----

export const RETENTION_CONFIG: FunnelConfig = {
  rows: [
    { key: 'active_clients', label: 'Active Clients', format: 'number', group: 'volume', summary: 'avg' },
    { key: 'churn_rate', label: '% Churn Rate', format: 'percent', group: 'volume', summary: 'avg' },
    { key: 'nrr', label: 'NRR', format: 'percent', group: 'volume', summary: 'avg' },
    { key: 'grr', label: 'GRR', format: 'percent', group: 'volume', summary: 'avg' },
  ],
};

// ---- Expansion ----

export const EXPANSION_CONFIG: FunnelConfig = {
  rows: [
    { key: 'upsell_mrr', label: 'Upsell MRR', format: 'currency', group: 'volume' },
    { key: 'crosssell_mrr', label: 'CrossSell MRR', format: 'currency', group: 'volume' },
    { key: 'expansion_mrr', label: 'Expansion MRR', format: 'currency', group: 'volume' },
    { key: 'downsell_mrr', label: 'Downsell MRR', format: 'currency', group: 'volume' },
    { key: 'crosssell_churn_mrr', label: 'CrossSell Churn MRR', format: 'currency', group: 'volume' },
    { key: 'contraction_mrr', label: 'Contraction MRR', format: 'currency', group: 'volume' },
    { key: 'net_expansion_mrr', label: 'Net Expansion MRR', format: 'currency', group: 'volume' },
  ],
};

// ---- Motion options (updated with SLG/PLG variants) ----

export const MOTION_OPTIONS = [
  { value: '', label: 'All Motions' },
  { value: 'paid_ads', label: 'Paid Ads' },
  { value: 'plg', label: 'PLG' },
  { value: 'outbound_slg', label: 'Outbound SLG' },
  { value: 'outbound_plg', label: 'Outbound PLG' },
  { value: 'organic', label: 'Organic' },
  { value: 'partners_slg', label: 'Partners SLG' },
  { value: 'partners_plg', label: 'Partners PLG' },
];

/** Map UI motion values to API-compatible values for data filtering */
export const MOTION_API_MAP: Record<string, string> = {
  paid_ads: 'paid_ads',
  plg: 'plg',
  outbound_slg: 'outbound',
  outbound_plg: 'outbound',
  organic: 'organic',
  partners_slg: 'partners',
  partners_plg: 'partners',
};

/** Get the funnel config for a phase + motion combination */
export function getPhaseFunnel(phase: string, motion: string): FunnelConfig {
  if (phase === 'retention') return RETENTION_CONFIG;
  if (phase === 'expansion') return EXPANSION_CONFIG;
  return ACQUISITION_FUNNELS[motion] || PAID_ADS_FUNNEL;
}
