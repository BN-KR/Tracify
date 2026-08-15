# Project Memory

## 2026-08-15 Content critique fixes
- The strongest reviewed public surfaces were `/product/trace-viewer` and `/security`: concrete, well-structured, and restrained. Use them as the copy bar when refining homepage and campaign sections.
- The published TypeScript SDK package is `5to1r` (not `tracify` or `@tracify/sdk`); its public client export is `TracifyClient`, with `traceAgent` for wrapping async functions. Keep all public install/import examples identical and verify with a repo-wide search.
- Public docs examples that embed escaped `\\n` sequences can render literal escape characters. Prefer real multiline template literals or normalize at the shared code-block boundary.
- Never link resource cards to invented articles or generic `/blog` when a specific promise is made; use a real published slug or remove the promise.
- Completed the critique pass: public SDK examples now use `5to1r` consistently; docs landing and Markdoc chapters use real multiline code; the homepage resource desk uses real guide language and a real published article where available; the trace-clinic destination states the promised 30-minute deliverable; support signal cards contain body copy.
- The review’s blog-date observation is retained as editorial follow-up, not a correctness bug. The honest `/status` page likewise remains intentional until real uptime monitoring is provisioned.

## 2026-08-13 Vercel preview deployment recovery
- The `codex/llms-seo` previews failed after compilation and TypeScript because Vercel Preview lacked `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL`; Better Auth failed during page-data collection for `/api/evaluation/run`.
- Added both public endpoints to Vercel Preview using the isolated `diligent-dragon-604` development Convex deployment, avoiding production data access from branch previews.
- Redeployed commit `45780f6` as deployment `dpl_F8Uk4ryBBfiDiJXvpc3CHe7PmcfS`; it completed the Next.js build and reached `READY` at the branch alias.
- Updated `docs/vercel-staging.md` to name the current `tracify` Vercel project and require both Convex public endpoints for Preview.

## 2026-08-13 Product page depth and SEO hardening
- Replaced the shared thin product-page template with nine substantial, source-backed pages for Trace Viewer, Cost Dashboard, Tool Calls, LLM Calls, Failure Analysis, Project Reports, Runtime Control, Evaluation Engine, and the AI Engineering Lifecycle.
- Each route now has a feature-specific working-surface visual: trace waterfall, cost ledger, tool payload, model-call accounting, failure stack, report sheet, policy controls, evaluation matrix, or lifecycle rail. The pages share the Future 19 palette and typography but vary hero alignment, section ordering, workflow geometry, and content.
- The landing page was not changed.
- Sitemap entries no longer claim that unchanged static pages were modified at every build; the blog index uses the newest published post date and other static routes omit unknown modification dates.
- Blog JSON-LD now includes canonical page identity, publisher data, absolute images, and breadcrumbs. Product pages include BreadcrumbList JSON-LD.
- All nine product routes rendered at desktop and 375px with no horizontal overflow. Browser structure, canonical/JSON-LD output, and console output were checked; a list-key warning found during QA was fixed.
- Verification passed: focused ESLint, 15 content tests, diff hygiene, and the Next.js production build with 80 generated pages.

## 2026-08-13 llms.txt and SEO audit
- Added `public/llms.txt` as a concise, curated entry point for agents, using canonical public Tracify URLs and explicit availability caveats.
- Added a regression contract to keep the file canonical, deduplicated, concise, and connected to core public resources; it runs with `npm run test:content`.
- Future agents must update the file when core public documentation or product routes change and must not list drafts, authenticated routes, secrets, or speculative capabilities.
- `llms.txt` is maintained for agent discovery only. Google states that it neither helps nor harms Google Search visibility; canonical crawlable pages, useful original content, page experience, sitemap coverage, and valid structured data remain the SEO priorities.

## 2026-08-13 Tracify content-authoring skill
- Added the project-local `writing-tracify-content` skill for drafting, editing, reviewing, storing, and publishing Tracify blogs and documentation.
- The skill distinguishes live storage surfaces: public blogs in `content/blog/*.mdoc`, blog media in `public/media`, internal engineering Markdown in `docs/`, public `/docs` content in its current TypeScript registry, and dashboard reference content in `docs-viewer.tsx`.
- Added an evidence-led writing quality bar, explicit draft/privacy and no-fabrication rules, a complete Markdoc blog example, and an internal-document example.
- Registered the skill as required in `AGENTS.md`. Skill validation passes, the skill body is 405 words, its template parses through the real Markdoc repository, remains a draft, and contains no placeholders.

## 2026-08-13 Payload replaced with Markdoc
- Replaced the Payload-backed blog and CMS with repository-authored Markdoc. The App Router blog index, post pages, metadata, JSON-LD, category filtering, related posts, RSS feed, and sitemap now read `.mdoc` files through a validated server-side content repository.
- Exported all 10 existing Payload articles (roughly 5,000 words each) and their metadata into `content/blog`; all remain drafts because their Payload `_status` was `draft`. Existing image originals and generated card/hero/OG variants remain under `public/media`.
- Removed the Payload route group, `/cms` and `/cms-api`, Payload config/collections/generated types/migrations, dashboard Content link, Next wrapper, TypeScript alias, seven Payload dependencies, and Payload npm scripts. Added Markdoc/YAML dependencies, author documentation, a legacy SQLite-to-Markdoc importer, and focused content tests.
- Verification: 7 content/conversion tests pass, focused ESLint passes, standalone TypeScript passes, diff hygiene passes, and the Next.js production build passes with 69 generated pages. Production runtime checks return 200 for `/blog`, `/blog/rss.xml`, and `/sitemap.xml`, and 404 for `/cms`, `/cms-api/posts`, draft slugs, and unknown blog slugs.
- Full repository ESLint remains blocked by 19 pre-existing errors in unrelated orchestration, marketing, hook, and UI files; none are in the Markdoc migration scope.

## 2026-08-13 Payload-to-Markdoc migration assessment
- Payload currently powers only the public blog/CMS surface, but that surface includes four collections, draft/version and scheduled publishing workflows, media uploads with generated sizes, categories, related posts, SEO metadata, RSS/sitemap queries, and the protected `/cms` editor.
- A Git-authored Markdoc replacement is estimated at 2-4 focused engineering days for application integration and verification, plus roughly 10-30 minutes per ordinary post for content/media conversion and QA.
- Markdoc is a parser/rendering system rather than a browser CMS. Preserving visual editing, roles, drafts, scheduled publishing, and media management requires retaining Payload or adding another editorial layer; a comparable replacement is likely 1-3 weeks.
- The supplied `@markdoc/next.js` example targets the Pages Router. Tracify uses Next.js 16 App Router, so the safer design is explicit server-side `@markdoc/markdoc` parsing within the existing `/blog/[slug]` route rather than adopting the example verbatim.
## 2026-08-13 Payload CMS dashboard access
- Corrected the private-content bootstrap allowlist to the live owner account, `kristofferbon@gmail.com` (the previous address incorrectly included a period).
- Dashboard Content visibility now comes from the same server-side access decision as `/cms`, preventing a client-session mismatch and supporting the existing user, email, and organization access configuration for the whole team.
- Focused ESLint, TypeScript, and diff-hygiene checks pass. Production deployment `dpl_BZ6kJ19vD83ENr6KEQb6rGUDNJdj` is Ready; the live dashboard shows Content and `/cms` now reaches Payload's login screen rather than the previous Next.js 404.

## 2026-08-13 Admin hub
- Consolidated the dashboard's separate Content and Admin Library links into one protected **Admin** entry.
- `/admin` offers authorized users two clear choices: **Admin Library** and **Payload CMS**.
- The hub retains the shared `requireLibraryAccess` policy; the individual destinations remain separately protected.
- Focused ESLint, TypeScript, the Admin-hub route contract check, and diff hygiene pass. Production deployment `dpl_CnFUPs1Jy5vz4u9LN4cwYNPLyurr` is Ready; live verification confirms the sidebar, hub, library, and CMS destinations.

## 2026-08-12 Dashboard onboarding escape and launch plan
- Leaving onboarding now records a durable local dismissal, so the optional setup entry point no longer reappears during ordinary dashboard navigation.
- The empty overview's activation list is now called **Launch plan** and routes to in-dashboard quickstart resources rather than sending an existing project back into onboarding.
- The populated overview now includes a live Launch plan checklist for traces, costs, evaluations, and alert coverage.
- Focused dashboard/onboarding ESLint passed. Full TypeScript verification is currently blocked by pre-existing malformed `.next/dev/types` generated files from another local dev process; no generated files were altered.

## 2026-08-12 Direct Pricing Checkout
- Paid plan CTAs on the homepage and `/pricing` now preserve plan and billing interval and route through `/pricing/checkout`.
- Authentication preserves the checkout destination for email and social sign-in/sign-up.
- Existing customers select a project before hosted Stripe Checkout; new customers can create their first project directly on the checkout page and proceed immediately to payment without completing onboarding.
- Pricing is directly accessible in desktop and mobile navigation. Focused ESLint and diff hygiene pass.

## 2026-08-12 Sitewide Link Audit
- Audited static and generated internal navigation links against the Next.js route manifest, including public marketing/docs/product/use-case/pricing flows and dashboard path templates.
- Fixed stale `/docs/quickstart` links in the docs index, public footers, and exploration navigation by routing them to the existing TypeScript SDK quickstart at `/docs/typescript`.
- Fixed a stale `/docs/api-reference` footer destination to `/docs/api` and changed dashboard documentation navigation from the unavailable `https://docs.tracify.tech` host to the first-party `/docs` route.
- Focused ESLint and `git diff --check` pass. Final production build rerun is pending because another active Next.js process owns `.next/lock`.

## 2026-08-11 Future 19 Public-Site Migration
- Migrated every previously dark/legacy public route family into the Future 19 paper, rule, pixel-type, black-panel, and acid-yellow signal language.
- Added reusable public-page primitives for mastheads, ruled bands, actions, indexes, and article typography.
- Gave each surface a distinct composition: blog signal-board bento, pricing ledger, docs field manual, product capability instrument, use-case failure anatomy, demo lab, integration directory, release tape, roadmap register, status ledger, contact router, trust matrix, and legal records.
- Preserved existing route data and interactions, including Sanity blog content, documentation code examples, pricing billing toggle, demo tabs, integration logos, and dynamic product/use-case metadata.
- Browser QA covered 11 representative public routes at desktop and 375px; all rendered without server errors or horizontal overflow after fixing the integrations mobile shell.
- Verification: focused ESLint, TypeScript, diff check, and full Next.js production build pass; 69 static pages generated.

