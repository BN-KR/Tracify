# Robots standards cleanup — 2026-08-13

## gstack investigation workflow — 2026-08-20

- Added Investigation Mode at `/dashboard/[projectId]/investigate` with URL-persisted run selection, existing telemetry evidence, and a local confirmed/inference board.
- Added an evidence-summary clipboard handoff and explicit full-trace link; kept the workflow honest about local-only notes and avoided inventing root causes.
- Added direct Trace Viewer actions into Investigation Mode and Trace Compare so the incident workflow starts from the run that exposed the problem.
- Added navigation and protected-route smoke coverage. Focused lint, activation, content, platform smoke, and diff checks pass.

## gstack activation slice — 2026-08-20

- Onboarding now exposes immediate diagnostics instead of waiting for a timer: authenticated project state, cloud health, key-region compatibility, and the last ingest request.
- The waiting step can send a bounded synthetic `run_end` span through the real regional ingest route. The API key stays memory-only and is cleared when the step unmounts.
- PostHog activation events cover project creation, key copy, install readiness, probe outcomes, and first-trace receipt. The empty dashboard Launch plan now derives progress from session state and the existing Convex onboarding query.
- Public docs, dashboard docs, and onboarding snippets use the published `tracify-sdk` package and real `traceAgent` / `trace_agent` APIs. `scripts/activation-contract.test.mjs` and `npm run test:activation` enforce this.
- Verification: activation contract, public content tests, focused ESLint, `git diff --check`, and the optimized production build pass. The earlier TypeScript blockage came from malformed generated `.next/dev/types/validator.ts` while an active local dev process was writing it; no generated output was edited.
- Added the first Trace Compare workflow at `/dashboard/[projectId]/compare`. It keeps run choices in `left`/`right` URL parameters and compares run metadata plus available span models, tools, and errors. The UI labels differences as observed evidence and does not invent causal conclusions.
- Added a pull-request/push activation workflow for the canonical SDK and public content contracts.

1. [completed] Keep canonical-host signals in redirects, canonical URLs, and sitemap rather than robots.txt.

# Sitewide link audit — 2026-08-12

1. [completed] Compare internal navigational URLs against concrete and dynamic route definitions.
2. [completed] Repair stale documentation and dashboard resource destinations.
3. [pending] Complete a clean production-build verification once the existing build finishes.

# Sitewide SEO — 2026-08-11

5. [completed] Standardize sitemap, robots, JSON-LD, RSS, and canonical URLs on `www.tracify.tech`.
1. [completed] Establish a single canonical domain and indexation policy.
2. [completed] Add structured data and page-level metadata for public route families.
3. [completed] Make the sitemap enumerate all intended public routes.
4. [completed] Verify generated metadata routes and build output.

# tracify Strategic Implementation Plan

## Better Auth Migration (2026-08-10)

- Better Auth now owns sessions, credentials, OAuth, and organizations through a Convex component, with Next.js proxying `/api/auth/*` and hydrating authenticated Convex clients with the Better Auth JWT.
- Clerk UI/runtime packages and middleware were removed. Custom Tracify forms now provide email/password and Google sign-in, while dashboard controls use Better Auth session and organization APIs.
- Authorization keeps project-owner and active-organization semantics. JWT payloads include the active organization and membership role so Convex admin checks continue to distinguish owners/admins from members.
- Security defaults include database-backed rate limiting, CSRF/origin checks, encrypted OAuth tokens, explicit trusted origins, and disabled organization deletion.
- Better Auth Infrastructure is integrated through `dash()`; development and production Convex environments have the Infra key. The canonical production origin is `https://www.tracify.tech` because the bare domain redirects.
- Development Convex synchronization and production build pass. Production deployment remains a deliberate follow-up because unrelated local changes share the worktree.

## Homepage Reference Refinement (2026-08-07)
- Added a compact lifecycle rail to the landing page, linking each stage to the relevant product workflow.
- Kept the Better Auth/Langfuse editorial structure, Linear-style product evidence, and monochrome Tracify system intact.
- Added distinct section compositions rather than repeating a two-column text/visual template: workflow canvas, centered white connection statement, integration matrix, README quickstart, and FAQ.
- Upgraded public product feature pages with feature-specific evidence panels and action-oriented next steps.
- Verification: focused ESLint, standalone TypeScript, `git diff --check`, and production build pass.

## Marketing Visual Redesign (2026-08-07)

- Reframed the homepage as a command-center incident journey: a production timeout, trace inspection, root-cause recommendation, evaluation, and improved release form one coherent story.
- Replaced the broad client-page implementation with a server-rendered route and isolated interactive workflow, product-signal, code-runtime, and trace-inspector components.
- Added product-specific Open Graph/X metadata and a generated incident-style Open Graph image route.
- Corrected legacy final-CTA installation examples to `tracify`, linked footer status to the public status surface, and added accessible tabs, pressed states, focus rings, copy feedback, and reduced-motion-compatible interaction.
- Verification: `npx.cmd tsc --noEmit`, focused marketing ESLint, `git diff --check`, and the full production build pass; Next generates all 58 routes, including `/opengraph-image`.

- Reworked the public homepage into a smaller editorial, monochrome composition inspired by Better Auth and Langfuse.
- Kept Geist Pixel, Geist Mono, Geist Sans, zero-radius controls, and existing marketing routes/CTAs.
- Centered the first viewport on the live trace preview, then added integrations, trace-to-fix feature rows, a README-style quickstart, and a focused final CTA.
- Added a restrained grid treatment and preserved purposeful motion/reduced-motion behavior.
- Verification: TypeScript, homepage/platform lint, diff check, and the full production build pass; the build generates all 57 routes.
- Follow-up: tightened the hero to a single viewport composition so the primary CTAs remain visible without scrolling.
- Added lightweight interaction to the hero trace preview: selectable span rows, selected-span context, and a live/inspection toggle.
- Rebuilt the marketing homepage into distinct interactive moments on a pure-black canvas: workflow map, before/after failure lab, five-state product showcase, runtime selector/code lab, ecosystem rail, and line/grid CTA motif.
- Verification: focused ESLint, TypeScript, diff check, and full production build pass across 57 routes.

## Dashboard Excellence Foundation (2026-08-07)

