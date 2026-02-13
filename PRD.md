# Product Requirements Document (PRD): Plinng GTM Brain

## 1. Document Overview & Objective

**Project Title:** Plinng GTM Brain (Internal Revenue Operating System)
**Purpose:** Plinng is an agentic B2B solution managing marketing and visibility for micro-SMEs (1-4 employees). We are moving away from manual Excel spreadsheets to build a centralized, AI-driven "Go-To-Market Brain". 
**Core Philosophy:** * **Winning by Design Bowtie Funnel:** We measure recurring revenue impact, not just linear acquisition.
* **Full Transparency:** Every employee logs in and can view the global dashboard and individual rep leaderboards.
* **Actionable Intelligence:** The AI acts as a prescriptive engine to surface pipeline blockages, hygiene issues, and revenue opportunities.

---

## 2. Tech Stack & Constraints

* **Frontend/Backend:** Next.js 14+ (App Router)
* **Database & Auth:** Supabase (PostgreSQL) with Google Workspace SSO
* **UI/Components:** Tremor (for charts/dashboards) + Shadcn/UI
* **AI/LLM:** Vercel AI SDK (Claude 3.5 Sonnet or GPT-4o)
* **Hosting:** Vercel
* **Constraints:** Read-only access to all external integrations (HubSpot, Google Ads, Meta Ads). The system must *never* attempt to execute changes (e.g., budget adjustments) in external ad platforms.

---

## 3. Business Logic: ICP & Unit Economic Guardrails

The AI must evaluate all data against strict baseline configurations set by the Admin:

* **Unit Economics Guardrails:** * Target maximum CAC Payback Period of <= 6 months. 
  * Churn rate must be < 5%. 
  * ARPA currently sits between 80€ and 130€.
* **ICP (Ideal Customer Profile) Scoring:**
  * **Vertical:** Home Services.
  * **Company Size:** Micro-SME (1-4 employees).
  * **Market Segments:** United States vs. Spain. (The AI must run distinct baseline evaluations for these two markets, as their dynamics differ).
* **Motion Segmentation:** Data must be filterable by Outbound, Partners, Paid Ads, Organic, and PLG. 

---

## 4. Data Architecture & Event Aggregation

* **Ingestion:** Data is fetched via scheduled jobs 3x per day (Morning, Noon, EOD) to avoid API rate limits and improve app performance.
* **Sources:** 1. HubSpot (Source of truth for Deals, CRM hygiene, and Sales Revenue).
  2. Google/Meta Ads (CAC, Spend, Impressions).
  3. Internal Product DB (Usage events).
* **Aggregation:** We do not store raw clickstreams. The database will store aggregated daily snapshots (e.g., `daily_funnel_metrics` table) mapped via `Email`, `Phone Number`, or `CIF/NIF`.

---

## 5. Hierarchical Dashboard & Full-Transparency Leaderboards

The UI follows a drill-down architecture:

* **Level 1 (Global):** Executive overview of the complete Bowtie Funnel (blended CAC, Total Pipeline, NRR).
* **Level 2 (Stage & Motion):** Specific metrics for a phase (e.g., "Selection" via "Paid Ads").
* **Level 3 (Rep Leaderboards):** Full transparency into productive team metrics:
  * **SDRs:** SALs (Sales Accepted Leads) generated, Lead -> SAL Conversion %, ARR Closed Won originating from their SALs.
  * **AEs:** ARR Closed Won (Acquisition + Expansion), SAL -> Closed Won Conversion %, and the trailing Churn Rate of accounts they closed.
  * **CSMs:** GRR (Gross Retention Rate), Churn Rate, Retention Deal Resolution Rate, Account Health Score.

---

## 6. AI Scoring Models (HubSpot & Product Data)

The system calculates automated, rule-based scores at specific Bowtie stages:

* **SDR Propensity Score (Selection Stage):** Evaluates HubSpot lead data against the Home Services ICP and engagement signals.
* **AE Deal Momentum Score (Commit Stage):** Evaluates stage velocity. *Critical Rule:* Any deal sitting in the final pipeline stages without an active "next step" is severely penalized and flagged.
* **CSM Health Score (Impact/Growth Stage):** Predicts churn or expansion readiness based on product event aggregation.

---

## 7. The "Brain" (AI Insights & Strategy Modes)

The core feature of the application is a prescriptive natural-language engine that runs on every data refresh (3x daily) to analyze deltas and anomalies.

* **Strategy Mode Configuration (The AI's Persona):** Admins can toggle the AI's core objective to calibrate its advice:
  1. **Maximize Revenue:** Tolerates higher CAC to aggressively capture market share.
  2. **Maximize Efficiency:** Strict adherence to the 6-month payback period; flags high-CAC campaigns immediately.
  3. **Maximize Activation:** Focuses purely on product usage, onboarding velocity, and time-to-first-value.
* **Output:** Natural language "Headlines" categorized by urgency.
  * *Strategic:* "Partner channel velocity in the US market slowed by 2 days; investigate onboarding bottlenecks."
  * *Tactical:* "Campaign 'Spring_Promo' CPA in Spain is 40% above the efficiency target. Pause recommended."

---

## 8. AI-Driven Revenue Forecasting Engine

The system includes a predictive forecasting module built for our B2B SaaS model:

* **Horizon & Scenarios:** Rolling 90-day forecast. Provides "Best Case," "Commit," and "Most Likely" scenarios.
* **Segmentation:** Forecasts must be separated by revenue type (New Business, Expansion, Renewals) and by Sales Motion.
* **Training Data:** The initial model must calibrate using our 3 months of historical HubSpot data, updating continuously with the 3x daily syncs.
* **Explainability:** When the AI scores a deal's likelihood to close, it must state *why* in natural language (e.g., "Matches US Home Services ICP, high momentum score, no stalled stages"). 

---

## 9. Multi-Level Alerting & Digests

* **In-App Inbox:** A read-only notification center for AI insights where users can view alerts without taking direct action inside the tool.
* **Slack Webhooks:**
  * **Leadership Digest:** Global KPIs, strategic drivers.
  * **RevOps Digest:** Broken data warnings, process inefficiencies.
  * **Sales Digest:** Pipeline metrics, conversion alerts, stalled deal warnings.
  * **Product Digest:** Activation insights, engagement drops.
  * **Real-Time Alerts:** Direct pings to specific users if a hard business rule threshold is breached.

---

## 10. Implementation Phases for AI Developer (Cursor/Claude)

*AI Agent Instructions: Execute this PRD sequentially. Do not move to the next phase until the current one is verified by the user.*

* **Phase 1: Database & Core Schema** * Generate the Supabase PostgreSQL schema. 
  * Include tables for `daily_funnel_metrics` (polymorphic to handle different motions), `strategy_config` (to store the Strategy Modes), `account_scores`, and `rep_kpis`.
* **Phase 2: Typescript Interfaces & Mocks** * Create the TS types for the DB schema.
  * Write a seed script to populate the DB with mock data reflecting the 80€-130€ ARPA, US/Spain split, and 90-day pipeline spread.
* **Phase 3: Analytics API & Vercel AI Setup** * Build the Next.js API routes that pull the daily snapshots and pass them to the Vercel AI SDK. Inject the selected Strategy Mode (Revenue/Efficiency/Activation) into the system prompt.
* **Phase 4: UI Development** * Implement the Tremor dashboards, starting with the Level 1 Global view, the Level 3 Rep Leaderboards, and the In-App Inbox for "The Brain" insights.
* **Phase 5: The Forecasting Engine** * Implement the logic to calculate the 90-day Best/Commit/Likely scenarios based on historical win rates and current Deal Momentum scores.