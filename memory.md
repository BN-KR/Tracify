# Project Memory

## Overview
- Purpose: 5to1r — Agent Observability Platform (Full visibility into AI agent steps, decisions, cost, failures).
- Stack: Next.js 16 (App Router), Clerk (Auth/Orgs), Convex (App DB), Tinybird (Telemetry Storage), Inngest (Background Jobs).

## Architecture
- **Auth:** Clerk handles user and organization auth. Now uses **Keyless mode** for local development.
- **Application State:** Convex is the source of truth for app metadata (`projects`, `agentRuns`, `alerts`). It provides reactive UI updates.
- **Telemetry Data:** Tinybird is the high-volume time-series database for raw telemetry (`spans`).
- **Ingestion Pipeline:** SDK calls POST `/api/ingest` -> Inngest event -> validates, writes to Tinybird, upserts rollups to Convex, triggers alerts.
- **Typography:** Uses **Geist Pixel Square** for logos and H1 headers, Geist Mono for UI/Data, and Geist Sans for prose.
- **Aesthetics:** Strict "Developer-grade" look: **0px border radius**, monochrome palette (#000000 bg, #FFFFFF primary), and **Emil Kowalski** design engineering principles (tactile feedback, micro-animations, polish).

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

## Recent Important Changes
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
  - **Terminal Panel:** A looping agent trace simulation (`run-agent`, `llm_call`, `tool_call`) that signals technical capability.
  - **Clerk Appearance:** Comprehensive `Theme` override in `src/components/auth/clerk-appearance.ts` to enforce 0px radius, monochrome primary buttons (White/Black), and Geist Mono typography for all sub-components (inputs, cards, social buttons).
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