- Added project-scoped saved Runs views. Users can name the current filter/sort/page-size state, restore it into controls and URL state, or delete it; storage is bounded to the most recent 12 views.
- Added keyboard navigation to the Runs table: Arrow Up/Down, Home/End, and Enter-to-open trace work from focused rows.
- Added URL-persisted Runs time windows (24h, 7d, 30d, 90d) backed by a Convex `startedAt` lower-bound filter; saved views now restore the time window too.
- Added dashboard-level `loading.tsx` and `error.tsx` boundaries with layout-matched skeletons, retry recovery, and a project-selector escape hatch.
- Extended the command menu with active-project run and session lookup actions when a query is entered, preserving deep-linkable context.
- Added a dashboard-specific not-found boundary with a clear explanation and project-selector recovery path.
- Added confirmation before muting an alert; resolve/reopen remain reversible through the alert center.
- Expanded Overview health summary with sample-labeled failure rate and p95 latency metrics, each linking directly to the relevant Runs investigation view.
- Live beta smoke now passes 5/5 available checks; 2 credential-dependent ingestion checks are skipped without smoke credentials. Also restored legacy `tracify_sk_live_` API-key prefix acceptance so malformed legacy-key payloads reach the documented 422 validation path.
- Final `npm run build` passes after the latest changes and generates 58 routes. In-app browser visual inspection was attempted against the local dashboard but timed out before a reliable authenticated render; manual authenticated visual QA remains pending.
- Fresh browser inspection now confirms the public entry page renders its trace-first hierarchy and interactive controls; `/dashboard` consistently redirects to Clerk sign-in without an authenticated session, so authenticated dashboard visual QA remains the only browser-gated check.
- Hardened trace payload copying with failure recovery, live-region feedback, accessible labels, and visible keyboard focus on copy actions.
- Made the selected trace span deep-linkable via the `span` query parameter; clicking a span, using the replay slider, and focusing the first error synchronize the evidence panel and URL.
- Expanded Alerts into a lifecycle-aware center with backward-compatible active defaults, URL-persisted active/resolved/muted tabs, resolve/mute/reopen actions, and accessible action labels.
- Added a global `prefers-reduced-motion` override covering dashboard animations, transitions, and smooth scrolling.
- Standardized Trace Search around the shared empty state, distinguishing first-use from no-match results, and added an inline retry action for analytics outages.
- Full production verification completed: `npm run lint:platform`, `npx.cmd tsc --noEmit`, and `npm run build` all pass; Next generated all 57 routes.
- Audited and cleaned the dashboard lint surface; `npx.cmd eslint src/components/dashboard src/app/dashboard` now passes cleanly. Remaining full-lint errors are outside the dashboard scope (blog, marketing, shared hooks, and unrelated APIs).
- Verification: focused Runs ESLint, TypeScript, and `git diff --check` pass.

- Added reusable dashboard signal, metric, and attention primitives in `src/components/dashboard/dashboard-primitives.tsx`.
- Refreshed Overview with clickable health metrics, failure-aware attention queue, and next-best-action links.
- Added dashboard grid, semantic signal, and tabular-number CSS tokens; enabled dark color-scheme behavior.
- Updated shell group language from Control/Configure toward Operate/Manage while retaining existing routes.
- Verification: TypeScript, focused dashboard ESLint, and `npm run lint:platform` pass.
- Reorganized the dashboard sidebar into intent-based Observe, Analyze, Improve, Operate, Manage, and Resources groups.
- Added operational, API key, and billing destinations to the Manage/Operate areas.
- Made Runs `status` and `q` state URL-addressable so Overview links preserve user context.
- Verification: focused dashboard ESLint and TypeScript pass.
- Added error-first Trace Viewer navigation: the first error span can be focused, highlighted, and scrolled into view.
- Added stable span anchors and keyboard-visible focus styling to support direct debugging navigation.
- Verification: Trace Viewer ESLint and TypeScript pass.
- Added the first global command-menu shell slice with keyboard shortcut support, destination filtering, and project-aware navigation.
- Reused the existing dialog system; no new package dependency.
- Verification: command menu/topbar TypeScript and focused ESLint pass with only existing warnings.
- Made Trace Search query, status, and day-window state URL-addressable and added reusable search presets.
- Improved result hierarchy with stronger error/healthy status signals and focus treatment.
- Verification: Trace Search and Sessions ESLint plus TypeScript pass.
- Made Costs period selection URL-addressable and added explicit measured-spend/source context.
- Added a direct Costs → Runs workflow link and removed an unused chart import found during focused lint.
- Verification: Costs ESLint and TypeScript pass.
- Added explicit supported workspace context to the topbar using Clerk organization state and the authorized project query.
- Replaced the static running badge with organization/project context while preserving existing auth and project boundaries.
- Verification: topbar ESLint and TypeScript pass with existing warnings only.
- Restored the project-level Alerts center with all/unread filters and the existing Convex read-state mutations.
- Kept the topbar popup as the quick-access notification surface while making the full route operational.
- Verification: Alerts page/list ESLint and TypeScript pass.
- Exposed existing environment and release search filters in the Trace Search UI and preserved them in submitted query state.
- Verification: focused Trace Search ESLint and standalone TypeScript pass.
- Improved Runs row hierarchy with primary model and session context from the existing Convex run summary shape; context hides responsively on narrow screens.
- Verification: Runs ESLint and TypeScript pass.
- Ran focused lint across the full dashboard redesign surface; it is clean, and `npm run lint:platform` passes.
- Removed topbar lint warnings by exposing title/description to assistive technology and using dimensioned `next/image` avatars.
- Standalone TypeScript passes; full production build remains timeout-limited on Windows without emitted source errors.
- Added explicit Clerk organization switching to the topbar using the installed `OrganizationSwitcher`, preserving personal workspace support and existing auth boundaries.
- Verification: topbar ESLint and TypeScript pass.
- Made Runs pagination deep-linkable with URL-backed page and row-limit state, preserving status/search context when navigating.
- Verification: Runs ESLint is clean; TypeScript passed in the pagination verification run.
- Made Sessions responsive: desktop keeps the dense grid while mobile uses labeled metric rows with preserved session context and deep links.
- Added stronger focus/hover affordances and tabular-number treatment.
- Verification: Trace Search and Sessions ESLint plus TypeScript pass.
- Added persistent Trace Viewer context strips for trace name, environment, release, and session metadata.
- Added a sticky selected-span evidence panel tied to the active replay span, including output preview and error details.
- Verification: Trace Viewer ESLint and TypeScript pass.

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
- [ ] **Full Smoke Run:** Execute with `TRACIFY_SMOKE_API_KEY` and `TRACIFY_SMOKE_PROJECT_ID` against local and production-like environments.
- [ ] **Alert Smoke:** Add a deterministic threshold alert verification once test project configuration can be safely controlled by script.

