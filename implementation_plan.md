# Langfuse parity-plus product epic — 2026-09-03

## Captured Tracify dashboard implementation — 2026-09-08

### Current implementation slice

- [completed] Add dense Tracing table/chart behavior with presets, environment/search filtering, selectable columns, filter-rail search, trace navigation, and empty-state pagination.
- [completed] Add populated Session detail layout with chronological events, input/output views, linked traces, scores, and dataset action boundary.
- [completed] Add populated Dashboards and Scores surfaces with selection/layout controls, metric widgets, score filtering, and score summaries.
- [completed] Re-run the production build after the parity additions; compilation, TypeScript, and generation of all 211 routes passed.
- [completed] Add Prompt Management and Evaluators captured-depth surfaces with editor tabs, prompt selection, evaluator filters, run/status columns, and action boundaries.
- [completed] Add Datasets, Human Annotation, Alerts, and Settings captured-depth surfaces with search, queue/status filters, review actions, alert cards, and functional settings tabs.
- [completed] Warm the local Sandbox route matrix and verify HTTP 200 for primary surfaces and nested session detail; first-request compilation latency is isolated from subsequent route behavior.
- [completed] Re-run the account-access Playwright contract after warming the local app.
- [completed] Extend the browser contract for prompt, dataset, and settings interactions and verify it locally.
- [completed] Add rows-per-page controls to the remaining generic collection tables so Users and Experiments retain the captured table affordances.
- [completed] Restart the stale local dev process and verify the captured tracing surface in-browser after recompilation; the intended controls and dense table are rendered.
- [completed] Make generic collection pagination functional and rerun TypeScript, focused ESLint, and the 9-test account-access browser contract.
- [completed] Match the populated Home grid to the localhost:4173 reference composition and verify the complete widget set in the local browser.
- [completed] Migrate authenticated Build Tracing to the captured renderer through a real Convex project/run adapter with loading and empty states.
- [pending] Wire the captured-depth Sandbox controls to the equivalent authenticated Build state and verify nested detail routes end to end.

Implementation contract:

1. Treat `C:\opencrawl\output\langfuse-capture` only as the supplied visual authority; the product, routes, fixtures, and visible labels remain Tracify-branded.
2. Maintain two distinct adapters behind one visual system: a deterministic, populated, public read-only Sandbox and authenticated Build routes backed by existing Tracify APIs.
3. Match the captured shell and 14 primary surfaces without a redesign; keep nested list/detail URLs, filters, selectors, prompt execution, and explicit Sandbox write boundaries functional.
4. Select region first at `/cloud`; show Sandbox and Build only after the browser reaches `/cloud/mode` on the selected regional host.
5. Keep the capture-style Home stable before and after first trace data arrives, rather than switching authenticated projects to a second dashboard design.
6. Prevent login loops by waiting for both Better Auth and Convex readiness and preserving validated return paths.
7. Gate release on TypeScript, lint, auth-state tests, browser route/interaction coverage, a production build, matching-viewport visual review, and a clean PR containing no unrelated generated or scratch changes.

Implemented locally. The only unverified runtime boundary is provider-backed signed-in mutation and ingestion behavior because this machine has no EU test-account credentials.

## Account access and onboarding flow — 2026-09-06

Implementation slice completed: centralized redirect validation, preserved Explore/Build intent through regional selection and Better Auth, added OAuth callback timeout/retry behavior, kept auth region changes local-safe, persisted project onboarding step/SDK/dismissal state in Convex, resumed setup from the dashboard, preserved recovery redirects, classified invitation failures, activated the accepted organization, and derived direct-host region display. Full Playwright journey coverage remains pending on a healthy auth-capable test host.

Verification update: production-style build and server smoke passed all public browser tests (3/3) on port 3100. Authenticated browser journeys remain pending provider-backed credentials.
Added deterministic account-access browser contract coverage; its production-style run passes 4/4 for Explore/Build entry, auth/recovery forms, missing invitations, and mobile keyboard/overflow behavior.
Cloud entry is now explicitly sequential: path selection at `/cloud`, region confirmation at `/cloud/region`, then the regional auth/playground destination.

## Cloud app auth and dashboard recovery — 2026-09-07

Implemented the approved cloud-app recovery slice: bounded Convex auth readiness and retry states, preserved dashboard return paths, safe unauthenticated playground behavior, persisted dashboard create/detail/widget actions, and working Tracing/account controls. The stable empty-project behavior remains read-only and does not synthesize user data.

Verification passed: production build, TypeScript, focused ESLint, local EU-backed 88-route dashboard sweep, CUA browser review, and the account-access Playwright contract (5/5 with one worker). Full provider-backed authenticated journeys remain a credential-dependent follow-up.

## Objective

Build a Tracify-native version of the complete trace-to-release workflow signaled by the Langfuse August update, with a sharper focus on consequential agent failures: fast investigation, trustworthy evidence, repeatable evaluation, cost-aware decisions, and an operational path from finding to ship/rollback. “Everything they have, just better” means covering the capability surface, not copying the implementation or committing to one giant release.

## Product thesis

Langfuse’s release is one coherent system: capture observations → select comparable evidence → configure and preview an evaluator → run scores across text and rich media → compare versions → alert and visualize → operate through APIs/CLI/self-hosting. Tracify should own the stronger outcome: explain why an agent failed, prove whether a fix works, and make the release decision auditable.

## Detailed capability backlog

### P0 — Failure-evidence and evaluation loop (first paid-review multiplier)

