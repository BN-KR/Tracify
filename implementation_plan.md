# 5to1r Strategic Implementation Plan

This plan merges the **Comprehensive Build Plan** and the **What To Do Now** strategic assessment. It prioritises the transition from a verified ingestion pipeline to a functional, high-fidelity developer product.

## Strategic Decision: SaaS Infrastructure
As established in the "What To Do Now" document, 5to1r is officially a **Developer Infrastructure SaaS**, not a web agency. All efforts are focused on agent observability.

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

### 3. Core Product: Trace Viewer [TODO]
The single most important UI in the product.
- [ ] **Runs List Page:** Live-updating table at `/dashboard/[projectId]/runs` using Convex `useQuery`.
- [ ] **Run Detail Page:** Timeline view at `/dashboard/[projectId]/runs/[runId]`.
- [ ] **Tinybird Pipes:** Implement `spans_by_run` and `recent_runs_summary`.
- [ ] **Span Detail Cards:** Expandable JSON viewers for input/output payloads.

### 4. Cost & Usage Dashboard [TODO]
- [x] **Usage Statistics:** Added lightweight `/dashboard/[projectId]/costs` total spend and saved expensive-run summaries.
- [x] **Cost Visualisation:** Added Recharts cost-over-time chart with 7d / 30d / 90d controls and Tinybird-unavailable fallback copy.
- [x] **Model Breakdown:** Moved model cost breakdown off Overview and onto `/costs` where the decision doc says it belongs.
- [x] **Immediate Saved Totals:** Overview and Costs use Convex saved run summaries for top-level spend/span totals so newly ingested runs update immediately even if Tinybird analytics is delayed.
- [x] **Tinybird Query Format:** Analytics SQL helpers append `FORMAT JSON` so Tinybird returns parseable JSON for cost charts and model breakdowns.
- [x] **Demo Data Seeding:** Added a local historical seed script that sends previous-day telemetry through `/api/ingest` for realistic dashboard chart testing.
- [x] **Analytics Auto-Refresh:** Overview and Costs poll stats every 4 seconds while visible so charts/model breakdowns update without a full page refresh.
- [x] **Savings Impact Chart:** Costs graph now compares actual spend to a peak-day baseline with shaded avoided-spend area and impact cards.
- [x] **Savings Demo Pattern:** Added `seed:savings` to generate expensive unoptimized days followed by cheaper optimized days, and savings copy now shows `$0.00` when there is no computed saving.
- [x] **Spend-First Cards:** Overview and Costs keep spend as the main card value and show potential savings as secondary card copy/sub-metrics.
- [x] **Overview Range Controls:** Dashboard Overview supports 1d/7d/30d/90d switching and displays total potential savings for the selected period.
- [x] **Range-Scoped Totals:** Overview and Costs use Tinybird range totals when available; Convex saved totals are only a fallback when analytics is unavailable.

### 5. Alerting & Notifications [TODO]
- [ ] **Alert Inngest Function:** Triggers on `5to1r/alert.triggered`.
- [ ] **Notification Channels:** Slack Webhook integration and Email alerts.
- [ ] **Alerts UI:** Inbox-style feed for active/resolved alerts.

### 6. Production SDKs [POLISHING]
- [ ] **Python SDK:** Wrap `@trace_agent` decorator logic and publish to PyPI. Package metadata now builds as distribution `5to1r`, docs use `pip install 5to1r`, and local wheel import smoke test passes; upload is pending a PyPI API token.
- [ ] **TS SDK:** Formalise `5to1r` and publish to npm. Build packaging is fixed, app/docs install snippets now use `npm install 5to1r`, and publish is blocked only on npm 2FA/token requirements.
- [x] **Documentation:** Quickstart/install surfaces now consistently use `pip install 5to1r` and `npm install 5to1r`, including the onboarding AI setup prompt.
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