## 2026-08-11 Sitewide SEO
- Canonical host standardized to `https://www.tracify.tech` in the root metadata base, sitemap, robots host/sitemap declaration, JSON-LD, RSS feed, alert links, and Tracify-owned Sanity blog canonicals.
- Added `robots.ts` to allow public content while blocking dashboard, admin, auth, onboarding, API, library, and preview paths from crawling; it advertises the canonical sitemap.
- Improved root metadata with a title template, search-focused descriptions/keywords, Open Graph/Twitter defaults, and Organization plus SoftwareApplication JSON-LD.
- Added canonical/page metadata across primary public pages and dynamic docs, product, and use-case pages; documentation now supplies static params for its known public routes.
- Expanded the sitemap to include public docs, product features, use cases, changelog, and demo pages while preserving CMS blog URLs.
- Verification: production build passed and generated 75 routes, including `/robots.txt` and `/sitemap.xml`. Focused lint only reports nine pre-existing quote-escaping violations in privacy, security, and terms content; none are from the SEO changes.

## 2026-08-10 Development Password Reset Enabled
- Synced the current Better Auth configuration to the Convex development deployment after localhost reported that password reset was disabled.
- Confirmed the development Convex auth endpoint now accepts `request-password-reset` and returns the enumeration-safe success response for a non-existent test address.
- The implementation keeps one-hour single-use tokens and revokes existing sessions after a successful password reset.

## 2026-08-10 Simplified Auth Layout
- Removed the shared auth-page editorial intro panel, including the Future 19/Auth System label, secure-connection badge, large mode headline, explanatory paragraph, and three benefit cells.
- Every auth route now opens directly on its centered form/status card beneath the standardized Tracify header.
- Verification: TypeScript, focused ESLint, diff check, and browser inspection pass with no horizontal overflow.

## 2026-08-10 Standardized Tracify Wordmark
- Added a canonical `BrandLogo` component matching the production Future 19 navbar wordmark: Geist Pixel Square, tight tracking, and the skewed translucent acid-yellow marker.
- Replaced one-off logo markup in the marketing navbar/footer, auth shell, both dashboard sidebars, and onboarding shell/router.
- Preserved plain-text product mentions and oversized editorial footer treatments because they are content/artwork rather than navigation wordmarks.
- Verification: TypeScript, focused ESLint, diff check, and local browser inspection pass; the auth logo renders at the navbar's 24px metrics with no horizontal overflow.

## 2026-08-10 GitHub OAuth Enabled
- Added the supplied GitHub OAuth App client ID and secret to both Convex development and production environments without committing them to the repository.
- Redeployed the production Convex Better Auth server; the existing conditional `github` social provider is now active alongside Google.
- GitHub OAuth App callback must remain `https://www.tracify.tech/api/auth/callback/github` because the canonical Better Auth `SITE_URL` is `https://www.tracify.tech`.

## 2026-08-10 Better Auth Social Credentials
- Existing Google OAuth credentials were found in `.env.prod` and synchronized without exposing their values to both Convex development (`diligent-dragon-604`) and production (`focused-otter-289`), where Better Auth executes.
- The Better Auth server and Future 19 auth UI already support conditional Google and GitHub providers.
- No reusable `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET` exists in the local environment; Clerk-managed social credentials cannot be extracted, so a GitHub OAuth App still needs to be created and its credentials added to Convex.
- Google Cloud must allow `https://www.tracify.tech/api/auth/callback/google` (and localhost for local testing) as an authorized redirect URI.

## 2026-08-10 Better Auth Sentinel
- Added Better Auth Infrastructure `sentinel()` to the Convex-hosted auth server and `sentinelClient()` with automatic proof-of-work challenge handling to the React auth client.
- Configured the project-specific identify endpoint in production Convex and Vercel (`BETTER_AUTH_IDENTIFY_URL` plus the browser-exposed `NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL`).
- Deployed Convex and Vercel production; deployment `dpl_5Yg6Arq6SMSBnUw3ALpnLt6fhAMz` reached Ready and both `www.tracify.tech` and `tracifytech.vercel.app` point to the new build.
- Sentinel uses its default security policy initially so events can be observed before adding stricter block/challenge thresholds.

## 2026-08-10 Stable Staging Alias
- Assigned `https://tracifytech.vercel.app` to the current Ready production deployment so the previously empty Vercel domain now serves Tracify.
- Added the stable staging hostname to Better Auth `trustedOrigins` and redeployed Convex production; authentication requests originating from that alias are now accepted.
- Verification: TypeScript, focused auth ESLint, Vercel alias assignment, and Convex production deployment pass.

## 2026-08-10 Better Auth Production Connection
- Replaced the production Convex `BETTER_AUTH_API_KEY` with the newly issued dashboard key and deployed the current Convex backend, including the `@better-auth/infra` `dash()` plugin and `/api/auth/dash/validate` ownership endpoint.
- Deployed the current application directly to Vercel production. Deployment `dpl_6ubgahD4kp66Ah6BDkVCSdBo4r3Y` reached Ready and `https://www.tracify.tech` resolves to it.
- The Convex deployment also applied all pending schema/index changes present in the worktree, including replacing `agentRuns.by_projectId_startedAt` and adding the evaluation/session indexes reported by Convex.

## 2026-08-10 Future 19 Auth Experience
- Rebuilt every Better Auth-facing page in the homepage's Future 19 visual system: cream field, black rules, acid-yellow interaction states, pixel headlines, mono labels, hard shadows, and zero-radius controls.
- Sign-in and sign-up now support both GitHub and Google OAuth plus email/password, safe absolute callback URLs, redirect preservation, password visibility, and accessible error states.
- Added `/forgot-password`, `/reset-password`, and `/auth/error`; password reset emails use Better Auth Infrastructure, expire after one hour, and revoke other sessions when completed.
- Reworked `/accept-invitation` into the same auth shell and suppressed the global marketing navbar/footer across all auth routes.
- GitHub OAuth is conditionally enabled by `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the Convex deployment environment.
- Verification: TypeScript, focused ESLint, diff check, and responsive in-app browser QA pass with no horizontal overflow and 48px auth controls.

## 2026-08-10 Better Auth Migration
- Replaced Clerk runtime dependencies, providers, middleware, auth screens, server checks, dashboard account controls, organization switching, member invitations, and Convex JWT configuration with Better Auth.
- Better Auth runs inside the Convex-maintained `@convex-dev/better-auth` component; auth data remains in Convex and the Next.js `/api/auth/[...all]` route proxies to the Convex HTTP deployment.
- Enabled email/password, optional Google OAuth, organizations, encrypted OAuth tokens, persistent rate limiting, explicit trusted origins, and organization role claims in Convex JWTs.
- Added Better Auth Infrastructure `dash()` and configured its API key on development and production Convex deployments. Production `SITE_URL` is `https://www.tracify.tech`; the bare domain redirects with 308 and must not be entered in the Better Auth dashboard.
- Installed the six official Better Auth agent skills under `.agents/skills`.
- Development Convex functions are synced. Production deployment is intentionally pending because the worktree contains extensive unrelated changes.
- Verification: `npx.cmd tsc --noEmit`, focused ESLint (generated-file warnings only), Better Auth session endpoint (200), Infra validation endpoint (401 without dashboard JWT, proving it is mounted), and `npm run build` all pass.

## 2026-08-07 Homepage Lifecycle Rail
- Added a linked Detect → Inspect → Evaluate → Promote → Monitor rail beneath the interactive marketing showcase.
- The rail uses numbered editorial steps, quiet dividers, and direct links to trace, evaluation, lifecycle, and failure product surfaces.
- Added varied public compositions: Linear-style workflow canvas, centered connection statement, integration matrix, Better Auth-style README quickstart, and Langfuse-style FAQ block.
- Public product feature pages now include evidence panels, capability signals, and clear next-step CTAs.
- Verification: focused ESLint, standalone TypeScript, `git diff --check`, and production build pass.

## 2026-08-07 Command-Center Landing Page
- The homepage now leads with a realistic production incident rather than a generic trace: a selectable timeout/retry trace, root-cause inspector, recommended fix, and direct signup/demo path.
- The page tells one consistent Detect → Inspect → Diagnose → Evaluate → Ship narrative, with incident-linked Trace, Cost, Evaluation, Prompts, and Alerts panels plus SDK/OTLP activation code and copy feedback.
- Marketing metadata now positions Tracify around agent-failure diagnosis and `/opengraph-image` produces a bespoke social command-center card.
- Legacy `5to1r` install strings in the final CTA now use `tracify`; the footer status label links to `/status`.
- Verification: `npx.cmd tsc --noEmit`, focused marketing ESLint, `git diff --check`, and a full `npm run build` pass. Next generates 58 routes, including the Open Graph image route.

## 2026-08-07 Dashboard Saved Runs Views
- Runs now supports named, project-scoped saved views for status, search, model, session, environment, release, cost/span thresholds, sort, and page size.
- Restore updates the visible controls and URL query state; saved views are stored locally, capped at 12, and can be deleted individually.
- Runs rows now expose a keyboard-operable focus target with Arrow Up/Down, Home/End navigation, and Enter to open the trace.
- Runs now supports server-backed time filtering for the last 24 hours, 7, 30, or 90 days; the selected window is URL-addressable and included in saved views.
- Dashboard routes now have a shared loading skeleton and recoverable error boundary, so slow or failed authenticated navigation remains actionable.
- Command menu now turns a typed identifier into direct `Inspect run` and `Open session` destinations under the active project.
- Missing dashboard routes now render an intentional not-found state with a return-to-projects action.
- Alert muting now requires explicit confirmation and explains the available reopen path.
- Overview now surfaces failure rate and p95 latency from the recent run sample, with honest sample/no-data labeling and filtered Runs links.
- With the dev server running, `npm run smoke:beta` passes all 5 available checks and skips only the 2 checks requiring `FIVETOONE_SMOKE_API_KEY`/project credentials.
- Final production build passes after the dashboard/API changes, generating 58 routes. Browser-based visual QA could not complete because local dashboard navigation timed out before a reliable authenticated render.
- A fresh browser tab successfully inspected the public trace-first entry page; the dashboard route redirects to `/sign-in?redirect_url=...` as expected, preventing authenticated dashboard screenshots in the current session.
- Trace payload copy actions now handle clipboard failures, announce success/failure to assistive technology, and expose explicit accessible names/focus rings.
- Trace Viewer selection now persists as `?span=<spanId>`, restoring the selected evidence panel after refresh and making shared debugging links more precise.
- Alerts now have an explicit optional `state` (`active`, `resolved`, `muted`); legacy records render as active, while authorized users can transition states from the alert center.
- Global CSS now honors `prefers-reduced-motion` by collapsing animation/transition durations and disabling smooth scrolling.
- Trace Search now has actionable first-use/no-result states and an inline retryable analytics-unavailable error instead of a bare placeholder.
- Extended verification now passes: platform lint, TypeScript, and a 600-second-window production build completed successfully; Next generated all 57 routes.
- Dashboard-wide ESLint now passes with zero errors or warnings across `src/components/dashboard` and `src/app/dashboard`.
- Verification: `npx.cmd eslint src/components/dashboard/runs-table.tsx`, `npx.cmd tsc --noEmit`, and `git diff --check` pass.