### 5. Alerting & Notifications [TODO]
- [x] **Alert Inngest Function:** Triggers on `tracify/alert.triggered` and logs alerts to Convex.
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
- [ ] **Python SDK:** Wrap `@trace_agent` decorator logic and publish to PyPI. Package metadata now builds as distribution `tracify`, docs use `pip install tracify-sdk`, the `tracify` import package re-exports the legacy SDK, and local import smoke test passes; upload is pending a PyPI API token.
- [ ] **TS SDK:** Formalise `tracify` and publish to npm. Build packaging is fixed, app/docs install snippets now use `npm install tracify-sdk`, and publish is blocked only on npm 2FA/token requirements.
- [x] **Documentation:** Quickstart/install surfaces now consistently use `pip install tracify-sdk` and `npm install tracify-sdk`, including SDK READMEs, dashboard docs, marketing CTA, and design specs.
- [x] **PM Handoff Summary:** Added `docs/project-manager-project-summary.md` with detailed product, architecture, function, deployment, and open-work inventory.
- [x] **Manual API Key Issuance:** Added admin-gated Convex `projects:createProjectForUser` for creating a project and one-time API key for a target Clerk user without bypassing the hashed-key storage model.
- [x] **Local User Install Test:** Verified the published `tracify` npm package can send a span through local Next.js/Inngest/Convex dev after aligning `.env.local` with the Convex dev API-key hash secret.

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
## Dashboard Feedback States (2026-08-07)
- Added a reusable empty-state primitive with explanatory copy and optional recovery/onboarding action.
- Applied it to Sessions and Alerts.
- Verification: focused ESLint and standalone TypeScript pass.
## Runs Triage Views (2026-08-07)
- Added URL-backed client-side sorting for newest, most expensive, slowest, and most spans.
- Added visible Views controls so common triage states are one interaction away and survive refresh/deep links.
- Verification: Runs ESLint and standalone TypeScript pass.
## Server-backed Runs Filters (2026-08-07)
- Extended `getRunsPageByProject` with optional model, session, minimum cost, and minimum span-count filters.
- Connected the Runs filter controls to URL state and the Convex paginated query, with numeric validation for threshold inputs.
- Regenerated Convex bindings and verified focused ESLint plus TypeScript.
## Runs Bulk Export (2026-08-07)
- Added accessible row selection and select-all-visible behavior to Runs.
- Added bounded CSV export for selected loaded runs, including status, model, session, spans, cost, and start time.
- Verification: Runs ESLint and standalone TypeScript pass.
## Search Saved Queries (2026-08-07)
- Added project-scoped local saved searches with naming, restore, and delete actions.
- Added visible active filter chips with one-click clearing for query, environment, release, and status.
- Preserved URL-backed query state and verified focused ESLint plus TypeScript.
## Trace Handoff Feedback (2026-08-07)
- Hardened the Trace Viewer share-link action against clipboard failures.
- Added visible button fallback text and an aria-live announcement for copied/failed states.
- Verification: Trace Viewer ESLint and standalone TypeScript pass.
## Improve Lifecycle Navigation (2026-08-07)
- Added a shared lifecycle rail across Prompts, Datasets, Evaluation, Experiments, and Playground.
- The rail makes Observe → Collect → Evaluate → Compare → Promote → Monitor explicit, with active-step styling and keyboard-visible focus.
- Verification: affected route ESLint and standalone TypeScript pass.
## Alert Review States (2026-08-07)
- Expanded Alerts with All, Unread, and Reviewed views while preserving mark-read and inspect behavior.
- Alert rows now expose review state and triggering run context directly in the center.
- Verification: Alerts ESLint and standalone TypeScript pass.
## Sidebar Keyboard Shortcut (2026-08-07)
- Added Ctrl+\\ / Cmd+\\ as a global sidebar toggle shortcut.
- Added the shortcut to the sidebar control tooltip while retaining the accessible button label.
- Verification: shell/sidebar ESLint and standalone TypeScript pass.
## Dashboard Quality Gate and Navigation Audit (2026-08-07)
- Platform lint and standalone TypeScript pass after the dashboard slices.
- Corrected sidebar taxonomy so Integrations is under Operate and Members is visible under Manage.
- Updated active-path matching to handle query-bearing navigation links such as the Members shortcut.
## Visual QA and Trace Context Links (2026-08-07)
- Attempted authenticated dashboard visual QA at localhost; the app correctly redirected to Clerk sign-in, so project-level desktop/mobile inspection remains pending authenticated access.
- Trace Viewer context metadata now links sessions to Session detail and environment/release values to filtered Search routes.
- Verification: Trace Viewer ESLint and standalone TypeScript pass.
## Active Project Shortcut (2026-08-07)
- Added Alt+Shift+O / Cmd+Shift+O to open the active project's Overview from any dashboard route.
- Added the shortcut to the command-menu footer alongside the sidebar shortcut.
- Verification: shell/command-menu ESLint and standalone TypeScript pass.
## Alerts URL State (2026-08-07)
- Persisted the Alerts All/Unread/Reviewed view in the `view` query parameter.
- Alert review tabs now restore correctly from deep links and refreshes.
- Verification: Alerts ESLint and standalone TypeScript pass.
## Alert Grouping (2026-08-07)
- Grouped identical alert type/message pairs in the alert center and surfaced occurrence counts.
- Preserved the first triggering run as the direct inspection target while reducing repeated visual noise.
- Verification: Alerts ESLint and standalone TypeScript pass.
## Runs Accessibility Hardening (2026-08-07)
- Added accessible names and focus-visible treatment to the icon-only run link.
- Added `aria-pressed` semantics and focus states to status and view toggles.
- Verification: Runs ESLint and standalone TypeScript pass.
## Repository Lint Audit (2026-08-07)
- `git diff --check` passes.
- Dashboard-focused lint, platform lint, and standalone TypeScript pass.
- Full `npm run lint` remains red with 69 pre-existing errors and 29 warnings across unrelated marketing/UI/hooks/lib files; this is an outstanding repository-wide gate, not a dashboard-specific diagnostic.
## Runs Empty State (2026-08-07)
- Replaced the bare Runs “No results found” message with a shared contextual empty state.
- Filtered no-data states offer Clear filters; genuinely empty projects offer the Quickstart path.
- Verification: Runs ESLint and standalone TypeScript pass.
## Shared Empty-State Focus (2026-08-07)
- Added a visible focus ring to the shared empty-state recovery link used across dashboard surfaces.
- Verification: dashboard primitives ESLint and standalone TypeScript pass.
## Run Environment and Release Contract (2026-08-07)
- Added optional environment and release fields to Convex agent-run summaries.
- Propagated those fields from Inngest span processing into run upserts.
- Added server-backed Runs filters and URL state for environment and release.
- Regenerated Convex bindings and verified focused lint plus TypeScript.
## Runs Context Visibility (2026-08-07)
- Added environment and release context to the large-screen Runs row hierarchy alongside model and session.
- Verification: Runs ESLint and standalone TypeScript pass.
## Cost Breakdown Actions (2026-08-07)
- Added direct “Inspect model runs” links beneath the Cost by Model chart.
- Links carry the model filter and cost sort into the Runs workflow.
- Verification: Costs ESLint and standalone TypeScript pass.
## Overview Evaluation Quality (2026-08-07)
- Added the existing project evaluation pass rate to the Overview health summary.
- The metric is clickable, sample-labeled, and shows an explicit no-data state until evaluations exist.
- Verification: focused Overview ESLint, standalone TypeScript, and `git diff --check` pass.
## Overview Scope-Preserving Links (2026-08-07)
- Overview run metrics, attention items, and failure actions now carry the selected `days` window into Runs.
- Verification: focused Overview ESLint, standalone TypeScript, and `git diff --check` pass.
## Overview Alert Action (2026-08-07)
- Overview now includes a direct Configure alert coverage action alongside failure, spend, and quality actions.
- All next-best-action links have visible keyboard focus treatment.
- Verification: focused Overview ESLint, standalone TypeScript, and `git diff --check` pass.
- The configuration action points to project settings; alert center remains the review destination.
## Shared Dashboard Contracts (2026-08-07)
- Added a shared dashboard contract module for metric/attention shapes, time ranges, run filters, saved views, alert status, and query state.
- Runs and primitives now consume shared contracts instead of duplicating route-local types.
- Verification: focused ESLint, standalone TypeScript, and `git diff --check` pass.
## Trace Action Focus States (2026-08-07)
- Added consistent focus-visible treatment to Trace Viewer share, refresh, and first-error actions.
- Existing annotation/comment, deep-link, error-first, and cancel workflows remain intact.
- Verification: focused Trace Viewer ESLint, standalone TypeScript, and `git diff --check` pass.
## Trace Annotation Action (2026-08-07)
- Named and focused the icon-only annotation submit control in the Trace Viewer.
- Verification: focused Trace Viewer ESLint, standalone TypeScript, and `git diff --check` pass.
## Critical Route Validation (2026-08-07)
- `npm run build` passes; Next generated 58 routes including the dashboard surfaces.
- `npm run smoke:beta` passes 5 checks with 2 credential-dependent skips and no failures.
- Dashboard-focused ESLint, TypeScript, and `git diff --check` pass.
- Authenticated visual QA remains an explicit follow-up because local dashboard access redirects to Clerk sign-in.
## Accessibility Sweep (2026-08-07)
- Named member actions, analytics refresh state, and documentation navigation focus behavior.
- Verification: focused ESLint, standalone TypeScript, and `git diff --check` pass.
## Explicit Environment Context (2026-08-07)
- Added environment scope to the organization/project context strip in the topbar.
- The context reads the active URL filter and defaults to “all environments” without inventing configuration.
- Verification: focused topbar ESLint, standalone TypeScript, and `git diff --check` pass.
## Route-Aware Time Context (2026-08-07)
- Fixed topbar scope reporting so Runs/Search no longer display Overview’s 7-day default when their default window is 30 days.
- Verification: focused topbar ESLint, standalone TypeScript, and `git diff --check` pass.
## Topbar Time Context (2026-08-07)
- Topbar context now displays environment scope and the active 1d/7d/30d/90d dashboard range.
- Invalid or absent range values use the same 7-day default as Overview.
- Verification: focused topbar ESLint, standalone TypeScript, and `git diff --check` pass.
## Final Dashboard Build Recheck (2026-08-07)
- `npm run build` passes after the latest dashboard/topbar changes and generates all 58 routes.
## Overview Range Semantics (2026-08-07)
- Overview range controls now expose selected state to assistive technology and have consistent keyboard focus treatment.
- Verification: focused Overview ESLint, standalone TypeScript, and `git diff --check` pass.
## Overview Quality Trend (2026-08-07)
- Added a daily quality pass-rate chart from the existing recent evaluation results contract.
- Empty days render as zero while the surrounding label makes the limited sample explicit; no synthetic quality score is created.
- Verification: focused Overview ESLint, standalone TypeScript, and `git diff --check` pass.
## Shell Icon Accessibility (2026-08-07)
- Named the account and alert icon-only controls for screen readers and added visible focus rings.
- Verification: focused topbar ESLint, standalone TypeScript, and `git diff --check` pass.
## Alert Recommended Actions (2026-08-07)
- Alert cards now explain the next useful action for cost and failure alerts.
- Recommendations are deliberately honest: thresholds and trends remain absent until the backend exposes them.
- Verification: focused Alerts ESLint, standalone TypeScript, and `git diff --check` pass.
## Alert Resolve Safeguard (2026-08-07)
- Resolving an alert now requires confirmation and communicates the reversible reopen path.
- Verification: focused Alerts ESLint, standalone TypeScript, and `git diff --check` pass.
## Alert Filter Semantics (2026-08-07)
- Alert lifecycle filters now expose selected state to assistive technology and keyboard users.
- Verification: focused Alerts ESLint, standalone TypeScript, and `git diff --check` pass.
## Overview Run Failure Trend (2026-08-07)
- Added a combined run-volume and failure-rate chart to the Overview cockpit.
- The chart is derived from loaded run summaries and explicitly labels its sample/window to avoid overstating coverage.
- Verification: focused Overview ESLint, standalone TypeScript, and `git diff --check` pass.
## Overview URL Time Range (2026-08-07)
- Overview health windows now use the deep-linkable `range` query parameter for 1d, 7d, 30d, and 90d.
- Range changes preserve other query state and update without scrolling the page.
- Verification: focused Overview ESLint, standalone TypeScript, and `git diff --check` pass.
## Project Skill: Hog Release Notes (2026-08-08)
- Initialized and implemented `.agents/skills/hog-release-notes` with a focused workflow for researching, drafting, and formatting PostHog release notes.
- No bundled resources are needed because the workflow relies on repository history and the existing changelog.
## PostHog Environment Configuration (2026-08-08)
- Added the supplied PostHog browser project token and EU host to `.env.local` and `.env.prod`.
## Marketing Surface Refresh (2026-08-08)
1. Establish page-level content architecture and conversion paths for home, blog, FAQ, docs, pricing, contact, and signup.
2. [Complete 2026-08-09] Redesign the homepage with original Tracify product visuals, lifecycle proof, integration confidence, customer-ready trust signals, and conversion CTAs.
   - Follow-up: compacted the desktop/tablet composition to a single viewport per primary section and top-aligned the hero health panel.
   - Added a removable three-section exploration set at the bottom for user selection: execution report, developer-first implementation brief, and platform lifecycle matrix.
   - Follow-up round 02: appended ten more removable concepts (04–13), each with a distinct composition and original Tracify content, while leaving all earlier sections intact.
   - Hero gallery follow-up: appended five removable hero directions (A–E) after all existing concepts, with the production hero left untouched.
   - Definitive follow-up: appended Hero F as a single best-of gallery direction with run health, evidence, diagnosis, evaluation, and release proof visible together.
   - Footer follow-up: appended four removable footer/newsletter directions with distinct editorial, newsroom, control-room, and brand-monument layouts while preserving the production footer.
   - Full-bleed footer follow-up: added Footer 05 with a responsive edge-to-edge `tracify` wordmark as the final visual anchor.
   - Refined Footer 05 so the wordmark has no horizontal inset and deliberately spans the full viewport from left to right.
   - CTA follow-up: appended five removable conversion directions covering editorial, proof-led, developer, lifecycle, and live-signal structures while preserving existing CTAs.
   - Global polish follow-up: standardized selected text to a faint translucent yellow marker across all routes; moved the rule outside cascade layers so local selection utilities cannot win.
   - Pricing follow-up: appended five removable pricing directions using the existing Free, $19 Pro, $39 Team, and Enterprise plan facts without changing `/pricing`.
   - Pricing clarity refinement: upgraded every direction to surface monthly price, usage allowance, and concrete plan benefits before the conversion action.
   - Pricing billing refinement: added a shared monthly/annual state with exact 20%-off monthly equivalents and a clearly readable normal-font `/mo` suffix in every plan presentation.
   - Extended-surface exploration: appended thirty removable directions (three each for proof, integrations, trust, FAQ, docs, use cases, comparisons, resources, workflow, and contact) after the pricing gallery.
   - Creative gallery rebuild: replaced the uniform left-copy/right-visual pattern with theme-specific layouts, original generated art, placeholder logo treatments, restrained signal colors, and reduced-motion-safe interactive animation.
   - Future-surface exploration: appended 24 further directions spanning product sandbox, calculators, architecture, migration, onboarding, reliability, deployment, personas, evaluation, cost, release gates, trace anatomy, brand/company/community, templates, newsletter, announcements, navigation, hero, pricing, page curation, mobile, and footer.
   - Private-library follow-up: moved every exploration off `/` and into canonical `/admin/library`, with 94 live sections across 16 categories, searchable/filterable cards, direct local anchor links, and five recommended site structures.
   - Lead-generation follow-up: added six concepts covering readiness scoring, trace clinics, benchmark research, cost diagnostics, migration planning, and an operator email course.
   - Access follow-up: every host now requires Clerk authentication plus an approved admin user or an approved organization with `org:admin`; access fails closed when unconfigured, the route is absent from marketing navigation, and it remains excluded from indexing.
   - Owner-access follow-up: added a server-side Clerk email allowlist so `kristoffer.bon@gmail.com` is approved locally and in the project production environment configuration.
   - Alternative-homepage follow-up: added public `/alternative` as one deliberate conversion-first composition using the strongest hero, product, lead-generation, pricing, CTA, nav, and footer patterns; made acid yellow the system-level accent and linked it from the admin library.
   - Composer follow-up: added private `/admin/composer` with seven show/hide controls that generate a shareable section-filtered `/alternative?sections=...` URL; library category links use URL filters for focused Hero, CTA, and other category views.
   - Future 19 system follow-up: translated the new navigation's light-grid, black-panel, yellow-accent visual language into 15 distinct live sections and indexed them under a dedicated library category; the library now contains 114 sections across 17 categories.
   - Future 19 preview follow-up: replaced the mixed `/alternative` composition with a complete preview using only the Future 19 navigation system and its 15 coordinated homepage sections.
   - Homepage promotion follow-up: replaced the public `/` page body with the approved Future 19 composition, while retaining `/alternative` as a comparison preview.
   - Sitewide chrome follow-up: centralized the Future 19 navbar and footer in a route-aware root shell, removed page-local duplicates, and excluded `/dashboard` and its child routes.
