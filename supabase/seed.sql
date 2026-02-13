-- ============================================================
-- Phase 2: Seed Script for Plinng GTM Brain
-- Populates 90 days of realistic mock data
-- Idempotent: safe to re-run (truncates first)
-- ============================================================

-- --------------------------------------------------------
-- 0. Clean slate (respect FK order)
-- --------------------------------------------------------
TRUNCATE rep_kpis CASCADE;
TRUNCATE account_scores CASCADE;
TRUNCATE daily_funnel_metrics CASCADE;
TRUNCATE strategy_config CASCADE;
TRUNCATE user_profiles CASCADE;

-- Temporarily disable the auth.users FK so we can insert mock profiles
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_auth_uid_fkey;

-- --------------------------------------------------------
-- 1. Mock User Profiles (3 SDRs, 3 AEs, 3 CSMs, 1 Admin)
-- --------------------------------------------------------
INSERT INTO user_profiles (id, auth_uid, email, full_name, role, rep_role) VALUES
  -- SDRs
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'maria.lopez@plinng.com',    'Maria Lopez',     'member',  'sdr'),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'james.chen@plinng.com',     'James Chen',      'member',  'sdr'),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'sofia.martinez@plinng.com', 'Sofia Martinez',  'member',  'sdr'),
  -- AEs
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'alex.johnson@plinng.com',   'Alex Johnson',    'member',  'ae'),
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 'elena.garcia@plinng.com',   'Elena Garcia',    'member',  'ae'),
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000006', 'ryan.patel@plinng.com',     'Ryan Patel',      'member',  'ae'),
  -- CSMs
  ('a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000007', 'ana.ruiz@plinng.com',       'Ana Ruiz',        'member',  'csm'),
  ('a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000008', 'david.kim@plinng.com',      'David Kim',       'member',  'csm'),
  ('a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000009', 'laura.santos@plinng.com',   'Laura Santos',    'member',  'csm'),
  -- Admin
  ('a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000010', 'admin@plinng.com',          'Admin User',      'admin',   NULL);

-- Re-add the FK constraint (will be validated when real auth users exist)
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_auth_uid_fkey
  FOREIGN KEY (auth_uid) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID;

-- --------------------------------------------------------
-- 2. Default Strategy Config
-- --------------------------------------------------------
INSERT INTO strategy_config (mode, max_cac_payback_months, max_churn_rate, arpa_min, arpa_max, is_active)
VALUES ('maximize_efficiency', 6, 0.0500, 80.00, 130.00, true);

-- --------------------------------------------------------
-- 3. Daily Funnel Metrics (90 days × 8 stages × 5 motions × 2 markets)
-- --------------------------------------------------------
DO $$
DECLARE
  d date;
  s funnel_stage;
  m sales_motion;
  mkt market;
  base_leads integer;
  stage_factor numeric;
  motion_factor numeric;
  market_factor numeric;
  day_noise numeric;
  leads integer;
  conv numeric;
  rev numeric;
  spd numeric;
  pip numeric;
  cac_val numeric;
BEGIN
  FOR d IN SELECT generate_series(CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '1 day', '1 day')::date
  LOOP
    FOR s IN SELECT unnest(enum_range(NULL::funnel_stage))
    LOOP
      FOR m IN SELECT unnest(enum_range(NULL::sales_motion))
      LOOP
        FOR mkt IN SELECT unnest(enum_range(NULL::market))
        LOOP
          -- Stage decay factor (top-of-funnel has more leads)
          stage_factor := CASE s
            WHEN 'awareness'  THEN 1.00
            WHEN 'education'  THEN 0.70
            WHEN 'selection'  THEN 0.45
            WHEN 'commit'     THEN 0.25
            WHEN 'onboarding' THEN 0.20
            WHEN 'impact'     THEN 0.18
            WHEN 'growth'     THEN 0.10
            WHEN 'advocacy'   THEN 0.05
          END;

          -- Motion weighting (paid_ads and outbound drive more top-of-funnel)
          motion_factor := CASE m
            WHEN 'paid_ads' THEN 1.20
            WHEN 'outbound' THEN 1.00
            WHEN 'organic'  THEN 0.80
            WHEN 'partners' THEN 0.60
            WHEN 'plg'      THEN 0.50
          END;

          -- Market split (US is ~60% of volume, Spain ~40%)
          market_factor := CASE mkt
            WHEN 'us'    THEN 1.00
            WHEN 'spain' THEN 0.65
          END;

          -- Daily noise ±20%
          day_noise := 0.80 + (random() * 0.40);

          -- Base leads per day per combination
          base_leads := 50;
          leads := GREATEST(1, (base_leads * stage_factor * motion_factor * market_factor * day_noise)::integer);

          -- Conversion rate decays by stage (awareness->education ~70%, deeper stages ~50-60%)
          conv := CASE s
            WHEN 'awareness'  THEN 0.65 + (random() * 0.10)
            WHEN 'education'  THEN 0.60 + (random() * 0.10)
            WHEN 'selection'  THEN 0.50 + (random() * 0.10)
            WHEN 'commit'     THEN 0.45 + (random() * 0.15)
            WHEN 'onboarding' THEN 0.80 + (random() * 0.15)
            WHEN 'impact'     THEN 0.75 + (random() * 0.15)
            WHEN 'growth'     THEN 0.30 + (random() * 0.15)
            WHEN 'advocacy'   THEN 0.20 + (random() * 0.10)
          END;

          -- Revenue: accounts × ARPA (80-130€ range)
          rev := leads * (80.00 + (random() * 50.00));

          -- Spend: higher for paid channels, lower for organic/plg
          spd := CASE m
            WHEN 'paid_ads' THEN leads * (25.00 + random() * 20.00)
            WHEN 'outbound' THEN leads * (10.00 + random() * 10.00)
            WHEN 'partners' THEN leads * (5.00 + random() * 8.00)
            WHEN 'organic'  THEN leads * (2.00 + random() * 3.00)
            WHEN 'plg'      THEN leads * (1.50 + random() * 2.50)
          END;

          -- CAC = spend / leads (or 0 if no spend)
          cac_val := CASE WHEN leads > 0 THEN spd / leads ELSE 0 END;

          -- Pipeline = revenue × pipeline multiplier by stage
          pip := rev * CASE s
            WHEN 'awareness'  THEN 3.00
            WHEN 'education'  THEN 2.50
            WHEN 'selection'  THEN 2.00
            WHEN 'commit'     THEN 1.50
            WHEN 'onboarding' THEN 1.00
            WHEN 'impact'     THEN 0.80
            WHEN 'growth'     THEN 1.20
            WHEN 'advocacy'   THEN 0.50
          END;

          INSERT INTO daily_funnel_metrics (date, funnel_stage, motion, market, leads_count, conversion_rate, revenue, spend, cac, pipeline_value)
          VALUES (d, s, m, mkt, leads, ROUND(conv::numeric, 4), ROUND(rev, 2), ROUND(spd, 2), ROUND(cac_val, 2), ROUND(pip, 2));

        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- --------------------------------------------------------
