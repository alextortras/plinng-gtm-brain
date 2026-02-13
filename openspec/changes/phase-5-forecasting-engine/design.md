## Context

Phases 1-4 established the database, API, AI Brain, and UI. Phase 5 adds the final major feature: a predictive forecasting engine. The engine uses historical funnel metrics and deal momentum scores to project revenue across three scenarios.

## Goals / Non-Goals

**Goals:**
- Calculate rolling 90-day revenue forecasts with three scenarios (Best, Commit, Most Likely)
- Segment forecasts by revenue type (New Business, Expansion, Renewals) and motion
- Store forecast snapshots for historical trend comparison
- Provide deal-level explainability for forecast contributions
- Expose API endpoints and a UI page for forecast interaction

**Non-Goals:**
- ML model training or external ML service integration (uses rule-based statistical model)
- Real-time forecast updates (batch calculation on demand or per sync)
- Quota management or target setting
- Forecast accuracy tracking over time (future enhancement)

## Decisions

1. **Rule-based statistical model**: Use weighted historical conversion rates per stage/motion/market rather than ML. Simpler, transparent, and sufficient for 90-day calibration data. Conversion rates are computed as rolling averages from `daily_funnel_metrics`.

2. **Three scenario definitions**:
   - **Best Case**: Use 75th percentile historical conversion rates, include all pipeline deals
   - **Commit**: Use median conversion rates, only include deals with momentum score > 70
   - **Most Likely**: Use weighted mean conversion rates, apply momentum-based probability weighting to each pipeline deal

3. **Revenue type derivation**: Since we don't have explicit deal types in the current schema, we derive them from funnel stage:
   - New Business = commit + selection stage revenue
   - Expansion = growth stage revenue
   - Renewals = impact stage revenue × GRR from CSM metrics

4. **Forecast table**: New `revenue_forecasts` table stores each forecast run with scenario, revenue type, motion, market, projected amount, and generation timestamp. Append-only for historical comparison.

5. **Explainability via AI**: For the top deals, pass their momentum scores and contributing factors to Claude to generate natural-language explanations. Reuses the Vercel AI SDK setup from Phase 3.

6. **UI as a new route**: Add `/forecasts` page to the sidebar. Uses Recharts grouped bar chart for scenario comparison and a detail table for deal explanations.

## Risks / Trade-offs

- **Simplistic model**: Rule-based approach may not capture complex patterns. Acceptable as a starting point; can evolve to ML once more data accumulates.
- **Revenue type derivation**: Mapping funnel stages to revenue types is an approximation. Proper deal type tracking in HubSpot would improve accuracy.
- **AI cost for explainability**: Each forecast generation may include an LLM call for explanations. Mitigated by only explaining top N deals per scenario.