3. Turn the existing Sanity-backed blog into an editorial hub with featured stories, categories, article templates, RSS, and a working subscription path.
4. Replace the three-card FAQ with an accessible accordion and a dedicated route or full FAQ index if content volume warrants it.
5. Validate responsive behavior, keyboard accessibility, metadata/schema, and builds; measure the funnel with privacy-appropriate events.
# Future 19 auth implementation — 2026-08-10

1. [completed] Translate the production Future 19 marketing system into a dedicated auth shell.
2. [completed] Rebuild email/password and Google/GitHub OAuth forms with accessible interaction states.
3. [completed] Add password recovery, reset, provider-error, and invitation pages.
4. [completed] Extend Better Auth's Convex configuration for GitHub and managed reset emails.
5. [completed] Run type, lint, diff, browser, and production-build verification.
# Better Auth dashboard production connection — 2026-08-10

1. [completed] Confirm the dashboard plugin exists in the Convex-hosted auth configuration.
2. [completed] Replace `BETTER_AUTH_API_KEY` in the production Convex deployment.
3. [completed] Deploy the production Convex backend and Better Auth component.
4. [completed] Deploy the application to Vercel production and wait for Ready.
5. [completed] Confirm the canonical custom domain resolves to the new deployment.
# Stable staging hostname — 2026-08-10

