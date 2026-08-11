# Sitewide SEO — 2026-08-11

5. [completed] Standardize the canonical host to `https://www.tracify.tech`.
1. [completed] Audit the public indexable routes, existing metadata, sitemap, and crawl controls.
2. [completed] Add robots directives, canonical metadata, Open Graph defaults, and Organization/SoftwareApplication structured data.
3. [completed] Expand sitemap coverage for public docs, product, use-case, demo, and changelog routes.
4. [completed] Run type, lint, build, and internal-link verification.

# tracify Execution Task List

## Better Auth Migration (2026-08-10)
- [x] Install Better Auth and the Convex-maintained adapter
- [x] Replace Clerk client/server integration and route protection
- [x] Replace hosted Clerk forms with Tracify email/password and Google OAuth forms
- [x] Preserve Convex user, organization, and role authorization claims
- [x] Replace organization switcher, member invitations, and account controls
- [x] Add Better Auth Infrastructure dashboard plugin and environment keys
- [x] Remove Clerk packages and theme imports
- [x] Sync development Convex functions and verify auth endpoints
- [x] Pass TypeScript and production build
- [ ] Deploy the complete dirty worktree to production only after reviewing unrelated changes
- [ ] Set the Better Auth dashboard server URL to `https://www.tracify.tech` with path `/api/auth`
- [ ] Add the Google OAuth callback `https://www.tracify.tech/api/auth/callback/google`

## Current Phase: Phase 2 - Distribution & Teams (Milestone 5)

## Dashboard Excellence Program
- [x] Add shared dashboard design primitives and signal tokens
- [x] Upgrade Overview around health, attention, and next actions
- [x] Complete the first intent-based sidebar restructuring pass
- [x] Make Runs filters URL-addressable for durable debugging links
- [x] Add command menu to the dashboard shell
- [x] Add explicit organization/project context to the dashboard shell
- [x] Add explicit organization switching to the dashboard shell
- [ ] Add environment selector once environment becomes a project-level source of truth
- [x] Turn Alerts into a project-level alert center
- [x] Expose environment and release filters in Trace Search
- [x] Add model/session context to the Runs table
- [x] Persist Runs pagination and row-limit state in the URL
- [x] Add project-scoped saved Runs views with restore/delete and deep links
- [x] Add keyboard navigation between Runs rows
- [x] Add server-backed Runs time-window filtering and save it with views
- [x] Add dashboard-wide loading skeleton and recoverable error boundaries
- [x] Add command-menu run and session lookup actions
- [x] Add dashboard-specific not-found recovery state
- [x] Require confirmation before muting alerts
- [x] Add actionable failure-rate and p95-latency Overview metrics
- [x] Re-run beta smoke suite against a live dev server
- [x] Re-run production build after final dashboard/API changes
- [x] Complete focused dashboard lint/typecheck audit
- [x] Re-run full production build in an environment with a longer Windows build window
- [x] Add error-first Trace Viewer navigation
- [x] Add persistent trace context and selected-span evidence panel
- [x] Make Trace Search state URL-addressable with debugging presets
- [x] Make Sessions responsive and scannable on mobile
- [x] Make Costs period state URL-addressable and connect it back to Runs
- [ ] Make Trace Viewer the flagship debugging workflow
- [x] Harden trace payload copy feedback and accessibility
- [x] Persist selected Trace Viewer span in deep links
- [ ] Unify Search, Sessions, Costs, Evaluation, and collaboration workflows
- [x] Add explicit active/resolved/muted alert lifecycle and alert-center actions
- [x] Add global reduced-motion behavior for dashboard transitions and animations
- [x] Standardize Trace Search empty, no-result, and analytics-recovery states
- [x] Clear dashboard-owned lint errors and warnings