1. **Representative evidence sets** — curate traces, spans, attachments, and expected outcomes into named regression sets; support inclusion from Runs/Trace Viewer and immutable snapshot membership for a review or release.
2. **Evaluator workbench** — create LLM-as-a-Judge, deterministic/code, rubric, and threshold evaluators; preview against real observations before saving; expose the exact inputs, mapped variables, model, prompt, score definition, and failure explanation.
3. **Visual variable mapping** — map evaluator inputs by selecting fields from a real trace/span/attachment rather than hand-writing paths; show missing/null values before execution.
4. **Reusable evaluation rules** — separate “which observations are selected” from “how they are scored”; support filters, sampling, environment/release/status constraints, and a visible matched-volume preview.
5. **Cost and latency preview** — estimate evaluation token cost, model cost, expected run time, and sample count before online execution; block or warn when a configured budget is exceeded.
6. **Comparable runs** — pin evaluator version, rule version, sample membership, model, and prompt; guarantee that side-by-side evaluators can run over the same evidence set and expose comparability metadata.
7. **Trace-linked results** — every score must link back to the source trace/span and preserve evaluator version, input snapshot, explanation, timestamp, and execution status.
8. **Failure review report export** — generate an annotated trace, evidence summary, mechanism hypothesis, tested-fix result, regression table, and ship/fix/rollback recommendation for the paid review workflow.
9. **Release gate** — define pass/fail thresholds and required regression cases; compare baseline versus candidate release and produce a deterministic decision with override reason and actor.

### P1 — Multimodal and rich-agent evidence

10. **Attachment-aware traces** — model images, audio, video, PDFs, and files as inspectable evidence with safe previews, metadata, size/type limits, retention behavior, and redaction boundaries.
11. **Multimodal evaluators** — allow evaluators to score rich attachments alongside text; support multiple prompt messages for criteria, evaluated content, and example output.
12. **Agent-specific templates** — ship templates for coding agents, browser agents, voice agents, RAG groundedness, tool correctness, policy adherence, exact match, and customer-defined failure taxonomies.
13. **Evidence quality controls** — detect missing attachments, unsupported formats, truncated payloads, inaccessible URLs, and non-comparable samples before an evaluation run starts.

### P1 — Investigation and scale

14. **Full-text and structured trace search** — search trace/span input, output, errors, tools, models, sessions, environments, releases, and evaluator results with composable filters.
15. **Large-run timeline** — provide a zoomable, pan-able timeline for hundreds or thousands of observations; color and group by observation type; preserve keyboard and mobile alternatives.
16. **Trace comparison** — compare two runs, two releases, or baseline/candidate evidence sets with synchronized spans, latency, cost, errors, and score deltas.
17. **Saved investigation views** — save/share filter, sort, time window, and comparison context with project-scoped permissions and URL deep links.
18. **Performance budgets** — define measurable targets for run-list load, trace load, search, timeline rendering, and evaluation result queries; instrument p50/p95/p99 rather than claim generic speed improvements.

### P1 — Alerts and operational feedback

19. **Score and cost alerts** — alert on score regression, failure-rate change, cost ceiling, latency tail, evaluator execution failure, and missing evidence; support active/resolved/muted lifecycle.
20. **Dashboard widgets** — turn score trends, cost, failure classes, evaluator coverage, and release gates into configurable project widgets.
21. **Annotation queues** — route uncertain or high-impact failures to reviewers from the trace/results surface; record ownership, decision, labels, and resolution.
22. **Evaluator version recovery** — restore any prior evaluator configuration as a draft, compare versions, and require an explicit publish action.

### P2 — Developer platform and ecosystem

23. **Stable public API v2** — expose ID-based endpoints for evaluators, rules, evidence sets, runs, scores, alerts, annotations, and release decisions with pagination and machine-readable errors.
24. **Production CLI** — provide typed flags, fast startup, pagination, JSON/NDJSON output, deterministic exit codes, project/environment selection, and API-version detection; keep runtime dependencies minimal.
25. **Prompt and configuration portability** — import/export prompts, evaluators, rules, templates, and release gates as versioned JSON with validation and secret redaction.
26. **SDK parity** — add typed TypeScript and Python helpers for tracing rich evidence, starting evaluations, retrieving scores, and checking release gates; publish compatibility and clean-install smoke tests.
27. **Integration breadth** — prioritize integrations by customer demand and failure-review relevance, beginning with model providers, agent frameworks, browser/voice tooling, RAG/retrieval, and MCP/tool servers.
28. **OpenTelemetry compatibility** — accept and normalize OTel-compatible spans without weakening Tracify’s agent-specific evidence model.

### P2 — Trust, governance, and deployment depth

29. **Accurate model/token/cost accounting** — version pricing tables, account for model parameters and provider modes, show source and uncertainty, and allow audited corrections.
30. **Team governance** — roles, evaluator/rule permissions, approval/publish controls, audit log, ownership, and organization-level feature flags.
31. **Retention/export controls** — configure evidence retention, deletion, export, and redaction with explicit regional-processing behavior.
32. **Self-hosting and air-gapped operation** — document deployment, API reference, migrations, health checks, exports, and offline/air-gapped constraints without overstating residency.
33. **Release operating system** — canonical application versioning, changeset/conventional-commit policy, CI release gates, signed/immutable artifacts, synchronized SDK releases, changelog generation, rollback ownership, and production smoke verification.

## Sequencing and dependency graph

```text
#1 Evidence sets ─┬─> #2 Evaluator workbench ─> #4 Rules ─> #6 Comparable runs
                 └─> #10 Rich evidence ───────> #11 Multimodal evaluators
#6 Comparable runs ─> #7 Trace-linked results ─> #8 Review report ─> #9 Release gate
#14 Search ─────────> #16 Trace comparison ────> #19 Alerts/widgets
#23 API v2 ──────────> #24 CLI ────────────────> #26 SDK parity
#29 Cost correctness ─────────────────────────> #5 Cost preview / #19 Cost alerts
#30 Governance + #31 Retention + #32 Deployment ─> #33 Release operating system
```

Phase 1 should make the first paid review repeatable. Phase 2 should make the evidence system compelling for multimodal and high-volume agents. Phase 3 should make it adoptable as a developer platform and trustworthy in larger organizations. Do not begin with broad integrations or enterprise controls before the core evidence/evaluation loop produces a useful release decision.

## Epic acceptance criteria

1. A user can create a named evidence set from real Tracify runs, freeze its membership, and see the source trace/span for every case.
2. A user can configure an evaluator against a real observation, preview missing mappings, matched volume, estimated cost, and sample count, then run it without writing a path expression by hand.
3. Two evaluator configurations can score the same frozen evidence set, and the result records enough version metadata to reproduce and compare the run.
4. A result opens the source trace and explains the score, evaluator inputs, execution status, and any missing or unsupported evidence.
5. A baseline/candidate comparison produces a deterministic release recommendation from configured thresholds and lists the failing cases.
6. Text and at least one rich evidence type are supported through the same evidence/evaluator model, with explicit size, type, retention, and failure behavior.
7. Public API and CLI workflows can create/list/run evaluators and retrieve machine-readable results with pagination and stable errors.
8. Performance, cost, and reliability claims are backed by instrumented benchmarks and production-safe verification; no “10x” or residency claim is made without evidence.

