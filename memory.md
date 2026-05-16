# Project Memory

## Overview
- Purpose: 5to1r — Agent Observability Platform (Full visibility into AI agent steps, decisions, cost, failures).
- Stack: Next.js 16 (App Router), Clerk (Auth/Orgs), Convex (App DB), Tinybird (Telemetry Storage), Inngest (Background Jobs).

## Architecture
- **Auth:** Clerk handles user and organization auth. Now uses **Keyless mode** for local development.
- **Application State:** Convex is the source of truth for app metadata (`projects`, `agentRuns`, `alerts`). It provides reactive UI updates.
- **Telemetry Data:** Tinybird is the high-volume time-series database for raw telemetry (`spans`).
- **Ingestion Pipeline:** SDK calls POST `/api/ingest` -> Inngest event -> validates, writes to Tinybird, upserts rollups to Convex, triggers alerts.
- **Typography:** Uses **Geist Pixel Square** for logos (regular weight, normal tracking) and H1 headers, Geist Mono for UI/Data, and Geist Sans for prose.
- **Aesthetics:** Strict "Developer-grade" look: **0px border radius**, monochrome palette (#000000 bg, #FFFFFF primary), and **Emil Kowalski** design engineering principles (tactile feedback, micro-animations, polish).
- **Branding:** Adopted a "skinnier" text-based logo aesthetic (text-lg, regular weight) across all surfaces (Navbar, Footer, Sidebar, Auth, Onboarding) for visual consistency.
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
