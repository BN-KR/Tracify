# tracify Strategic Implementation Plan

## AI Engineering Platform Pass (2026-08-05)

- Added score analytics in the Evaluation workspace: per-evaluator sample counts, numeric averages, boolean pass rates, and source breakdowns.
- Extended the prompt playground to compare two provider models in parallel with per-model output and latency.
- Replaced evaluation sub-route placeholder copy with working dataset, run-history, monitor, and settings workflows.
- Made dataset versions backward-compatible for legacy Convex documents (missing versions default to v1 on update).
- Verification: production `npm run build`, TypeScript, focused platform lint, and Convex code generation pass. Authenticated browser E2E remains pending until a signed-in test session is available.
- Added independent annotation review records with self-claim, reviewer submission, reviewer rotation support, and agreement reporting in the review queue.
- Added an API-key-authenticated prompt resolver for labeled development/staging/production versions, plus public runtime documentation and smoke coverage.
- Added `getPrompt` / `get_prompt` helpers to the TypeScript and Python SDKs, including prompt-version trace linking examples.
- Added project/restricted dataset access modes, owner-controlled sharing, and permission checks across dataset and experiment reads/writes.
- Added experiment score deltas against the prior run, with a regression/improvement report in the experiment workspace.
- Fixed API-key SDK score ingestion so declared numeric, boolean, categorical, and text data types are persisted and validated correctly.
- Added SDK-side prompt caching with stale-cache and explicit fallback recovery for runtime availability.
- Extended platform smoke coverage to the offline evaluation-run API and verified the full Next production build again (56 routes).
- Made the TypeScript and Python SDK suites runnable from the repository root; both pass (24 TS, 18 Python).
- Corrected pricing copy that still described shipped prompt/evaluation/experiment/runtime workflows as roadmap items.
- Added the OTLP health endpoint to platform smoke coverage and verified the OTLP route plus TypeScript compilation.
- Hardened API-key usage bookkeeping so the public mutation requires the matching hashed key and active project, protecting both native and OTLP ingestion.
- Added a first-class Datasets dashboard route and sidebar navigation entry, backed by the existing dataset workflow, plus smoke coverage.
- Added a one-click “Share trace” action that copies the authenticated deep link from the trace viewer, and cleared the viewer lint gate.
- Added Integrations as a direct dashboard Resources link and kept it covered by the public-route smoke suite.
- Platform-focused lint passes; the repository-wide lint command still reports unrelated legacy errors in blog/marketing files and is intentionally not being widened into this platform pass.
- Closed the production-label bypass: prompt mutations and the editor can promote only to development/staging; production is assigned exclusively by a passed evaluation release gate.
- Expanded the integrations guide with a copy-paste OTLP exporter setup and explicit OpenAI, LangChain, and LlamaIndex instrumentation guidance.
- Expanded `lint:platform` to cover OTLP ingestion, Datasets, sidebar navigation, trace sharing, and all current platform workflow files; the gate passes with TypeScript compilation.
- Made the interactive demo’s production-promotion control functional: clicking it updates the demo state and explains the evaluation-gated release behavior.
- Ran the live platform smoke suite against the existing local server, fixed `/api/evaluation/run` invalid-ID handling (500 → 404), and confirmed every smoke route passes.
- Final `npm run build` passes after all changes: Next.js compiled, TypeScript passed, and all 56 static/dynamic routes generated successfully.
- Added an unauthenticated OTLP POST contract assertion to smoke coverage; the live suite still passes.
- Added the same unauthenticated-boundary assertion for native `/api/ingest`; smoke and focused lint remain green.
- Added dedicated `/docs/lifecycle` and `/product/lifecycle` overview pages explaining the complete Trace → Deploy loop, with both routes in smoke coverage.
- Expanded the interactive demo with a dedicated Datasets tab showing versioned examples, expected outputs, metadata, and project-sharing state.

This plan merges the **Comprehensive Build Plan** and the **What To Do Now** strategic assessment. It prioritises the transition from a verified ingestion pipeline to a functional, high-fidelity developer product.

