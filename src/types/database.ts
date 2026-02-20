// ============================================================
// Database types for Plinng GTM Brain
// Maps 1:1 to the Supabase PostgreSQL schema
// ============================================================

// --- Enums ---

// Dynamic — values come from integration field mapping
export type FunnelStage = string;
export type SalesMotion = string;
export type Market = string;
export type Channel = string;

export type StrategyMode =
  | 'maximize_revenue'
  | 'maximize_efficiency'
  | 'maximize_activation';

export type ScoreType =
  | 'sdr_propensity'
  | 'deal_momentum'
  | 'csm_health';

export type RepRole = 'sdr' | 'ae' | 'csm';

export type UserRole = 'admin' | 'manager' | 'member';

export type ForecastScenario = 'best_case' | 'commit' | 'most_likely';

export type RevenueType = 'new_business' | 'expansion' | 'renewals';

// --- Table Row Types ---

export interface UserProfile {
  id: string;
  auth_uid: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  rep_role: RepRole | null;
  created_at: string;
  updated_at: string;
}

export interface DailyFunnelMetric {
  id: string;
  date: string;
  funnel_stage: FunnelStage;
  motion: SalesMotion;
  market: Market;
  channel: Channel | null;
  leads_count: number;
  conversion_rate: number;
  revenue: number;
  spend: number;
  cac: number;
  pipeline_value: number;
  created_at: string;
  updated_at: string;
}

export interface StrategyConfig {
  id: string;
  mode: StrategyMode;
  max_cac_payback_months: number;
  max_churn_rate: number;
  arpa_min: number;
  arpa_max: number;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountScore {
  id: string;
  account_id: string;
  score_type: ScoreType;
  score_value: number;
  score_date: string;
  is_stalled: boolean;
  stalled_since: string | null;
  contributing_factors: Record<string, unknown>;
  created_at: string;
}

export interface RepKpi {
  id: string;
  user_id: string;
  rep_role: RepRole;
  date: string;

  // SDR metrics
  sals_generated: number | null;
  lead_to_sal_conversion_rate: number | null;
  arr_from_sals: number | null;

  // AE metrics
  arr_closed_won: number | null;
  arr_expansion: number | null;
  sal_to_closed_won_rate: number | null;
  trailing_churn_rate: number | null;

  // CSM metrics
  grr: number | null;
  churn_rate: number | null;
  retention_deal_resolution_rate: number | null;
  account_health_score: number | null;

  created_at: string;
  updated_at: string;
}

export interface RevenueForecast {
  id: string;
  generated_at: string;
  scenario: ForecastScenario;
  revenue_type: RevenueType;
  funnel_stage: string;
  motion: SalesMotion;
  market: Market;
  channel: Channel | null;
  projected_revenue: number;
  conversion_rate_used: number;
  pipeline_included: number;
  deal_count: number;
  explanations: { account_id: string; explanation: string; likelihood: number }[];
  created_at: string;
}

// --- Integration Enums ---

export type IntegrationProvider = 'hubspot' | 'amplitude' | 'google_ads' | 'meta_ads';

export type IntegrationStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type IntegrationAuthType = 'oauth2' | 'api_key';

export type SyncStatus = 'running' | 'success' | 'error';

export type FieldMappingStatus = 'mapped' | 'suggested' | 'unmapped';

// --- Integration Table Row Types ---

export interface Integration {
  id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  auth_type: IntegrationAuthType;
  credentials_encrypted: string | null;
  account_name: string | null;
  account_id: string | null;
  scopes: string[];
  config: Record<string, unknown>;
  error_message: string | null;
  connected_at: string | null;
  connected_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationFieldMapping {
  id: string;
  integration_id: string;
  source_object: string;
  source_field: string;
  target_table: string;
  target_field: string;
  status: FieldMappingStatus;
  transform_rule: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationSync {
  id: string;
  integration_id: string;
  status: SyncStatus;
  started_at: string;
  completed_at: string | null;
  records_synced: number;
  records_failed: number;
  error_details: string | null;
  created_at: string;
}

// --- Supabase Database Type Map ---

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      daily_funnel_metrics: {
        Row: DailyFunnelMetric;
        Insert: Omit<DailyFunnelMetric, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DailyFunnelMetric, 'id' | 'created_at'>>;
      };
      strategy_config: {
        Row: StrategyConfig;
        Insert: Omit<StrategyConfig, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<StrategyConfig, 'id' | 'created_at'>>;
      };
      account_scores: {
        Row: AccountScore;
        Insert: Omit<AccountScore, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AccountScore, 'id' | 'created_at'>>;
      };
      rep_kpis: {
        Row: RepKpi;
        Insert: Omit<RepKpi, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<RepKpi, 'id' | 'created_at'>>;
      };
      revenue_forecasts: {
        Row: RevenueForecast;
        Insert: Omit<RevenueForecast, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<RevenueForecast, 'id' | 'created_at'>>;
      };
      integrations: {
        Row: Integration;
        Insert: Omit<Integration, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Integration, 'id' | 'created_at'>>;
      };
      integration_field_mappings: {
        Row: IntegrationFieldMapping;
        Insert: Omit<IntegrationFieldMapping, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<IntegrationFieldMapping, 'id' | 'created_at'>>;
      };
      integration_syncs: {
        Row: IntegrationSync;
        Insert: Omit<IntegrationSync, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<IntegrationSync, 'id' | 'created_at'>>;
      };
    };
    Enums: {
      strategy_mode: StrategyMode;
      score_type: ScoreType;
      rep_role: RepRole;
      user_role: UserRole;
      forecast_scenario: ForecastScenario;
      revenue_type: RevenueType;
      integration_provider: IntegrationProvider;
      integration_status: IntegrationStatus;
      integration_auth_type: IntegrationAuthType;
      sync_status: SyncStatus;
      field_mapping_status: FieldMappingStatus;
    };
  };
}
