## Context

The database and mock data are in place. Phase 3 adds the application layer: API routes for data access and the AI Brain for generating insights. All routes run server-side in Next.js App Router route handlers.

## Goals / Non-Goals

**Goals:**
- Expose typed API routes for all core tables with filtering
- Integrate Vercel AI SDK with strategy-mode-aware system prompts
- Stream AI responses for real-time UX
- Centralize data-fetching logic into reusable query modules
- Enforce authentication on all endpoints

**Non-Goals:**
- Building UI components (Phase 4)
- Implementing the forecasting engine (Phase 5)
- Connecting to live HubSpot/Ads APIs (future work)
- Caching layer or rate limiting (premature optimization)

## Decisions

1. **Query modules in `src/lib/queries/`**: Each table gets a query module with typed functions (e.g., `getFunnelMetrics(filters)`) used by both API routes and server components. Avoids duplicating Supabase query logic.

2. **Vercel AI SDK with `ai` package**: Use `ai` + `@ai-sdk/anthropic` (Claude) as primary provider. System prompt is built dynamically from the active `strategy_config` row.

3. **Structured output for insights**: The AI returns JSON with `category` (strategic/tactical), `urgency` (high/medium/low), `headline`, and `detail` fields. Parsed via Vercel AI SDK's `generateObject` or streamed as text with structured formatting.

4. **Data summary before LLM call**: The Brain endpoint aggregates recent metrics into a compact summary (not raw rows) before passing to the LLM. This keeps token usage efficient and context focused.

5. **Auth middleware pattern**: A shared `getAuthenticatedUser()` helper checks the Supabase session and returns the user or throws 401. Used at the top of every route handler.

## Risks / Trade-offs

- **LLM cost per insight call**: Each Brain request makes an LLM API call. Mitigated by summarizing data before sending and keeping prompts focused.
- **No caching yet**: API routes query Supabase on every request. Acceptable for development; caching can be added when real data and traffic patterns are known.
- **AI provider lock-in**: Using Vercel AI SDK abstracts the provider, making it easy to swap between Claude and GPT-4o later.
