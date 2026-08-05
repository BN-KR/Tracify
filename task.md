# tracify Execution Task List

## Current Phase: Phase 2 - Distribution & Teams (Milestone 5)

### 1. Teams & RBAC
- [ ] Implement Clerk Organization switching in the Dashboard
- [x] Add "Team Members" view in Settings backed by Clerk organization memberships
- [x] Add safer project deletion requiring exact project name and `DELETE`
- [x] Implement role-based access control for project deletion
- [x] Require admin access for project settings updates and API key rotation
- [x] Require developer/admin style access for trace comments

### Evaluation Engine Integration [IN PROGRESS]
- [x] Add score analytics and side-by-side model comparison in the prompt playground
- [x] Replace evaluation sub-route placeholder surfaces with usable workflows
- [x] Keep dataset version updates compatible with pre-versioning records
- [x] Add independent reviewer claims, submissions, rotation, and agreement reporting
- [x] Add runtime prompt resolution for deployed environment labels with API-key authentication
- [x] Add TypeScript and Python SDK helpers for deployed prompt resolution
- [x] Add restricted dataset access, owner sharing controls, and experiment permission checks
- [x] Add experiment baseline deltas and regression/improvement reporting
- [x] Preserve typed score data from API-key SDK feedback helpers
- [x] Add prompt cache TTL and fallback behavior to both SDKs
- [x] Add offline evaluation API smoke coverage and re-verify the production build
- [x] Make both TypeScript and Python SDK test suites runnable from the repository root
- [x] Add versioned evaluator, suite, job, result, monitor, and feedback tables with project indexes
- [x] Add authenticated evaluation overview, evaluator creation, suite creation, job creation, monitor creation, and feedback mutations
- [x] Add unified Evaluation Engine dashboard and routes for evaluators, datasets, runs, monitors, and settings
- [x] Add trace-linked quality panel for persisted scores, evaluation results, and user feedback
- [x] Add exact match, regex, JSON validity, and basic JSON Schema deterministic evaluator rules
- [x] Add public Evaluation Engine product page and marketing navigation entry
- [x] Connect online evaluator execution to the Inngest ingestion pipeline
- [x] Add reviewer assignment/rotation and inter-rater agreement UI
- [x] Add provider-backed groundedness, toxicity, PII, jailbreak, prompt-injection, and policy detector templates
- [x] Add monitor threshold alert creation and deduplication in Convex
- [x] Add SDK helpers and evaluation documentation
- [x] Add Tinybird-backed score time-series aggregation and threshold recovery alerts
- [x] Add release-gate enforcement and prompt-version promotion for regression suites
- [x] Prevent direct production-label assignment outside a passed release gate
- [x] Verify live platform smoke routes, including invalid offline evaluation requests
- [x] Add first-class Datasets and Integrations navigation plus shareable trace links
- [x] Re-run the full production build after the final platform pass
- [x] Assert unauthenticated OTLP ingestion is rejected in runtime smoke tests
- [x] Assert unauthenticated native ingestion is rejected in runtime smoke tests
- [x] Add dedicated public lifecycle overview documentation and product page
- [x] Add a dedicated realistic Datasets tab to the interactive demo

### 2. Marketing & Distribution
- [x] Reposition landing page around agent observability for builders/operators
- [ ] Update Landing Page with real dashboard screenshots
- [x] Create honest beta Pricing page without fake checkout links
- [ ] Connect Pricing page to real Stripe checkout links when Stripe is ready
- [ ] Publish SDKs to PyPI and npm
  - [x] Prepare `@5to1r/sdk` build output for npm package contents
  - [x] Rename TypeScript package/install docs to public package name `5to1r`
  - [x] Rename TypeScript package/install docs to new public package name `tracify`
  - [ ] Publish `tracify` with npm 2FA OTP or granular publish token
  - [x] Rename Python SDK distribution/install docs to public package name `5to1r`
  - [x] Rename Python SDK distribution/install docs to new public package name `tracify`
  - [ ] Publish Python `tracify` package to PyPI with a PyPI API token
