-- ============================================================
-- Phase 1: Core Schema for Plinng GTM Brain
-- Bowtie Funnel revenue operating system
-- ============================================================

-- --------------------------------------------------------
-- 1. Enum Types
-- --------------------------------------------------------

CREATE TYPE funnel_stage AS ENUM (
  'awareness',
  'education',
  'selection',
  'commit',
  'onboarding',
  'impact',
  'growth',
  'advocacy'
);

CREATE TYPE sales_motion AS ENUM (
  'outbound',
  'partners',
  'paid_ads',
  'organic',
  'plg'
);

CREATE TYPE market AS ENUM (
  'us',
  'spain'
);

CREATE TYPE strategy_mode AS ENUM (
  'maximize_revenue',
  'maximize_efficiency',
  'maximize_activation'
);

CREATE TYPE score_type AS ENUM (
  'sdr_propensity',
  'deal_momentum',
  'csm_health'
);

CREATE TYPE rep_role AS ENUM (
  'sdr',
  'ae',
  'csm'
);

CREATE TYPE user_role AS ENUM (
  'admin',
  'manager',
  'member'
);

-- --------------------------------------------------------
-- 2. Tables
-- --------------------------------------------------------

-- User profiles extending Supabase Auth
CREATE TABLE user_profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid    uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  role        user_role NOT NULL DEFAULT 'member',
  rep_role    rep_role,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Daily aggregated funnel metrics (no raw clickstreams)
CREATE TABLE daily_funnel_metrics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date            date NOT NULL,
  funnel_stage    funnel_stage NOT NULL,
  motion          sales_motion NOT NULL,
  market          market NOT NULL,
  leads_count     integer NOT NULL DEFAULT 0,
  conversion_rate numeric(5,4) NOT NULL DEFAULT 0,
  revenue         numeric(12,2) NOT NULL DEFAULT 0,
  spend           numeric(12,2) NOT NULL DEFAULT 0,
  cac             numeric(12,2) NOT NULL DEFAULT 0,
  pipeline_value  numeric(12,2) NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (date, funnel_stage, motion, market)
);

-- AI strategy configuration with business rule guardrails
CREATE TABLE strategy_config (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode                    strategy_mode NOT NULL DEFAULT 'maximize_efficiency',
  max_cac_payback_months  integer NOT NULL DEFAULT 6,
  max_churn_rate          numeric(5,4) NOT NULL DEFAULT 0.0500,
  arpa_min                numeric(10,2) NOT NULL DEFAULT 80.00,
  arpa_max                numeric(10,2) NOT NULL DEFAULT 130.00,
  is_active               boolean NOT NULL DEFAULT true,
  updated_by              uuid REFERENCES user_profiles(id),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Account scoring (append-only for trend analysis)
CREATE TABLE account_scores (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id            text NOT NULL,
  score_type            score_type NOT NULL,
  score_value           numeric(5,2) NOT NULL CHECK (score_value >= 0 AND score_value <= 100),
  score_date            date NOT NULL,
  is_stalled            boolean NOT NULL DEFAULT false,
  stalled_since         timestamptz,
  contributing_factors  jsonb NOT NULL DEFAULT '{}',
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- Rep KPIs for leaderboard and performance tracking
CREATE TABLE rep_kpis (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rep_role                      rep_role NOT NULL,
  date                          date NOT NULL,

  -- SDR metrics
  sals_generated                integer,
  lead_to_sal_conversion_rate   numeric(5,4),
  arr_from_sals                 numeric(12,2),

  -- AE metrics
  arr_closed_won                numeric(12,2),
  arr_expansion                 numeric(12,2),
  sal_to_closed_won_rate        numeric(5,4),
  trailing_churn_rate           numeric(5,4),

  -- CSM metrics
  grr                           numeric(5,4),
  churn_rate                    numeric(5,4),
  retention_deal_resolution_rate numeric(5,4),
  account_health_score          numeric(5,2),

  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, date)
);

-- --------------------------------------------------------
-- 3. Indexes
-- --------------------------------------------------------

CREATE INDEX idx_daily_funnel_date_market_motion
  ON daily_funnel_metrics (date, market, motion);

CREATE INDEX idx_account_scores_history
  ON account_scores (account_id, score_type, score_date);

CREATE INDEX idx_rep_kpis_leaderboard
  ON rep_kpis (rep_role, date);

CREATE INDEX idx_user_profiles_auth_uid
  ON user_profiles (auth_uid);

-- --------------------------------------------------------
-- 4. Updated_at trigger function
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_daily_funnel_metrics_updated_at
  BEFORE UPDATE ON daily_funnel_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_strategy_config_updated_at
  BEFORE UPDATE ON strategy_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_rep_kpis_updated_at
  BEFORE UPDATE ON rep_kpis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --------------------------------------------------------
-- 5. Row-Level Security
-- --------------------------------------------------------

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_funnel_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_kpis ENABLE ROW LEVEL SECURITY;

-- Full transparency: all authenticated users can read all tables
CREATE POLICY "Authenticated users can read user_profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read daily_funnel_metrics"
  ON daily_funnel_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read strategy_config"
  ON strategy_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read account_scores"
  ON account_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read rep_kpis"
  ON rep_kpis FOR SELECT
  TO authenticated
  USING (true);

-- Admin-only write access for strategy configuration
CREATE POLICY "Admins can insert strategy_config"
  ON strategy_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE auth_uid = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update strategy_config"
  ON strategy_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE auth_uid = auth.uid()
      AND role = 'admin'
    )
  );

-- Service role (used by sync jobs) bypasses RLS automatically.
-- No explicit policy needed — Supabase service_role ignores RLS.

-- --------------------------------------------------------
-- 6. Default Data
-- --------------------------------------------------------

-- Insert default strategy configuration (Maximize Efficiency)
INSERT INTO strategy_config (mode, max_cac_payback_months, max_churn_rate, arpa_min, arpa_max, is_active)
VALUES ('maximize_efficiency', 6, 0.0500, 80.00, 130.00, true);
