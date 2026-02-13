## Why

Phase 1 and 2 established the database schema and mock data. The application now needs API routes to serve dashboard data and an AI-powered "Brain" that analyzes funnel metrics and produces prescriptive insights. The AI must respect the admin-configured strategy mode (Maximize Revenue / Efficiency / Activation) to calibrate its advice.

## What Changes

Build Next.js App Router API routes for all core data endpoints (funnel metrics, rep KPIs, account scores, strategy config) and integrate the Vercel AI SDK to power the prescriptive "Brain" engine that generates natural-language insights on each data query.

## Capabilities

### New Capabilities
- `analytics-api`: REST API routes for querying funnel metrics, rep KPIs, account scores, and strategy config with filtering support
- `brain-insights`: AI-powered endpoint that analyzes current data against strategy mode and business rules, returning categorized natural-language insights

### Modified Capabilities

## Impact

- New API routes under `app/api/`
- Vercel AI SDK dependency and configuration
- System prompt engineering with strategy mode injection
- Server-side Supabase queries with typed responses
