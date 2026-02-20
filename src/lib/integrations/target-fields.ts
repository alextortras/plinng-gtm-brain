// ============================================================
// GTM Brain target fields available for integration field mapping
// ============================================================

import type { TargetFieldOption, DimensionMappingConfig } from '@/types/integrations';

export const TARGET_FIELDS: TargetFieldOption[] = [
  // daily_funnel_metrics fields
  { table: 'daily_funnel_metrics', field: 'date', label: 'Date', description: 'Snapshot date for the metric row' },
  { table: 'daily_funnel_metrics', field: 'funnel_stage', label: 'Funnel Stage', description: 'Bowtie funnel stage (awareness → advocacy)' },
  { table: 'daily_funnel_metrics', field: 'leads_count', label: 'Leads Count', description: 'Number of leads at this stage' },
  { table: 'daily_funnel_metrics', field: 'conversion_rate', label: 'Conversion Rate', description: 'Stage conversion rate (0-1)' },
  { table: 'daily_funnel_metrics', field: 'revenue', label: 'Revenue', description: 'Revenue attributed to this stage/motion' },
  { table: 'daily_funnel_metrics', field: 'spend', label: 'Spend', description: 'Marketing/sales spend' },
  { table: 'daily_funnel_metrics', field: 'cac', label: 'CAC', description: 'Customer acquisition cost' },
  { table: 'daily_funnel_metrics', field: 'pipeline_value', label: 'Pipeline Value', description: 'Total pipeline value at this stage' },
  { table: 'daily_funnel_metrics', field: 'motion', label: 'Sales Motion', description: 'Sales motion (dynamic — from integration)' },
  { table: 'daily_funnel_metrics', field: 'market', label: 'Market', description: 'Market (dynamic — from integration)' },
  { table: 'daily_funnel_metrics', field: 'channel', label: 'Channel', description: 'Traffic source / channel (dynamic — from integration)' },

  // account_scores fields
  { table: 'account_scores', field: 'score_value', label: 'Score Value', description: 'AI-generated account score (0-100)' },
  { table: 'account_scores', field: 'score_type', label: 'Score Type', description: 'Score category (sdr_propensity, deal_momentum, csm_health)' },
  { table: 'account_scores', field: 'account_id', label: 'Account ID', description: 'External account identifier' },
  { table: 'account_scores', field: 'contributing_factors', label: 'Contributing Factors', description: 'JSON object with score factors' },
];

export const DIMENSION_CONFIGS: DimensionMappingConfig[] = [
  {
    dimension: 'funnel_stage',
    label: 'Funnel Stage',
    description: 'Select the field that identifies the lifecycle or funnel stage (e.g. lifecycle stage, deal stage).',
    required: true,
  },
  {
    dimension: 'market',
    label: 'Market',
    description: 'Select the field that identifies the market or country for each record.',
    required: true,
  },
  {
    dimension: 'channel',
    label: 'Channel',
    description: 'Select the field that identifies the traffic source or channel (e.g. organic search, paid social, referral).',
    required: true,
  },
  {
    dimension: 'motion',
    label: 'Motion',
    description: 'Select the field that identifies the GTM motion (e.g. SLG, PLG). Optional — most companies have a single motion.',
    required: false,
  },
];

// --- Metric-only target fields (6 numeric metrics) ---

export const METRIC_TARGET_FIELDS: TargetFieldOption[] = TARGET_FIELDS.filter(
  (f) =>
    f.table === 'daily_funnel_metrics' &&
    ['leads_count', 'conversion_rate', 'revenue', 'spend', 'cac', 'pipeline_value'].includes(f.field)
);

// Heuristic auto-suggestion: maps common source field names to target fields
const SUGGESTION_MAP: Record<string, { table: string; field: string }> = {
  'amount': { table: 'daily_funnel_metrics', field: 'revenue' },
  'lifecyclestage': { table: 'daily_funnel_metrics', field: 'funnel_stage' },
  'lifecycle_stage': { table: 'daily_funnel_metrics', field: 'funnel_stage' },
  'pipeline': { table: 'daily_funnel_metrics', field: 'pipeline_value' },
  'hs_analytics_source': { table: 'daily_funnel_metrics', field: 'channel' },
  'closedate': { table: 'daily_funnel_metrics', field: 'date' },
  'close_date': { table: 'daily_funnel_metrics', field: 'date' },
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
  'gtm_motion': { table: 'daily_funnel_metrics', field: 'motion' },
};

export function suggestTargetField(sourceField: string): TargetFieldOption | null {
  const normalized = sourceField.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const suggestion = SUGGESTION_MAP[normalized];
  if (!suggestion) return null;
  return TARGET_FIELDS.find(
    (t) => t.table === suggestion.table && t.field === suggestion.field
  ) ?? null;
}
