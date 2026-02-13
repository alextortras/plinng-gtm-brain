## Context

Plinng GTM Brain needs a PostgreSQL schema in Supabase to replace manual Excel-based revenue operations. This schema is the foundation for all subsequent phases — API routes, dashboards, AI scoring, and forecasting. Data is ingested from HubSpot, Google/Meta Ads, and an internal product DB via 3x daily scheduled syncs. Only aggregated daily snapshots are stored.

## Goals / Non-Goals

**Goals:**
- Define a normalized schema that supports the full Bowtie Funnel lifecycle
- Enable efficient drill-down queries: Global → Stage/Motion → Rep Leaderboard
- Store AI strategy configuration with business rule guardrails
- Support append-only score history for trend analysis
- Enforce full-transparency read access with admin-only config writes via RLS

**Non-Goals:**
- Raw event/clickstream storage
- Real-time streaming ingestion (batch sync only)
- External integration write-back (read-only constraint)
- API routes or application logic (Phase 3)
- UI implementation (Phase 4)

## Decisions

1. **Enum types for constrained values**: Use PostgreSQL enums for `funnel_stage`, `sales_motion`, `market`, `strategy_mode`, `score_type`, and `rep_role` to enforce data integrity at the DB level.

2. **Composite upsert keys**: `daily_funnel_metrics` uses `(date, funnel_stage, motion, market)` as a unique constraint for upsert operations during each sync cycle.

3. **JSONB for score factors**: `account_scores.contributing_factors` uses JSONB to flexibly store score explanations without rigid column requirements, since factor shapes differ by score type.

4. **Append-only scoring**: Scores are never updated in place. Each evaluation inserts a new row with `score_date`, enabling trend analysis. Indexes on `(account_id, score_type, score_date)` support efficient history queries.

5. **User profiles linked to Supabase Auth**: A `user_profiles` table extends `auth.users` with `role` and optional `rep_role` to connect authentication identity to business role.

6. **RLS policy pattern**: All tables get `SELECT` for `authenticated` role. `INSERT/UPDATE` on `strategy_config` restricted to `admin` role. Service role used by sync jobs bypasses RLS.

## Risks / Trade-offs

- **Enum rigidity**: Adding a new funnel stage or motion requires a schema migration. Acceptable given these change rarely and integrity matters more than flexibility.
- **JSONB queryability**: Score contributing factors in JSONB are harder to query/index than typed columns. Mitigated by keeping the primary query path on typed columns (`score_type`, `score_value`, `score_date`).
- **3x daily sync granularity**: Intra-day metrics are overwritten by the latest sync. Acceptable per PRD requirements — daily aggregation is the target.
- **No soft deletes**: Using hard deletes for simplicity. If audit trail is needed later, can add `deleted_at` columns.