### 1. Teams & RBAC
- [x] Implement Clerk Organization switching in the Dashboard
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
- [x] Rebuild the landing page around an incident-to-improvement command-center journey
- [x] Reposition landing page around agent observability for builders/operators
- [x] Redesign public landing page with Better Auth × Langfuse editorial composition while retaining Tracify fonts
- [x] Rebuild homepage as pure-black interactive product showcase with distinct section layouts and ecosystem compatibility proof
- [x] Add an explicit Detect → Inspect → Evaluate → Promote → Monitor lifecycle rail to the homepage
- [x] Add varied homepage compositions: workflow canvas, centered connection statement, integration matrix, quickstart README, and FAQ
- [x] Upgrade public product feature pages with evidence panels and next-step CTAs
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
### Dashboard Excellence: Feedback States [COMPLETED]
- [x] Add a shared empty-state primitive with optional recovery/onboarding actions.
- [x] Apply explanatory no-data states to Sessions and Alerts.
- [x] Verify focused lint and TypeScript for the updated dashboard surfaces.
### Dashboard Excellence: Runs Triage Views [COMPLETED]
- [x] Add URL-persisted sort state to the Runs surface.
- [x] Add newest, most expensive, slowest, and most-spans triage views.
- [x] Verify Runs lint and TypeScript.
### Dashboard Excellence: Server-backed Runs Filters [COMPLETED]
- [x] Add model and session filters to the paginated Runs query.
- [x] Add minimum cost and minimum span-count filters.
- [x] Persist filter state in the URL and preserve it across pagination/sort changes.
- [x] Regenerate Convex bindings and verify lint/TypeScript.
### Dashboard Excellence: Runs Bulk Export [COMPLETED]
- [x] Add accessible row selection and select-all-visible behavior.
- [x] Add bounded CSV export for selected loaded runs.
- [x] Verify focused lint and TypeScript.
### Dashboard Excellence: Search Saved Queries [COMPLETED]
- [x] Add project-scoped saved search persistence.
- [x] Add restore and delete controls.
- [x] Add visible active filter chips with one-click clearing.
- [x] Verify focused lint and TypeScript.
### Dashboard Excellence: Trace Handoff Feedback [COMPLETED]
- [x] Make deep-link copy resilient when clipboard permissions fail.
- [x] Add accessible live feedback for copy success and failure.
- [x] Verify focused lint and TypeScript.
### Dashboard Excellence: Improve Lifecycle Navigation [COMPLETED]
- [x] Add shared lifecycle navigation for improvement surfaces.
- [x] Expose active-step context and direct links between lifecycle stages.
- [x] Verify affected routes with focused lint and TypeScript.
### Dashboard Excellence: Alert Review States [COMPLETED]
- [x] Add all/unread/reviewed alert views.
- [x] Show review state and triggering run context in each alert row.
- [x] Verify focused lint and TypeScript.
### Dashboard Excellence: Sidebar Keyboard Shortcut [COMPLETED]
- [x] Add a global sidebar toggle shortcut.
- [x] Document it in the sidebar tooltip.
- [x] Verify shell/sidebar lint and TypeScript.
### Dashboard Excellence: Quality Gate and Navigation Audit [COMPLETED]
- [x] Run platform lint and TypeScript across the current dashboard work.
- [x] Align Integrations and Members with the brief's navigation taxonomy.
- [x] Preserve correct active indicators for query-bearing links.
### Dashboard Excellence: Visual QA and Trace Context Links [IN PROGRESS]
- [x] Attempt authenticated local dashboard visual QA.
- [x] Link Trace Viewer session context to Session detail.
- [x] Link environment/release context to filtered Search.
- [ ] Repeat desktop/mobile visual QA with an authenticated project session.
- [x] Re-run production build after the latest dashboard changes.
### Dashboard Excellence: Active Project Shortcut [COMPLETED]
- [x] Add a keyboard shortcut to open the active project Overview.
- [x] Document the shortcut in the command menu.
- [x] Verify shell and command-menu lint/TypeScript.
### Dashboard Excellence: Alerts URL State [COMPLETED]
- [x] Persist All/Unread/Reviewed alert view in the URL.
- [x] Restore alert view from deep links and refreshes.
- [x] Verify focused lint and TypeScript.
### Dashboard Excellence: Alert Grouping [COMPLETED]
- [x] Group identical alert signals in the center.
- [x] Surface occurrence counts while retaining direct run inspection.
- [x] Verify focused lint and TypeScript.
### Dashboard Excellence: Runs Accessibility Hardening [COMPLETED]
- [x] Name the icon-only run inspection link.
- [x] Add focus-visible states to Run controls.
- [x] Add pressed semantics to status and view toggles.
- [x] Verify focused lint and TypeScript.
### Dashboard Excellence: Repository Lint Audit [IN PROGRESS]
- [x] Run `git diff --check`.
- [x] Confirm dashboard-focused lint, platform lint, and TypeScript.
- [ ] Resolve the broader repository lint debt outside the dashboard scope.
### Dashboard Excellence: Runs Empty State [COMPLETED]
- [x] Replace the bare Runs no-data message with a shared empty state.
- [x] Distinguish filtered no-results from an uninstrumented project.
- [x] Provide Clear filters or Quickstart next actions.
- [x] Verify focused lint and TypeScript.
### Dashboard Excellence: Shared Empty-State Focus [COMPLETED]
- [x] Add visible keyboard focus to the shared empty-state action.
- [x] Verify dashboard primitive lint and TypeScript.
### Dashboard Excellence: Run Environment and Release Filters [COMPLETED]
- [x] Persist environment and release on agent-run summaries.
- [x] Propagate span context through Inngest to Convex.
- [x] Add server-backed, URL-persisted Runs filters.
- [x] Regenerate bindings and verify focused lint/TypeScript.
### Dashboard Excellence: Runs Context Visibility [COMPLETED]
- [x] Surface environment and release in the Runs row context.
- [x] Verify focused lint and TypeScript.
### Dashboard Excellence: Cost Breakdown Actions [COMPLETED]
- [x] Link model cost segments to filtered Runs.
- [x] Preserve cost-oriented sorting in the destination.
- [x] Verify focused lint and TypeScript.
### Dashboard Excellence: Overview Evaluation Quality [COMPLETED]
- [x] Add a project-level Evaluation Quality health metric from the existing evaluation overview query.
- [x] Use a truthful no-data fallback instead of presenting an invented quality score.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Route-Aware Time Context (COMPLETED)
- [x] Align topbar time context with Overview `range` and Runs/Search `days` state.
- [x] Use route-specific defaults of 7d for Overview and 30d for Runs/Search.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Overview Scope-Preserving Links (COMPLETED)
- [x] Preserve the selected Overview time window when navigating metric and attention links into Runs.
- [x] Keep failure, active, latency, and recent-activity destinations URL-consistent.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Topbar Time Context (COMPLETED)
- [x] Show the active URL-backed dashboard time range in the topbar context strip.
- [x] Default to the Overview 7-day window when no range is specified.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Trace Annotation Action (COMPLETED)
- [x] Name the Trace Viewer comment submit control as Add annotation.
- [x] Add visible keyboard focus treatment to the annotation action.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Alert Resolve Safeguard (COMPLETED)
- [x] Require confirmation before resolving an active alert.
- [x] Explain that resolved alerts can be reopened later.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Overview Alert Action (COMPLETED)
- [x] Add Configure alert coverage to the Overview next-best-action panel.
- [x] Add visible keyboard focus to every next-best-action link.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Shared Contracts (COMPLETED)
- [x] Add shared contracts for metrics, attention items, time ranges, run filters, saved views, alert status, and query state.
- [x] Reuse the shared SavedRunView contract in Runs and the shared signal contract in dashboard primitives.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Alert Filter Semantics (COMPLETED)
- [x] Expose selected alert lifecycle tab state with `aria-pressed`.
- [x] Add visible keyboard focus treatment to alert filters.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Trace Action Focus States (COMPLETED)
- [x] Add visible keyboard focus to share, live-refresh, and focus-first-error Trace Viewer actions.
- [x] Preserve existing deep-link, error-first, and cancellation behavior.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Overview Range Semantics (COMPLETED)
- [x] Expose selected Overview time range through `aria-pressed` and descriptive labels.
- [x] Add visible keyboard focus treatment to active and inactive range controls.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Explicit Environment Context (COMPLETED)
- [x] Show the active environment filter in the dashboard topbar context.
- [x] Use an honest “all environments” fallback when no environment filter is active.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Critical Route Validation (COMPLETED)
- [x] Confirm production build succeeds for the current dashboard route set.
- [x] Run beta smoke tests: 5 passed, 0 failed, 2 skipped for missing live credentials.
- [x] Confirm dashboard-focused lint, TypeScript, and diff checks pass.
- [ ] Complete authenticated visual QA once a usable Clerk session is available.
### Dashboard Excellence: Accessibility Sweep (COMPLETED)
- [x] Name the project-member actions control.
- [x] Add refresh-state labels and focus treatment to analytics refresh.
- [x] Add visible focus treatment to documentation navigation.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Overview Quality Trend (COMPLETED)
- [x] Add a quality pass-rate trend using recent evaluation results already returned by the project overview query.
- [x] Show an explicit no-data label when evaluation coverage is absent.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Overview Run Failure Trend (COMPLETED)
- [x] Add run-volume and failure-rate trend visualization to Overview.
- [x] Label the visualization as a recent-run sample when analytics coverage is limited.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Alert Recommended Actions (COMPLETED)
- [x] Add alert-type-specific recommended next steps to the alert center.
- [x] Keep recommendations grounded in the existing alert data contract without fabricating thresholds or trends.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Shell Icon Accessibility (COMPLETED)
- [x] Add accessible names and tooltips to account and alert icon controls.
- [x] Add visible keyboard focus rings to both controls.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Dashboard Excellence: Overview URL Time Range [COMPLETED]
- [x] Persist the Overview 1d/7d/30d/90d health range in the `range` query parameter.
- [x] Preserve existing query state and avoid full-page navigation when switching ranges.
- [x] Verify focused lint, TypeScript, and diff cleanliness.
### Project Skill: Hog Release Notes [COMPLETED]
- [x] Add a project-local `hog-release-notes` skill for drafting PostHog release notes from merged changes.
- [x] Validate its skill metadata and structure.
### PostHog Environment Configuration [COMPLETED]
- [x] Add the supplied public PostHog browser variables to local development and production environment files.
### Marketing Surface Refresh [PLANNED]
- [x] Refresh the public homepage around a clear trace-to-improvement narrative and real product proof.
- [x] Fit the primary landing-page sections into the desktop/tablet viewport and top-align the hero run-health panel.
- [x] Append independently labeled, reference-inspired concept sections without changing prior homepage content.
- [x] Append ten additional distinct concept layouts (04–13) after the first exploration set, preserving every existing section.
- [x] Append five standalone hero explorations (A–E) at the bottom while preserving the original hero.
- [x] Append one definitive Hero F that consolidates the strongest editorial, product-proof, and conversion patterns.
- [x] Append four distinct footer explorations with categorized links and accessible newsletter signup treatments.
- [x] Add a fifth footer with an edge-to-edge Tracify wordmark across the bottom of the screen.
- [x] Append five distinct, reference-inspired CTA explorations without replacing existing CTAs.
- [x] Apply a faint translucent-yellow text-selection marker sitewide, overriding local selection styles.
- [x] Append five distinct pricing-section explorations while preserving the existing pricing route.
- [x] Revise pricing explorations so price, usage allowance, and concrete benefits are immediately visible in every variant.
- [x] Add a shared Monthly/Annual pricing toggle and render every `/mo` suffix in the readable normal UI font.
- [x] Append three new exploration layouts for each of the ten remaining homepage surface themes without changing existing sections.
- [x] Rebuild all 30 extended explorations with genuinely varied compositions, placeholder logos, original illustration assets, on-brand color, and interactive motion.
- [x] Explore every remaining proposed homepage experience and rework area in a 24-section interactive future-surface gallery.
- [x] Move all exploration sections off the public homepage and into the private admin library.
- [x] Expand the library to 94 explorations across 16 categories with six new lead-generation concepts.
- [x] Require approved Clerk administrators for the library on every host, including localhost.
- [x] Add a simple private homepage composer with show/hide controls and shareable alternative-page previews.
- [x] Add 15 distinct Future 19-style homepage sections to a dedicated private-library category.
- [x] Recompose `/alternative` as a complete Future 19-only homepage preview, including the shared navigation and all 15 system sections.
- [x] Promote the approved Future 19 composition from `/alternative` to the public homepage at `/`.
- [x] Apply the landing navbar and Future 19 footer sitewide through the root marketing shell, excluding all `/dashboard` routes.
- [ ] Upgrade the blog to an editorial resource hub backed by production-ready publishing and subscription behavior.
- [ ] Expand the homepage FAQ into an accessible, searchable answer set connected to docs and contact.
# 2026-08-10 — Future 19 Better Auth pages

