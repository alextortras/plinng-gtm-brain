## 1. Seed Script Setup

- [ ] 1.1 Create `supabase/seed.sql` with truncation logic (respecting FK order)
- [ ] 1.2 Temporarily handle `auth.users` FK constraint for mock user profiles

## 2. Mock User Profiles & Reps

- [ ] 2.1 Insert 10 mock user profiles: 3 SDRs, 3 AEs, 3 CSMs, 1 admin
- [ ] 2.2 Assign realistic names, emails, and roles

## 3. Mock Daily Funnel Metrics

- [ ] 3.1 Generate 90 days of `daily_funnel_metrics` rows using `generate_series`
- [ ] 3.2 Cover all 8 funnel stages × 5 motions × 2 markets per day
- [ ] 3.3 Apply realistic value ranges (leads tapering by stage, revenue in ARPA range, conversion decay)

## 4. Mock Account Scores

- [ ] 4.1 Create 25 mock accounts with IDs
- [ ] 4.2 Generate weekly score snapshots for 90 days (SDR propensity, deal momentum, CSM health)
- [ ] 4.3 Flag 3-5 accounts as stalled with `is_stalled = true` and `stalled_since` timestamps

## 5. Mock Rep KPIs

- [ ] 5.1 Generate 90 days of KPI rows for each SDR (sals_generated, conversion rates, ARR)
- [ ] 5.2 Generate 90 days of KPI rows for each AE (closed won, expansion, churn)
- [ ] 5.3 Generate 90 days of KPI rows for each CSM (GRR, churn, health scores)

## 6. Validation

- [ ] 6.1 Verify seed runs cleanly with `supabase db reset`
- [ ] 6.2 Validate row counts and data ranges with spot-check queries