1. [completed] Resolve the current production deployment and Vercel domain ownership.
2. [completed] Assign `tracifytech.vercel.app` as an alias of the live deployment.
3. [completed] Trust the staging origin in Better Auth and deploy Convex production.
# Better Auth Sentinel — 2026-08-10

1. [completed] Add `sentinel()` beside the dashboard plugin on the auth server.
2. [completed] Add `sentinelClient()` with the project identify endpoint.
3. [completed] Configure production environment variables in Convex and Vercel.
4. [completed] Verify types/lint and deploy Convex plus Vercel production.
5. [completed] Point canonical and stable staging hostnames at the Ready build.
# Better Auth social OAuth credentials — 2026-08-10

1. [completed] Audit local Google/GitHub credential availability.
2. [completed] Reuse the existing Google OAuth pair in both Convex environments.
3. [completed] Confirm the auth server and UI already invoke both provider IDs.
4. [completed] Configure the supplied GitHub OAuth App credentials in both Convex environments and deploy production.
# Standard Tracify wordmark — 2026-08-10

1. [completed] Capture the canonical Future 19 navbar logo treatment.
2. [completed] Build a reusable accessible `BrandLogo` component.
3. [completed] Adopt it across every production product-shell wordmark location.
4. [completed] Run static checks and compare the auth header visually in-browser.
# Simplified auth layout — 2026-08-10

1. [completed] Remove the shared Future 19 intro/benefits region.
2. [completed] Convert the auth body to a centered single-card layout.
3. [completed] Verify all shared auth routes through static checks and browser QA.
# Development password reset — 2026-08-10

1. [completed] Confirm the reset handler exists in Better Auth configuration.
2. [completed] Sync the current functions to development Convex.
3. [completed] Verify the direct development reset endpoint succeeds without affecting a real account.

# Responsive evaluation scoreboard — 2026-08-10

1. [completed] Preserve the desktop comparison table from the `md` breakpoint upward.
2. [completed] Add a compact stacked candidate comparison below `md`.
3. [completed] Validate the section and document widths in a 375px browser viewport.

# Official external logos — 2026-08-10

1. [completed] Inventory external-brand visuals on public pages.
2. [completed] Introduce a shared registry of official SVG/image sources.
3. [completed] Replace homepage stand-ins and add matching integration-directory marks.
4. [completed] Run lint, TypeScript, and browser image-load checks.