- [x] Redesign sign-in and sign-up in the production landing-page visual system.
- [x] Add GitHub and Google social authentication actions.
- [x] Add forgot-password, reset-password, OAuth error, and invitation states.
- [x] Configure GitHub provider support and Better Auth Infrastructure reset emails.
- [x] Verify TypeScript, focused lint, responsive layout, and production build.
# 2026-08-10 — Connect Better Auth Infrastructure production dashboard

- [x] Replace the production Convex Better Auth Infrastructure API key.
- [x] Deploy the Convex-hosted Better Auth server with `dash()` enabled.
- [x] Deploy the current Next.js application to Vercel production.
- [x] Confirm the production deployment is Ready and assigned to `www.tracify.tech`.
# 2026-08-10 — Enable stable staging hostname

- [x] Point `tracifytech.vercel.app` at the current live Vercel deployment.
- [x] Add the hostname to Better Auth trusted origins.
- [x] Verify and deploy the production Convex auth configuration.
# 2026-08-10 — Enable Better Auth Sentinel

- [x] Add Sentinel to the Better Auth server.
- [x] Add Sentinel client identification and automatic challenge handling.
- [x] Configure the project identify URL in Convex and Vercel production.
- [x] Deploy both runtimes and refresh production/staging aliases.
# 2026-08-10 — Reuse social OAuth credentials