## Evaluation Engine Integration (2026-08-05)

- Added the durable evaluation domain model in `convex/schema.ts`: evaluator versions, suites, jobs, results, monitors, and feedback.
- Added `convex/evaluationEngine.ts` for authenticated overview, trace-quality reads, evaluator/suite/job/monitor creation, and deduplicated feedback capture.
- Replaced the Evaluation Lab landing surface with a unified Evaluation Engine workspace and added datasets, runs, monitors, and settings routes while preserving existing evaluator/review URLs.
- Added trace-viewer quality evidence and expanded deterministic evaluator rules for exact match, regex, JSON validity, and basic JSON Schema validation.
- Added `/product/evaluation-engine` and marketing navigation copy.
- Remaining integration work at the time was Inngest online execution, provider-backed detectors, reviewer workflows, score aggregation, and release gates.
- Follow-up completion: Online execution, offline jobs, guardrail templates, automatic review queueing, reviewer rotation/agreement, API-key feedback/score helpers, Tinybird score aggregation, recovery alerts, release gates, prompt promotion, and quickstart/SDK documentation are wired.

## Strategic Decision: SaaS Infrastructure
As established in the "What To Do Now" document, tracify is officially a **Developer Infrastructure SaaS**, not a web agency. All efforts are focused on agent observability.

## Positioning Update
tracify is now positioned publicly as **agent observability for builders and operators of production AI workflows**. The audience includes developers, AI startups, AI agencies, internal AI teams, and AI operations owners under one niche. Marketing and pricing must avoid claiming replay, evals, runtime orchestration, self-hosting, email alerts, or PDF export until those surfaces are implemented.

## Phase 1: Core Trace Viewer & Infrastructure (Weeks 1-4)

### 1. Ingestion Pipeline & Environment [DONE]
- [x] Clerk Auth Integration
- [x] Convex Schema & Mutations (`projects`, `agentRuns`)
- [x] Tinybird `spans.datasource` Configuration
- [x] Inngest `processSpan` Function
- [x] `POST /api/ingest` Ingestion Route
- [x] End-to-end Verification (curl -> Tinybird -> Convex)

### 2. Onboarding & Dashboard Foundation [DONE]
- [x] Premium Landing Page (Hero, Features, Pricing)
- [x] Dashboard Shell & Grouped Sidebar
- [x] Multi-step Onboarding Flow
- [x] One-time API Key Generation & Management
- [x] Route-state hardening for zero-project users: `/dashboard` and `/onboarding` now resolve real Convex project state, and `/dashboard/[projectId]` validates route params before project-scoped queries mount.
- [x] Local dev auth recovery: Clerk now has the required `convex` JWT template and Convex dev contains a seeded project for the current local Clerk user.
- [x] Dashboard shell ownership hardened: only `src/app/dashboard/layout.tsx` renders `DashboardShell`; project child pages render content only, preventing duplicate sidebars while keeping project ids in workspace URLs.
- [x] Project management foundation: `/dashboard/[projectId]/manage` shows Convex-saved project stats and requires exact project-name plus `DELETE` confirmation before destructive project removal.
- [x] Custom 404 fallback: `src/app/not-found.tsx` provides branded actions back to Dashboard/Home for unmatched routes.
- [x] Production auth recovery: Clerk production now has JWT template `convex`, and Convex prod `focused-otter-289` has current functions/auth config deployed.
- [x] Convex/Clerk auth runbook: `docs/troubleshooting-convex-clerk-auth.md` documents the missing JWT-template culprit, dev/prod comparison checklist, and recovery commands.

