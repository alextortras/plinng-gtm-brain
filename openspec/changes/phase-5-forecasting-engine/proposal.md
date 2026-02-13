## Why

The GTM Brain has dashboards, leaderboards, and AI insights, but no forward-looking revenue predictions. The PRD specifies a rolling 90-day forecasting engine that provides Best Case, Commit, and Most Likely scenarios segmented by revenue type and sales motion. This gives leadership the visibility to plan headcount, budget, and strategy with confidence.

## What Changes

Add a forecasting engine that calculates 90-day revenue projections from historical funnel metrics and deal momentum scores. Includes a new database table for forecast snapshots, calculation logic, an API endpoint, and a forecast visualization page.

## Capabilities

### New Capabilities
- `forecast-engine`: Core calculation logic that produces Best/Commit/Most Likely 90-day revenue forecasts segmented by revenue type (New Business, Expansion, Renewals) and sales motion
- `forecast-api`: API endpoint to trigger forecast generation and retrieve results
- `forecast-ui`: Dashboard page with scenario comparison charts and explainability detail

### Modified Capabilities

## Impact

- New `revenue_forecasts` database table and migration
- New TypeScript types for forecast data
- Forecast calculation module in `src/lib/forecast/`
- New API route at `/api/forecasts`
- New UI page at `/forecasts`
- Sidebar navigation updated with Forecasts link
