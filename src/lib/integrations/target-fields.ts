// ============================================================
// GTM Brain target fields available for integration field mapping
// ============================================================

import type { FunnelStage } from '@/types/database';
import type { TargetFieldOption, DimensionMappingConfig } from '@/types/integrations';

export const BOWTIE_STAGES: { value: FunnelStage; label: string }[] = [
  { value: 'awareness', label: 'Awareness' },
  { value: 'education', label: 'Education' },
  { value: 'selection', label: 'Selection' },
  { value: 'commit', label: 'Commit' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'impact', label: 'Impact' },
  { value: 'growth', label: 'Growth' },
  { value: 'advocacy', label: 'Advocacy' },
];

export const SLG_FUNNEL_STAGES: { value: string; label: string }[] = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'lead', label: 'Lead' },
  { value: 'sql', label: 'SQL' },
  { value: 'sal', label: 'SAL' },
  { value: 'win', label: 'Win' },
];

export const TARGET_FIELDS: TargetFieldOption[] = [
  // daily_funnel_metrics fields
  { table: 'daily_funnel_metrics', field: 'funnel_stage', label: 'Funnel Stage', description: 'Bowtie funnel stage (awareness → advocacy)' },
  { table: 'daily_funnel_metrics', field: 'leads_count', label: 'Leads Count', description: 'Number of leads at this stage' },
  { table: 'daily_funnel_metrics', field: 'conversion_rate', label: 'Conversion Rate', description: 'Stage conversion rate (0-1)' },
  { table: 'daily_funnel_metrics', field: 'revenue', label: 'Revenue', description: 'Revenue attributed to this stage/motion' },
  { table: 'daily_funnel_metrics', field: 'spend', label: 'Spend', description: 'Marketing/sales spend' },
  { table: 'daily_funnel_metrics', field: 'cac', label: 'CAC', description: 'Customer acquisition cost' },
  { table: 'daily_funnel_metrics', field: 'pipeline_value', label: 'Pipeline Value', description: 'Total pipeline value at this stage' },
  { table: 'daily_funnel_metrics', field: 'motion', label: 'Sales Motion', description: 'Sales motion (outbound, partners, paid_ads, organic, plg)' },
  { table: 'daily_funnel_metrics', field: 'market', label: 'Market', description: 'Market (us, spain)' },

  // account_scores fields
  { table: 'account_scores', field: 'score_value', label: 'Score Value', description: 'AI-generated account score (0-100)' },
  { table: 'account_scores', field: 'score_type', label: 'Score Type', description: 'Score category (sdr_propensity, deal_momentum, csm_health)' },
  { table: 'account_scores', field: 'account_id', label: 'Account ID', description: 'External account identifier' },
  { table: 'account_scores', field: 'contributing_factors', label: 'Contributing Factors', description: 'JSON object with score factors' },
];

// --- Market & Motion dimension values ---

export const MARKET_VALUES: { value: string; label: string }[] = [
  { value: 'us', label: 'US' },
  { value: 'spain', label: 'Spain' },
];

export const MOTION_VALUES: { value: string; label: string }[] = [
  { value: 'outbound', label: 'Outbound' },
  { value: 'partners', label: 'Partners' },
  { value: 'paid_ads', label: 'Paid Ads' },
  { value: 'organic', label: 'Organic' },
  { value: 'plg', label: 'PLG' },
];

export const DIMENSION_CONFIGS: DimensionMappingConfig[] = [
  {
    dimension: 'market',
    label: 'Market',
    description: 'Maps source country/region values to GTM Brain markets (US, Spain).',
    allowed_values: MARKET_VALUES,
    suggested_source_field: 'hs_country',
  },
  {
    dimension: 'motion',
    label: 'Sales Motion / Channel',
    description: 'Maps source traffic/channel values to GTM Brain sales motions.',
    allowed_values: MOTION_VALUES,
    suggested_source_field: 'hs_analytics_source',
  },
];

// --- Metric-only target fields (6 numeric metrics) ---

export const METRIC_TARGET_FIELDS: TargetFieldOption[] = TARGET_FIELDS.filter(
  (f) =>
    f.table === 'daily_funnel_metrics' &&
    ['leads_count', 'conversion_rate', 'revenue', 'spend', 'cac', 'pipeline_value'].includes(f.field)
);

// --- HubSpot value-map suggestions ---

export const HUBSPOT_MOTION_SUGGESTIONS: Record<string, string> = {
  ORGANIC_SEARCH: 'organic',
  ORGANIC_SOCIAL: 'organic',
  PAID_SEARCH: 'paid_ads',
  PAID_SOCIAL: 'paid_ads',
  DIRECT_TRAFFIC: 'organic',
  REFERRALS: 'partners',
  OFFLINE_SOURCES: 'outbound',
  EMAIL_MARKETING: 'outbound',
  OTHER_CAMPAIGNS: 'outbound',
};

export const HUBSPOT_MARKET_SUGGESTIONS: Record<string, string> = {
  'United States': 'us',
  US: 'us',
  USA: 'us',
  Spain: 'spain',
  España: 'spain',
  ES: 'spain',
};

// Heuristic auto-suggestion: maps common source field names to target fields
const SUGGESTION_MAP: Record<string, { table: string; field: string }> = {
  'amount': { table: 'daily_funnel_metrics', field: 'revenue' },
  'lifecyclestage': { table: 'daily_funnel_metrics', field: 'funnel_stage' },
  'lifecycle_stage': { table: 'daily_funnel_metrics', field: 'funnel_stage' },
  'pipeline': { table: 'daily_funnel_metrics', field: 'pipeline_value' },
  'hs_analytics_source': { table: 'daily_funnel_metrics', field: 'motion' },
  'closedate': { table: 'daily_funnel_metrics', field: 'revenue' },
  'close_date': { table: 'daily_funnel_metrics', field: 'revenue' },
  'num_associated_contacts': { table: 'daily_funnel_metrics', field: 'leads_count' },
  'contact_count': { table: 'daily_funnel_metrics', field: 'leads_count' },
  'spend': { table: 'daily_funnel_metrics', field: 'spend' },
  'cost': { table: 'daily_funnel_metrics', field: 'spend' },
  'budget': { table: 'daily_funnel_metrics', field: 'spend' },
  'revenue': { table: 'daily_funnel_metrics', field: 'revenue' },
  'score': { table: 'account_scores', field: 'score_value' },
  'health_score': { table: 'account_scores', field: 'score_value' },
  'account_id': { table: 'account_scores', field: 'account_id' },
  'company_id': { table: 'account_scores', field: 'account_id' },
};

export function suggestTargetField(sourceField: string): TargetFieldOption | null {
  const normalized = sourceField.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const suggestion = SUGGESTION_MAP[normalized];
  if (!suggestion) return null;
  return TARGET_FIELDS.find(
    (t) => t.table === suggestion.table && t.field === suggestion.field
  ) ?? null;
}