### 3. Core Product: Trace Viewer [IN PROGRESS]
The single most important UI in the product.
- [x] **Runs List Page:** Live-updating paginated table at `/dashboard/[projectId]/runs` with status filtering, page controls, and exact indexed runId lookup.
- [x] **Run Detail Page:** Timeline view at `/dashboard/[projectId]/runs/[runId]` with guarded run lookup, cached span loading, and clear refresh failure state.
- [x] **Run Cancellation Control:** Running saved run summaries can be marked `cancelled` from the runs table or trace viewer after a two-step confirmation; terminal states are preserved against later summary upserts.
- [x] **Clickable Breadcrumbs:** Dashboard topbar breadcrumbs now link back to the active project overview and parent section routes, replacing the separate runs-detail back button.
- [x] **Tinybird Pipes:** Added local endpoint pipe definitions for `spans_by_run` and `recent_runs_summary`; deploy/endpoint validation remains as the next operational step.
- [x] **Span Detail Cards:** Expandable input/output viewers now include copy controls, error spans auto-expand, and the trace viewer includes a latency overview plus model/tool summary panel.

### 4. Cost & Usage Dashboard [TODO]
- [x] **Usage Statistics:** Added lightweight `/dashboard/[projectId]/costs` total spend and saved expensive-run summaries.
- [x] **Cost Visualisation:** Added Recharts cost-over-time chart with 7d / 30d / 90d controls and Tinybird-unavailable fallback copy.
- [x] **Model Breakdown:** Moved model cost breakdown off Overview and onto `/costs` where the decision doc says it belongs.
- [x] **Immediate Saved Totals:** Overview and Costs use Convex saved run summaries for top-level spend/span totals so newly ingested runs update immediately even if Tinybird analytics is delayed.
- [x] **Tinybird Query Format:** Analytics SQL helpers append `FORMAT JSON` so Tinybird returns parseable JSON for cost charts and model breakdowns.
- [x] **Demo Data Seeding:** Added a local historical seed script that sends previous-day telemetry through `/api/ingest` for realistic dashboard chart testing.
- [x] **Analytics Auto-Refresh:** Overview and Costs poll stats every 4 seconds while visible so charts/model breakdowns update without a full page refresh.
- [x] **Hybrid Realtime Refresh:** Overview and Costs now trigger immediate debounced stats refetches when Convex saved run summaries change, while retaining 4-second polling as an efficient fallback.
- [x] **Low-Query Analytics Refresh:** Overview and Costs now use a Convex-backed analytics cache with a 10-minute TTL, 24-hour stale fallback, Tinybird daily read budget guard, and manual refresh controls instead of 4-second Tinybird polling.
- [x] **Redis Analytics Cache:** Stats and run-span API routes now use Redis as a server-side cache after access verification, returning fresh cache before analytics reads and stale cache before empty fallbacks.
- [x] **Cached Trace Spans:** Run span timelines now cache Tinybird results in Convex, use long-lived cache for terminal runs, and require explicit refresh for running traces after the short cache window.
- [x] **Client-Side Durations:** Runs table and trace viewer durations tick from Convex timestamps via a client clock, so visible seconds update without analytics network calls.
- [x] **Runs Pagination:** Dashboard runs table now uses a Convex paginated query with project access checks, bounded total-count lookup, rows-per-page controls, Prev/Next navigation, and a `Page X of Y` indicator.
- [x] **Alerts Popup:** Alerts now live in a topbar bell popup with recent alert links instead of occupying primary sidebar navigation; the old alerts route redirects to overview.
- [x] **Unread Alerts:** Alerts support optional `readAt` state, the bell badge counts unread items only, unread rows are visually stronger, and the popup includes a guarded `Read all` action.
- [x] **Always-Visible Analytics Charts:** Overview and Costs now render saved-run fallback series or a zero baseline when analytics data is empty, and range/refresh controls are right-aligned without outage copy.
- [x] **Savings Impact Chart:** Costs graph now compares actual spend to a peak-day baseline with shaded avoided-spend area and impact cards.
- [x] **Savings Demo Pattern:** Added `seed:savings` to generate expensive unoptimized days followed by cheaper optimized days, and savings copy now shows `$0.00` when there is no computed saving.
- [x] **Spend-First Cards:** Overview and Costs keep spend as the main card value and show potential savings as secondary card copy/sub-metrics.
- [x] **Overview Range Controls:** Dashboard Overview supports 1d/7d/30d/90d switching and displays total potential savings for the selected period.
- [x] **Range-Scoped Totals:** Overview and Costs use Tinybird range totals when available; Convex saved totals are only a fallback when analytics is unavailable.
- [x] **Tool Cost Breakdown:** Stats API/cache now includes Tinybird-backed top tool costs for reports and future operator views.
- [x] **Honest Billing Surface:** `/dashboard/[projectId]/billing` now shows real Convex saved usage and current `planTier`, with beta access/contact states instead of fake checkout actions.