-- 4. Mock Account Scores (25 accounts, weekly snapshots over 90 days)
-- --------------------------------------------------------
DO $$
DECLARE
  acct_id text;
  acct_num integer;
  score_d date;
  st score_type;
  base_score numeric;
  score_val numeric;
  is_stall boolean;
  stall_ts timestamptz;
  factors jsonb;
BEGIN
  FOR acct_num IN 1..25
  LOOP
    acct_id := 'ACCT-' || LPAD(acct_num::text, 4, '0');

    FOR score_d IN SELECT generate_series(CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '1 day', '7 days')::date
    LOOP
      -- Assign a primary score type based on account segment
      IF acct_num <= 8 THEN
        st := 'sdr_propensity';
        base_score := 40 + (random() * 40);  -- 40-80 range
        factors := jsonb_build_object(
          'icp_match', CASE WHEN random() > 0.3 THEN 'home_services' ELSE 'other' END,
          'engagement_signals', ROUND((random() * 10)::numeric, 1),
          'company_size', (1 + (random() * 3)::integer)
        );
      ELSIF acct_num <= 16 THEN
        st := 'deal_momentum';
        base_score := 30 + (random() * 50);  -- 30-80 range
        factors := jsonb_build_object(
          'stage_velocity_days', (3 + (random() * 25)::integer),
          'has_next_step', CASE WHEN random() > 0.25 THEN true ELSE false END,
          'deal_size', ROUND((80 + random() * 50)::numeric, 2)
        );
      ELSE
        st := 'csm_health';
        base_score := 50 + (random() * 40);  -- 50-90 range
        factors := jsonb_build_object(
          'product_usage_score', ROUND((random() * 100)::numeric, 1),
          'days_since_last_login', (1 + (random() * 30)::integer),
          'support_tickets_open', (random() * 5)::integer
        );
      END IF;

      -- Add trend drift over time (slight improvement or decline)
      score_val := LEAST(100, GREATEST(0,
        base_score + (EXTRACT(EPOCH FROM (score_d - (CURRENT_DATE - 90))) / 86400) * (random() * 0.3 - 0.1)
      ));

      -- Mark some deals as stalled (accounts 10-13 in deal_momentum)
      is_stall := false;
      stall_ts := NULL;
      IF st = 'deal_momentum' AND acct_num BETWEEN 10 AND 13 AND random() > 0.4 THEN
        is_stall := true;
        stall_ts := score_d - (INTERVAL '1 day' * (3 + (random() * 14)::integer));
        score_val := LEAST(score_val, 25);  -- Severely penalize stalled deals
        factors := factors || jsonb_build_object('has_next_step', false, 'stall_reason', 'no_next_step');
      END IF;

      INSERT INTO account_scores (account_id, score_type, score_value, score_date, is_stalled, stalled_since, contributing_factors)
      VALUES (acct_id, st, ROUND(score_val, 2), score_d, is_stall, stall_ts, factors);
    END LOOP;
  END LOOP;
END $$;