# Public infrastructure disclosure — 2026-08-10

1. [completed] Remove the Platform category from the customer-facing integration index.
2. [completed] Retain only product compatibility and standards information.
3. [completed] Verify the affected public section does not contain provider names.

# Dashboard-only admin access — 2026-08-10

1. [completed] Replace public Admin navigation with session-aware account actions.
2. [completed] Create a shared owner-email allowlist for dashboard visibility and server access.
3. [completed] Add the private Admin destination to the dashboard sidebar only.
4. [completed] Validate lint, TypeScript, diff hygiene, and public navigation output.

# Onboarding chrome and plain product branding — 2026-08-10

1. [completed] Exclude `/onboarding` from the shared marketing shell.
2. [completed] Add an explicit highlighted/plain option to the shared brand component.
3. [completed] Use the plain mark in dashboard and onboarding application shells.
4. [completed] Validate TypeScript and browser structure on the onboarding project route.

# Onboarding API-key hashing configuration — 2026-08-10

1. [completed] Identify which Convex deployment is missing the HMAC secret.
2. [completed] Configure a cryptographically random secret only where missing.
3. [completed] Verify development and preserve the existing production secret.

# Tracify API-key secret naming — 2026-08-10

1. [completed] Rename all runtime references to `TRACIFY_API_KEY_HASH_SECRET`.
2. [completed] Copy each deployment's existing value to the new name without exposing it.
3. [completed] Deploy Convex development and production against the new variable.
4. [completed] Remove the obsolete Convex variables and verify static checks.

# Stripe documentation skills — 2026-08-11

1. [completed] Install the skills published through `https://docs.stripe.com`.

# Stripe subscription billing — 2026-08-11

1. [completed] Install Stripe CLI 1.45.2, agent tooling, and Projects plugin 0.32.0.
2. [completed] Model flat-rate Pro and Team subscriptions with monthly and annual prices.
3. [completed] Implement hosted Checkout, Customer Portal, signed webhook verification, and Convex state sync.
4. [completed] Configure and verify the test-mode Stripe catalog and portal.
5. [completed] Confirm Stripe KYC/account activation and configure the live catalog, portal, webhook, Vercel billing values, and production Convex sync.
6. [completed] Push the verified release branch and deploy the application to Vercel production.
7. [pending] Roll the exposed live secret, add a replacement restricted key directly to Vercel, and run a live-mode checkout smoke test.
# Future 19 public-site migration — 2026-08-11

1. [completed] Establish composable Future 19 page primitives and typographic rules.
2. [completed] Replace generic marketing grids with route-specific editorial compositions.
3. [completed] Preserve dynamic content, metadata, and existing interactions.
4. [completed] Validate desktop/mobile rendering, accessibility-oriented semantics, TypeScript, lint, and production build.

# Distinct Future 19 public-page compositions — 2026-08-11

1. [completed] Identify the shared masthead and repeated section patterns across previously migrated routes.
2. [completed] Recompose editorial, commercial, documentation, feature, use-case, operational, and legal pages around distinct page-specific concepts.
3. [completed] Exercise representative static and dynamic routes at desktop and mobile widths.
4. [completed] Pass focused ESLint, TypeScript, and diff-hygiene checks without modifying unrelated concurrent work.

# Payload Neon initialization — 2026-08-12

1. [completed] Configure the dedicated Neon connection for local development and Vercel.
2. [completed] Install Neon’s official database-management agent skills.
3. [completed] Generate the initial Payload schema migration.
4. [completed] Apply the migration and verify it is recorded in Neon.
5. [completed] Confirm the Payload posts endpoint responds successfully.
6. [pending] Let the owner create the first administrator credentials at `/cms`.
7. [pending] Review, commit, and deploy the integrated worktree safely.
8. [completed] Add a dashboard Content entry for allowlisted administrators and enforce the same allowlist at `/cms`.

# Unified production release — 2026-08-12

1. [completed] Audit the branch history and mixed worktree for the requested recent-chat scope.
2. [completed] Stage SEO, public-site, Payload blog/CMS, Stripe, Site 1/dashboard, Neon, and admin-access changes while excluding scratch artifacts.
3. [pending] Commit the unified release and push its branch.
4. [pending] Fast-forward `main`, push it, and verify Vercel's Git-backed production deployment.
## Direct pricing checkout (2026-08-12)

1. Centralize paid-plan checkout links with plan and interval query parameters. — Complete
2. Add an authenticated project-aware checkout page, including inline first-project creation. — Complete
3. Preserve checkout redirects across email and social authentication. — Complete
4. Verify lint/build, production environment, and deploy. — In progress
# Dashboard onboarding escape and launch plan — 2026-08-12

1. [completed] Identify the setup re-entry paths in onboarding and dashboard navigation.
2. [completed] Make "Skip" an explicit durable preference.
3. [completed] Replace setup-oriented overview actions with a dashboard-native Launch plan.
4. [completed] Verify, commit, and push to `main` (`410ebfc`).

# Managed Payments checkout â€” 2026-08-13

1. [completed] Add the exact Stripe product creation command from the supplied blueprint.
2. [completed] Apply `managed_payments[enabled]=true` and the required preview API version to Checkout Session creation.
3. [completed] Verify the API change and product command with focused tests, linting, TypeScript, and diff checks.
# Payload-to-Markdoc assessment — 2026-08-13

1. [completed] Review supplied Markdoc material and the repository-specific Next.js constraints.
2. [completed] Map the Payload-backed content model and all public consumers.
3. [completed] Separate renderer migration effort from CMS/editorial feature replacement effort.
4. [completed] Produce a repository-specific schedule and recommendation.
# Payload-to-Markdoc migration — 2026-08-13

1. [completed] Audit and export the 10 Payload drafts plus their category, tag, SEO, and image metadata.
2. [completed] Build the validated Markdoc filesystem repository and React rendering boundary with red-green tests.
3. [completed] Move every public blog consumer from Payload queries to Markdoc files.
4. [completed] Remove Payload CMS routes, runtime configuration, generated schema/types, dependencies, scripts, and navigation.
5. [completed] Validate the content corpus, TypeScript, focused lint, diff hygiene, production build, public feeds, CMS removal, and draft privacy.
# Tracify content-authoring skill — 2026-08-13

1. [completed] Identify baseline failures in writing quality and storage selection.
2. [completed] Initialize a discoverable project-local skill with UI metadata.
3. [completed] Add a concise authoring workflow, exact storage map, and separate blog/documentation quality bar.
4. [completed] Add reusable Markdoc blog and internal Markdown document examples.
5. [completed] Validate the skill package and register it in repository-wide agent instructions.

# Markdoc blog release — 2026-08-13