## Planning rule

Each numbered capability becomes its own 1–3 day implementation issue or a small epic with explicit dependencies. Before implementation, use `/spec` on the selected slice after an `/office-hours` prioritization pass. Every spec must tie the work to a customer outcome, identify current Tracify files and interfaces, and define pass/fail acceptance criteria. Completed items must be removed from active task files under the repository task-file hygiene rule in `AGENTS.md`.

# First-customer execution — 2026-09-02

1. [completed] Make the offer sellable: qualification-only contact CTA, seeded-demo failure CTA, valid SDK quickstarts, first-party documentation link, and no inactive connection button.
2. [completed] Make the review deliverable: customer scope, report template, evidence boundary, retention/deletion record, discovery/close scripts, follow-up cadence, demo script, and objection taxonomy.
3. [completed] Build the editable execution workbook from current public sources with 50 candidate accounts, 100 contact slots, founder/technical-owner profiles where public, outreach drafts, daily funnel formulas, and stop rules.
4. [completed] Apply an evidence threshold to prospect research: 15 accounts are Qualified by public filters, 28 remain Watch, and 7 are Disqualified. Do not inflate the qualified count or infer incidents/frameworks that are not public.
5. [completed] Verify focused lint, both local SDK examples, public route status, the email actions, the seeded demo, desktop/mobile layout, and unchanged $19/$39 pricing. Record the unrelated existing production TypeScript blocker separately.
6. [pending owner] Create and test the live one-time $1,000 Stripe Payment Link in the intended account; store the URL privately.
7. [pending owner] Qualify the remaining account gap, personally send 10 initial messages per weekday plus follow-ups, run discovery, send same-day offers, collect payment before evidence, and deliver one review using the operating kit.
8. [completed] Publish draft PR #75 from `codex/first-customer-review`.
9. [completed] Inspect PR #75 hosted checks and squash-merge it into `main` as `1cc8f88`. Record the unrelated comparison-blog framework failure separately and do not deploy as part of this merge.

# Cursor removal and fit verification — 2026-08-24

- [completed] Remove the shared cursor component, scene cursor paths, click timing, and cursor CSS.
- [completed] Render and visually inspect each scene at its densest content state.
- [completed] Render the replacement MP4 and inspect representative frames extracted from the encoded file for clipping or overflow.

# Product film pacing and SaaS cursor — 2026-08-24

- [completed] Re-time each scene around the core interaction and shorten transitions to 15 frames.
- [completed] Animate a cursor path and click ring through the homepage, run list, trace inspector, replay, and release gate.
- [completed] Run lint/build, inspect representative stills, render the final MP4, probe its streams, and inspect extracted encoded frames.

# Product film rebuild — 2026-08-22

# Blog corpus cleanup — 2026-08-26

# AI evaluation metrics editorial rebuild — 2026-08-26

- [completed] Replace repetitive H3/paragraph cadence with visual decision-led modules.
- [completed] Add worked release comparison, three-layer gates, and reader checklist.
- [completed] Verify localhost response, Markdoc output, tests, build, and diff hygiene.

- [completed] Audit every published post for visuals, code, callouts, emphasis, FAQ placement, and word count.
- [completed] Remove repeated generated prose from the remaining articles.
- [completed] Run content tests, diff hygiene, and production build.
- [pending] Publish through the PR workflow after repository review permissions are available.

- [completed] Extract the public homepage and demo-page design tokens, typography, panel geometry, and interaction language.
- [completed] Archive the old Motion Canvas project and scaffold a clean Remotion composition.
- [completed] Build four connected scenes using the actual Tracify visual system and product workflow.
- [completed] Render and inspect representative frames, then produce and probe the final MP4.

# 17-post visibility content set — 2026-08-20

1. [completed] Read the project memory, content map, quality bar, interactive-content rules, and blog README.
2. [completed] Inventory the existing published corpus and choose 17 keyword-led topics with distinct reader jobs.
3. [completed] Add 17 Markdoc articles, natural internal links, code examples, and the future-agent writing workflow article.
4. [completed] Add and centrally register a deterministic `<trace-scenario>` interaction for articles where reader-controlled state improves the lesson.
5. [completed] Run the complete content test suite.
6. [completed] Complete the production build with the Webpack path and a temporary Node worker-thread verification setting, then remove the temporary setting.

# Motion Canvas product demo — 2026-08-21

- [completed] Study the Bufferhead Motion Canvas reference and current Tracify trace/evaluation surfaces.
- [completed] Replace the card-based draft with a graph-led animation that keeps the execution system alive across scene changes.
- [completed] Build the Motion Canvas project and render the H.264 MP4 with the FFmpeg exporter.
- [completed] Visually inspect representative MP4 frames and correct graph leakage, multiline text, panel-safe anchors, the selected-span right-edge marker, opening graph framing, signal timing, and final timing.

# Robots standards cleanup — 2026-08-13

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

# AI agent monitoring article polish — 2026-08-21

