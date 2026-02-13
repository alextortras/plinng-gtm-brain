## 1. Supabase Project Setup

- [ ] 1.1 Create Supabase project and configure Google Workspace SSO provider in Supabase Auth
- [ ] 1.2 Configure authorized redirect URLs and allowed email domains

## 2. Enum Types & Extensions

- [ ] 2.1 Create `funnel_stage` enum: awareness, education, selection, commit, onboarding, impact, growth, advocacy
- [ ] 2.2 Create `sales_motion` enum: outbound, partners, paid_ads, organic, plg
- [ ] 2.3 Create `market` enum: us, spain
- [ ] 2.4 Create `strategy_mode` enum: maximize_revenue, maximize_efficiency, maximize_activation
- [ ] 2.5 Create `score_type` enum: sdr_propensity, deal_momentum, csm_health
- [ ] 2.6 Create `rep_role` enum: sdr, ae, csm

## 3. Core Tables

- [ ] 3.1 Create `user_profiles` table (id, auth_uid FK, email, full_name, role, rep_role, created_at, updated_at)
- [ ] 3.2 Create `daily_funnel_metrics` table (id, date, funnel_stage, motion, market, leads_count, conversion_rate, revenue, spend, cac, pipeline_value, created_at, updated_at) with unique constraint on (date, funnel_stage, motion, market)
- [ ] 3.3 Create `strategy_config` table (id, mode, max_cac_payback_months, max_churn_rate, arpa_min, arpa_max, updated_by, is_active, created_at, updated_at)
- [ ] 3.4 Create `account_scores` table (id, account_id, score_type, score_value, score_date, is_stalled, stalled_since, contributing_factors JSONB, created_at)
- [ ] 3.5 Create `rep_kpis` table (id, user_id FK, rep_role, date, sals_generated, lead_to_sal_conversion_rate, arr_from_sals, arr_closed_won, arr_expansion, sal_to_closed_won_rate, trailing_churn_rate, grr, churn_rate, retention_deal_resolution_rate, account_health_score, created_at, updated_at) with unique constraint on (user_id, date)

## 4. Indexes

- [ ] 4.1 Add index on `daily_funnel_metrics` (date, market, motion) for dashboard drill-down queries
- [ ] 4.2 Add index on `account_scores` (account_id, score_type, score_date) for score history trend queries
- [ ] 4.3 Add index on `rep_kpis` (rep_role, date) for leaderboard queries
- [ ] 4.4 Add index on `user_profiles` (auth_uid) for auth lookups

## 5. Row-Level Security Policies

- [ ] 5.1 Enable RLS on all tables
- [ ] 5.2 Add `SELECT` policy for `authenticated` role on all tables (full transparency)
- [ ] 5.3 Add `INSERT/UPDATE` policy on `strategy_config` restricted to users where `user_profiles.role = 'admin'`
- [ ] 5.4 Add service-role bypass for scheduled sync jobs (INSERT/UPDATE on `daily_funnel_metrics`, `account_scores`, `rep_kpis`)

## 6. Default Data & Validation

- [ ] 6.1 Insert default `strategy_config` row (maximize_efficiency mode, guardrails: cac_payback=6, churn=0.05, arpa_min=80, arpa_max=130)
- [ ] 6.2 Validate schema with `openspec validate` against spec requirements