1. [completed] Publish the AI agent observability guide.
2. [completed] Remove the post-level newsletter CTA and refine the author signature.
3. [completed] Run content tests, focused lint, TypeScript, diff hygiene, and production build.
4. [completed] Commit, merge, push, verify Vercel, confirm no obsolete Payload variables remain, and restart localhost.

# Blog discovery and internal linking — 2026-08-13

1. [completed] Add a tested contextual internal-link contract.
2. [completed] Replace generic link blocks with natural anchored links in all published articles.
3. [completed] Pressure-test and update the future-agent writing skill and template.
4. [completed] Build a restrained three/two/one-column bento grid and remove the page-level newsletter.
5. [completed] Production and responsive layout-contract verification pass; commit `1717d19` is live and verified.

# Interactive Markdoc authoring rule — 2026-08-13

1. [completed] Define a right-interaction/right-article decision matrix.
2. [completed] Specify safe centralized Markdoc and React implementation boundaries.
3. [completed] Update the authoring skill, quality bar, publishing README, and AGENTS rules.
4. [completed] Validate instructions, 14 content/UI tests, and the 80-page production build.

# Agent Git workflow policy — 2026-08-13

1. [completed] Make `codex/<description>` plus draft PR the default workflow.
2. [completed] Limit direct `main` pushes to explicit, low-risk content fixes with passing checks.
3. [completed] Require staged-diff review and exclusion of scratch or unrelated changes.

# Root robots.txt route — 2026-08-13

1. [completed] Move `robots.ts` from the `(frontend)` route group to the App Router root.
2. [completed] Verify the generated route in a fresh production build.
3. [completed] Commit, merge, and deploy the isolated fix; live `/robots.txt` and `/sitemap.xml` both return HTTP 200.

# Payload CMS dashboard access â€” 2026-08-13

1. [completed] Trace the live dashboard and Payload authorization paths.
2. [completed] Correct the owner email and share the server-side authorization result with the dashboard shell.
3. [completed] Commit, deploy to Vercel production, and verify the authenticated live experience.

# Admin hub â€” 2026-08-13

1. [completed] Consolidate the dashboard's private navigation under one Admin entry.
2. [completed] Add the access-controlled `/admin` choice page for the library and Payload CMS.
3. [completed] Verify the production deployment and live authorized flow.
# llms.txt and SEO audit — 2026-08-13

1. [completed] Compare the public discovery surface with the llms.txt proposal and current Google guidance.
2. [completed] Add a curated `/llms.txt` with canonical documentation, product, guide, and policy links.
3. [completed] Add a content contract test and repository maintenance rules.
4. [completed] Verify content tests, the production build, and staged scope.
# Product page depth and SEO hardening — 2026-08-13

1. [completed] Audit all product routes, source-backed capabilities, and Next.js metadata conventions.
2. [completed] Use comparable observability sites to inform information architecture without copying claims or visual design.
3. [completed] Build nine feature-specific product narratives and visual instruments without changing the landing page.
4. [completed] Correct sitemap freshness and enrich blog/product structured data.
5. [completed] Complete production verification, record the result, and publish the branch.

# Vercel preview deployment recovery — 2026-08-13

1. [completed] Read the failed deployment logs and identify the missing Preview configuration.
2. [completed] Compare Vercel Preview variable names with the application auth configuration.
3. [completed] Configure `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL` for Preview using the isolated development deployment.
4. [completed] Redeploy the exact failed commit and verify build completion plus final `READY` state.
5. [completed] Record the durable staging requirement in repository documentation.

# Page-specific site redesign — 2026-08-14

1. [completed] Inventory in-scope routes and isolate the shared masthead/band repetition.
2. [completed] Capture desktop and mobile evidence and select the mobile Section Switchboard direction.
3. [completed] Implement and visually verify large mobile accordion and destination buttons.
4. [completed] Assign and implement a distinct page-purpose composition for every in-scope public route.
   - [completed] Pricing decision canvas.
   - [completed] Integrations connection map.
   - [completed] Four use-case-specific layouts.
   - [completed] Product, operational, company, and legal routes.
5. [completed] Recompose onboarding and auth routes around their individual tasks.
6. [completed] Run route-coverage, responsive, interaction, accessibility, lint, type, content, and build gates.
7. [pending] Review staged scope, commit the feature branch, publish a draft PR, and verify Preview.

# SEO release guardrails — 2026-08-14

1. [completed] Capture why commits pushed after PR #5 merged were absent from `main`.
2. [completed] Define public-page SEO checks and explicit indexability rules.
3. [completed] Define commit-ancestry, clean-tree, Vercel-project, production-alias, IndexNow, and Ahrefs verification gates.
4. [completed] Register the checklist in `AGENTS.md` and durable project memory.

## SAML login integration (2026-08-14)
1. Install the official `@better-auth/sso` plugin.
2. Enable SAML and domain verification in the Better Auth server and client.
3. Add the plugin’s `ssoProvider` table to the Convex Better Auth schema.
4. Start SAML login from the existing sign-in form using the entered email domain.
5. For each enterprise customer, register and verify their SAML provider before enabling login.
# Docs deployment reliability

- Include dynamically loaded `content/docs/*.mdoc` files in Next/Vercel output tracing.
- Verify content tests, TypeScript, and production build before updating the docs PR.

# Docs information architecture refinement

- Keep persistent product-area navigation on the left.
- Make quickstarts and product areas first-class overview sections.
- Add an on-page rail and grouped all-guides index without copying reference branding or unsupported claims.

# Docs navigation and AI handoff

1. [completed] Make the documentation taxonomy available as a responsive, categorized sidebar.
2. [completed] Add article-level Markdown copy and ChatGPT/Claude handoff controls with concise supporting copy.
3. [completed] Implement a public read-only MCP surface for listing, searching, and reading the full documentation corpus.
4. [completed] Run final checks, inspect the scoped diff, and publish the follow-up through draft PR #13.

# EU/US regional cloud — 2026-08-15

1. [completed] Establish one-codebase/two-region invariants and a pre-auth region selector.
2. [completed] Bind new API keys, SDK hosts, ingestion, auth origins, and billing metadata to EU or US.
3. [completed] Provision isolated Convex deployments and deploy a region-reporting health route to each.
4. [completed] Provision two Vercel projects and apply matching production and preview environment configuration; Git automation remains disconnected until merged release readiness.
5. [completed] Attach the requested regional hostnames and record the authoritative DNS records still required.
5a. [completed] Add regional Redis-backed project ingestion quotas and explicit retry responses.
6. [in progress] Provision independent Tinybird, Redis, and Inngest resources; current provider credentials do not permit unattended workspace creation.
7. [pending] Configure regional OAuth callbacks and Stripe webhook signing secrets.
8. [pending] Verify DNS/TLS, deep health, authentication, onboarding, ingestion isolation, wrong-region rejection, and dashboards in both regions.
9. [completed] Complete build/type/content/SDK gates, browser-check the selector, and publish draft PR #14.

# EU-first regional launch revision — 2026-08-16

