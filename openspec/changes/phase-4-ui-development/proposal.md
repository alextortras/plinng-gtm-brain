## Why

The API layer and AI Brain are in place, but there is no user interface. The PRD specifies a drill-down dashboard architecture with full-transparency leaderboards and an AI insights inbox. This phase delivers the visual layer that makes the GTM Brain usable by the team.

## What Changes

Build the complete UI using Next.js App Router with Shadcn/UI components and Recharts for data visualization. Implements the three-level drill-down hierarchy (Global → Stage/Motion → Rep Leaderboard) plus the Brain insights inbox and strategy config panel.

## Capabilities

### New Capabilities
- `app-shell`: Navigation layout with sidebar, header, and routing between views
- `global-dashboard`: Level 1 executive overview — Bowtie Funnel visualization, blended CAC, total pipeline, NRR
- `stage-motion-view`: Level 2 drill-down — metrics for a specific funnel stage filtered by sales motion
- `rep-leaderboards`: Level 3 full-transparency leaderboards for SDRs, AEs, and CSMs with role-specific KPIs
- `brain-inbox`: In-app notification center displaying AI-generated insights categorized by urgency
- `strategy-panel`: Admin panel for toggling AI strategy mode and editing business rule guardrails

### Modified Capabilities

## Impact

- Complete UI under `src/app/` with page routes and shared components
- Shadcn/UI component setup (Card, Button, Select, Badge, Tabs, etc.)
- Recharts-based chart components for funnel visualization and trend lines
- Client-side data fetching hooks
- Responsive layout for desktop use