- [x] Confirm Better Auth has Google and GitHub provider configuration.
- [x] Locate existing OAuth credentials without printing their values.
- [x] Synchronize the existing Google credentials to Convex development and production.
- [ ] Add GitHub credentials after a GitHub OAuth App client ID and secret are available.
  - [x] Credentials received, configured in development and production, and deployed.
# 2026-08-10 — Standardize Tracify logos

- [x] Extract the production navbar wordmark into one shared component.
- [x] Replace auth, footer, dashboard, and onboarding logo variants.
- [x] Verify typography, marker treatment, accessibility labels, and browser rendering.
# 2026-08-10 — Remove auth intro panel

- [x] Remove the selected editorial panel from the shared auth shell.
- [x] Center the auth card across every auth route.
- [x] Verify rendering and static checks.
# 2026-08-10 — Enable localhost password reset

- [x] Sync the password-reset handler to the development Convex deployment.
- [x] Probe the development auth endpoint with a non-existent test address.
- [x] Confirm the reset endpoint returns the safe success response.

# 2026-08-10 — Fix mobile evaluation scoreboard

- [x] Replace the wide comparison table with mobile candidate cards.
- [x] Scale the release heading for narrow screens.
- [x] Verify lint and browser overflow at phone width.

# 2026-08-10 — Standardize external brand logos

