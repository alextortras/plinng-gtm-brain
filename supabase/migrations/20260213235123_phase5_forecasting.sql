-- ============================================================
-- Phase 5: Forecasting Engine Schema
-- ============================================================

-- --------------------------------------------------------
-- 1. Enum Types
-- --------------------------------------------------------

CREATE TYPE forecast_scenario AS ENUM (
  'best_case',
  'commit',
  'most_likely'
);

CREATE TYPE revenue_type AS ENUM (
  'new_business',
  'expansion',
  'renewals'
);

-- --------------------------------------------------------
-- 2. Revenue Forecasts Table
-- --------------------------------------------------------

CREATE TABLE revenue_forecasts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_at        timestamptz NOT NULL DEFAULT now(),
  scenario            forecast_scenario NOT NULL,
  revenue_type        revenue_type NOT NULL,
  motion              sales_motion NOT NULL,
  market              market NOT NULL,
  projected_revenue   numeric(14,2) NOT NULL DEFAULT 0,
  conversion_rate_used numeric(5,4) NOT NULL DEFAULT 0,
  pipeline_included   numeric(14,2) NOT NULL DEFAULT 0,
  deal_count          integer NOT NULL DEFAULT 0,
  explanations        jsonb NOT NULL DEFAULT '[]',
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------
-- 3. Indexes
-- --------------------------------------------------------

CREATE INDEX idx_forecasts_generated
  ON revenue_forecasts (generated_at DESC);

CREATE INDEX idx_forecasts_scenario_type
  ON revenue_forecasts (scenario, revenue_type);

CREATE INDEX idx_forecasts_lookup
  ON revenue_forecasts (generated_at, scenario, revenue_type, motion, market);

-- --------------------------------------------------------
-- 4. Row-Level Security
-- --------------------------------------------------------

ALTER TABLE revenue_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read forecasts"
  ON revenue_forecasts FOR SELECT
  TO authenticated
  USING (true);

-- Service role (sync/generation jobs) bypasses RLS for inserts
