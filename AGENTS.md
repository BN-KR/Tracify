# tracify — Agent Observability Platform

<!-- BEGIN:nextjs-agent-rules -->
This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read `node_modules/next/dist/docs/` before writing any Next.js code.
<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->
This project uses Convex as its backend. **Always read `convex/_generated/ai/guidelines.md` first** before writing Convex code. The file contains rules that override what you may have learned about Convex from training data.
<!-- convex-ai-end -->

**Critical:** Read `memory.md` at session start. Update `memory.md`, `task.md`, `implementation_plan.md` after every major task.

## Commands
- `npm run dev` — Next.js dev server on :3000
- `npm run build` — Builds Next.js (Convex generated bindings are committed, not generated at build time)
- `npm run lint` — ESLint
- `npm run deploy:convex` — Deploy Convex to production
- `npm run smoke:beta` — Beta smoke tests (requires env vars for full coverage)
- `npx convex dev` — Run Convex dev backend (runs alongside `npm run dev`)
- `npx convex dev --once --typecheck disable` — Sync Convex once after schema/function changes
- `npx convex codegen` — Regenerate Convex type bindings after schema changes
- `npm run build` (in `packages/ts-sdk/`) — Build the TypeScript SDK

## Architecture
- **Path aliases:** `@/*` → `./src/*`, `convex/*` → `./convex/*`
- **Ingestion:** SDK → `POST /api/ingest` → Inngest → Tinybird (raw spans) + Convex (run summaries). Tinybird = time-series telemetry. Convex = app metadata (projects, agentRuns, alerts, comments). Redis = API cache between Tinybird and dashboard.
- **Auth:** Clerk Keyless mode for local dev. Convex authenticates via Clerk JWT template named `convex` with `aud: "convex"`. Clerk v7 uses `<Show>`, not deprecated `<SignedIn>`/`<SignedOut>`.
- **API keys:** HMAC-SHA256 with `TRACIFY_API_KEY_HASH_SECRET`. Prefix: `tracify_sk_live_` (legacy `5t1r_sk_live_` accepted). Plaintext never stored server-side — shown once during onboarding.

## Conventions
- **Design:** Monochrome (#000000 bg, #FFFFFF text), 0px border-radius. Geist Pixel Square for logos/H1s, Geist Mono for UI/data, Geist Sans for prose. Tailwind v4 + shadcn/ui (`base-nova`). No blue accents.
- **Dashboard localStorage keys:** `5to1r.sidebar.collapsed`, `5to1r.lastProjectId`, `5to1r:dashboard-sidebar-groups`, `5to1r.onboarding.*`
- **`legacy-peer-deps=true`** in `.npmrc`. Use `npx.cmd` on Windows for shadcn additions.
- **React:** Server Components by default, Client Components at leaf nodes.

## Existing Pages
### Marketing (public)
`/` — Landing (Hero → Problem → DebugStream → FirstTrace → WhatYouGet → UseCases → PricingTeaser → FinalCTA)
`/pricing` — Free/Pro/Team/Enterprise
`/product/[feature]` — Static feature pages (trace-viewer, cost-dashboard, tool-calls, llm-calls, failures — all placeholder)
`/use-cases/[slug]` — Use case pages (research, support, automation, tool-calling)
`/blog`, `/blog/[slug]`, `/blog/rss.xml` — Sanity CMS blog
`/changelog` — Product updates
`/docs`, `/docs/[...slug]` — Documentation (rendered from markdown)
`/privacy`, `/terms` — Legal

### Authenticated (dashboard)
`/dashboard` — Project selector / start state
`/dashboard/[projectId]` — Overview with charts
`/dashboard/[projectId]/runs` — Paginated runs table
`/dashboard/[projectId]/runs/[runId]` — Trace viewer
`/dashboard/[projectId]/costs` — Cost analysis with savings chart
`/dashboard/[projectId]/billing` — Usage + plan tier
`/dashboard/[projectId]/api-keys` — API key management
`/dashboard/[projectId]/alerts` — Redirects to overview
`/dashboard/[projectId]/manage` — Project management + stats
`/dashboard/[projectId]/settings` — Project settings + members
`/dashboard/[projectId]/reports` — Print-friendly project report
`/dashboard/[projectId]/docs` — In-app docs viewer
`/dashboard/[projectId]/quickstart` — Quickstart guide

### Auth / Onboarding
`/sign-in`, `/sign-up` — Clerk auth pages
`/onboarding`, `/onboarding/project`, `/onboarding/api-key`, `/onboarding/install`, `/onboarding/waiting`, `/onboarding/success`

## Useful Pages This Project is Missing
- **`/integrations`** — Document existing integrations (Slack, Tinybird, Redis, Convex) and planned ones (Email, PagerDuty, Discord). The product has a real Slack integration but no discoverable listing page.
- **`/contact` or `/sales`** — Enterprise plan exists (Pricing page shows "Contact us") but there is no contact form, email, or calendly link. Essential for converting Enterprise inquiries.
- **`/security`** — SaaS platform with enterprise plans needs a security page covering data handling, encryption, SOC2 roadmap (mentioned in honest disclaimer), retention, and compliance posture.
- **`/status`** — An observability product should eat its own dog food with a public status page for API/ingest uptime.

## Gotchas
- **Next.js 16 breaking changes.** Read `node_modules/next/dist/docs/` before writing Next.js code.
- **Convex `_generated/` bindings are committed to git.** Run `npx convex codegen` after schema changes.
- **No test framework** configured. `npm run smoke:beta` is the only verification script.
- **Convex + Clerk auth mismatch** is the most common production issue. See `docs/troubleshooting-convex-clerk-auth.md`.
- **`scripts/`** and **`scratch/`** excluded from TypeScript compilation.
- **`convex/auth.config.ts`** must point to the correct Clerk issuer per environment.
- **Turbopack may OOM** on Windows during `npm run build` (Rust panic in `globals.css`). This is a system memory issue, not a code problem — use `npm run dev` to verify compilation.
- **Marketing product feature pages** (`/product/[feature]`) are placeholders — they show "under construction" copy. Don't expect real content there.
- **SDKs** (`packages/ts-sdk/`, `packages/python-sdk/`) are built but not yet published to npm/PyPI.