- [x] Audit public third-party logo surfaces.
- [x] Replace invented marks with real brand assets.
- [x] Centralize brand asset lookup and reuse it on the integrations page.
- [x] Verify every rendered brand image loads.

# 2026-08-10 — Remove infrastructure disclosure

- [x] Remove the public platform dependency row from the homepage integrations section.
- [x] Verify internal provider names no longer render in that section.

# 2026-08-10 — Move admin access into dashboard

- [x] Remove Admin from public desktop and mobile navigation.
- [x] Show Dashboard and Sign out to signed-in users.
- [x] Add a dashboard-only Admin link for the whitelisted owner email.
- [x] Keep the server-side private-library access guard aligned with the allowlist.

# 2026-08-10 — Focus onboarding and dashboard branding

- [x] Exclude onboarding routes from marketing chrome.
- [x] Add a plain shared wordmark variant.
- [x] Apply the plain wordmark to dashboard and onboarding shells.
- [x] Verify the onboarding route in-browser and run static checks.

# 2026-08-10 — Fix onboarding API-key secret

- [x] Check development and production Convex secret availability safely.
- [x] Generate and configure a strong development-only HMAC secret.
- [x] Verify the development deployment contains the secret.

# 2026-08-10 — Rename API-key secret to Tracify

- [x] Rename active code, examples, and documentation.
- [x] Preserve and migrate development and production secret values.
- [x] Deploy the renamed Convex code and remove obsolete Convex variables.
- [x] Add the renamed variable to Vercel production without breaking the current deployment.

# 2026-08-11 — Install Stripe documentation skills

- [x] Add the skills published at `https://docs.stripe.com` to the project agent-skill directory.

# 2026-08-11 — Stripe subscription billing

- [x] Install and configure the Stripe CLI and agent tooling.
- [x] Generate a Stripe-hosted subscription integration plan.
- [x] Create test-mode Pro and Team products with monthly and annual prices.
- [x] Add Checkout, Customer Portal, signed webhooks, and Convex subscription sync.
- [x] Activate the Stripe account and configure the live catalog, portal, webhook, Vercel non-secret billing values, and production Convex sync.
- [x] Push the verified release branch and deploy the application to Vercel production.
- [ ] Roll the exposed live secret and add a replacement restricted key to Vercel to enable checkout.

# 2026-08-11 — Make migrated public pages visually distinct

- [x] Audit the migrated public pages for repeated compositions.
- [x] Give each affected route family its own visual metaphor and layout.
- [x] Preserve pages outside the prior public-site migration.
- [x] Verify desktop and mobile rendering plus focused static checks.

# 2026-08-12 — Initialize Payload on Neon

- [x] Connect Payload to Neon locally and in Vercel environments.
- [x] Install Neon’s official agent skills.
- [x] Generate and apply the initial Payload Postgres migration.
- [x] Verify the recorded migration and Payload API response.
- [ ] Create the first Payload administrator account at `/cms`.
- [ ] Deploy the integrated application after reviewing concurrent worktree changes.
# Future 19 public-site migration — 2026-08-11

- [x] Inventory legacy public route families outside the dashboard.
- [x] Create shared Future 19 page primitives.
- [x] Migrate blog, docs, pricing, product, use-case, and demo surfaces.
- [x] Migrate integrations, changelog, contact, roadmap, status, security, privacy, and terms.
- [x] Verify representative routes at desktop and mobile widths.
- [x] Pass focused lint, TypeScript, diff hygiene, and production build.
