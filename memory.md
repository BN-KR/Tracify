# Project Memory

## Overview
- Last Synced: 2026-05-17T00:19:00Z
- Purpose: 5to1r — Agent Observability Platform (Full visibility into AI agent steps, decisions, cost, failures).
- Stack: Next.js 16 (App Router), Clerk (Auth/Orgs), Convex (App DB), Tinybird (Telemetry Storage), Inngest (Background Jobs).

## Architecture
- **Auth:** Clerk handles user and organization auth. Now uses **Keyless mode** for local development.
- **Application State:** Convex is the source of truth for app metadata (`projects`, `agentRuns`, `alerts`). It provides reactive UI updates.
- **Telemetry Data:** Tinybird is the high-volume time-series database for raw telemetry (`spans`).
- **Ingestion Pipeline:** SDK calls POST `/api/ingest` -> Inngest event -> validates, writes to Tinybird, upserts rollups to Convex, triggers alerts.
- **Typography:** Uses **Geist Pixel Square** for logos (regular weight, normal tracking) and H1 headers, Geist Mono for UI/Data, and Geist Sans for prose.
- **Aesthetics:** Strict "Developer-grade" look: **0px border radius**, monochrome palette (#000000 bg, #FFFFFF primary), and **Emil Kowalski** design engineering principles (tactile feedback, micro-animations, polish).
- **Branding:** Adopted a "skinnier" text-based logo aesthetic (text-lg, regular weight) across all surfaces. Global controls (Project Switcher, Account, Breadcrumbs) are consolidated in the **Dashboard Topbar** to keep the sidebar focused on navigation.
- **Navigation:** Integrated a custom monochromatic `DropdownMenu` for both Project Switching and Account management in the topbar.
- **Legal:** Dedicated `/privacy` and `/terms` pages with a minimalist, linked **Footer** component.
- **Auth:** Google OAuth credentials configured in `.env.prod`, `.env.local`, and Vercel production variables.


## Conventions
- Use Tailwind CSS and shadcn/ui.
- Follow Next.js 16 App Router best practices (React Server Components by default).
- Convex queries/mutations live in `convex/`.
- **Path Aliases:** Use `convex/_generated/api` for Convex imports and `@/*` for `src/` imports.
- Tinybird REST API is used for high-volume ingest and heavy analytics queries (`lib/tinybird.ts`).

## Known Issues
- None yet (MVP phase).

## Infrastructure
- Frontend/API: Vercel (target)
- Database: Convex Cloud
- Analytics: Tinybird (Clickhouse)
- Queues: Inngest
- **Environment:** Created `.env.prod` template for streamlined Vercel deployment. Isolated local dev via Tinybird `dev` branch.

## Recent Important Changes
- **SDK Install Copy Finalization (2026-05-17):**
  - **Goal:** Make every user-facing install path consistently show the now-published package names.
  - **Change:** Onboarding Python install now uses `pip install 5to1r` instead of the old GitHub package URL.
  - **Change:** Marketing final CTA terminal now shows both `pip install 5to1r` and `npm install 5to1r`.
  - **Change:** The onboarding AI setup prompt now explicitly tells coding agents to use `pip install 5to1r` for Python and `npm install 5to1r` for TypeScript/Node.js.
  - **Verification:** Searched source/docs for stale `pip install fivetoone`, GitHub Python install, `npm install @5to1r`, and `@5to1r/sdk` references outside dependency folders; `npm run build` passes.

- **Python SDK PyPI Package Rename Prep (2026-05-17):**
  - **Goal:** Make Python install match the public product/package name: `pip install 5to1r`.
  - **Change:** `packages/python-sdk/pyproject.toml` now uses distribution name `5to1r` while keeping the import module as `fivetoone`.
  - **Reason:** PyPI distribution names may be installed as `5to1r`, but Python import statements cannot cleanly use `from 5to1r import ...`; user code should install `5to1r` and import from `fivetoone`.
  - **Docs:** Updated Python install snippets in app quickstart/docs and package README from `pip install fivetoone` to `pip install 5to1r`.
  - **Verification:** `uv build` produced `dist/5to1r-0.1.0.tar.gz` and `dist/5to1r-0.1.0-py3-none-any.whl`; local wheel smoke test imported `FiveToOneClient`, `trace_agent`, `llm_call`, and `tool_call`; `uv publish --dry-run` passed. Real PyPI upload still needs a PyPI API token.

- **Production Convex Auth Recovery (2026-05-17):**
  - **Issue:** Production project creation could stay on "waiting for auth", matching the previous dev failure.
  - **Cause:** The production Clerk instance had no JWT templates, so `ConvexProviderWithClerk` could not fetch `getToken({ template: "convex" })`.
  - **Fix:** Created production Clerk JWT template `convex` with `aud: "convex"` and standard user claims.
  - **Fix:** Deployed current Convex functions/auth config to prod deployment `focused-otter-289`.
  - **Verification:** Production Clerk now lists JWT template `convex`, Convex prod env has `CLERK_JWT_ISSUER_DOMAIN=https://clerk.5to1r.com`, and Vercel production has the required Clerk/Convex env vars.
  - **Runbook:** Detailed dev/prod troubleshooting steps are documented in `docs/troubleshooting-convex-clerk-auth.md`.

- **Dashboard Layout Fix (2026-05-17):**
40:   - **Issue:** Identified a 56px "bar" or gap at the bottom of the dashboard content area.
41:   - **Cause:** A hardcoded height subtraction `h-[calc(100svh-56px)]` in `DashboardShell` was reserving space for a topbar that is actually rendered inside the scrollable content.
42:   - **Fix:** Removed the height subtraction and set `main` to `h-svh pb-0` to fill the viewport and eliminate the gap.
43: 
44: - **Dashboard Decision Document Alignment Pass (2026-05-17):**
  - **Source:** Read `5to1r - docs\5to1r_dashboard_decisions.docx` and used it as the dashboard MVP target.
  - **Navigation:** Added `/dashboard/[projectId]/costs` and removed API Keys/Billing from primary sidebar navigation; those are now settings-owned actions per the decision doc.
  - **Settings Hub:** Settings now includes API Keys and Management tabs, making project operations discoverable without cluttering primary nav.
  - **Overview Scope:** Removed model distribution from the overview chart area; model breakdown now belongs on the Costs page.
  - **Costs Page:** Added a lightweight cost dashboard with total spend, 7/30/90 day range controls, cost-over-time, cost-by-model, expensive saved runs, and threshold link.
  - **Verification:** Convex dev sync passed and `npm run build` passes with `/dashboard/[projectId]/costs` included.

- **Dashboard Saved Totals Fallback (2026-05-17):**
  - **Issue:** New agent workflow runs appeared in Convex-backed run lists, but overview/cost totals could stay stale because the top cards depended on Tinybird analytics only.
  - **Fix:** Overview spend/span cards now use Convex `getProjectManagementSummary` saved totals as the immediate source of truth when analytics are unavailable or behind.
  - **Fix:** Costs total spend now uses the larger of Tinybird analytics and Convex saved totals, so newly ingested high-cost runs show immediately while detailed analytics catches up.
  - **Correction:** Range-scoped spend and span cards must use Tinybird analytics for the selected range when available; Convex saved totals are all-time-ish fallback only when Tinybird is unavailable.
  - **Verification:** `npm run build` passes.

- **Tinybird SQL JSON Response Fix (2026-05-17):**
  - **Issue:** Dashboard analytics showed `Tinybird analytics unavailable` even though Tinybird had data because `/v0/sql` returned tab-separated output and the app attempted `res.json()`.
  - **Fix:** Tinybird SQL helpers now append `FORMAT JSON` to every analytics query so `getDailyCosts`, `getCostByModel`, and run span queries parse correctly.
  - **Verification:** Direct Tinybird query with `FORMAT JSON` returned JSON and `npm run build` passes.

- **Historical Demo Data Seed (2026-05-17):**
  - **Script:** Added `scratch/user-test-5to1r/seed-history.mjs` and `npm run seed:history` for local demo data generation.
  - **Data Shape:** Seeds 13 previous days with 22 runs, 132 spans, varied costs, one failed run, and model coverage across `gpt-5.5`, `claude-3-opus-latest`, and `claude-3-5-sonnet-latest`.
  - **Verification:** Seed ran through the real `/api/ingest` path, Convex saved historical run summaries, Tinybird returned 14-day daily JSON rollups, and `npm run build` passes.

- **Dashboard Analytics Auto-Refresh (2026-05-17):**
  - **Issue:** Tinybird-backed charts and model breakdowns only updated after a manual page refresh.
  - **Fix:** Overview and Costs now poll `/api/projects/[projectId]/stats` every 4 seconds while the tab is visible, use `cache: "no-store"`, and refresh immediately when the tab becomes visible again.
  - **UX:** Polling keeps existing chart data on screen and avoids skeleton flicker after the first load.
  - **Verification:** `npm run build` passes.

- **Savings Impact Cost Graph (2026-05-17):**
  - **Issue:** The Costs page line graph was too plain and did not communicate the visual impact of reducing agent spend.
  - **Fix:** Replaced the basic cost-over-time line with a savings-impact area chart: actual spend, shaded estimated avoided spend, and a dashed peak-day baseline.
  - **UX:** Added peak day, latest day, and estimated avoided-spend cards above the chart to make savings visible before reading the graph.
  - **UX:** Savings copy now always renders with `$0.00` when there is no computed saving instead of disappearing.
  - **UX:** Overview and Costs now keep spend as the primary number and show savings as smaller secondary sub-metrics in the same card.
  - **UX:** Dashboard Overview now has a 1d/7d/30d/90d range switcher and shows total potential savings for the selected period, not per-day savings.
  - **Demo Data:** Added `scratch/user-test-5to1r/seed-savings.mjs` and `npm run seed:savings` to create a clear unoptimized-to-optimized savings pattern through the real ingest path.
  - **Verification:** `npm run build` passes.

- **Custom 404 Page (2026-05-17):**
  - **Fix:** Added `src/app/not-found.tsx` using the existing monochrome 5to1r visual language for unmatched routes and `notFound()` cases.
  - **UX:** Includes direct actions back to `/dashboard` and `/`, plus a small trace-style status panel.
  - **Verification:** `npm run build` passes and Next generates the `_not-found` route.

- **Project Management + Safer Delete Flow (2026-05-17):**
  - **Stats Resilience:** `/api/projects/[projectId]/stats` now returns an empty analytics payload with `unavailable: true` when Tinybird is unavailable instead of surfacing a dashboard console error.
  - **Management Page:** Added `/dashboard/[projectId]/manage` with Convex-backed saved stats: runs, spans, saved cost, alerts, recent runs, lifecycle, API key last-used, and alert thresholds.
  - **Navigation:** Added Manage to the dashboard sidebar, account menu, and overview activity header.
  - **Deletion Safety:** Project deletion now requires typing the exact project name and `DELETE`; deletion also removes saved Convex runs, alerts, and comments for the project.
  - **Verification:** Synced Convex dev, verified `projects:getProjectManagementSummary` for `test_manual_api`, and `npm run build` passes with Next.js 16.2.6.

- **Local Ingest Dev Flow Fix (2026-05-16):**
  - **Issue:** Localhost showed internal server/proxy errors and the npm user-test script could not move onboarding past the listening state.
  - **Fix:** Restarted Next.js in normal `npm run dev` mode instead of binding to `127.0.0.1`, which avoided the localhost proxy hang.
  - **Fix:** `.env.local` now uses the Convex dev `FIVETOONE_API_KEY_HASH_SECRET` and points `INNGEST_DEV` at `http://127.0.0.1:8288`.
  - **Verification:** `http://localhost:3000` returns `200`, `/api/ingest` returns `202`, `scratch/user-test-5to1r` returns `Ingest status: 202 Accepted`, and Convex dev contains the generated run for project `jd74cdngtnqd2yw3gsb2602fv186t0hr`.

- **Manual API Key Issuance + npm Package Rename (2026-05-16):**
  - **SDK Install Copy:** Updated app onboarding, dashboard docs, quickstart docs, design spec, and TS SDK README so TypeScript installs use `npm install 5to1r` and imports use `from "5to1r"`.
  - **Package Metadata:** `packages/ts-sdk/package.json` now publishes as `5to1r`; removed the accidental self-dependency from `package.json` and `package-lock.json`.
  - **Admin Issuance:** Added `projects:createProjectForUser`, an admin-only Convex mutation that creates a project for a target Clerk user and returns the one-time plaintext API key using the same HMAC storage path as normal onboarding.
  - **Access Control:** Dev Convex env `FIVETOONE_ADMIN_CLERK_USER_IDS` is set to the local admin Clerk user id `user_3DbExfanjwXgIVGD8jXscKuXf7S`.
  - **Verification:** Convex dev sync passed, manual project/API key creation succeeded for project `jd75ha4z0264kr6wsbes7vd8rs86trsa`, SDK package build passed, and root `npm run build` passes.

- **npm SDK Publish Prep (2026-05-16):**
  - **Issue:** `npm publish --access public` for `@5to1r/sdk@0.1.0` failed with npm `E403` because the npm account requires 2FA or a granular publish token with bypass 2FA.
  - **Fix:** Added `packages/ts-sdk/tsconfig.json` so `npm run build` emits `dist/index.js` and `dist/index.d.ts`.
  - **Cleanup:** Removed stale `uuid` runtime/type dependencies from `packages/ts-sdk/package.json`; the SDK uses `crypto.randomUUID` with a fallback.
  - **Verification:** `npm run build` in `packages/ts-sdk` passes, and `npm pack --dry-run --cache C:\tmp\npm-cache` includes `README.md`, `dist/index.js`, `dist/index.d.ts`, and `package.json`.

- **Dashboard Shell Single-Instance Fix (2026-05-16):**
  - **Fix:** Removed nested `DashboardShell` wrappers from project child pages (`alerts`, `api-keys`, `billing`, `quickstart`, `runs`, `runs/[runId]`, `settings`).
  - **Reason:** `src/app/dashboard/layout.tsx` already owns the dashboard shell and sidebar. Nested shells could render two independent sidebars with different collapsed state and layer them over each other.
  - **Guarantee:** `DashboardShell` is now referenced only by `src/app/dashboard/layout.tsx`, so dashboard routes can render only one sidebar instance.
  - **URL Behavior:** Project workspaces keep the Convex project id in the URL (`/dashboard/[projectId]`), `/dashboard` is just an entry redirect, and the sidebar logo now links to the active project URL when a project is selected.
  - **Verification:** `npm run build` passes with Next.js 16.2.6.

- **Dev Convex Project Seed + Clerk JWT Template Fix (2026-05-16):**
  - **Dev Data:** Created Convex dev project `Dev Terminal Project` for local Clerk user `user_3DbExfanjwXgIVGD8jXscKuXf7S`; project id is `jd77b4bxf1k3eq4ztxmphjgyy186vcf3`.
  - **API Key Backup:** Saved the generated one-time dev API key to `C:\tmp\fivetoone_dev_terminal_project_api_key.txt`.
  - **Auth Fix:** Local Clerk instance had no JWT templates, so `ConvexProviderWithClerk` could not fetch `getToken({ template: "convex" })` and the app stayed in "waiting for auth". Created Clerk JWT template `convex` with `aud: "convex"` and standard user claims.
  - **Deployment Sync:** Ran `npx convex dev --once --typecheck disable` after the browser reported missing `projects:getProjectRouteState`; Convex dev now registers the route-state query.
  - **Verification:** `projects:getProjectsByUserOrOrg` returns the seeded project and `projects:getProjectRouteState` returns `{ status: "ready", projectId: "jd77b4bxf1k3eq4ztxmphjgyy186vcf3" }` when run against Convex dev with the matching Clerk identity.

- **Project Onboarding Route-State Fix (2026-05-16):** Removed `/dashboard/no-project` as an active dashboard state.
  - **Fix:** `/dashboard` now resolves the authenticated user's real Convex project list and redirects to the last/first valid project, or shows a first-project empty state without creating a fake project id.
  - **Fix:** `/dashboard/[projectId]` is guarded by a Convex-backed route-state query that accepts a plain string, normalizes it with `ctx.db.normalizeId`, and redirects invalid/stale/no-project routes before project-scoped query components mount.
  - **Fix:** Onboarding entry now verifies real Convex projects instead of trusting `sessionStorage`/`localStorage`; stale project ids are cleared for zero-project users.
  - **Fix:** Onboarding escape/return-path handling normalizes old `/dashboard/no-project` values back to `/dashboard`.
  - **Cleanup:** Removed active `"no-project"` query guards from dashboard leaves; the sentinel remains only as stale browser-state compatibility cleanup.
  - **Build:** `npm run build` passes with Next.js 16.2.6 after adding missing local `Tabs`, correcting encoded API route folders/files, fixing trace viewer JSX, and replacing the TS SDK `uuid` dependency with `crypto.randomUUID`.

- **Vercel Build Pipeline Fix (2026-05-15):** Removed the interactive Convex deploy from the Vercel build script and committed Convex generated bindings.
  - **Fix:** `package.json` build now runs `next build`; Convex deployment is available separately via `npm run deploy:convex`.
  - **Fix:** `convex/_generated` is no longer gitignored, so Vercel can resolve `convex/_generated/api` during frontend compilation without running an interactive deploy step.
  - **Fix:** Dashboard link buttons no longer pass unsupported `asChild` props to the local Base UI-backed `Button` component.
  - **Fix:** `agentRuns` project access typing now matches the legacy-compatible optional `projects.clerkUserId` schema field.
  - **Verification:** `npm run build` passes with Next.js 16.2.6.
  - **Deployment:** Vercel project `5to1r/5to1r` was linked and production deployment `dpl_HsSNpJDGpET5miH4ji2MEZ8773JN` is Ready at `https://5to1r.vercel.app`.
  - **Environment:** `.env.prod` values were applied to the Vercel production environment before the successful deploy.
  - **Runtime Correction:** `.env.prod` still contained template placeholders, causing Clerk runtime 500s (`Publishable key not valid`). Vercel production was temporarily overwritten with non-placeholder `.env.local` test/dev values and redeployed as `dpl_3AqxVmaB5qaP5LDnkJSeqL2QXjeZ`; recent 500 logs cleared.
  - **Clerk Production Keys:** Vercel production now has live Clerk keys and redeployed successfully as `dpl_3TiEbJ9qwnXEzuWYoLvYSYida3er`. Local ignored `.env.prod` was also updated with the live Clerk entries.
  - **Convex Production Switch:** Vercel production now points to Convex prod `focused-otter-289` (`https://focused-otter-289.convex.cloud` and `https://focused-otter-289.convex.site`) and redeployed successfully as `dpl_8rT1Ty4pWGnMveuRTd5LagdUu1rW`.
  - **Convex Auth:** `convex/auth.config.ts` now reads `CLERK_JWT_ISSUER_DOMAIN` with a dev fallback. Convex prod has `CLERK_JWT_ISSUER_DOMAIN=https://clerk.5to1r.com`.
  - **Production Secret:** Generated and set `FIVETOONE_API_KEY_HASH_SECRET` in Vercel and Convex prod; a local backup is in `C:\tmp\fivetoone_api_key_hash_secret.txt`.
  - **Caution:** Inngest and Slack production values still need final real credentials; `INNGEST_DEV` was removed from Vercel production.
  - **Note:** `npm run lint` still reports pre-existing lint issues in `.agents`, `scratch`, and several marketing/UI files; these are not part of the Vercel production build blocker.

- **Dashboard Login Flow Correction:** Landing -> sign-in now returns users to the dashboard instead of the landing page.
  - **Behavior:** Clerk sign-in and sign-up pages now force/fallback redirect to `/dashboard`.
  - **Behavior:** `/dashboard` now renders the dashboard start state directly instead of bouncing into onboarding.
  - **Behavior:** The dashboard top bar now exposes an explicit `Onboarding` button so quickstart remains reachable from the main workspace.
  - **Reason:** Signed-in users should not be sent back to marketing or onboarding by default.

- **Project Creation Auth-State Split:** `ProjectStep` now distinguishes Clerk sign-in from Convex auth readiness.
  - **Behavior:** Signed-in users see `Preparing project creation...` while Convex catches up instead of a sign-in prompt.
  - **Behavior:** Only truly unsigned users see `Sign in to create a project.`
  - **Reason:** The previous Convex auth gate was too opaque for a user who was already signed in through Clerk.

- **Project Creation Auth Boundary Fix:** `ProjectStep` now waits for Convex `Authenticated` before rendering the create-project form.
  - **Reason:** Calling `projects.createProject` before the Convex auth token is established can yield `ctx.auth.getUserIdentity() === null`.
  - **Behavior:** A short `AuthLoading` message appears while Convex auth initializes, and the form only renders once the client is truly authenticated.
  - **Scope:** This is a submit-path auth timing fix only; no onboarding copy, install commands, or dashboard navigation behavior changed.

- **Convex Sync Recovery:** Fixed a deployment sync blocker that prevented `projects:createProject` and `projects:getProjectsByUserOrOrg` from registering.
  - **Cause:** An existing `agentRuns` document in the deployment was missing `createdAt`, which caused schema validation to fail before upload.
  - **Fix:** Made `agentRuns.createdAt` optional for backward compatibility and kept new writes populating it.
  - **Result:** `npx convex dev` now reports `Convex functions ready!`, so the deployment can serve the current public functions again.
  
- **Vercel Build Fix:** Resolved "Module not found" errors for `convex/_generated/api` during Vercel deployment.
  - **Fix:** Updated `package.json` build script to `npx convex deploy && next build`. This ensures Convex generated files are available before the Next.js build starts.
  - **Correction:** Removed the unsupported `--bundle` flag which was causing the build to fail.
  - **Cleanup:** Standardized all Convex imports to use the `convex/` path alias instead of relative paths (e.g., in `src/lib/inngest-functions.ts`).
  
- **Auth Instant Loading Pass:** Removed all entrance animations (Framer Motion) and conflicting global CSS overrides to eliminate 5-second loading delays and 'black overlay' effects. Pages now render immediately.
- **Auth Contrast Pass:** Reverted background to deep black (`#050505`) and pushed all text and terminal logs to pure white (`#FFFFFF`) to ensure maximum legibility and modal visibility.
- **Navbar Sign Out:** Added a `SignOutButton` to the marketing navbar for authenticated users, placed beside the Dashboard button.
- **Root Routing Stability Fix:** Onboarding and dashboard root entry now rely on local project context first instead of a Convex query during redirect.
  - **Reason:** A stale deployment can block route entry if the redirect itself depends on a missing public Convex function.
  - **Current Behavior:** `/dashboard` and `/onboarding` now use onboarding/session and last-selected project context to decide whether to route to `/dashboard/[projectId]` or `/onboarding/project`.
  - **Scope:** This keeps route entry stable without touching trace viewer, runs list, cost dashboard, or landing page behavior.
- **Onboarding Routing + Install Step Refinement:** Onboarding is now state-based and manual-entry friendly instead of login-based.
  - **Routing:** `/onboarding` checks signed-in project state and routes users with an existing project back to `/dashboard/[projectId]`; users with no project continue to `/onboarding/project`.
  - **Dashboard Entry:** `/dashboard` routes users with an existing project to `/dashboard/[projectId]` and users with no project to `/onboarding/project`, so onboarding does not run every login.
  - **API Key Handling:** API keys are generated on project creation, shown once, stored server-side only as HMAC-SHA256 hash plus prefix/last4, and the plaintext browser handoff is memory-only until copy.
  - **Install Step:** `/onboarding/install` now includes Python, TypeScript, and AI setup prompt modes.
  - **Package Accuracy:** Real PyPI/npm install commands should only be shown when packages are published; current onboarding uses beta GitHub install commands because `5to1r` and `@5to1r/sdk` were not found in public registries.
- **Onboarding/Dashboard Navigation Escape Hatches:** Added navigation-only escape and re-entry paths between onboarding and dashboard.
  - **Onboarding Escape:** `/onboarding/project`, `/onboarding/api-key`, `/onboarding/install`, `/onboarding/waiting`, and `/onboarding/success` now show a quiet top-left Home/Dashboard link in the onboarding shell.
  - **API Key Protection:** The API key step warns before leaving if the one-time key is still available and has not been copied.
  - **Dashboard Re-entry:** Dashboard sidebar Resources now includes Quickstart above Docs, routed to `/onboarding/install`.
  - **Empty State CTA:** Dashboard start state now routes View quickstart to `/onboarding/project`, `/onboarding/api-key`, or `/onboarding/install` based on available onboarding session context.
  - **Scope Control:** This pass was navigation-only; landing, auth, pricing, ingestion, Convex, Inngest, trace viewer, runs, costs, and alerts behavior were not changed.
- **Dashboard Project Switcher Runtime Fix:** Removed dashboard project switcher Convex query calls for now.
  - **Reason:** Local/stale Convex deployments can throw missing public function errors before `npx convex dev` registers new project-list functions.
  - **Current Behavior:** Switcher uses onboarding `sessionStorage` project context when present, then falls back to existing mock projects.
  - **TODO:** Reconnect to Convex-backed project listing after the local deployment/function registration path is stable.
- **Milestone 2 Part 3 - Ingestion + First Span Activation:** Added the minimum ingestion path needed for real onboarding activation.
  - **Ingest API:** `POST /api/ingest` accepts span JSON with Bearer API key auth, validates payloads up to 1MB, updates API key last-used metadata, and returns `202` after accepting valid spans.
  - **Key Validation:** API keys are validated by HMAC hash lookup; invalid/missing/revoked keys return `401` without revealing existence.
  - **Processing:** `5to1r/span.received` Inngest event writes span rows to Tinybird and upserts Convex `agentRuns` summaries.
  - **Activation:** `/onboarding/waiting` subscribes to `agentRuns.getProjectOnboardingState` and auto-advances only after a real run exists.
  - **Run Destination:** `/onboarding/success` now uses real `projectId` and `runId`; the destination remains the temporary run placeholder until the trace viewer milestone.
  - **Scope Control:** Full trace viewer, runs list, costs, alerts, billing, replay, evals, and integrations remain deferred.
- **Milestone 2 Part 2 - Project Creation + API Key Backend:** Connected onboarding project creation to Convex and real one-time API key generation.
  - **Project Schema:** Projects now include `slug`, `clerkUserId`, optional `clerkOrgId`, timestamps, `planTier`, alert/default threshold fields, and API key metadata.
  - **Fix (Onboarding Error):** Resolved "Could not find public function for 'projects:createProject'" by successfully syncing schema and ensuring mutation exports.
  - **Identity Mapping:** Shifted to `identity.subject` (Clerk User ID) for `clerkUserId` storage in projects to match frontend expectations.
  - **Timestamps:** Standardized project timestamps (`createdAt`, `updatedAt`, `apiKeyCreatedAt`, `apiKeyLastUsedAt`) as numeric `Date.now()` values.
  - **Legacy Compatibility:** Relaxed `projects` and `agentRuns` schema fields to optional to accommodate existing local development data.
- **Required Secret:** Convex project creation requires `FIVETOONE_API_KEY_HASH_SECRET`.
- **Milestone 2 Part 1 - Onboarding UI Flow:** Started the onboarding UI-only pass without backend integration.
  - **Separate Shell:** `/onboarding/*` uses a standalone centered dark panel, not the dashboard shell, marketing navbar, or footer.
  - **Five Steps:** Project -> API key -> Install SDK -> Waiting -> First span success are implemented as route segments.
  - **Mock Key:** API key screen uses `5t1r_sk_live_mock_1234567890abcdef1234567890abcdef` and gates Continue on copying.
  - **No Fake Activation:** Waiting screen does not auto-advance from normal UI; success remains a separate route for the future real first-span activation.
  - **Backend Deferred:** Project creation, real key generation, ingestion, and first-span detection remain Part 2/Part 3 TODOs for this UI flow.
- **Dashboard Sidebar Simplification:** Removed the recently added hover-peek and adjustable-width behavior because it made the expand control harder to use.
  - **Steady Widths:** Sidebar is back to fixed workspace widths: 240px expanded and 64px collapsed.
  - **No Hover Peek:** Collapsed sidebar no longer expands on hover; the top icon is the deliberate expand control.
  - **No Resize Handle:** User drag-resizing was removed; `5to1r.sidebar.width` is no longer used by the shell.
  - **Preserved Behavior:** Top header collapse/expand icon remains, collapsed state still persists in `5to1r.sidebar.collapsed`, and clicking a collapsed nav icon still expands before navigation.
- **Dashboard Sidebar Workspace Assistance:** Refined the authenticated dashboard sidebar interaction model only.
  - **Top Collapse Control:** Collapse/expand now lives as a quiet 28px icon in the 60px sidebar header, aligned with the `5to1r` logo when expanded.
  - **Resizable Panel:** Permanent expanded sidebar width is user-resizable from 200px to 360px, with a 240px default and 64px collapsed width.
  - **Persistent State:** Sidebar collapsed state persists in `5to1r.sidebar.collapsed`; custom width persists in `5to1r.sidebar.width`; group state remains preserved.
  - **Hover Peek:** Collapsed sidebar hover temporarily reveals labels/project switcher without shifting main content; peeking is overlay-only and not persisted.
  - **Assisted Nav:** Clicking a nav icon while collapsed or peeking permanently expands the sidebar, preserves/restores the saved width, opens that item's group when needed, and lets navigation continue.
  - **Project Memory:** Mock project switcher stores the last selected project id in `5to1r.lastProjectId`.
- **Dashboard Shell Usability Pass:** Improved the authenticated dashboard entry point without building the full product surfaces.
  - **Collapsible Sidebar:** Sidebar now supports persisted expanded/collapsed widths (240px/64px), icon-only collapsed nav, and collapsed tooltips.
  - **Grouped Navigation:** Sidebar is organized into persisted OBSERVE, CONFIGURE, and RESOURCES groups while still hiding Replay, Evals, Integrations, Team, Memory, and Runtime.
  - **Project Selector:** Project switcher now exposes mock environment labels and routes selected mock projects to their dashboard route.
  - **Start State:** Replaced the thin empty dashboard placeholder with a start-here checklist, quickstart code panel, and sample trace entry points.
  - **Scope Control:** No trace viewer, runs list, cost dashboard, alerts logic, landing page, pricing, auth, CTA, or footer work was added in this pass.
- **Dashboard Milestone 2:** Started onboarding plus the minimum ingestion pipeline needed for first-span activation.
  - **Onboarding Flow:** Create project -> copy API key -> install SDK -> wait for first span -> success.
  - **Activation Event:** Onboarding auto-advances only when a real first span creates the first Convex agent run.
  - **API Key Security:** API keys use `5t1r_sk_live_` plus 32 hex chars, are shown once, and Convex stores only HMAC-SHA256 hash, prefix, last 4 chars, timestamps, and status.
  - **Ingestion Minimum:** `POST /api/ingest` validates Bearer keys and span payloads, emits the Inngest span event, writes spans to Tinybird, and upserts Convex `agentRuns` for live onboarding detection.
  - **Activation Query:** `agentRuns.getProjectOnboardingState` returns project key display data plus the first real run so the waiting screen can advance without simulation.
  - **Run Placeholder:** `/dashboard/[projectId]/runs/[runId]` exists only as a received-run placeholder until the trace viewer milestone.
- **Dashboard Shell Foundation:** Started the authenticated dashboard shell using `shadcn` `sidebar-03` as the structural base.
  - **Milestone:** Dashboard Milestone 1 started: authenticated shell and project selector only.
  - **Visual Direction:** Adapted the shell to the 5to1r dashboard language: dark-only, sharp monochrome surfaces, no radius, no shadows, and no blue UI accents.
  - **Navigation:** MVP sidebar includes only Overview, Runs, Costs, Alerts, Settings, and Docs.
  - **Scope Control:** Deferred dashboard pages are hidden from nav; unfinished Phase 2/Phase 3 surfaces such as Replay, Evals, Integrations, Team, Runtime, and Memory are not exposed.
- **Final landing page order:** Hero → Problem → DebugStream → FirstTrace → WhatYouGet → Use Cases → PricingTeaser → Final CTA → Footer
- **Pricing Teaser (`PricingTeaser`):** Restructured into a 3-column top row (Pro, Team, Enterprise) and a full-width bottom row (Free). Team plan updated to include 10 seats (extra seats paid).
- **"What You Get" (`WhatYouGet`):** Compact technical matrix showing the concrete outputs of a trace (Trace, Cost, Retries, Failure). Uses a scanning focus animation to guide attention.
- **"Workspace Terminal" (`DebugStream`):** High-velocity simulation of agent execution ends with a "Wasted Cost" indicator to create visceral pain. Untouchable emotional hook.
- **"SDK Quickstart" (`FirstTrace`):** Reframed as "Catch the next one." Provides immediate relief after the terminal shock by showing a code diff (+@trace_agent) and the resulting visibility of the "next run."
- **Typography Refined:** Installed `geist` package and integrated **Geist Pixel Square** for all branding and primary headers.
- **Clerk Keyless:** Configured Clerk to run in **Keyless mode**, removing local dependency on placeholder keys.
- **Monochrome Transition:** Removed all blue/indigo accents in favor of a strict black-and-white palette to emphasize technical precision.
- **Emil Kowalski Integration:** Adopted design engineering principles for UI polish, including scale-on-press, custom easing curves, and staggered entrances.
- **Clerk v7 (Core 3) Compatibility:** Migrated from deprecated `<SignedIn>`/`<SignedOut>` components to the unified `<Show>` component.
- **Build Configuration:** Excluded `scratch` directory from TypeScript compilation to prevent temporary scripts from blocking production builds.
- **Custom Auth Pages Integration:** Created a production-grade authentication experience using Clerk with strict 5to1r design language.
  - **Auth Shell:** Split-screen layout (45% terminal panel, 55% auth form) with a "Home" back-link and mobile-optimized branding.
  - **Terminal Panel:** A looping agent trace simulation (`run-agent`, `llm_call`, `tool_call`) that signals technical capability. Now features staggered line entry with subtle y-translation.
  - **Clerk Appearance:** Comprehensive `Theme` override in `src/components/auth/clerk-appearance.ts` to enforce 0px radius, monochrome primary buttons (White/Black), and Geist Mono typography for all sub-components (inputs, cards, social buttons).
    - **Auth Pages Styling Fix:** Updated `.cl-socialButtonsRoot` to use `grid-template-columns: repeat(2, 1fr)` instead of a hardcoded 3-column grid. This ensures that when exactly 2 providers (Google/GitHub) are active, they fill the space correctly without gaps. Applied to `CLERK_APPEARANCE`, `layout.tsx`, and `globals.css`.
- **Design Engineering Polish:** Integrated Emil Kowalski principles:


    - **Tactile Feedback:** Added `scale(0.98)` on `:active` for all buttons and interactive elements.
    - **Premium Entrances:** Implemented staggered `framer-motion` entrances for form containers and terminal visuals.
    - **Custom Easing:** Replaced default transitions with high-performance `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out).
    - **Refined Transitions:** Specified exact properties for transitions to avoid layout thrashing and improve perceived performance.
  - **Social Providers:** Built-in support for Google, GitHub, and Apple via Clerk components.
  - **Routing:** Configured `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and related variables in `.env.local` to support custom auth paths.
- **Landing Page Navigation Wiring:** Rewired all marketing CTAs to real application routes.
  - **Start/Free/Trace CTAs:** All route to `/sign-up`.
  - **Sign-in/Login CTAs:** All route to `/sign-in`.
  - **Paid Plans:** Pro/Team buttons route to `/sign-up` with `plan` query parameters.
  - **Demo Anchor:** Hero secondary CTA wired to `#workspace-terminal`.
  - **Placeholders:** Replaced all `#` and `SignUpButton` wrappers with Next.js `Link` components.
- **Marketing Navbar Integration:** Implemented a high-fidelity `DropdownNavigation` component for the landing page.
  - **Aesthetic:** Dark monochrome, 0px radius, Geist Mono for links.
  - **Menu Structure:** Includes product-specific sections (Platform, Signals, Agent Types, Start) with detailed descriptions and monochrome icons.
  - **Tech:** Uses `framer-motion` for subtle y-translation and opacity transitions on hover.
- **Final CTA Overhaul:** Replaced the generic marketing banner with a compact, developer-centric `FinalCTA` component.
  - **Headline:** "Run your first trace." (Geist Mono).
  - **Visual:** Compact terminal surface showing `pip install 5to1r` and `run-agent` with a `trace ready` confirmation.
  - **Purpose:** Transition from "learning" to "immediate action" after the pricing section.
- **Full Frontend Design Package:** Complete 40-section design spec written to `docs/design-spec/`. Covers design tokens, all 30+ pages, component system, copy, SEO, file structure, build prompts, and QA checklist. Key decisions: `#0A0A0A` bg, `#6366F1` accent, 0px radius, Geist Pixel for logo, tagline "Five signals. One truth.", free tier 50K spans/month.

## Active Priorities
- **Phase 2.0: Trace Viewer.**
- Build the hierarchical Gantt timeline for agent runs.
- Implement the telemetry sidebar for detailed span inspection.
- Ensure strict monochrome and 0px radius are maintained in the complex data visualization.
