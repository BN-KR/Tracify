# tracify Strategic Implementation Plan

This plan merges the **Comprehensive Build Plan** and the **What To Do Now** strategic assessment. It prioritises the transition from a verified ingestion pipeline to a functional, high-fidelity developer product.

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
