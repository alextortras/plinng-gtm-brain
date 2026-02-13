## Context

Phase 1 created the database schema. Phase 2 needs to fill it with realistic mock data for 90 days so that dashboards, AI scoring, and forecasting can be developed and tested against meaningful numbers.

## Goals / Non-Goals

**Goals:**
- Generate 90 days of daily funnel metrics across all stages, motions, and markets
- Create 8-10 mock reps (mix of SDR, AE, CSM) with daily KPI rows
- Generate 20-30 mock accounts with scoring history
- Reflect realistic business parameters (ARPA 80-130€, conversion funnels, seasonal variance)
- Make the script idempotent (safe to re-run)

**Non-Goals:**
- Connecting to live HubSpot/Ads data
- Creating a data generation API endpoint
- Generating product usage event data (Phase 3+)

## Decisions

1. **Pure SQL seed script**: Use `supabase/seed.sql` which Supabase runs automatically with `supabase db reset`. No TypeScript runner needed — keeps it simple and portable.

2. **Truncate-then-insert pattern**: The seed starts by truncating all tables (respecting FK order), making it idempotent.

3. **PL/pgSQL loops for date generation**: Use `generate_series` and procedural loops to create 90 days of data without repetitive INSERT statements.

4. **Randomized but bounded values**: Use `random()` within business-rule bounds (ARPA 80-130, churn <5%, conversion rates by stage) to create realistic variance.

5. **Auth user workaround**: Since seed runs without Supabase Auth, mock `user_profiles` rows use hardcoded UUIDs for `auth_uid` rather than referencing real `auth.users` entries.

## Risks / Trade-offs

- **No real auth.users rows**: Mock `user_profiles` won't have matching `auth.users` entries, so the FK to `auth.users` must be temporarily deferred or the FK dropped in the seed. We'll disable the FK trigger during seed and re-enable after.
- **Randomized data**: Values are random within bounds, not derived from real business patterns. Sufficient for development but not for calibration.