## 2026-08-07 Marketing Visual Redesign
- Public homepage redesigned toward a Better Auth × Langfuse visual language: editorial grid, restrained monochrome surfaces, numbered sections, trace-first hero, integrations strip, README quickstart, and product-led CTA.
- Existing Tracify fonts and zero-radius black/white system were retained.
- Dashboard, auth, onboarding, backend, and existing marketing routes were left unchanged.
- `npx.cmd tsc --noEmit`, homepage ESLint, and `npm run lint:platform` pass. The production build now completes successfully across 57 routes.
- Follow-up viewport pass tightened the hero to `100svh` minus the fixed nav, reduced the headline/trace footprint, and kept primary CTAs visible above the fold.
- The hero trace preview is now interactive: visitors can select individual spans, inspect latency/cost context, and toggle live/inspection mode.
- Rebuilt the homepage again from the pure-black interactive brief: added workflow map, failure-to-fix comparison, tabbed product showcase for Trace/Cost/Evaluation/Prompts/Alerts, runtime-aware README lab, ecosystem rail, guide-line backgrounds, and pure-black panels.
- Verification: homepage ESLint, TypeScript, diff check, and full Next production build pass across 57 routes.

## 2026-08-05 Platform Continuation
- Official Langfuse review highlighted score analytics and model comparison as remaining product gaps; Tracify now has both in the evaluation and playground surfaces.
- Evaluation sub-routes previously rendered a generic “ready to be expanded” panel. They now expose dataset, run, monitor, and settings workflows backed by Convex state.
- `npm run build` and `npx tsc --noEmit` pass after the changes. `npm run lint:platform` passes cleanly. The unauthenticated smoke script can lose its external local server mid-run; this is not an application build failure.
- Annotation review now has Convex-backed reviewer records, self-claim/submission controls, and queue-level agreement visibility; production build remains green.
- Prompt deployment now has a real runtime contract at `/api/prompts/:name?environment=production`; it resolves only explicitly labeled versions using the project API key and is documented under `/docs/prompts`.
- Both SDKs expose prompt resolution helpers (`getPrompt` and `get_prompt`) and show how to attach the returned version id to a traced generation.
- Datasets now support backward-compatible `project` or `restricted` access, with owner-only access changes and experiment visibility checks.
- Experiment summaries now calculate score deltas against the prior run and the UI labels improvements versus regressions.
- API-key score ingestion now honors and validates the SDK-provided data type instead of coercing every custom score to text.
- Prompt SDK helpers now cache resolved deployments for 60 seconds by default and serve stale/fallback prompts when the resolver is unavailable.
- The platform smoke script now probes `/api/evaluation/run`; the full Next production build completed successfully across 56 routes on this pass.
- Root scripts now expose `test:sdk:ts` and `test:sdk:python`; both SDK suites pass after adding Python test-path configuration.
- Public pricing pages now accurately describe the shipped AI engineering workflows instead of calling them roadmap items.
- Platform smoke now checks `GET /api/otel`; its API-key prefix matches the Convex project key generator (`tracify_sk_live_`).
- `projects.markApiKeyUsed` now verifies the supplied API-key hash, project ID, and active status before patching usage metadata.
- Datasets are now directly reachable at `/dashboard/[projectId]/datasets` and use the live Evaluation Engine dataset workflow rather than being hidden under Evaluation.
- Trace viewer now exposes a copyable deep link for sharing findings; the action remains within the existing project authorization boundary.
- Dashboard Resources now links directly to `/integrations`, making framework/provider setup discoverable from an authenticated project workspace.
- `npm run lint:platform` passes. Full `npm run lint` remains noisy because of pre-existing blog/marketing `any` and hook-rule violations outside the platform scope.
- Production prompt labels are now backend-gated; direct prompt editing cannot bypass the evaluation suite promotion mutation.
- Integrations docs now include a Python OTLP exporter example for OpenAI/LangChain/LlamaIndex and the attributes needed for sessions and releases.
- The focused platform lint command now includes the newest routes/components rather than only the original workflow files; it passes alongside `tsc --noEmit`.
- `/demo` now has a working promotion interaction instead of a dead button, completing the visible Trace → Experiment → Deploy story.
- Live `npm run smoke:platform` now passes all public, protected, OTLP, prompt, evaluation, experiment, and dataset route checks; invalid offline evaluation IDs return 404 instead of 500.
- Final production build completed successfully across 56 routes after the demo, navigation, deployment-safety, and evaluation API fixes.
- Platform smoke now verifies both `GET /api/otel` health and rejection of unauthenticated OTLP ingestion.
- Platform smoke also rejects unauthenticated native ingestion, covering the primary SDK/API path.
- The lifecycle is now documented explicitly at `/docs/lifecycle` and `/product/lifecycle`, not only implied by the interactive demo.
- The demo now has an explicit Datasets surface alongside Prompts, Evaluation, and Experiments, completing its seeded lifecycle coverage.

## Overview
- Last Synced: 2026-06-16T12:00:00Z
- Purpose: tracify — Agent Observability Platform (Full visibility into AI agent steps, decisions, cost, failures).
- Stack: Next.js 16 (App Router), Clerk (Auth/Orgs), Convex (App DB), Tinybird (Telemetry Storage), Redis (API cache), Inngest (Background Jobs).