- [x] Add admin-only manual project/API key issuance through Convex
- [x] Add project management page with Convex-backed per-project saved stats
- [x] Align dashboard navigation/overview/costs with dashboard decision document
- [x] Make dashboard top-level cost/span totals update from Convex saved run summaries when Tinybird analytics lags
- [x] Fix Tinybird SQL analytics parsing by forcing JSON responses
- [x] Add reusable historical demo data seed for previous-day dashboard charts
- [x] Auto-refresh dashboard analytics without requiring manual page refresh
- [x] Upgrade Costs graph to show savings impact against a peak-day baseline
- [x] Add branded custom 404 page for unmatched routes
- [x] Add savings demo seed and always show zero-dollar savings state
- [x] Keep spend as primary card value and move savings into secondary card copy
- [x] Add dashboard overview time-period switcher and use total selected-period savings
- [x] Fix range-scoped spend/span cards so 1d/7d/30d/90d no longer show all-time Convex totals
- [x] Add hybrid realtime refresh for dashboard stats using Convex activity signals plus 4-second Tinybird fallback polling
- [x] Replace 4-second Tinybird polling with Convex-backed analytics cache, budget guard, and manual refresh controls
- [x] Cache run span timelines and add manual span refresh for running traces
- [x] Make running run durations tick client-side without analytics requests
- [x] Add Redis-backed API cache for analytics stats and run spans
- [x] Remove analytics outage label, right-align timeframe/refresh controls, and keep charts visible with saved-run fallback data
- [x] Add paginated dashboard runs table with 10/25/50 page-size controls, page navigation, and total page count
- [x] Convert Alerts from sidebar page navigation into a topbar popup
- [x] Add unread alert state, prominent new-notification styling, and a Read all action
- [x] Mark individual alerts read on click and deduplicate repeated run/type alerts
- [x] Add settings validation and Slack test-alert action
- [x] Add exact indexed runId lookup to runs search
- [x] Polish trace viewer with span overview, copyable payloads, error auto-expand, and model/tool summary panel
- [x] Fix production Clerk/Convex auth by creating prod `convex` JWT template and deploying Convex prod
- [x] Document Convex/Clerk dev-vs-production auth troubleshooting runbook
- [x] Prepare Python SDK for `pip install 5to1r` and verify local wheel install
- [x] Standardize site and AI setup prompt install commands for both `pip install tracify` and `npm install tracify`
- [x] Add guarded cancel/stop control for running saved run summaries
- [x] Make dashboard breadcrumbs clickable for parent navigation
- [x] Create detailed project-manager handoff summary document
- [x] Add Tinybird pipe endpoints for `spans_by_run` and `recent_runs_summary`
- [x] Replace fake billing usage/checkout affordances with real usage or beta contact state
- [x] Add print-friendly project reports with report metadata, run totals, model/tool breakdowns, alerts, and failed traces
- [x] Add beta smoke script for ingest auth failures, invalid payloads, protected route reachability, and optional valid ingest/Convex run checks
- [x] Deploy Tinybird endpoint pipes to the active Tinybird workspace and verify endpoint responses
- [ ] Smoke test report page states: no data, normal runs, failed runs, and analytics unavailable
- [ ] Run `npm run smoke:beta` with `FIVETOONE_SMOKE_API_KEY` and `FIVETOONE_SMOKE_PROJECT_ID`

---

## Completed Tasks