-- --------------------------------------------------------
-- 5. Mock Rep KPIs (90 days for all 9 reps)
-- --------------------------------------------------------
DO $$
DECLARE
  d date;
  rep_id uuid;
  r_role rep_role;
  -- SDR vars
  sals integer;
  l2s_rate numeric;
  arr_sals numeric;
  -- AE vars
  arr_cw numeric;
  arr_exp numeric;
  s2cw_rate numeric;
  trail_churn numeric;
  -- CSM vars
  csm_grr numeric;
  csm_churn numeric;
  csm_resolution numeric;
  csm_health numeric;
BEGIN
  FOR d IN SELECT generate_series(CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '1 day', '1 day')::date
  LOOP
    -- SDRs (profiles 1-3)
    FOR i IN 1..3
    LOOP
      rep_id := ('a1000000-0000-0000-0000-00000000000' || i)::uuid;

      sals := 2 + (random() * 6)::integer;                     -- 2-8 SALs/day
      l2s_rate := 0.10 + (random() * 0.15);                    -- 10-25%
      arr_sals := sals * (80.00 + random() * 50.00) * 12;      -- Annual from ARPA

      INSERT INTO rep_kpis (user_id, rep_role, date, sals_generated, lead_to_sal_conversion_rate, arr_from_sals)
      VALUES (rep_id, 'sdr', d, sals, ROUND(l2s_rate, 4), ROUND(arr_sals, 2))
      ON CONFLICT (user_id, date) DO UPDATE SET
        sals_generated = EXCLUDED.sals_generated,
        lead_to_sal_conversion_rate = EXCLUDED.lead_to_sal_conversion_rate,
        arr_from_sals = EXCLUDED.arr_from_sals;
    END LOOP;

    -- AEs (profiles 4-6)
    FOR i IN 4..6
    LOOP
      rep_id := ('a1000000-0000-0000-0000-00000000000' || i)::uuid;

      arr_cw := (random() * 3)::integer * (80.00 + random() * 50.00) * 12;  -- 0-3 deals × ARPA × 12
      arr_exp := (random() * 500.00);                                         -- Expansion revenue
      s2cw_rate := 0.15 + (random() * 0.20);                                 -- 15-35%
      trail_churn := 0.01 + (random() * 0.04);                               -- 1-5%

      INSERT INTO rep_kpis (user_id, rep_role, date, arr_closed_won, arr_expansion, sal_to_closed_won_rate, trailing_churn_rate)
      VALUES (rep_id, 'ae', d, ROUND(arr_cw, 2), ROUND(arr_exp, 2), ROUND(s2cw_rate, 4), ROUND(trail_churn, 4))
      ON CONFLICT (user_id, date) DO UPDATE SET
        arr_closed_won = EXCLUDED.arr_closed_won,
        arr_expansion = EXCLUDED.arr_expansion,
        sal_to_closed_won_rate = EXCLUDED.sal_to_closed_won_rate,
        trailing_churn_rate = EXCLUDED.trailing_churn_rate;
    END LOOP;

    -- CSMs (profiles 7-9)
    FOR i IN 7..9
    LOOP
      rep_id := ('a1000000-0000-0000-0000-00000000000' || i)::uuid;

      csm_grr := 0.88 + (random() * 0.10);         -- 88-98%
      csm_churn := 0.01 + (random() * 0.04);        -- 1-5%
      csm_resolution := 0.60 + (random() * 0.30);   -- 60-90%
      csm_health := 50 + (random() * 45);            -- 50-95

      INSERT INTO rep_kpis (user_id, rep_role, date, grr, churn_rate, retention_deal_resolution_rate, account_health_score)
      VALUES (rep_id, 'csm', d, ROUND(csm_grr, 4), ROUND(csm_churn, 4), ROUND(csm_resolution, 4), ROUND(csm_health, 2))
      ON CONFLICT (user_id, date) DO UPDATE SET
        grr = EXCLUDED.grr,
        churn_rate = EXCLUDED.churn_rate,
        retention_deal_resolution_rate = EXCLUDED.retention_deal_resolution_rate,
        account_health_score = EXCLUDED.account_health_score;
    END LOOP;
  END LOOP;
END $$;

-- --------------------------------------------------------
-- Summary counts for verification
-- --------------------------------------------------------
DO $$
DECLARE
  cnt_profiles integer;
  cnt_metrics integer;
  cnt_scores integer;
  cnt_kpis integer;
  cnt_config integer;
BEGIN
  SELECT count(*) INTO cnt_profiles FROM user_profiles;
  SELECT count(*) INTO cnt_metrics FROM daily_funnel_metrics;
  SELECT count(*) INTO cnt_scores FROM account_scores;
  SELECT count(*) INTO cnt_kpis FROM rep_kpis;
  SELECT count(*) INTO cnt_config FROM strategy_config;

  RAISE NOTICE '=== Seed Complete ===';
  RAISE NOTICE 'user_profiles:       % rows', cnt_profiles;
  RAISE NOTICE 'daily_funnel_metrics: % rows', cnt_metrics;
  RAISE NOTICE 'account_scores:      % rows', cnt_scores;
  RAISE NOTICE 'rep_kpis:            % rows', cnt_kpis;
  RAISE NOTICE 'strategy_config:     % rows', cnt_config;
END $$;