### 4b. Reporting And Proof [IN PROGRESS]
- [x] **Project Metadata:** Added optional `clientName` and `reportNotes` fields to project settings for stakeholder-facing reports.
- [x] **Reports Route:** Added `/dashboard/[projectId]/reports` with print-friendly run totals, failed runs, total cost, span count, top models/tools, recent alerts, and notable failed traces.
- [ ] **Report QA:** Verify report page with no data, normal runs, failed runs, and unavailable analytics fallback.
- [ ] **Export Decision:** Keep browser print as the first delivery path; defer PDF export until beta users ask for it.

### 4c. Marketing And Pricing Honesty [IN PROGRESS]
- [x] **Landing Positioning:** Hero and use-case copy now describe agent observability for production AI workflows and explicitly cover developers, startups, agencies, internal teams, and operators.
- [x] **Pricing Page:** Added `/pricing` with Free, Pro, Team, and Enterprise beta states. Checkout is intentionally disabled until Stripe is connected.
- [x] **Claim Cleanup:** Landing pricing and marketing navigation no longer advertise replay, evals, email alerts, self-hosting, runtime controls, or PDF export as working product features.
- [ ] **Screenshots:** Replace abstract marketing visuals with real dashboard/report screenshots.

### 4d. Beta Smoke Tests [IN PROGRESS]
- [x] **Smoke Script:** Added `npm run smoke:beta` for missing API key, invalid API key, invalid payload, report/billing route reachability, and optional valid-span/Convex-run checks.
- [ ] **Full Smoke Run:** Execute with `FIVETOONE_SMOKE_API_KEY` and `FIVETOONE_SMOKE_PROJECT_ID` against local and production-like environments.
- [ ] **Alert Smoke:** Add a deterministic threshold alert verification once test project configuration can be safely controlled by script.

### 5. Alerting & Notifications [TODO]
- [x] **Alert Inngest Function:** Triggers on `5to1r/alert.triggered` and logs alerts to Convex.
- [x] **Slack Webhook Integration:** Project settings save a validated Slack webhook and can send an admin-gated test alert.
- [x] **Alerts UI:** Topbar popup shows recent alerts, unread state, read-all, and read-on-click behavior.
- [x] **Duplicate Guard:** Convex alert creation deduplicates repeated alerts for the same project/run/type event.
- [ ] **Email Alerts:** Deferred until an email provider is configured.

### 7. Settings, Teams, and RBAC [IN PROGRESS]
- [x] **Settings Validation:** Client and Convex validation for name, cost, duration, stall, and Slack webhook values.
- [x] **Sensitive Mutations:** Project settings, API key rotation, and project deletion require project owner, configured app admin, or Clerk org admin access.
- [x] **Comments Authorization:** Trace comments require developer/admin style access; comment listing is project-access guarded and bounded.
- [x] **Team Members:** Settings member list uses Clerk organization memberships instead of placeholder users.
- [ ] **Organization Switching:** Add explicit Clerk organization switching in the dashboard topbar/sidebar.
- [ ] **Viewer UI Guards:** Hide or disable settings/API-key/destructive controls for viewer roles once role claims are confirmed in the active JWT template.