## Architecture
- **Auth:** Clerk handles user and organization auth. Now uses **Keyless mode** for local development.
- **Application State:** Convex is the source of truth for app metadata (`projects`, `agentRuns`, `alerts`). It provides reactive UI updates.
- **Telemetry Data:** Tinybird is the high-volume time-series database for raw telemetry (`spans`).
- **Ingestion Pipeline:** SDK calls POST `/api/ingest` -> Inngest event -> validates, writes to Tinybird, upserts rollups to Convex, triggers alerts.
- **Typography:** Uses **Geist Pixel Square** for logos (regular weight, normal tracking) and H1 headers, Geist Mono for UI/Data, and Geist Sans for prose.
- **Aesthetics:** Strict "Developer-grade" look: **0px border radius**, monochrome palette (#000000 bg, #FFFFFF primary), and **Emil Kowalski** design engineering principles (tactile feedback, micro-animations, polish).
- **Branding:** Site UI rebranded to **tracify** (lowercase logo with Geist Pixel Square, same monochrome styling). SDK packages already use `tracify`; internal storage keys and Inngest event IDs retain legacy `5to1r` prefixes for compatibility.
- **Navigation:** Integrated a custom monochromatic `DropdownMenu` for both Project Switching and Account management in the topbar.
- **Legal:** Dedicated `/privacy` and `/terms` pages with a minimalist, linked **Footer** component.
- **Auth:** Google OAuth credentials configured in `.env.prod`, `.env.local`, and Vercel production variables.

- **Evaluation Engine (2026-08-06):** Added versioned evaluator/suite/job/result/monitor/feedback schema and authenticated Convex mutations in `convex/evaluationEngine.ts`. The dashboard now has a unified Evaluation Engine workspace with overview, evaluator, dataset, run, monitor, review, and settings routes. Trace Viewer shows linked quality scores/results/feedback. Online evaluation now runs through a secret-protected Convex HTTP action invoked from Inngest, with deterministic rules, LLM judges, built-in groundedness/toxicity/PII/jailbreak/prompt-injection/policy templates, idempotent results, automatic failed-trace review queueing, and monitor alert creation. Offline jobs run through `/api/evaluation/run`. Reviewer assignment supports round-robin/least-loaded rotation and agreement metrics. TypeScript/Python SDKs expose feedback and score helpers. Public marketing and quickstart/SDK docs expose the workflow. Live online/API-key feedback requires the same `EVALUATION_INTERNAL_SECRET` in Next and Convex environments.


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
- **Site Rebrand to Tracify (2026-06-14):**
  - **UI:** Marketing, auth, onboarding, dashboard, legal pages, and Slack alert copy now show **tracify** branding with unchanged monochrome styling (Geist Pixel Square logo, 0px radius, black/white palette).
  - **Env copy:** Onboarding and quickstart surfaces now show `TRACIFY_API_KEY` instead of `FIVETOONE_API_KEY`.
  - **Links:** Public docs/social/email links use **tracify.tech** domains.
  - **Unchanged:** localStorage keys, Inngest app/event IDs, and backend env var fallbacks kept for compatibility.

- **Tracify SDK Package Rename (2026-06-14):**
  - **Public Packages:** Python distribution and TypeScript npm package metadata now use `tracify`.
  - **Install Copy:** Marketing CTA, dashboard docs, SDK READMEs, quickstart docs, design specs, and project-manager summary now show `pip install tracify` and `npm install tracify`.
  - **Imports:** Added Python `tracify` import package that re-exports the existing SDK, and added TypeScript `TracifyClient` export while preserving legacy `fivetoone` / `FiveToOneClient` compatibility.
  - **Environment:** SDKs now prefer `TRACIFY_API_KEY` and `TRACIFY_CURRENT_RUN_ID`, with fallbacks for existing `FIVETOONE_*` variables.
  - **Verification:** `npm run build` passes for the TypeScript SDK and full Next app. Python import smoke test passes using the repo virtualenv with local `PYTHONPATH`.

- **Marketing Repositioning, Pricing, and Beta Smoke Script (2026-05-21):**
  - **Positioning:** Landing hero copy now centers the broader niche: agent observability for production AI workflows, with concrete language around what the agent did, why it failed, cost, and what to fix next.
  - **Audience:** Use-case section now explicitly covers developers, AI startups, AI agencies, internal teams, and operators before agent-type examples.
  - **Honest Pricing:** Added `/pricing` and rewrote the landing pricing teaser around Free/Pro/Team/Enterprise beta states without claiming replay, evals, email alerts, self-hosting, PDF export, or runtime controls as currently working.
  - **Navigation:** Marketing navigation no longer advertises Run Replay as a product surface; it points to reports instead.
  - **Smoke Tests:** Added `npm run smoke:beta` using `scripts/beta-smoke.mjs` for missing API key, invalid API key, invalid payload, protected route reachability, and optional valid-span/Convex-run verification when smoke env vars are provided.
  - **Verification:** `npm run build`, `node --check scripts\beta-smoke.mjs`, and default `npm run smoke:beta` pass. Default smoke skips valid ingest/run checks until `FIVETOONE_SMOKE_API_KEY` and `FIVETOONE_SMOKE_PROJECT_ID` are set.

- **Reports, Honest Billing, and Tinybird Pipe Prep (2026-05-20):**
  - **Reports:** Added `/dashboard/[projectId]/reports` with a print-friendly project report covering run totals, failed runs, saved cost, span count, top models, top tools, recent alerts, and notable failed traces.
  - **Project Metadata:** Added optional `clientName` and `reportNotes` project fields, surfaced in settings, so agencies/internal teams can label stakeholder reports without changing ingest payloads.
  - **Billing:** Replaced hardcoded billing usage and nonfunctional upgrade buttons with real Convex saved usage, current `planTier`, and beta "Join beta" states while Stripe remains unconnected.
  - **Analytics:** Extended stats cache/API responses with Tinybird-backed tool cost breakdowns and adjusted the daily Tinybird read reservation from 2 to 3 reads for stats refreshes.
  - **Tinybird:** Added endpoint pipe definitions for `spans_by_run` and `recent_runs_summary` under `tinybird/endpoints/`.
  - **Verification:** `npx convex codegen` and `npm run build` pass.

- **Settings, Alerts, and RBAC Hardening (2026-05-18):**
  - **Settings Validation:** Project settings now validate project name, non-negative cost thresholds, positive integer duration/stall thresholds, and Slack webhook URLs on both client and Convex mutation paths.
  - **Slack Test:** Settings includes a guarded "Send test alert" action that posts to the saved Slack webhook only for admins.
  - **RBAC:** Project settings updates, API key rotation, and project deletion now require project owner, configured app admin, or Clerk org admin access; comments require developer/admin style access.
  - **Alerts:** Alert creation deduplicates repeated run/type events, topbar alert clicks mark individual alerts read, and alert/comment queries now enforce project access.
  - **Runs Search:** Runs search now performs an exact indexed runId lookup across saved project runs in addition to loaded-page filtering.
  - **Teams:** Settings members now renders Clerk organization membership data instead of placeholder teammates.
  - **Verification:** `npx convex codegen` and `npm run build` pass.

- **Trace Viewer Product Polish (2026-05-18):**
  - **Core UX:** Added a compact span latency overview above the timeline so a developer can scan trace shape before opening individual spans.
  - **Inspection:** Input/output payload panels now have copy buttons with immediate copied feedback.
  - **Debugging:** Error spans auto-expand, and empty completed traces now show a clear inline empty state instead of a blank timeline.
  - **Summary:** Added a right-side trace summary panel with cost/latency metrics plus model and tool breakdowns.
  - **Verification:** `npm run build` passes.

- **Alert Read State + Visibility (2026-05-18):**
  - **Backend:** Added optional `alerts.readAt` and public `alerts:markAllRead`, guarded by the same Clerk project access check as alert listing.
  - **UX:** Topbar bell now counts unread alerts only, highlights when unread notifications exist, and exposes a `Read all` action in the popup.
  - **UX:** Unread popup rows have a stronger border/background, a left accent rail, and a `New` label so fresh notifications are easier to spot.
  - **Verification:** `npx convex codegen`, `npx convex dev --once`, and `npm run build` pass.

- **Alerts Popup Conversion (2026-05-18):**
  - **UX:** Converted the dashboard Alerts entry from a primary sidebar/page destination into a topbar bell popup showing recent alerts inline.
  - **Navigation:** Removed Alerts from the primary dashboard sidebar. The old `/dashboard/[projectId]/alerts` route remains as a compatibility redirect back to the project overview.
  - **Security:** Hardened `alerts:listByProject` to verify Clerk identity has access to the project before returning alerts.
  - **Verification:** `npx convex codegen`, `npx convex dev --once`, and `npm run build` pass.

- **Dashboard Runs Pagination (2026-05-18):**
  - **Backend:** Added Convex `agentRuns:getRunsPageByProject` using `paginationOptsValidator`, project access checks, and server-side status filtering.
  - **Backend:** Added bounded `agentRuns:getRunCountsByProject` so pagination can show total pages for the active status filter. Counts are capped at 1,000 and should become denormalized counters for large production projects.
  - **UI:** Runs table now uses Convex paginated results instead of a fixed 25-run query.
  - **Controls:** Added rows-per-page controls for 10/25/50 runs, Prev/Next buttons, and a `Page X of Y` indicator.
  - **Behavior:** Duration still ticks client-side for running runs; status filters reset to page 1 and search applies within loaded results.
  - **Verification:** `npx convex codegen` and `npm run build` pass.

- **Dashboard Analytics Empty-State Polish (2026-05-18):**
  - **UX Copy:** Removed the visible `Analytics temporarily unavailable; showing cached data` label from dashboard refresh controls and trace span status copy.
  - **Controls:** Overview and Costs range selectors plus manual refresh controls are right-aligned in the dashboard header/control area.
  - **Charts:** Overview and Costs now always render a date series for the selected range. Analytics data wins when available; saved Convex run summaries are used when analytics is empty; a zero baseline renders when no runs exist yet.
  - **Verification:** `npm run build` passes.

- **Low-Query Analytics Refresh (2026-05-17):**
  - **Goal:** Keep Tinybird read volume under 1,000/day while preserving a live-feeling dashboard.
  - **Stats Cache:** Added Convex-backed `analyticsStatsCache` keyed by project/range with 10-minute fresh TTL, 24-hour stale fallback, and metadata used by Overview/Costs labels.
  - **Budget Guard:** Added `tinybirdReadBudget` with stats refresh reservations counting 2 Tinybird reads, soft protection near 850/day, and hard protection near 980/day.
  - **Manual Refresh:** Overview and Costs now expose an explicit Refresh button and status copy; repeated manual refreshes cool down for 30 seconds.
  - **Polling Removed:** `useProjectStats` no longer does 4-second Tinybird polling. It fetches on load/range/visibility and only performs controlled stale refreshes from Convex activity.
  - **Span Cache:** Run span responses are cached in Convex; running traces use cached spans by default and expose `Refresh spans`.
  - **Live Durations:** Runs table and trace viewer durations now tick with a client timer from Convex run timestamps, without Tinybird requests.
  - **Verification:** `npx convex codegen` and `npm run build` pass.

- **Redis Analytics Cache Layer (2026-05-17):**
  - **Goal:** Prevent empty analytics screens when the analytics backend is unavailable before Convex has a warm cache.
  - **Dependency:** Installed `redis` and added `REDIS_URL` support for server route handlers.
  - **Stats Route:** `/api/projects/[projectId]/stats` now verifies project access, reads fresh Redis cache before spending analytics reads, writes successful analytics responses to Redis, and uses stale Redis cache before returning an empty analytics payload.
  - **Spans Route:** `/api/projects/[projectId]/runs/[runId]/spans` now caches span responses in Redis; running traces use a 30-second fresh window and otherwise require manual refresh while terminal traces can reuse cached data for 24 hours.
  - **Security:** Redis responses are only served after existing Clerk/Convex project or run access checks pass. The real Redis URL is local-env only; `.env.local.example` contains a placeholder.
  - **Verification:** `npm run build` passes and a Redis smoke test writes/reads a temporary key successfully.

- **Project Manager Summary Document (2026-05-17):**
  - **File:** Added `docs/project-manager-project-summary.md` as a detailed handoff summary for non-implementation stakeholders.
  - **Scope:** Captures product status, architecture, implemented dashboard areas, Convex functions, API routes, Inngest/Tinybird pipeline, SDK/package status, deployment lessons, major bug fixes, and open production-beta work.
  - **Purpose:** Gives a project manager enough context to track what has shipped, what is verified, and what remains without reading the full codebase.

- **Run Cancellation + Clickable Dashboard Breadcrumbs (2026-05-17):**
  - **Run Control:** Added a guarded `agentRuns:cancelRun` Convex mutation that can mark a running saved run summary as `cancelled` after verifying Clerk identity and project access.
  - **UI:** Runs table and trace detail now expose a two-step stop/cancel control for running traces; completed, failed, and cancelled runs remain terminal and are not overwritten by later ingest updates.
  - **Navigation:** Dashboard topbar breadcrumbs are clickable for parent levels. `Dashboard` returns to the active project overview, and nested section crumbs like `runs` return to the section list while the current leaf remains plain text.
  - **Limit:** Cancellation currently stops the observed dashboard run state only; it does not terminate a user's external agent process until SDK/runtime cancellation polling is added.
  - **Deployment Note:** The stop button requires the Convex deployment to have `agentRuns:cancelRun`; after the frontend error, both dev `diligent-dragon-604` and prod `focused-otter-289` were synced and verified with `convex function-spec`.
  - **Verification:** `npm run build` passes.

- **Hybrid Dashboard Refresh Strategy (2026-05-17):**
  - **Goal:** Make dashboard stats feel closer to 1-second updates without permanently polling Tinybird every second.
  - **Approach:** Added shared `useProjectStats` hook for Overview and Costs that keeps 4-second visible-tab polling as a fallback.
  - **Realtime Trigger:** Convex `getProjectManagementSummary.latestActivityAt`/totals now act as a live refresh signal; when saved run summaries change, the hook schedules quick stats refetches after 750ms and 2500ms.
  - **Efficiency:** This preserves efficient baseline polling while refreshing charts/model breakdowns immediately after Convex sees new activity.
  - **Robustness:** The hook avoids duplicate in-flight requests for the same project/range and ignores stale responses when the user switches ranges.
  - **Verification:** `npm run build` passes.

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
  - **Fix:** `.env.local` now uses the Convex dev `TRACIFY_API_KEY_HASH_SECRET` and points `INNGEST_DEV` at `http://127.0.0.1:8288`.
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
  - **Production Secret:** Generated and set `TRACIFY_API_KEY_HASH_SECRET` in Vercel and Convex prod; a local backup is in `C:\tmp\fivetoone_api_key_hash_secret.txt`.
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
- **Required Secret:** Convex project creation requires `TRACIFY_API_KEY_HASH_SECRET`.
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

- **Sanity CMS Blog Added (2026-06-15):**
  - **Goal:** Add a blog with rich content managed via Sanity Studio.
  - **Schema:** Post schema with title, slug, author, publishedAt, excerpt, coverImage, categories, tags, block content, and SEO object.
  - **Pages:** Blog listing (`/blog`), blog post (`/blog/[slug]`) with SSG + JSON-LD + OG/Twitter meta, RSS feed (`/blog/rss.xml`), sitemap integration.
  - **Sanity Studio:** https://8no3oibu.sanity.studio
  - **Dataset:** `production`

- **API Key Prefix Changed (2026-06-16):**
  - **Change:** API keys now generated with `tracify_sk_live_` prefix instead of `5t1r_sk_live_`.
  - **Validation:** Ingest API still accepts both prefixes for backward compatibility with existing keys.

- **Google OAuth Updated (2026-06-16):**
  - **Change:** Replaced old Google OAuth client ID/secret in `.env.prod` and Vercel production env.

- **Convex Auth Config Deployed (2026-06-16):**
  - **Fix:** Deployed `convex/auth.config.ts` with `https://clerk.tracify.tech` to Convex production, resolving the "Auth: Waiting" hang during onboarding.

- **Project Rename 5to1r → tracify (2026-06-15):**
  - **Goal:** Complete the project/product rename from `5to1r` to `tracify`.
  - **Change:** Updated `package.json` name to `tracify`.
  - **Change:** Updated all source code comments and visible product name references in docs.
  - **Change:** Updated `pyproject.toml` bug tracker URL to `github.com/tracify/python-sdk`.
  - **Change:** Updated Tinybird pipe/datasource descriptions.
  - **Change:** Updated Convex test alert text.
  - **Retained:** Internal localStorage keys, Inngest event IDs (`5to1r/span.received`, `5to1r/alert.triggered`), and scratch scripts preserve legacy `5to1r` prefixes for backward compatibility.
  - **Verification:** `npm run build` pending.

- **Blog CMS via Sanity (2026-06-15):**
  - **Goal:** Add a headless CMS-powered blog to tracify using Sanity.io (free tier).
  - **Schema:** Blog post schema in `sanity/schemas/post.ts` with title, slug, author, publishedAt, excerpt, coverImage, categories, tags, rich body (Portable Text + code blocks), and a full SEO object (metaTitle, metaDescription, ogImage, canonicalUrl).
  - **Client:** `src/lib/sanity/client.ts` – Sanity client with image URL builder. Gracefully handles missing env vars.
  - **Queries:** `src/lib/sanity/queries.ts` – GROQ queries for listing, single post, slugs, recent posts, and category filtering.
  - **Blog Listing (`/blog`):** Static page with post cards (cover image, title, date, author, excerpt, categories), responsive layout, and empty/not-configured states.
  - **Blog Post (`/blog/[slug]`):** SSG with `generateStaticParams`. Full rich text rendering via `@portabletext/react`. JSON-LD structured data for BlogPosting schema. SEO metadata via `generateMetadata` with Open Graph, Twitter cards, and canonical URL.
  - **RSS Feed (`/blog/rss.xml`):** Static RSS 2.0 feed with all published posts.
  - **Sitemap (`/sitemap.xml`):** Includes blog posts with `weekly` change frequency.
  - **Footer:** Added "Blog" link to the marketing footer.
  - **Env vars required:** `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`.
  - **Setup:** User needs to create a free Sanity project at sanity.io, get the project ID, and add it to `.env.local`. The Sanity Studio is accessed via Sanity's hosted platform (responsive web app works on mobile for posting from phone).
  - **Verification:** `npm run build` passes.

## Active Priorities
- **Phase 2.1: Beta Reliability and Proof.**
- Deploy and validate Tinybird endpoint pipes in the active Tinybird workspace.
- Run full beta smoke with a real API key/project id so valid ingest and Convex run creation are checked, not skipped.
- Smoke test report page states with authenticated sessions: no data, normal runs, failed runs, and analytics-unavailable fallback.
- Continue replacing beta placeholders with real usage, contact, or hidden states.

## Competitive Product Surface (2026-08-03)
- Replaced the placeholder marketing product pages with detailed, feature-specific pages for Trace Viewer, Cost Dashboard, Tool Calls, LLM Calls, Failures, Reports, and Runtime Control.
- Added public `/roadmap`, `/contact`, and intentionally non-claiming `/status` routes. The roadmap explicitly separates shipped work from in-progress, planned, and enterprise-phase delivery.
- Added dashboard `/dashboard/[projectId]/control`, which exposes the existing project runtime-policy controls from the sidebar. The sidebar now has a Control group and preserves compatibility with previously stored group preferences.
- Marketing navigation now links to Reports, Runtime Control, and the roadmap. Targeted ESLint passes; the full lint command exceeded the 60-second command limit without diagnostics.

## Sessions and Search Milestone (2026-08-03)
- Added optional session context to native ingest, OTLP ingest, TypeScript SDK, and Python SDK helpers: session, end user, environment, release, tags, and trace name.
- Added Tinybird span fields and a project-scoped `/api/projects/[projectId]/search` route with bounded filters for text, session, user, environment, release, model, tags, status, cost, latency, and time range.
- Added Convex `sessions` summaries and optional `agentRuns.sessionId` linkage with authorized list/detail/run queries.
- Added dashboard Observe routes for Sessions, session detail, and Trace Search, plus sidebar navigation.
- Convex codegen, targeted ESLint, Next production build, and TypeScript SDK build pass.

## Evaluation Engine Integration (2026-08-06)
- Added release-gated regression suites, safe prompt promotion mutation, and UI gate visibility.
- Added monitor state transitions so recovery alerts are emitted after a breach clears.
- Added Tinybird evaluation score datasource, ingestion, and hourly aggregation query helper.
- Verification: Convex codegen, Next production build, targeted ESLint, TypeScript SDK build, Python compile, and diff check pass.
- Remaining production setup: `EVALUATION_INTERNAL_SECRET` and Tinybird datasource deployment/smoke validation.
- Follow-up audit fixes: configurable suite thresholds and prompt-version promotion UI, trace-to-dataset and queue-review mutations, job completion accounting, JSON Schema/numeric-range deterministic rules, and explicit evaluation result retrieval.
- Full-repository lint still reports unrelated pre-existing errors outside the evaluation changes; targeted evaluation lint and production build remain green.
- Added `/docs/evaluation` documentation and expanded platform smoke coverage for the evaluation product/docs routes. Smoke requests now use per-request timeouts; the current local run timed out on the existing dev environment before completing, so production credential validation remains outstanding.
- Configured a local-only `EVALUATION_INTERNAL_SECRET` consistently in `.env.local` and the Convex dev deployment; private evaluator endpoint checks returned 401 for the wrong secret and 422 for an authenticated but invalid payload. Formatted `tinybird/evaluation_scores.datasource` with the Tinybird CLI. Tinybird cloud deployment remains unavailable because the workspace is not logged in.
- Corrected monitor aggregation to filter by configured score/evaluator name, count failed and error results, and honor hysteresis via `recoveryThreshold`; Convex codegen and Next production build pass afterward.
- Routed online evaluation monitor breach/recovery events through the existing Inngest `5to1r/alert.triggered` flow so Convex alerts can reach configured Slack notifications with the standard deduplication path. Build and Convex codegen pass.
- Extended Tinybird evaluation score records and hourly aggregation to retain numeric, boolean, categorical, and text-derived score types instead of forwarding numeric values only. Tinybird formatting, Convex codegen, SDK build, Next build, targeted lint, and diff check pass.
- Added `npm run deploy:tinybird:evaluation` with a guarded PowerShell deployment script and documented the required secret/authentication setup; it is ready to run after Tinybird CLI login.
- Exposed monitor score name, aggregation, breach/recovery thresholds, and grouping controls in the Evaluation dashboard; build, Convex codegen, targeted lint, and diff check pass.
- Connected `/experiments` to evaluation suites: experiments can now select a matching suite, persist its criteria, and use the same evaluator thresholds while retaining prompt/model comparison. Build and Convex codegen pass.
- Added an allowlisted server-side custom evaluator registry (`has_citation`, `no_pii`, `non_empty_json`) so custom checks remain controlled and never execute browser-provided code. Next build, targeted lint, and diff check pass.
- Added built-in redaction of common emails, phone numbers, identifiers, and API secrets before LLM judge calls, plus a 10-second timeout and one retry for transient judge failures. The first build worker reported a stale demo-page symbol error; a clean rerun passed with all 57 static pages generated.

## Dashboard Excellence Foundation (2026-08-07)
- Added shared dashboard primitives for signal badges, clickable metrics, and attention items.
- Upgraded Overview hierarchy around workspace health, an attention queue, and next-best actions while preserving existing analytics fallbacks and routes.
- Added dashboard grid and tabular-number tokens, dark color-scheme support, and signal-color variables.
- Renamed dashboard sidebar groups toward Operate and Manage; expanded navigation restructuring remains the next slice.
- Verification: TypeScript, focused ESLint, and `npm run lint:platform` pass.
- Reorganized sidebar destinations into Observe, Analyze, Improve, Operate, Manage, and Resources groups.
- Added Alerts, API Keys, and Billing to their intent-based groups while preserving existing routes.
- Synced Runs status and run-ID search filters to URL query parameters for durable links and Overview drill-downs.
- Verification: focused dashboard ESLint and TypeScript pass after the Runs changes.
- Trace Viewer now exposes a Focus first error action that scrolls to and highlights the first error/error-message span using stable span anchors.
- Trace span headers have explicit keyboard focus styling and scroll offsets for deep inspection.
- Verification: Trace Viewer ESLint and TypeScript pass.
- Added persistent trace context metadata for trace name, environment, release, and session when present on spans.
- Added a sticky selected-span inspector driven by the existing replay selection, showing type, model/tool, latency, cost, error text, and output preview.
- Verification: Trace Viewer ESLint and TypeScript pass after the context-panel changes.
- Added a project-aware dashboard command menu using the existing dialog primitives; opens from the Command button or `⌘K`/`Ctrl+K` and links to core workspace surfaces.
- Verification: command menu/topbar TypeScript and focused ESLint pass; remaining warnings are pre-existing topbar title/image warnings.
- Trace Search now initializes and persists query, status, and time-window state in the URL.
- Added one-click search presets for failures in 24 hours, all traces in 7 days, and healthy traces in 30 days.
- Search results now visually distinguish error traces from healthy traces and retain keyboard focus styling.
- Verification: Trace Search and Sessions ESLint plus TypeScript pass.
- Costs range selection now persists as the `days` URL parameter for shareable period context.
- Cost summary explicitly labels analytics-backed values versus saved-summary fallback and links directly back to Runs.
- Verification: Costs ESLint and TypeScript pass.
- Dashboard topbar now shows supported workspace context from Clerk organization/personal workspace plus the authorized Convex project name.
- Replaced the misleading static `running` label with a neutral workspace/project context indicator.
- Verification: topbar ESLint and TypeScript pass; existing title/description and raw-image warnings remain.
- Restored the project Alerts route as a real alert center instead of redirecting to Overview.
- Added all/unread filtering, unread emphasis, mark-all-read, read-on-inspect, and direct run inspection links.
- Verification: Alerts page/list ESLint and TypeScript pass.
- Trace Search now exposes environment and release filters backed by the existing search API, with those filters included in submitted URL state.
- Verification: focused Trace Search ESLint and standalone TypeScript pass; a combined command timeout produced no diagnostics.
- Runs table now surfaces primary model and session context in a large-screen Context column, with graceful fallback labels and responsive hiding on smaller screens.
- Verification: Runs ESLint and TypeScript pass.
- Completed a focused lint audit across all changed dashboard files with no warnings; platform lint also passes.
- Fixed topbar title/description accessibility usage and replaced raw Clerk avatar images with dimensioned `next/image` elements.
- Standalone TypeScript passes. Full `npm run build` exceeded the Windows timeout and ended with EPIPE without source diagnostics.
- Added the installed Clerk `OrganizationSwitcher` to the dashboard topbar with Tracify-compatible compact styling and personal-workspace support.
- Verification: topbar ESLint and TypeScript pass.
- Runs pagination now restores and persists `page` and `limit` URL parameters alongside status and run-ID search state.
- Verification: Runs ESLint is clean; TypeScript passed in the pagination verification run.
- Sessions list now has a responsive mobile presentation instead of forcing the desktop grid; compact metric labels preserve traces, spans, and last-seen context.
- Session links have stronger hover/focus treatment and tabular-number styling for cost/counts.
- Verification: Trace Search and Sessions ESLint plus TypeScript pass.
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
- Overview now reads `api.evaluationEngine.overview` and exposes project evaluation pass rate as a health metric.
- Missing evaluation data renders `—` with “No evaluation results”; quality is not fabricated.
- Focused ESLint, TypeScript, and `git diff --check` passed after the change.
## Overview URL Time Range (2026-08-07)
- The Overview time-range selector is now URL-backed via `range`, making shared links and refreshes deterministic.
- Supported values are 1, 7, 30, and 90 days; invalid values fall back to 7 days.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Route-Aware Time Context (2026-08-07)
- Topbar now reads `range` on Overview and `days` on Runs/Search, with matching route defaults.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Overview Scope-Preserving Links (2026-08-07)
- Overview symptom links now preserve the selected time range when opening Runs, keeping the debugging scope consistent.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Topbar Time Context (2026-08-07)
- Added the active dashboard time window to the topbar context strip beside project and environment.
- Defaults are aligned with Overview’s 7-day range.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Trace Annotation Action (2026-08-07)
- The Trace Viewer annotation submit icon now has an accessible name, tooltip, and visible focus ring.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Alert Resolve Safeguard (2026-08-07)
- Alert resolve now uses confirmation, matching the existing mute safeguard; both lifecycle actions remain reopenable.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Overview Alert Action (2026-08-07)
- Added the missing alert-configuration action to Overview’s next-best-action panel.
- The action correctly links to project settings, while `/alerts` remains the alert review center.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Shared Dashboard Contracts (2026-08-07)
- Added `src/components/dashboard/dashboard-contracts.ts` as the shared home for dashboard state/type contracts.
- `SavedRunView` and `DashboardSignal` now flow through shared definitions.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Alert Filter Semantics (2026-08-07)
- Alert All/Active/Resolved/Muted tabs now expose `aria-pressed` and visible focus rings.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Trace Action Focus States (2026-08-07)
- Trace Viewer primary actions now have visible keyboard focus rings.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Overview Range Semantics (2026-08-07)
- Added `aria-pressed`, descriptive labels, and focus rings to the Overview time-range controls.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Explicit Environment Context (2026-08-07)
- Topbar now displays the active environment query scope, defaulting to “all environments.”
- This keeps environment context visible while preserving the existing URL-backed Runs/Search filters.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Critical Route Validation (2026-08-07)
- Current production build passes and generates the dashboard route set.
- Beta smoke: 5 passed, 0 failed, 2 skipped due to absent live smoke credentials.
- Full repository lint still has unrelated pre-existing errors; dashboard-focused lint is clean.
- Authenticated browser QA is not yet proven because the local dashboard redirects to Clerk sign-in.
## Authenticated Visual QA Recheck (2026-08-07)
- A fresh local dashboard navigation again redirected to `/sign-in?redirect_url=.../dashboard`.
- No authenticated project session was available; no desktop/mobile visual pass is claimed.
## Final Dashboard Build Recheck (2026-08-07)
- `npm run build` passes after the latest dashboard/topbar changes and generates all 58 routes.
## Accessibility Sweep (2026-08-07)
- Added accessible member-action naming, analytics refresh labeling, and documentation navigation focus rings.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Overview Quality Trend (2026-08-07)
- Overview now includes a daily pass-rate trend derived from `evaluationOverview.recentResults`.
- The chart is sample-labeled and shows a clear no-results state when no quality data exists.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Overview Run Failure Trend (2026-08-07)
- Overview now shows daily run volume with failure rate on a secondary axis alongside spend.
- Because the current query returns recent run summaries, the chart labels the sample instead of implying complete telemetry coverage.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Alert Recommended Actions (2026-08-07)
- Alert center cards now include actionable guidance for cost-exceeded versus failure alerts.
- Do not invent threshold/trend values; the current alert schema only stores type, message, run, time, read state, and lifecycle state.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Shell Icon Accessibility (2026-08-07)
- Account and alert icon-only controls now expose accessible labels/tooltips and keyboard focus treatment.
- Focused ESLint, TypeScript, and `git diff --check` passed.
## Project Skill: Hog Release Notes (2026-08-08)
- Added `.agents/skills/hog-release-notes`, a project-local PostHog release-notes workflow.
- It gathers recent merged changes, applies concise reader-focused entry rules, and emits Markdown ready for the PostHog changelog.
## PostHog Environment Configuration (2026-08-08)
- Added the supplied public PostHog project token and EU ingestion host to `.env.local` and `.env.prod`.
## Marketing Homepage, Blog, and FAQ Plan (2026-08-08)
- Reviewed the supplied Langfuse, Linear, and Better Auth reference captures and the current Tracify marketing/blog surfaces.
- Planned an original Tracify refresh that borrows their structural strengths: outcome-led product proof, editorial release storytelling, and docs-first developer trust. No code changes were made in this planning pass.
## Landing Page Rebuild (2026-08-09)
- Rebuilt `/` around an original trace-to-release narrative using the supplied reference captures for inspiration: Linear's editorial grid rhythm, Better Auth's concise README proof, and Langfuse's lifecycle-based product evidence.
- Added a run-health hero, interactive trace inspection, integration rail, product workflow cards, accessible FAQ accordion, and a refreshed social card that matches the new positioning.
- Verification: focused ESLint, standalone TypeScript, `git diff --check`, and a production build passed; Next generated 58 routes.
## Landing Viewport Composition (2026-08-09)
- Reworked the public landing-page composition so each primary desktop/tablet content section fits within the visible viewport; the compact integrations rail remains intentionally brief.
- Moved the hero run-health card to top alignment and reduced oversized vertical spacing without forcing small-screen content to clip.
- Verified the active 720px-tall local viewport: hero is 710px, the longest primary section is 693px, and the remaining primary sections are 660px.
## Landing Exploration Set (2026-08-09)
- Appended three clearly labeled, removable concept sections after the existing homepage without changing its prior sections: an execution report, developer-first implementation brief, and connected-platform lifecycle matrix.
- The concepts take structural inspiration from the supplied Linear, Better Auth, and Langfuse captures while using original Tracify copy and UI.
- Verification: focused ESLint, standalone TypeScript, `git diff --check`, and a production build passed; refreshed `localhost:3000` opens at the first concept section.
## Landing Exploration Round 02 (2026-08-09)
- Appended exactly ten more independent homepage concepts (04–13) after the first exploration set without modifying the established landing sections or concepts 01–03.
- The layouts cover an incident flight recorder, quality scorecard, release pipeline, cost ledger, collaborative review, session map, policy control plane, integration directory, before/after experiment, and release changelog.
- All copy and product visuals are original to Tracify while borrowing high-level editorial, developer-first, and lifecycle patterns from the supplied references.
- Verification: focused ESLint, standalone TypeScript, `git diff --check`, and the Next.js production build pass; `localhost:3000` returns 200 and opens at concept 04.
## Landing Hero Exploration Gallery (2026-08-09)
- Appended five standalone hero directions (A–E) after concept 13 without changing the original hero or any prior exploration.
- Directions: command-center split, editorial declaration, live incident investigation, release-proof scorecard, and developer quickstart.
- Kept the gallery server-rendered and independently labeled for easy comparison/removal.
- Verification: focused ESLint, standalone TypeScript, diff check, and production build pass; localhost returns 200 and includes both the original hero and Hero A.
## Definitive Hero Exploration (2026-08-09)
- Appended Hero F after the exploration gallery, preserving the original hero and Heroes A–E.
- Combines a concise outcome-led headline with immediate run health, trace evidence, root-cause diagnosis, evaluated fix, and safe-to-promote proof in one server-rendered composition.
- Verification: focused ESLint, standalone TypeScript, diff check, and production build pass; localhost returns 200 and includes both the original and definitive hero anchors.
## Footer Exploration Gallery (2026-08-09)
- Appended four independently labeled footer directions after Hero F while preserving the current production footer below them.
- Variations: dark editorial signal, light newsroom grid, operational control room, and oversized brand monument.
- Every direction includes Product, Developers, Company, and Resources link categories plus an accessible email newsletter form routed to the existing contact flow.
- Verification: focused ESLint, standalone TypeScript, diff check, and production build pass; localhost returns 200 with all four anchors, four forms, and the production footer.
- Follow-up: added Footer 05, a dark full-bleed wordmark direction where `tracify` spans the entire browser width beneath links and newsletter signup; localhost now verifies five footer anchors and five forms.
- Full-bleed refinement: removed the wordmark side inset and increased/scaled its responsive type so the `tracify` letters extend from the left viewport edge to the right viewport edge.
## CTA Exploration Gallery (2026-08-09)
- Appended five independently labeled CTA directions after Hero F and before the footer gallery, preserving every existing CTA.
- Variations: centered editorial focus, proof-before-promise release panel, developer activation quickstart, horizontal release rail, and light live-signal conversion block.
- The set uses original Tracify content while borrowing high-level editorial restraint, developer clarity, and product-proof patterns from the supplied Linear, Better Auth, and Langfuse references.
- Verification: focused ESLint, standalone TypeScript, diff check, and production build pass; localhost returns 200 with exactly five CTA anchors and the existing footer gallery intact.
## Pricing Exploration Gallery (2026-08-09)
- Appended five independently labeled pricing directions after Hero F and before the CTA/footer galleries, preserving the existing `/pricing` route.
- Variations: editorial matrix, highlighted plan trio, usage-led table, light comparison ledger, and enterprise conversation.
- Uses the live plan facts without inflating claims: Free ($0), Pro ($19), Team ($39), and custom Enterprise; beta access framing is preserved.
- Verification: focused ESLint, standalone TypeScript, diff check, and production build pass; both `/` and `/pricing` return 200 and the homepage includes exactly five pricing anchors.
- Clarity pass: rebuilt all five variants around price-first plan decisions. Each self-serve plan now visibly includes the monthly price, span allowance, retention, projects/members, and three concrete included benefits before its CTA.
- Billing refinement: added one shared Monthly/Annual toggle for the whole gallery. Annual mode shows the exact 20%-off monthly equivalents ($15.20 Pro, $31.20 Team), marked as billed annually; every `/mo` suffix now uses readable Geist Sans rather than the display face.
## Extended Landing Surface Exploration Gallery (2026-08-09)
- Appended 30 independently labeled sections after the pricing explorations while preserving every existing homepage section.
- The gallery provides three comparison-ready visual directions for each requested theme: customer proof, integrations, security, FAQ, developer docs, use cases, comparisons, resources, workflow, and contact/sales.
- Customer-proof treatments are explicitly placeholder/approval-oriented and make no fabricated customer, logo, testimonial, or outcome claims.
- Verification: focused ESLint, standalone TypeScript, diff check, and production build pass.
- Creative rebuild: replaced the repeated three-template system with 30 theme-specific compositions, including a placeholder logo wall, quote monument, metric poster, integration orbit, connector bento, data-flow rail, security vault, trust center, FAQ conversation, terminal takeover, workload map, editorial covers, workflow loop, office hours, and enterprise intake.
- Added restrained signal colors (acid yellow, coral, violet, mint), two original generated illustrations under `public/images/explorations/`, and client-leaf interactions for signal selection and mouse-reactive artwork.
- Motion includes orbit rotation, a pausable lifecycle ribbon, signal pulses, hover-responsive connector tiles, and pointer spotlights; reduced-motion preferences disable continuous animation.
- Browser verification confirms all 30 section anchors render, the generated signal visual changes to the selected evaluation state, three continuous-motion elements have active keyframes, and the page reports no console errors.
## Future Surface Exploration Gallery (2026-08-09)
- Appended 24 additional independently labeled concepts after the creative 30-section gallery, preserving all previous homepage work.
- Covered every remaining proposed direction: interactive product sandbox, ROI calculator, architecture explorer, gradual migration, onboarding journey, reliability/status, deployment choices, persona routing, evaluation playground, cost simulator, release-gate builder, trace anatomy, brand manifesto, founder story, community/open source, template gallery, editorial newsletter, announcement system, navigation rework, hero rework, pricing curation, homepage sequence curator, dedicated mobile composition, and footer finale.
- Kept the gallery server-rendered except for focused client leaves containing six interactive tools: trace selection, ROI controls, prompt comparison, cost modeling, release-gate configuration, and persona routing.
- Browser verification proves 24 `future-*` anchors render, trace selection updates evidence, ROI controls recalculate values, release-gate toggles update coverage, mobile viewport has no horizontal document overflow, and console logs contain no runtime errors.
- Focused ESLint, standalone TypeScript, diff check, and the Next production build pass.
## Sitewide Text Selection (2026-08-09)
- Global text selection now uses faint yellow (`rgba(250, 204, 21, 0.38)`) while preserving the selected text's existing color across the entire application.
- The rule lives outside CSS cascade layers, intentionally overriding older component/page-level white and translucent selection utilities, and includes Firefox's selection pseudo-element.
- Removed every remaining source-level `selection:bg-white*` and `selection:text-black` utility, replacing them with `selection:bg-yellow-300/40` directly on page/component roots.
- Verification: production build passes; the served stylesheet contains the faint-yellow utility and no white selection utility.
## Private Section Library (2026-08-09)
- Moved the complete exploration stack off the public homepage and into canonical `/admin/library`; `/library` is now an authenticated compatibility redirect.
- The admin workspace organizes 94 live explorations into 16 functional categories with search, category filters, direct anchor links, and five selectable site-structure narratives.
- Added six demand-generation concepts: production-readiness audit, trace clinic, reliability benchmark, cost-leak scan, migration brief, and five-day operator course.
- Every host, including localhost, now requires Clerk sign-in plus either an approved user ID or an approved organization with active `org:admin` role. Missing configuration and unapproved identities fail closed.
- Admin email allowlists are also supported through `TRACIFY_LIBRARY_ADMIN_EMAILS`; the local and production environment files allow `kristoffer.bon@gmail.com` to access the workspace after Clerk sign-in.
- The library is dynamic, marked noindex/nofollow/nocache, omitted from the sitemap, and absent from the public and signed-in marketing navigation.
- Verification: focused ESLint, standalone TypeScript, production build, clean public homepage response, and signed-out admin redirects pass.
## Curated Alternative Homepage (2026-08-09)
- Added public `/alternative` as a standalone, conversion-first homepage composition, leaving the production homepage untouched.
- The sequence combines the selected release-proof hero, trace investigation, operating benefits, readiness-audit lead magnet, clear three-plan pricing, trace-clinic CTA, custom navigation, and full-bleed yellow wordmark footer.
- Acid yellow is the signature accent across primary actions, proof markers, featured pricing, diagnostic affordances, and footer branding; an existing Tracify signal-map asset supports the product story.
- The private library now links directly to the curated route for comparison.
## Lightweight Homepage Composer (2026-08-09)
- Added private `/admin/composer` with simple show/hide switches for the seven alternative-homepage beats: hero, product, proof, readiness audit, pricing, CTA, and footer.
- The composer creates a shareable `/alternative?sections=...` preview URL; no CMS, database, or publish flow was introduced.
- Library category links now support focused URLs such as `/admin/library?category=Heroes` and `/admin/library?category=Contact%20%26%20CTA`.
- Verification: focused lint/type checks and production build pass; a partial preview verifies that omitted sections are not rendered.
## Future 19 Section System (2026-08-09)
- Extended the light navigation language into 15 distinct, live homepage sections under the dedicated `Future 19 system` library category.
- Replaced `/alternative` with a complete Future 19-only homepage preview: shared light-grid navigation plus all 15 matched sections, from outcome hero through footer atlas.
- Promoted the same Future 19 composition to the public `/` homepage; `/alternative` remains available as a comparison preview.
- Centralized the landing navbar and Future 19 footer in `SiteChrome` at the root layout. Every page route receives the marketing shell except `/dashboard` and all dashboard children; former route-local nav/footer instances were removed.
- The set covers an outcome hero, signal directory, proof band, lifecycle map, trace report, evaluation scoreboard, developer install, integration index, use-case switchboard, security controls, comparison matrix, pricing ledger, resource desk, conversion workshop, and footer atlas.
- All directions share the navbar's light paper field, thin black rules, black feature panels, yellow interaction/accent color, square geometry, and pixel-display typography without collapsing into one repeated layout.
- The private library now contains 114 indexed sections across 17 categories.
- Verification: exactly 15 `navsys-*` component anchors match exactly 15 library entries; focused ESLint, standalone TypeScript, production build, and refreshed localhost production server pass.

## Mobile Evaluation Scoreboard (2026-08-10)
- The Future 19 evaluation scoreboard now replaces its wide five-column table with stacked candidate cards below the `md` breakpoint.
- Its release heading scales down on narrow screens; desktop retains the original comparison table.
- Browser QA at a 375px viewport confirmed the section matches the viewport width with no horizontal document overflow.

## Official Third-Party Brand Marks (2026-08-10)
- Added a shared `ThirdPartyLogo` registry for external product marks used by the public site.
- Replaced invented homepage integration glyphs with official OpenAI, Anthropic, Vercel, LangChain, LlamaIndex, and OpenTelemetry marks.
- The homepage integration index and `/integrations` directory now reuse the same registry; unavailable live Simple Icons slugs use pinned or official-project assets.
- Browser QA confirmed every rendered third-party image loaded across all three public brand surfaces.

## Public Integration Disclosure (2026-08-10)
- Removed the public homepage Platform row that disclosed Tinybird, Redis, and Convex.
- The integration area now communicates only customer-facing compatibility: models, frameworks, and telemetry standards.

## Private Admin Navigation (2026-08-10)
- Removed the Admin destination from public desktop and mobile navigation; it does not appear in the public footer.
- Signed-in users see Dashboard and Sign out actions in the navbar; signed-out visitors retain Start free.
- The Admin link now appears only in the dashboard for `kristoffer.bon@gmail.com`; the server-side library guard uses the same default allowlist in addition to configured environment allowlists.

## Focused Onboarding and Product-Shell Branding (2026-08-10)
- `/onboarding` and every nested onboarding route now render without the marketing navbar or footer.
- `BrandLogo` supports a plain mode without the yellow marker; dashboard and onboarding shells use it while marketing retains the highlighted wordmark.
- Browser verification confirms the onboarding project route contains no navbar, footer, or yellow logo highlight.

## Development API-Key Hashing Secret (2026-08-10)
- Local onboarding project creation failed because the development Convex deployment lacked `TRACIFY_API_KEY_HASH_SECRET`.
- Production already had the variable; a separate cryptographically random 256-bit secret was generated, set, and verified for development without exposing its value.
- Convex environment variables apply directly to the deployment, so no source or schema change was required.

## Tracify API-Key Secret Rename (2026-08-10)
- Renamed `FIVETOONE_API_KEY_HASH_SECRET` to `TRACIFY_API_KEY_HASH_SECRET` across Convex, Next.js, local environment files, examples, and operational documentation.
- Preserved the existing secret value separately in development and production so previously issued API keys continue to hash identically.
- Synced and deployed Convex development and production, verified the new variable, and removed the old variable from both Convex deployments.
- Added the new production variable to Vercel; its old variable remains temporarily for the currently deployed pre-rename Next.js build and can be removed after the next site deployment.

## Stripe Documentation Skills (2026-08-11)
- Installed the seven Stripe-published agent skills under `.agents/skills`: Connect recommendations, Stripe Apps, best practices, directory, docs, projects, and upgrade guidance.
- User-provided Stripe sandbox keys were not written to source control or local environment files.

## Stripe Subscription Billing (2026-08-11)
- Installed Stripe CLI 1.45.2, configured Stripe agent tooling, installed the Projects plugin, and accepted the hosted Checkout subscription integration plan.
- Added Stripe SDK 22.4.0 plus authenticated Checkout and Customer Portal routes, signature-verified webhook handling, and Convex-backed customer/subscription state.
- Created test-mode Tracify Pro ($19 monthly / $182.40 annual) and Team ($39 monthly / $374.40 annual) products and a customer portal with invoice history, payment-method updates, prorated plan changes, and cancel-at-period-end.
- Test credentials and webhook secrets are stored only in ignored `.env.local`; public templates contain variable names only.
- Live payments remain blocked because the Stripe account is not activated: charges and payouts are disabled and required business/representative/bank/TOS details are outstanding. Tax is intentionally disabled until an active tax registration is confirmed.

## Stripe Live Billing Readiness (2026-08-12)
- Stripe account activation is complete: card payments, transfers, charges, and payouts are enabled with no outstanding verification requirements.
- The live catalog contains Pro ($19 monthly / $182.40 annual) and Team ($39 monthly / $374.40 annual). The live Customer Portal supports invoice history, payment-method updates, prorated plan changes, and cancel-at-period-end.
- Created the live subscription webhook for `https://www.tracify.tech/api/stripe/webhook`; its signing secret, the billing sync secret, live publishable key, and all live price IDs are configured in Vercel production. The sync secret is also configured in production Convex.
- Deployed the billing schema/functions to production Convex, including Stripe customer and subscription indexes.
- Reconciled homepage, public pricing, dashboard, and Stripe prices/limits. Production build passes after making the Open Graph image dynamic to avoid a Windows libvips prerender failure.
- Application deployment is intentionally pending: the live server secret was pasted into chat and must be rolled. Add a replacement restricted live key directly to Vercel as `STRIPE_SECRET_KEY`; never paste it into chat or commit it.
- Stripe Tax remains disabled because an active tax registration has not been confirmed.

## Git and Vercel Production Release (2026-08-12)
- Published branch `codex/stripe-live-billing` with release commits `121ccdd` and `a6f40b5`.
- Production Vercel deployment `dpl_7RgTFMWSVRfdsQEyZKaSghfuhRwB` reached Ready and `https://www.tracify.tech` points to it.
- Hardened Stripe client initialization so builds and non-billing routes remain healthy when the server key is absent; billing endpoints return 503 until a replacement restricted live key is configured.
- Removed the tracked `scratch/sync_envs.ps1` credential dump before publishing. Its historical credentials remain compromised and require rotation.

## Distinct Future 19 Public Pages (2026-08-11)
- Replaced the repeated public-page masthead composition with route-specific visual systems across the public routes migrated in the Future 19 pass.
- Blog, pricing, docs, product, use-case, changelog, contact, roadmap, status, security, privacy, and terms now use distinct editorial metaphors and responsive layouts while retaining the shared monochrome/yellow brand language.
- Desktop and 375px browser checks passed on representative and dynamic variants; focused ESLint, TypeScript, and diff-hygiene checks passed.
- A separate concurrent task moved the application into `(frontend)` and `(payload)` route groups; those unrelated Payload, Stripe, dashboard, and backend changes were preserved untouched.

## Payload Neon Initialization (2026-08-12)
- Connected Payload to the dedicated Neon Postgres database through `DATABASE_URL` in local development and all Vercel environments.
- Generated `src/migrations/20260811_220842_initial_payload_schema.ts` and applied it successfully to Neon.
- Verified migration batch 1 is recorded as run and the local Payload posts API responds with HTTP 200.
- The remaining personal setup step is creating the first administrator account at `/cms`; application deployment remains separate because the worktree contains concurrent changes.
- Installed Neon’s official `neon` and `neon-postgres` agent skills under `.agents/skills` for managed database access, branching, SQL, and migrations.
- Added a whitelisted `Content` entry to the dashboard Resources navigation and protected `/cms` with the existing server-side private-library allowlist; Payload authentication remains a second security layer.
- Browser verification confirmed the whitelisted signed-in session still reaches `Dashboard - Payload`. Full static/build validation was interrupted because the long-running Windows Next development process saturated Node and caused new checks/navigation to stall.

## Unified Production Release (2026-08-12)
- Consolidated the recent SEO/public-site, Payload blog and CMS, Stripe live billing, Site 1/dashboard navigation, Neon migration, and administrator-access work into the `codex/stripe-live-billing` release lineage.
- Scratch logs and downloaded reference material remain excluded from version control.
- The exact combined worktree passed Vercel's production compilation and TypeScript checks and deployment `dpl_5TUPyFowyzSBZhBZpftsTn2L2wjR` reached Ready before the Git history consolidation.

## Markdoc Blog and Authoring Workflow (2026-08-13)
- Replaced Payload CMS with validated repository-backed Markdoc content under `content/blog`; Payload routes and runtime packages are removed.
- Future blog and documentation work must use `.agents/skills/writing-tracify-content/SKILL.md` for writing quality and storage routing.
- The first published post is `ai-agent-observability-complete-guide`; the other migrated posts remain drafts.
- Blog posts do not render a post-level newsletter CTA. The site-wide footer newsletter remains.
- The article author signature uses a responsive light editorial treatment instead of the former dark card.
- Markdoc shipped to `main` in `b551ff2`; production deployment `dpl_7eQKAxcC6R5gZ1y8NhJE5huUZ6Gc` reached Ready and owns the Tracify production aliases.
- The linked `tracify` Vercel project has no environment variables, so there were no Payload-only variables to remove. Localhost was restarted from merged `main`, and the blog index and published article both returned HTTP 200.
- Published articles require at least two distinct contextual links to other published posts when eligible targets exist. Generic `Related guide` blocks, self/draft/missing targets, bare URLs, `click here`, and `read more` fail `npm run test:content`.
- The blog index uses a restrained bento grid: the newest post spans two of three desktop columns with capped media, standard cards retain their own images, tablet uses two columns, and mobile uses one. The page-level newsletter was removed; only the global footer signup remains.
- Blog discovery and internal linking shipped in `1717d19`; production deployment `tracify-h15vc5vcq-tracify-tech.vercel.app` reached Ready. Live checks confirmed `/blog` and a representative article return 200, all 10 cards render, the duplicate newsletter is absent, and contextual links are present.
- Future posts must choose interaction by reader job: trace/evaluation demos for execution reasoning, editable sandboxed code for implementation learning, focused calculators/checklists/explorers for operational decisions, or static prose when interaction adds no value. Interactive content remains centralized Markdoc tags mapped to accessible leaf React components; arbitrary MDX/JSX, server-side code execution, secrets, and production-data access are prohibited.
- Future Git work defaults to a `codex/<description>` branch and draft PR. Features and higher-risk application changes require PRs; direct `main` pushes are reserved for explicit user-approved, low-risk content fixes after checks pass. Agents must inspect staged scope and exclude scratch or unrelated changes.
## Root robots.txt route (2026-08-13)
- Removed the unsupported `Host` directive from `/robots.txt` after Google Search Console correctly reported it as ignored by Googlebot. Canonical-host selection remains enforced by the bare-domain redirect, `metadataBase`, canonical tags, and sitemap URLs.
- Diagnosed the production `robots.txt` 404: Next.js requires `robots.ts` in the root App Router directory, but it was nested under the `(frontend)` route group and omitted from Vercel's build output.
- Moved the metadata route to `src/app/robots.ts`; `npm run build` passed and explicitly emitted static `/robots.txt`. PR #4 merged to `main` and production deployment `dpl_BQ1D2JYfFkcp771WcRnYP5BVsJ7f` is Ready; live `/robots.txt` and `/sitemap.xml` return HTTP 200.
# 2026-08-15 Documentation hub migration
- Replaced the hand-coded public docs registry with a separate `content/docs/*.mdoc` repository, parsed by `src/lib/markdoc-docs.ts` and rendered by the docs routes. Blog Markdoc remains isolated in `content/blog`.
- Added a Langfuse-inspired docs information architecture: grouped chapter index, persistent article navigation, quickstart/code surfaces, and responsive two-column layout, adapted to Tracify’s monochrome/acid-yellow Future 19 design.
- Added initial quickstart, TypeScript, Python, and ingestion API chapters. Broader source migration and verification remain.
- Added prompt, evaluation, lifecycle, integrations, and self-hosting chapters; added a client-side docs search and utility navigation modeled on the supplied docs shell. Corrected stale `5to1r` placeholder examples back to the verified Tracify SDK examples.
- Updated the writing skill contract to point at `content/docs/*.mdoc` and added `src/lib/markdoc-docs.test.ts`, proving docs load through their own repository and do not intersect blog slugs. Content tests now pass 16 tests.
- Expanded the public docs corpus with observability, datasets, tool calls, costs, and API/data-platform chapters to cover the supplied mirror's major topic groups while keeping all technical claims Tracify-specific.
- Grouped article-side navigation by documentation section, added an Overview entry, and kept the desktop sidebar sticky to better match the reference documentation shell.
- Added practical subtopic chapters for public API, MCP, CLI, export, prompt playground, human review queues, prompt caching, and evaluation release gates.
