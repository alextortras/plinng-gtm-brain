## Why

The Phase 1 schema is in place but the database is empty. To develop and test dashboards, AI scoring, and forecasting in later phases, we need realistic mock data that reflects actual business parameters. The PRD specifies mock data must cover the 80€–130€ ARPA range, US/Spain market split, all five sales motions, and a 90-day pipeline spread.

## What Changes

Create a comprehensive seed script that populates all Phase 1 tables with realistic mock data. TypeScript interfaces are already complete from Phase 1 (`src/types/database.ts`), so this phase focuses entirely on the seed script and data generation.

## Capabilities

### New Capabilities
- `seed-data`: A runnable seed script that populates all tables with realistic mock data for development and testing

### Modified Capabilities

## Impact

- New seed script at `supabase/seed.sql` (or TypeScript seed runner)
- Mock data covering 90 days of funnel metrics, rep KPIs, account scores, and strategy config
- Enables Phase 3 (API routes) and Phase 4 (dashboards) development without a live data connection
