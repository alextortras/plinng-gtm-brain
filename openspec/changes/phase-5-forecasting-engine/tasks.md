## 1. Database Schema Extension

- [ ] 1.1 Create migration for `revenue_forecasts` table (id, generated_at, scenario, revenue_type, motion, market, projected_revenue, conversion_rate_used, pipeline_included, deal_count, explanations JSONB, created_at)
- [ ] 1.2 Add TypeScript types for `RevenueForecast` and related enums
- [ ] 1.3 Add indexes on (generated_at, scenario, revenue_type)

## 2. Forecast Calculation Engine

- [ ] 2.1 Create `src/lib/forecast/conversion-rates.ts` — compute historical conversion rates (mean, median, p75) per stage/motion/market
- [ ] 2.2 Create `src/lib/forecast/scenarios.ts` — implement Best Case, Commit, Most Likely calculation logic
- [ ] 2.3 Create `src/lib/forecast/revenue-types.ts` — derive New Business, Expansion, Renewals from funnel stage mapping
- [ ] 2.4 Create `src/lib/forecast/explainer.ts` — generate natural-language deal explanations via AI

## 3. API Endpoints

- [ ] 3.1 Create `app/api/forecasts/route.ts` — GET handler with revenue type and motion filters
- [ ] 3.2 Create `app/api/forecasts/generate/route.ts` — POST handler that runs forecast engine and stores results
- [ ] 3.3 Create `src/lib/queries/forecasts.ts` — query module for reading/writing forecast data

## 4. UI Page

- [ ] 4.1 Create `app/forecasts/page.tsx` — scenario comparison cards + grouped bar chart
- [ ] 4.2 Add revenue type breakdown table
- [ ] 4.3 Add motion filter and generate button
- [ ] 4.4 Add deal explanation detail section
- [ ] 4.5 Add "Forecasts" link to sidebar navigation

## 5. Validation

- [ ] 5.1 Type-check project with `tsc --noEmit`
- [ ] 5.2 Validate OpenSpec change with `openspec validate`