### Project Onboarding Stability [COMPLETED]
- [x] Centralized zero-project handling at `/dashboard` and `/onboarding` route entry
- [x] Added Convex route-state validation for `/dashboard/[projectId]` without accepting `"no-project"` as a project id
- [x] Cleared stale browser project state for first-time/zero-project users
- [x] Removed active dashboard navigation paths that generated `/dashboard/no-project`
- [x] Seeded a Convex dev project through the terminal for the local Clerk user
- [x] Created the missing local Clerk `convex` JWT template required for browser Convex auth
- [x] Removed nested dashboard shell wrappers so only one sidebar can render
- [x] Verified with `npm run build`
- [x] Updated all TypeScript SDK install/import snippets from `@5to1r/sdk` to `5to1r`
- [x] Verified manual API key issuance via `projects:createProjectForUser`
- [x] Fixed local ingest dev environment so `npm install 5to1r` user test returns `202 Accepted`
- [x] Made dashboard analytics resilient when Tinybird stats are unavailable
- [x] Fixed Overview and Costs totals so newly ingested high-cost workflow runs appear immediately from Convex summaries
- [x] Fixed Tinybird stats endpoint so model/cost charts can parse SQL results instead of treating TSV as broken JSON
- [x] Seeded 13 days of local demo telemetry through the real ingest path for dashboard visual testing
- [x] Added 4-second visible-tab polling for Overview and Costs analytics cards/charts
- [x] Added Costs page impact cards and shaded avoided-spend area chart

### Milestone 4: Advanced Features & SDKs [COMPLETED]
- [x] Python SDK: Core logic + pyproject.toml + README
- [x] TS SDK: Core logic + package.json + README
- [x] Documentation: Quickstart guide for 5-minute instrumentation
- [x] Project Settings: Thresholds & API Key rotation logic
- [x] Billing: Usage tracking & plan cards UI
- [x] Slack Integration: Real-time alerts to Slack webhooks
- [x] Human-in-the-loop: Span-level annotations and comments

### Milestone 3: Core Trace Viewer & Product [COMPLETED]
- [x] Runs List Page: Live-updating table at `/dashboard/[projectId]/runs`
- [x] Run Detail (Trace Viewer): Vertical timeline UI at `/dashboard/[projectId]/runs/[runId]`
- [x] Dashboard Overview: Charts (Spend, Model Distribution) at `/dashboard/[projectId]`
- [x] Alerting System: Threshold checking in Inngest + Alerts inbox UI
- [x] Sidebar/Topbar Refactor: Dynamic project-aware navigation
- [x] Added MVP cost dashboard route and moved API Keys/Billing out of primary sidebar

### Milestone 2: Onboarding & Dashboard Shell [COMPLETED]
- [x] Dashboard Shell with Sidebar
- [x] Project Creation & API Key Management
- [x] Multi-step Onboarding Flow
- [x] Local Storage Persistence for Sidebar/Project context

### Milestone 1: Environment & Pipeline [COMPLETED]
- [x] Clerk Auth Integration
- [x] Convex Schema & Mutations
- [x] Tinybird spans.datasource
- [x] Inngest processSpan Function
- [x] End-to-end Pipeline Verification

### Phase 0: Foundations [COMPLETED]
- [x] Project Scaffolding (Next.js 16, Tailwind 4, Geist)
- [x] Auth Shell & Clerk Integration
- [x] High-fidelity Landing Page
- [x] Legal Pages (Privacy/Terms)

### Competitive Product Surface [COMPLETED]
- [x] Replace placeholder product feature pages with detailed shipped-capability pages
- [x] Add public roadmap, contact, and honest status surfaces
- [x] Expose runtime controls as a dashboard Control workspace route
- [x] Add product/roadmap access through the marketing and dashboard navigation

### Observe Foundation: Sessions and Search [COMPLETED]
- [x] Add optional session/user/environment/release/tag context to JSON and OTLP ingestion
- [x] Persist bounded Convex session summaries and link runs to sessions
- [x] Add Tinybird-backed project trace search with bounded filters
- [x] Add dashboard Sessions, Session detail, and Trace Search routes
- [x] Update Python/TypeScript SDK context helpers and regenerate Convex bindings
- [x] Verify targeted lint, production build, and TypeScript SDK build

### Evaluation Engine Integration (2026-08-06)
- [x] Online/offline evaluators, guardrail templates, typed scores, feedback, human review, and trace-linked quality panels.
- [x] Regression suites with release-gate metrics and safe prompt-version promotion.
- [x] Monitor breach and recovery alerts, plus Tinybird score time-series ingestion and hourly aggregation support.
- [ ] Production rollout validation: configure `EVALUATION_INTERNAL_SECRET`, deploy Tinybird datasource, and run beta smoke tests with production credentials.