1. [completed] Compare the supplied Semrush guide, ROI-framework, and prompt-library structures and extract reusable editorial patterns without copying their branding or wording.
2. [completed] Add a reusable static `runthrough` Markdoc component and apply six checkpoints only to the monitoring article.
3. [completed] Close the TOC by default, use the Tracify yellow progress bar, render `C:\` before monitoring H2 headings, and harden focus/overflow/reduced-motion styles.
4. [completed] Rework the article's latter sections into layered H3/H4 hierarchy, add visual evidence throughout, distribute contextual links, and remove the standalone link list.
5. [completed] Codify definitive-guide, decision-framework, practical-library, tutorial, and comparison archetypes in the required authoring workflow.
6. [completed] Verify content contracts, changed-file lint, diff hygiene, the full 116-route production build, and a local 200 rendered response containing six runthroughs, five FAQ accordions, and a closed TOC.

# AI agent monitoring usability correction — 2026-08-22

1. [completed] Remove the `C:\\MONITOR` runthrough cards and restore a restrained `/` H2 marker.
2. [completed] Turn the strongest operational guidance into inline decision notes and remove the useless pseudo-alert sample.
3. [completed] Preserve only adaptable YAML/JSON examples, identify their languages correctly, and render them in neutral dark-gray scroll containers.
4. [completed] Wrap native tables in accessible, focusable overflow regions and prevent page-level mobile overflow or mid-word splitting.
5. [completed] Fix article top spacing and Back to blog contrast, then render three recommended article cards at the bottom.
6. [completed] Verify link density, content contracts, focused lint, diff hygiene, responsive browser behavior, and the full production build.
# Future content quality gate — 2026-08-24

1. [completed] Increase completed-item strikethrough decoration opacity in the dashboard launch plan.
2. [completed] Make the future-agent content workflow explicit and mandatory in both the writing skill and blog publishing README.
3. [completed] Run content, focused lint, full lint, build, diff, and rendered-style verification; content/focused checks pass, while full lint and build report unrelated pre-existing repository issues.

# Google Search Console indexing triage — 2026-08-24

1. [completed] Audit robots, sitemap, redirects, and canonical metadata against the reported categories.
2. [completed] Add explicit canonicals for intentionally noindex utility/preview routes.
3. [completed] Run the content validation suite and live sitemap/status checks.
4. [completed] Exclude archived video source from TypeScript and complete the production build.
5. [completed] Deploy the exact commit to a clean Vercel Preview and verify the changed route metadata.
6. [pending] Merge/deploy through the production `origin/main` workflow, then validate the exact affected URLs and request reindexing in Search Console.
# AI agent monitoring blog refinement — 2026-08-21

1. [completed] Inspect the single article, Markdoc contract, shared TOC, code renderer, and page styles.
2. [completed] Add full-article structure, FAQ accordion, scoped background/code treatment, and mobile-safe TOC/overflow rules.
3. [completed] Validate Markdoc/content tests, focused ESLint, local response status, and diff hygiene; browser runtime initialization remains unavailable.

# LLM tracing article refinement — 2026-08-25

1. [completed] Establish a clean `codex/blog-llm-tracing-format` worktree from `origin/main`.
2. [completed] Replace duplicated article sections with a concise reader/job/outcome/boundary structure and truthful tracing examples.
3. [completed] Verify content contracts, internal links, FAQ count, image inventory, image HTTP status, and diff scope.
4. [pending] Run the full build and rendered desktop/mobile route checks with the required Convex environment configured, then open a focused PR.

# LLM observability metrics refinement — 2026-08-25

1. [completed] Establish a clean branch from the merged LLM tracing baseline.
2. [completed] Replace duplicated article sections with an outcome-led metric selection and response framework.
3. [completed] Verify Markdoc contracts, links, interaction, image, build, and diff evidence.
4. [pending] Publish the branch, inspect the rendered preview at desktop/mobile widths, and merge after hosted checks pass.

# AI agent regression testing guide refinement — 2026-08-25

1. [completed] Establish a clean branch from the merged production-debugging baseline.
2. [completed] Replace appended legacy sections with a production-trace regression and release-gate guide.
3. [completed] Verify Markdoc contracts, links, interaction, image inventory, build, and diff evidence.
4. [pending] Publish the branch, inspect the rendered preview at desktop/mobile widths, and merge after hosted checks pass.

# Production debugging guide refinement — 2026-08-25

1. [completed] Establish a clean branch from the merged RAG-evaluation baseline.
2. [completed] Replace duplicated article sections with a production incident reconstruction and verification guide.
3. [completed] Verify Markdoc contracts, links, interaction, image inventory, build, and diff evidence.
4. [pending] Publish the branch, inspect the rendered preview at desktop/mobile widths, and merge after hosted checks pass.

# RAG evaluation guide refinement — 2026-08-25

1. [completed] Establish a clean branch from the merged testing-guide baseline.
2. [completed] Replace appended legacy sections with a retrieval, groundedness, usefulness, and release-gate guide.
3. [completed] Verify Markdoc contracts, links, interaction, image inventory, build, and diff evidence.
4. [pending] Publish the branch, inspect the rendered preview at desktop/mobile widths, and merge after hosted checks pass.

# AI agent testing guide refinement — 2026-08-25

1. [completed] Establish a clean branch from the merged observability-guide baseline.
2. [completed] Replace duplicated article sections with a layered testing and production-feedback guide.
3. [completed] Verify Markdoc contracts, links, interaction, image inventory, build, and diff evidence.
4. [pending] Publish the branch, inspect the rendered preview at desktop/mobile widths, and merge after hosted checks pass.

# AI agent observability guide refinement — 2026-08-25

1. [completed] Establish a clean branch from the merged reliability-guide baseline.
2. [completed] Replace duplicated article sections with an outcome-led observability and evidence model.
3. [completed] Verify Markdoc contracts, links, interaction, image inventory, build, and diff evidence.
4. [pending] Publish the branch, inspect the rendered preview at desktop/mobile widths, and merge after hosted checks pass.

# AI agent reliability guide refinement — 2026-08-25

1. [completed] Establish a clean branch from the merged evaluation-guide baseline.
2. [completed] Replace duplicated article sections with a failure taxonomy, bounded retry, guardrail, and recovery guide.
3. [completed] Verify Markdoc contracts, links, interaction, image inventory, build, and diff evidence.
4. [pending] Publish the branch, inspect the rendered preview at desktop/mobile widths, and merge after hosted checks pass.

# AI agent evaluation guide refinement — 2026-08-25

1. [completed] Establish a clean branch from the merged production-readiness baseline.
2. [completed] Replace duplicated article sections with a representative-evidence and release-gate evaluation guide.
3. [completed] Verify Markdoc contracts, links, interaction, image inventory, build, and diff evidence.
4. [pending] Publish the branch, inspect the rendered preview at desktop/mobile widths, and merge after hosted checks pass.

# Production-ready AI agents article refinement — 2026-08-25

1. [completed] Establish a clean branch from the merged architecture baseline.
2. [completed] Replace duplicated article sections with a measurable production-readiness and stewardship guide.
3. [completed] Verify Markdoc contracts, links, interaction, image, build, lint result, and diff evidence.
4. [pending] Publish the branch, inspect the rendered preview at desktop/mobile widths, and merge after hosted checks pass.

# AI agent architecture article refinement — 2026-08-25

1. [completed] Establish a clean branch from the merged latency baseline.
2. [completed] Replace duplicated article sections with a contract-and-boundary architecture guide.
3. [completed] Verify Markdoc contracts, links, interaction, image, build, lint result, and diff evidence.
4. [pending] Publish the branch, inspect the rendered preview at desktop/mobile widths, and merge after hosted checks pass.

# LLM latency article refinement — 2026-08-25

1. [completed] Establish a clean branch from the merged metrics baseline.
2. [completed] Replace duplicated article sections with an outcome-led latency measurement and optimization sequence.
3. [completed] Verify Markdoc contracts, links, interaction, image, build, lint result, and diff evidence.
4. [pending] Publish the branch, inspect the rendered preview at desktop/mobile widths, and merge after hosted checks pass.

# Long-form blog corpus enforcement — 2026-08-26

1. [completed] Add the 3,000–10,000 hard validator gate and document the 4,000–8,000 editorial target for every agent and future post.
2. [completed] Expand every published article below 4,000 body words with operational, evidence-led sections while preserving frontmatter and links.
3. [completed] Verify the full 35-post count audit, framework/link/Markdoc tests, build, and diff hygiene.
4. [in_progress] Create branch/commit, open PR, inspect hosted checks, and merge after release verification.

# AI evaluation metrics editorial and UX rebuild — 2026-08-26

1. [completed] Rebuild the article hierarchy, teaching sequence, callouts, FAQ, and ending while preserving route, metadata, anchors, publication state, and the 3,000–10,000 contract.
2. [completed] Centralize the editorial panel renderer and dynamic related-post selector, with tests for curated order, category/recency fallback, self/draft/missing exclusion, and deduplication.
3. [completed] Add two project-bound lower-half visuals plus a unique article-specific hero, card-specific selection contrast, and deliberate highlight pacing; verify desktop and 390px rendering with no page overflow.
4. [completed] Pass 20 content tests, 3 related-post tests, focused ESLint, media/route HTTP checks, and `git diff --check`; record the unrelated dashboard TypeScript blocker encountered after successful production compilation.
5. [completed] Update the future-agent contract so hero and teaching visuals must be compositionally unique to each article, with no cross-post reuse or recolor-only variants.
6. [pending] Keep the pass local and uncommitted until visual approval, then force-add the ignored media assets and create the requested focused PR.

# Reusable Tracify blog-quality skill — 2026-08-26

1. [completed] Keep one canonical automatically triggered skill and define `ai-evaluation-metrics` as a quality benchmark rather than a copyable article template.
2. [completed] Add a reusable editorial blueprint and new-post scaffold with visual pacing requirements spanning the opening, midpoint, lower half, action ending, and five-item FAQ.
3. [completed] Implement a targeted validator with clear issue codes and a regression test proving that the benchmark passes while an intentionally poor post fails.
4. [completed] Wire the gate into package scripts, `AGENTS.md`, the writing skill, skill UI metadata, and the publishing README.
5. [completed] Run the strict article gate, 22 content tests, focused lint, skill validation, build compilation/typecheck, and diff checks; preserve unrelated known blockers as separate evidence.
6. [pending] Force-add ignored `.agents` additions and media assets, then include them in the focused article/renderer/skill PR after approval.

# Rename project blog skill — 2026-08-26

1. [completed] Rename the folder, skill frontmatter ID, heading, UI display name, and default `$skill` prompt to `tracify-blog-tool`.
2. [completed] Redirect all active repository instructions and validation commands to `.agents/skills/tracify-blog-tool/`.
3. [completed] Validate the renamed skill package, parse its UI metadata, and rerun its strict article gate and 22-test content suite.
4. [pending] Force-add the renamed skill directory when preparing the focused PR because the local repository exclude rule hides new `.agents` paths.
# 2026-09-02 — Trust-first lifecycle implementation

Implemented the first slice: consent-gated analytics, a reusable consent utility/banner, real contact lead submission endpoint, Convex lead and note storage with admin authorization, and a Resend-compatible email adapter that logs safely when `RESEND_API_KEY` is absent. Remaining verification is Convex codegen plus lint/type/build checks; the current Windows shell cannot locate Node.
# EU deployment readiness audit — 2026-09-02

- [x] Inventory regional providers and code paths; verify dormant US remains unavailable.
- [x] Probe public EU health, region selection, ingest, OTLP, security, and status surfaces.
- [x] Document evidence-backed residency limits and provider-owner follow-up actions.
- [ ] Owner: restore/verify EU Redis, configure EU Stripe billing variables, and decide on an EU queue replacement if strict processing residency is required.
# Activation path follow-up — 2026-09-02

1. [completed] Inspect landing, demo, pricing, contact, signup, quickstart, SDKs, and dashboard start state.
2. [completed] Correct quickstart navigation and authenticated first-trace/demo handoffs.
3. [pending] Verify focused contracts, lint/typecheck, and desktop/mobile routes.
## Consent analytics verification (2026-09-02)

1. Audit all PostHog initialization and capture paths — completed.
2. Harden consent storage/event lifecycle and PostHog gating — completed.
3. Finish accessible consent UI and align privacy copy — completed.
4. Run focused tests, lint, typecheck, and browser coverage — blocked by unavailable Node tooling in current shell.
# Lead workflow completion

1. Preserve the existing first slice and inspect its auth, schema, and UI conventions.
2. Harden the public route and Convex persistence with strict bounds, rate limiting, dedupe, safe email handling, and admin-only operations.
3. Complete the admin inbox interaction model for metadata, filtering, statuses, assignment, notes, and recoverable states.
4. Run focused tests, codegen, lint/typecheck/build, and diff hygiene checks; record environment blockers.
## Lead workflow completion audit — 2026-09-02

The existing lead slice already covers Convex persistence, admin authorization, status transitions, assignment, notes, Redis rate limiting, deduplication, and non-fatal email delivery. This pass added aggregate request-size and JSON-object validation and expanded the inbox presentation of required lead metadata. Verification is pending because Node/npm are unavailable in the current shell.
# Release-readiness disclosure update — 2026-09-02

- [completed] Reconciled public privacy and security disclosures with the current regional architecture: EU storage in Ireland, Stripe as the separate billing processor, and Inngest Cloud span-event processing in US infrastructure. Analytics copy now matches the approved-by-default consent behavior.
# SEO/AEO blog ideation — 2026-09-03

1. [completed] Inspect canonical editorial requirements and existing published slugs.
2. [completed] Identify durable topic gaps across agent operations, evaluation, reliability, security, and buyer education.
3. [completed] Produce 10 detailed briefs with primary queries, question targets, article archetype, outline, evidence, interaction, and conversion path.
## Email sender configuration
- [x] Use a personal verified sender identity for transactional mail.
- [x] Document `RESEND_API_KEY`, `EMAIL_FROM`, and `EMAIL_REPLY_TO` in the local environment template.
- [ ] Owner adds the Resend API key and verifies `kb@tracify.tech`/`tracify.tech` in Vercel and Resend.
# 2026-09-03 — Langfuse parity and release operating model

## Findings

- The Langfuse release corpus contains 672 releases from v1.0.0 through the current v4/v3 maintenance streams.
- Tracify already has early slices for prompts, datasets, evaluators, experiments, alerts, agent tracing, typed scores, cost ceilings, and TS/Python SDKs.
- The largest parity gaps are production-grade evaluation execution, richer trace/observation querying, model/token/cost correctness, team governance, OpenTelemetry/MCP breadth, and a trustworthy release lifecycle.
- Current release automation only publishes SDKs manually or on `sdk-v*` tags; there is no single application release manifest, changelog pipeline, release PR, provenance/attestation policy, or rollback runbook.

## Recommended sequence

1. Establish release foundations: canonical version source, Conventional Commit/changeset policy, CI release gate, GitHub Release generation, immutable artifacts, and rollback/runbook documentation.
2. Make the SDKs production-ready: API compatibility tests, package smoke installs, npm trusted publishing, PyPI trusted publishing, provenance, and synchronized release notes.
3. Ship the highest-value product parity slice: representative datasets → evaluation suites → trace-linked results → regression thresholds → canary release decision.
4. Add query and platform depth: full-text/filter search, monitors/alerts, saved views, trace comparison, accurate model pricing/token accounting, and OTel-compatible ingestion.
5. Add enterprise depth only after the core lifecycle is reliable: RBAC/SCIM, audit log, SSO enforcement, retention/export controls, and regional processing guarantees.

## First release target

Use a v0.3.0 product release plus synchronized SDK patch/minor releases. Do not publish until the release workflow passes application tests, SDK tests, typecheck/build, security checks, package smoke installs, migration checks, and a production smoke test. The first release should include a human-readable changelog with upgrade notes and a rollback owner.

## Favicon candidates — 2026-09-04

The first literal trace-path and pixel-`T` drafts were rejected as too busy and too close to a superhero-style badge. The refined candidates are a measured telemetry signal (`favicon-signal.svg`) and a restrained open trace loop (`favicon-open-trace.svg`), each with 16/32/48px PNG and ICO fallbacks. The signal mark is now the default multi-size app ICO; keep the open-trace version ready as the alternate.
# Plane integration documentation — 2026-09-03

# ERPNext integration — 2026-09-03

- First slice: outbound Tracify alerts to ERPNext `ToDo` records through the Frappe REST API.
- Keep trace/span evidence in Tracify; send bounded alert metadata and a trace link.
- Implement validation, secret-safe persistence/read paths, server-only actions, idempotency, timeout/no-redirect behavior, and project/admin authorization.
- Do not claim end-to-end completion until a customer-provided ERPNext sandbox is tested successfully.
- Added the initial REST client boundary in `src/lib/erpnext.ts`; next code work is credential storage, project authorization, delivery wiring, and settings UI.

1. [completed] Keep Plane content separate from Tracify's own self-hosting guide.
2. [completed] Add a canonical `/docs/plane-integration` Markdoc page grounded in Plane's developer documentation.
3. [pending] Validate the documentation route and content contracts.

# Private Plane workspace — 2026-09-03

1. [completed] Define Plane as an internal project-management system for Tracify.
2. [completed] Remove the erroneous public integration page and document the isolated VPS architecture.
3. [pending] Provision and harden the VPS, configure a Cloudflare Tunnel for `plane.tracify.tech`, Cloudflare Access/MFA, SMTP, backups, and the private Tracify workspace.
# Explore / Build playground and site assistant — 2026-09-04

## Completed

1. Added a pre-region Explore / Build entry choice. Explore goes through the existing EU authentication boundary and enters a simulated `/playground`; Build continues to the existing region-scoped onboarding.
2. Added a populated, interactive simulated dashboard surface with healthy, latency, and tool-failure scenarios, persisted account state, filters, alert dismissal, and a real-project CTA. Simulation data never enters the real project/ingestion path.
3. Added a public Tracify assistant with curated product/setup context, cited internal links, deterministic no-provider fallback, bounded input/rate limiting, and server-only OpenAI usage when configured.
4. Added optional redacted assistant traces to a dedicated internal Tracify ingestion target and made tracing non-blocking.
5. Focused ESLint and TypeScript pass. Local assistant API smoke test returns a cited response. Full page smoke is limited by the existing unavailable local Convex service at `127.0.0.1:3211`.
6. Switched the assistant to `gpt-5.6-luna` with low reasoning effort and added per-IP, daily-global, and output-token guards before enabling paid model calls.

## Follow-up

- Deploy the Convex schema/function change through the normal authenticated Convex deployment/codegen workflow.
- Add browser E2E coverage for Explore/Build, playground persistence/isolation, and assistant citations/fallbacks.
- Configure `TRACIFY_INTERNAL_INGEST_URL` and `TRACIFY_INTERNAL_API_KEY` only in the intended server deployment environment.
- Commit/review/merge the local implementation before treating the playground and assistant as production-live; the Vercel guardrail redeploy used `main` commit `fbd51b1`.
- Favicon cascade-T preview is pushed as `19082d7`; production promotion remains pending merge/owner approval. Only the approved Cascade A family is stored under `public/logos/cascade-t-a/`; the Photoshop-ready transparent lockup is available as both PNG and SVG, and unselected favicon experiments are archived outside `public/`.
- Configure the provider-side OpenAI organization/project budget after the owner signs in; application caps are already configured in Vercel Production.

# 2026-09-05 — EU cloud TLS regression

1. [completed] Reproduce the public failure and identify the failing layer.
2. [completed] Confirm the Cloudflare record and Vercel deployment are otherwise configured.
3. [completed] Test the owner-selected DNS-only/Vercel path; curl succeeds but Chrome still rejects the Vercel TLS handshake.
4. [pending] Resolve Vercel custom-domain TLS renegotiation or migrate to a one-level hostname covered by the free certificate.

# Langfuse clone surface — 2026-09-06

- Implemented the first local parity slice for the requested demo and empty-project views.
- Follow-up scope: add authenticated data wiring and expand remaining project modules only if the user wants a full product-surface parity pass.

# Langfuse empty dashboard parity — 2026-09-06

1. [completed] Read the supplied handoff and inspect the captured empty-home reference.
2. [completed] Add a maintainable React overview component with dark cards, empty chart states, controls, and responsive behavior.
3. [completed] Connect the empty-project branch to the existing project route and preserve the populated overview path.
4. [completed] Add a scoped dark shell/sidebar treatment and Tracify-native navigation links.
5. [completed] Run focused ESLint, TypeScript, and diff hygiene checks; remove stale generated references created by the existing dev server.
6. [completed] Restore local Convex startup with a backwards-compatible legacy lead-record schema adjustment; new lead writes still populate both delivery fields.
7. [completed] Compare a clean isolated preview against the captured desktop reference and verify tab/model controls change state.
8. [pending] Repeat the comparison through the authenticated production route once the local browser session has a usable project identity.

# Tracify dashboard feature parity — 2026-09-06

1. [completed] Apply the dark Tracify cloud shell and shared selectors across dashboard routes.
2. [completed] Add a local populated tracing surface with search, filters, table/chart modes, columns, and seeded trace metadata.
3. [completed] Add the populated tracing surface with search, filters, table/chart modes, columns, and seeded trace metadata.
4. [completed] Add the operations surface with Sessions, Users, Alerts, search, and alert severity filtering.
5. [pending] Replace seeded preview data with authenticated Convex-backed trace/session/user data and carry the feature treatment through the remaining dashboard modules.
6. [in progress] Finish route-by-route parity for dashboards, users, scores, evaluators, human annotation, and settings using authenticated project data; navigation, Scores, Users, and the authenticated Operations route are now exposed.
7. [pending] Run matching-viewport visual review across the captured route set and fix remaining layout/interaction mismatches.
8. [in progress] Match dashboard editor controls and remaining captured interaction details before the final route audit.
9. [completed] Add an interactive dashboard widget library and clone feedback to the project Dashboards route.
10. [completed] Add direct Evaluators and Human Annotation project routes to match the captured navigation destinations.
11. [completed] Keep command-menu navigation aligned with the expanded dashboard destination set.
12. [completed] Make project settings tab query navigation functional for sidebar deep links.
13. [completed] Add secondary project-settings navigation covering the captured settings destinations and mapping each to an existing Tracify workflow.
14. [completed] Add the organization workspace route with live organization/project selection and project creation entry point.
15. [completed] Add real New organization creation to the workspace screen.
16. [completed] Add a first-class Tracing project route and align navigation with the captured destination name.
17. [completed] Add a first-class Prompt Management project route and preserve the Prompts compatibility route.
18. [completed] Connect project overview metrics to authenticated Convex summary/evaluation queries without changing the captured empty-state layout.
19. [completed] Connect the overview's model, user-consumption, and latency summaries to the existing project-stats API.
20. [completed] Add compact live model and end-user breakdowns inside the overview panels.
21. [completed] Render selected dashboard-editor widgets in the overview after Add Widget.
22. [completed] Persist dashboard-editor widget selection per project for repeatable workspace behavior.
23. [completed] Add removal controls so persisted dashboard widgets can be edited down as well as added.
24. [completed] Add a dedicated LLM Connections settings workflow with safe masked local metadata handling.
25. [completed] Add functional overview filter controls matching the captured dashboard toolbar.
26. [completed] Add a dedicated Model Definitions settings workflow with editable provider pricing metadata.
27. [completed] Add a dedicated Scores Configs settings workflow with editable score thresholds.
28. [completed] Add a dedicated MCP & CLI settings workflow with copyable developer-access snippets.
29. [completed] Add a dedicated Exports settings workflow backed by live trace filtering and CSV export.
30. [completed] Add a dedicated project-scoped Notifications settings workflow.
31. Move the regional cloud switcher into the dashboard top bar before the remaining dashboard selectors; preserve the cloud-directory destination and verify it on both local hosts.
32. Add a dedicated Batch Actions settings surface using the existing run selection/export workflow and enable the already-implemented Notifications tab.
33. Add a real project-scoped audit log table, record settings/API-key changes, and expose a dedicated Audit Logs settings page.
34. Add the captured Organization Settings surface using the existing Better Auth organization and member state.
35. Add project-scoped Integrations settings with the existing alert destination backend and developer connection links.
36. Make dashboard editing behavior persistent: named dashboard selector and durable clone action per project.
37. Align the authenticated sidebar Integrations entry with the project-scoped settings route.
38. Add captured-style search and environment filtering to live project Sessions.
39. Add captured-style user detail navigation and live per-user session metrics.
40. Add user detail navigation and live per-user operational metrics.
41. Connect dashboard environment filtering to live Convex summary data.
42. Connect dashboard time range to live summary metrics so cards and charts share the same window.
43. Connect dashboard trace/session/user/release filters to live summary metrics.
44. Populate dashboard environment choices from observed project telemetry.
45. Align Costs summary fallback with selected dashboard range and environment context.
46. Connect dashboard model selection to live project summary metrics.
47. Populate dashboard model choices from observed project runs.
48. Make dashboard usage and consumption tabs change live displayed metrics.
49. Apply selected model filtering consistently to dashboard breakdowns and latency metrics.
50. Distinguish model and tool usage in dashboard type-based tabs.
51. Add real model latency percentile aggregation through Tinybird, Convex cache, stats API, and dashboard rendering.
52. Connect the captured Home Assistant control to the shared dashboard command menu.
53. Connect Home shell sidebar toggle to shared dashboard sidebar state.
54. Remove the stale dashboard sidebar memo dependency after wiring shell controls.
55. Connect dashboard topbar Filters control to the Home filter state.
56. Persist dashboard widget layouts independently for each named dashboard.
57. Add rename and delete actions for custom dashboards while protecting the default Tracify Home dashboard.
58. Make both local dashboard previews use the authenticated-style Tracify shell for visual comparison.
59. Continue visual parity review of linked dashboard surfaces against their captured references.
60. Compare linked-surface content and controls against the captured screenshots and wire the highest-value interactions.
61. Verify the upgraded linked-surface controls through the authenticated-style preview and refine visual spacing against the capture.
62. Continue behavior parity audit for dashboard editor actions and linked-surface create flows.
63. Exercise the editor and linked create-flow state changes in-browser at the reference viewport.
64. Complete the remaining capture-path and feature audit across both regional runtimes.
65. Perform final visual comparison of the Home dashboard against the captured reference at the same viewport.
66. Continue feature-depth parity for non-Home captured surfaces with real list/detail interactions.
67. Extend linked forms with persistence-backed project data where the corresponding Tracify API exists.
68. Replace local draft markers with Convex mutations for surfaces that have backend schemas.
69. Wire prompt and evaluation create forms to their existing typed Convex mutations, then design schemas for the remaining linked surfaces.
70. Verify prompt and evaluation linked routes with authenticated project data and preserve the generic surfaces for schema-less features.
71. Add explicit Convex-backed schemas for the remaining high-value captured surfaces, starting with alerts and automations.
72. Verify the alert creation route against an authenticated project and then design the automation contract.
73. Verify Automations in both regional runtimes and continue the saved-dashboard/widget backend contract.
74. Switch authenticated dashboard editor reads/writes from compatibility local storage to dashboardConfigs/dashboardWidgets.
75. Add persisted rename, delete, reset, and reorder mutations for dashboard editor parity.
76. Verify authenticated editor actions end-to-end against a real project session.
77. Verify the production build artifact and regional runtime URLs after the final editor mutations.
78. Preserve final handoff links and document the remaining backend expansion points.
79. Add a reversible Tracify-branded dashboard presentation layer with legacy/v2 preview controls while preserving existing functionality.
80. Keep the Explore and region choices as separate steps, carry a stable simulated user ID into the playground URL, and verify the production Vercel and Convex deployments before release.
81. Fix the Better Auth/Convex callback race, preserve the immersive playground return query through sign-in, and align regional Better Auth host resolution.
81. [completed] Stabilize direct project-route empty states so invalid or inaccessible IDs never render project-specific Convex queries before authentication and route validation.
82. [completed] Decouple the deterministic Explore Playground simulator from the stale regional `sandbox` deployment while preserving scenario, filter, alert, and trace-detail interactions.
83. [completed] Verify the corrected EU Vercel environment binding, production build, TypeScript, focused lint, and 6-case account-access browser contract.
84. [completed] Add the missing EU Vercel Production `CONVEX_SITE_URL`, confirm the merged main deployment is Ready on `eu.cloud.tracify.tech`, and smoke-test the live Playground controls.

85. [in progress] Migrate authenticated Build Sessions list and detail routes to the captured localhost:4173 workspace renderer with live Convex records.
86. [next] Migrate the remaining high-value authenticated Build surfaces (home/dashboard, costs, prompts, evaluations, datasets, scores, alerts, and settings) to the captured renderer, retaining Tracify branding and real project data.

## Explore/Build parity spec — 2026-09-08

Objective: give first-time visitors a reliable Tracify Explore experience that visually follows the supplied populated dashboard capture while keeping production account data, authentication, and regional telemetry out of the demo path.

Acceptance contract:

1. Explore opens `/playground?view=home&userId=usr_demo_7f3a9c21` directly; no region selection, Clerk/Convex auth gate, stale project ID, personal dashboard, or Langfuse label is involved.
2. The Explore shell is visibly branded Tracify, uses the dark cloud dashboard treatment, and uses gray placeholders/skeletons against the dark canvas. The captured populated Home/Tracing information architecture is the visual reference, not archived JavaScript.
3. The logo always returns to `/dashboard` project selection. The synthetic project switcher clearly says `Demo Project (view only)` and offers a Build path.
4. Every visible Explore sidebar item remains inside the simulator and changes the `view` state; Home, Tracing, filters, scenario cards, trace detail, time range, environment, and Build actions have observable behavior.
5. Build remains a separate path: `/cloud/region` lists available regions, and selecting one shows `/cloud/connecting` with a visible `Connecting to … cloud` status before regional API redirect.
6. Verification must pass TypeScript, focused ESLint, production build, and the account-access browser contract. Existing generated Convex changes and unrelated scratch files remain untouched.

Implementation completed:

- Added the `synthetic` dashboard-shell/sidebar/project-switcher mode and routed all simulator navigation through `view` query state.
- Replaced the auth-dependent playground surface with populated synthetic Home, Tracing, and generic simulator surfaces, preserving safe localStorage scenario state.
- Added the regional connecting handoff route and gray dark-dashboard loading treatment.
- Updated `tests/e2e/account-access-contract.spec.ts` to encode the acceptance contract; all 8 tests pass locally.

Production verification:

- PR #99 merged as `7c3ee0f`; PR #100 merged as `312a4df`.
- Marketing production deployment and EU production deployment for `312a4df` reached Ready. Live marketing Explore click reaches `https://eu.cloud.tracify.tech/playground?view=home&userId=usr_demo_7f3a9c21` and renders the populated synthetic Home.
- Remaining deployment hygiene item: copy the existing production `CONVEX_SITE_URL` config into the EU Vercel Preview environment. The preview deployment for PR #100 fails at page-data collection with `CONVEX_SITE_URL is not set`; this does not affect the verified production deployment.
