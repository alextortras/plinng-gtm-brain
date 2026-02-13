## 1. Dependencies & Configuration

- [ ] 1.1 Install Vercel AI SDK (`ai`, `@ai-sdk/anthropic`) dependencies
- [ ] 1.2 Add AI provider env vars to `.env.local.example`

## 2. Shared Utilities

- [ ] 2.1 Create `src/lib/auth.ts` — `getAuthenticatedUser()` helper for route handlers
- [ ] 2.2 Create `src/lib/queries/funnel-metrics.ts` — typed query functions with filter support
- [ ] 2.3 Create `src/lib/queries/rep-kpis.ts` — typed query functions with role/sort filters
- [ ] 2.4 Create `src/lib/queries/account-scores.ts` — typed query functions with type/stalled filters
- [ ] 2.5 Create `src/lib/queries/strategy-config.ts` — get/update active config functions

## 3. API Route Handlers

- [ ] 3.1 Create `app/api/funnel-metrics/route.ts` — GET with market/motion/stage/date filters
- [ ] 3.2 Create `app/api/rep-kpis/route.ts` — GET with role/sort/order filters
- [ ] 3.3 Create `app/api/account-scores/route.ts` — GET with type/stalled filters
- [ ] 3.4 Create `app/api/strategy-config/route.ts` — GET and PUT handlers

## 4. AI Brain Setup

- [ ] 4.1 Create `src/lib/brain/system-prompt.ts` — dynamic prompt builder with strategy mode injection
- [ ] 4.2 Create `src/lib/brain/data-summarizer.ts` — aggregates recent metrics into compact LLM context
- [ ] 4.3 Create `app/api/brain/insights/route.ts` — POST handler with streaming AI response

## 5. Validation

- [ ] 5.1 Type-check project with `tsc --noEmit`
- [ ] 5.2 Validate OpenSpec change with `openspec validate`
