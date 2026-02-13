## Why

Plinng GTM Brain currently relies on manual Excel spreadsheets for revenue operations. To build an AI-driven Go-To-Market operating system, we need a structured PostgreSQL schema in Supabase as the foundational data layer. All downstream features — dashboards, AI scoring, forecasting, and alerting — depend on this schema being in place first.

## What Changes

Introduce the core Supabase PostgreSQL schema covering funnel metrics, AI strategy configuration, account scoring, and rep performance tracking. This includes Row-Level Security policies, Google Workspace SSO via Supabase Auth, and the aggregated daily snapshot pattern (no raw clickstreams).

## Capabilities

### New Capabilities
- `daily-funnel-metrics`: Aggregated daily snapshots of Bowtie Funnel metrics by stage, motion, and market (US/Spain)
- `strategy-configuration`: Admin-configurable AI strategy modes (Maximize Revenue / Efficiency / Activation) with business rule guardrails
- `account-scoring`: Automated scoring tables for SDR Propensity, AE Deal Momentum, and CSM Health scores
- `rep-performance`: Rep KPI tracking across SDR, AE, and CSM roles with leaderboard support
- `auth-and-access`: Google Workspace SSO integration via Supabase Auth with role-based access

### Modified Capabilities

## Impact

- New Supabase project setup with PostgreSQL schema
- Supabase Auth configured for Google Workspace SSO
- Row-Level Security policies for full transparency (all authenticated users can read)
- Admin-only write access for strategy configuration
- Foundation for all subsequent phases (API routes, dashboards, AI engine, forecasting)