1. [pending] Revise PR #14 to expose only EU while preserving the dormant US implementation behind a disabled launch gate.
2. [pending] Reuse and verify the existing free-plan EU service configuration; do not imply strict residency where Redis or Inngest cannot prove it.
3. [pending] Configure only `eu.cloud.tracify.tech` DNS, TLS, authentication callbacks, EU Stripe webhook, and existing provider credentials.
4. [pending] Merge through the pull-request workflow, deploy the exact merged `origin/main` commit to `tracify-cloud-eu`, and complete EU end-to-end verification.
5. [deferred] Enable US only after physically US stateful infrastructure, unique credentials, operational controls, and cross-region isolation tests are available.

# EU-first regional launch — SHIPPED 2026-08-19

Supersedes the 2026-08-16 revision above; items 1-4 there are now complete.

1. [completed] PR #17 restricts the public selector to EU via an `available` flag in
   `src/lib/regions.ts`, rejects dormant regions server-side in `/api/region/select`, and filters
   the status board. The US implementation stays defined and routable but unadvertised.
2. [completed] Rebuilt the EU stateful services in genuinely EU regions after discovering that
   GCP `europe-west2` is London, UK — not the EU. Tinybird workspace recreated as
   `tracify_eu_west1` (AWS eu-west-1) with all four datafiles deployed; Redis moved to Upstash
   (primary eu-west-1, TLS) because Redis Cloud's free tier gates TLS behind a paid plan.
   Every region verified by IP against the provider's published ranges.
3. [completed] `eu.cloud.tracify.tech` DNS via CNAME to `5ee7be47305fd6c5.vercel-dns-017.com`,
   TLS issued, Google/GitHub callbacks registered, EU Stripe webhook
   `we_1U5YRMV05QqKbrt9FFuI0zWx` created with its signing secret set.
4. [completed] Merged `091d9da` and deployed it to both `tracify-cloud-eu` and the marketing
   `tracify` project from a clean detached worktree. `/api/health/region` returns 200 with all
   four dependencies healthy, which also proved the two write-only Vercel values
   (`TINYBIRD_TOKEN`, `REDIS_URL`) are correct.
5. [accepted limitation] Inngest Cloud runs in AWS us-east-2 (Ohio) with no EU region, and sits
   on the primary ingestion path carrying span `input`/`output`. Decision: keep Inngest, apply
   the existing default-on PII redaction before send, and disclose US event processing plainly in
   the "Data residency" section of `/security` rather than claim end-to-end EU residency.
6. [deferred] Enable US only after physically US stateful infrastructure, unique credentials,
   operational controls, and cross-region isolation tests exist.

## Follow-ups

1. [pending] Rotate the `tracify_eu_west1` Tinybird token; this also invalidates the MCP URL,
   which embeds the same token. Update `TINYBIRD_MCP_TOKEN` afterwards.
2. [pending] Delete the superseded Redis Cloud databases `database-MSZ2JEQR` (London; its
   password was exposed in a chat transcript) and `tracify-eu-west1` (Ireland).
3. [pending] Add `STRIPE_SECRET_KEY` and the four `STRIPE_PRICE_*` values to `tracify-cloud-eu`;
   billing on the EU host returns 503 until they exist.
4. [pending] Reconnect Git automation for `tracify-cloud-eu`. Now safe: the project has a real
   production deployment on `main`, so Vercel can no longer misclassify a first build.
5. [optional] Replace Inngest with Upstash QStash on the EU deployment to close the residency
   gap — 2 functions, 5 `inngest.send()` sites.

# PR #19 conflict recovery — 2026-08-20

1. [completed] Reproduce the conflicting PR in an isolated detached worktree.
2. [completed] Rebase its four commits onto current `origin/main` and resolve the planning-file conflict without restoring stale infrastructure instructions.
3. [completed] Compare old and rebased commit ranges and run TypeScript, content, diff-hygiene, focused lint, and production-build gates.
4. [completed] Obtain explicit authorization, update the existing PR branch with an exact force-with-lease, and verify GitHub mergeability/checks.
5. [follow-up] Run the authenticated browser smoke test over the high-risk dashboard visualization surfaces; the app browser runtime could not initialize during recovery.

# gstack and safe PR merges — 2026-08-20

1. [completed] Install Bun and gstack 1.68.2 outside the repository.
2. [completed] Register namespaced gstack skills for Codex and Claude Code with telemetry, auto-upgrades, update checks, team mode, and plan-tune hooks disabled.
3. [completed] Review PR #23's `.tinyb` fallback, validate its real file shape and failure behavior, and squash-merge it as `3e656e1`.
4. [completed] Rebase the validated PR #19 series plus tracking updates onto the new `origin/main`, then push with an exact force-with-lease.
5. [completed] Merge PR #19 only after GitHub reports it mergeable and all GitGuardian/Vercel checks succeed; `origin/main` contains squash commit `1a5555f`.

# SDK publishing dry-run repair — 2026-08-20

1. [completed] Confirm `tracify-sdk` is absent from npm and PyPI and the publishing workflow had never run.
2. [completed] Trigger a non-publishing workflow dry run. Python tests and distributions pass; npm fails because `vitest` is not installed.
3. [completed] Install dependencies from the standalone `packages/ts-sdk` package in CI and verify its build, 27 tests, and tarball.
4. [completed] Validate that `NPM_TOKEN` belongs to intended npm owner `tracifytech`; enforce that owner through `EXPECTED_NPM_USER`.
5. [completed] First-publish `tracify-sdk@0.2.0` to PyPI through CI and npm through the owner's interactive 2FA session, then clean-install and import both public artifacts.
6. [follow-up] Configure npm and PyPI trusted publishers for tokenless future releases; npm staged publishing is now available because the package exists.
# Browser-agent observability wedge — 2026-08-20

## Product decision

Build Tracify as the reliability and release layer for AI agents that act through browsers and APIs. Playwright is the capture layer. Do not compete with Playwright's Codegen or Trace Viewer. Ponytail and gstack inform our internal build/QA loop but should not become customer-facing branding.

## Delivery sequence

1. Specify a Playwright-to-Tracify event mapping using the existing runs, spans, metadata, environments, releases, evaluations, annotations, and failure states.
2. Implement the smallest `@tracify/playwright` reporter/adapter and fixture needed to emit a complete test/agent run.
3. Preserve a link to the Playwright trace artifact rather than reimplementing its viewer.
4. Build the Agent Journey surface: LLM decision → browser action → network/tool call → console/assertion failure → evaluation → cost.
5. Add release gates and regression grouping after the journey view is useful.
6. Test with three real browser-agent journeys. Expand to production monitoring only if the workflow proves valuable.

## Success condition

A developer can install the adapter, run a browser-based agent, open the run in Tracify, understand why it failed, inspect the original Playwright evidence, and compare the result with a prior release.