### 6. Production SDKs [POLISHING]
- [ ] **Python SDK:** Wrap `@trace_agent` decorator logic and publish to PyPI. Package metadata now builds as distribution `tracify`, docs use `pip install tracify`, the `tracify` import package re-exports the legacy SDK, and local import smoke test passes; upload is pending a PyPI API token.
- [ ] **TS SDK:** Formalise `tracify` and publish to npm. Build packaging is fixed, app/docs install snippets now use `npm install tracify`, and publish is blocked only on npm 2FA/token requirements.
- [x] **Documentation:** Quickstart/install surfaces now consistently use `pip install tracify` and `npm install tracify`, including SDK READMEs, dashboard docs, marketing CTA, and design specs.
- [x] **PM Handoff Summary:** Added `docs/project-manager-project-summary.md` with detailed product, architecture, function, deployment, and open-work inventory.
- [x] **Manual API Key Issuance:** Added admin-gated Convex `projects:createProjectForUser` for creating a project and one-time API key for a target Clerk user without bypassing the hashed-key storage model.
- [x] **Local User Install Test:** Verified the published `5to1r` npm package can send a span through local Next.js/Inngest/Convex dev after aligning `.env.local` with the Convex dev API-key hash secret.

---

## Phase 2: Advanced Features (Post-MVP)

### 1. Run Replay
- [ ] **Replay UI:** Interactive "Play/Step" controls for agent traces.
- [ ] **Payload Storage:** S3 integration for large (>10KB) span payloads.

### 2. Orchestrator Layer
- [ ] **Agent SDK Extension:** Native Agent class with built-in cost ceilings and retries.
- [ ] **Tool Registry:** Versioned tool management and authentication.

---

## Phase 3: Enterprise & Evaluation

### 1. Eval Engine
- [ ] **Eval Framework:** Automated assertions (cost, latency, content) for agent runs.
- [ ] **CI Integration:** CLI tools to run evals in GitHub Actions.

### 2. Enterprise Controls
- [ ] **SSO:** Clerk Enterprise integration.
- [ ] **RBAC:** Fine-grained permissions (Admin, Dev, Viewer).

---

## Verification Plan

### Automated Tests
- `npm run test`: Unit tests for ingestion logic.
- `npx inngest-cli dev`: Local verification of background jobs.
- `curl` pipeline tests: Continuous validation of the API gateway.

### Manual Verification
- **Onboarding E2E:** Verify a new user can sign up, create a project, instrument an agent, and see the first trace.
- **UI Audit:** Ensure 0px radius and monochrome high-contrast styling remains consistent.

### Competitive Product Surface [DONE]
- [x] Product detail pages now cover the currently shipped tracing, analytics, reporting, failure, tool/LLM call, and runtime-control capabilities.
- [x] Public roadmap, contact, and status routes establish an honest delivery and enterprise-contact surface.
- [x] Runtime control is reachable at `/dashboard/[projectId]/control` through the new dashboard Control group.
- [ ] Continue the planned program with canonical telemetry/session data, search, redaction, datasets/evaluations, prompt management, and enterprise deployment in separately verifiable milestones.

### Observe Foundation: Sessions and Search [DONE]
- [x] Canonical optional session context is accepted by native and OTLP ingestion and both SDKs.
- [x] Convex stores bounded session summaries and links saved runs by session.
- [x] Tinybird-backed trace search supports bounded metadata, status, cost, latency, and time-window filters.
- [x] Dashboard exposes Sessions, session detail, and Trace Search under Observe.
- [ ] Next: ingestion-time redaction and object-storage references for large/multimodal payloads.

## Evaluation Engine Integration (2026-08-06)
- [x] Online/offline evaluators, guardrail templates, typed scores, feedback, human review, and trace-linked quality panels.
- [x] Regression suites expose release-gate metrics and safe prompt-version promotion.
- [x] Monitor state tracks both threshold breaches and recovery alerts.
- [x] Numeric evaluation scores have a Tinybird datasource and hourly time-series query path.
- [ ] Production validation remains: configure the internal secret and deploy the Tinybird datasource in the active workspace.
