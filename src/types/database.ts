// ============================================================
// Database types for Plinng GTM Brain
// Maps 1:1 to the Supabase PostgreSQL schema
// ============================================================

// --- Enums ---

export type FunnelStage =
  | 'awareness'
  | 'education'
  | 'selection'
  | 'commit'
  | 'onboarding'
  | 'impact'
  | 'growth'
  | 'advocacy';

export type SalesMotion =
  | 'outbound'
  | 'partners'
  | 'paid_ads'
  | 'organic'
  | 'plg';

export type Market = 'us' | 'spain';

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
  motion: SalesMotion;
  market: Market;
  projected_revenue: number;
  conversion_rate_used: number;
  pipeline_included: number;
  deal_count: number;
  explanations: { account_id: string; explanation: string; likelihood: number }[];
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
    };
    Enums: {
      funnel_stage: FunnelStage;
      sales_motion: SalesMotion;
      market: Market;
      strategy_mode: StrategyMode;
      score_type: ScoreType;
      rep_role: RepRole;
      user_role: UserRole;
      forecast_scenario: ForecastScenario;
      revenue_type: RevenueType;
    };
  };
}
