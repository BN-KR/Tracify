# 2026-08-22 — Product film rebuilt from scratch

- [x] Remove the active Motion Canvas composition and preserve it in a recoverable archive.
- [x] Rebuild the film in Remotion using the live homepage/demo design language and exact Geist fonts.
- [x] Animate the homepage proof, demo workspace, failed-run drilldown, trace inspector, replay score, and release proof.
- [x] Pass lint and bundle checks; inspect four still checkpoints and four frames extracted from the final MP4.
- [x] Render `video/tracify-demo.mp4` at 1920×1080, 30fps, H.264, 38.25 seconds.

# 2026-08-20 — 17-post visibility content set

## 2026-08-21 — AI agent monitoring article refinement

- [x] Restructure only `content/blog/ai-agent-monitoring.mdoc` into six H2 phases with nested H3 decision points.
- [x] Add the centralized `faq-item` Markdoc tag as an accessible native accordion.
- [x] Add scoped article background/code colors and a nested, mobile-safe shared blog TOC.
- [x] Run `npm run test:content`, focused ESLint, and `git diff --check`; local browser initialization remains unavailable.

- [x] Add 17 keyword-led, non-overlapping Markdoc posts covering AI agent architecture, evaluation, security, performance, cost, operations, browser agents, MCP, and prompt management.
- [x] Add the future-agent workflow article at `/blog/how-to-write-tracify-blog-posts` and retain the required workflow in `AGENTS.md`, the writing skill, and `content/blog/README.md`.
- [x] Add a centralized, deterministic `<trace-scenario>` Markdoc interaction with accessible disclosure behavior and use it in the RAG and cost articles.
- [x] Run `npm run test:content` successfully (16 tests passed).
- [x] Verify the production build end-to-end with the Webpack path and temporary Node worker-thread workaround; compilation, TypeScript, static generation, and route finalization all passed. The workaround was removed afterward, leaving `next.config.ts` unchanged.

# 2026-08-21 — Motion Canvas product demo

- [x] Implement the standalone Motion Canvas source project under `video/tracify-demo`.
- [x] Replace the initial PowerPoint-like card sequence with a persistent graph-led animation inspired by the Bufferhead reference.
- [x] Build and render `video/tracify-demo.mp4` at 1920×1080, 60fps, H.264, 45.63 seconds.
- [x] Visually inspect trace, code, release, and outro frames from the MP4; correct panel-safe text anchors, the selected-span right-edge marker, opening graph framing, and add a staged signal pulse.

# ⚠ PENDING — needs BN-KR on their own machine (updated 2026-08-16)

These require local credentials, live provider consoles, or a working internet
connection that this environment doesn't reliably have right now. Read this
section first whenever asked "what do I need to do."

## Regional cloud — EU-first launch (decision recorded 2026-08-16)

Free-plan provider environments do not necessarily guarantee physical EU/US data residency. Launch only EU for now and keep the US option hidden/disabled. Do not describe Tracify as multi-region until every US stateful provider has a verified US location.

### ⚠ BLOCKER (found 2026-08-18): "europe-west2" is London, UK — not the EU

Both stateful EU services are physically in the **United Kingdom**, which left the EU in 2020:

- Tinybird `tracify_eu` → `api.europe-west2.gcp.tinybird.co` → GCP **europe-west2 = London, UK**.
- Redis `database-MSZ2JEQR` → `start-crisp-coherent-91539.db.redis.io` → `35.246.69.33`, which
  falls in `35.246.0.0/17`, published by Google in `https://www.gstatic.com/ipranges/cloud.json`
  with `scope: europe-west2` — same London region.

"It's only a cache" does not resolve this. Two different things share that Redis:
- Rate-limit counters (`consumeRateLimit`/`peekRateLimit`) — just integers, genuinely low-risk.
- The analytics/span cache — `src/app/(frontend)/api/projects/[projectId]/runs/[runId]/spans/route.ts`
  stores full `SpanRow[]` under `analytics:spans:<projectId>:<runId>` with a **24-hour TTL**, and
  `SpanRow` (`src/lib/tinybird.ts:413-437`) carries `input: string` and `output: string` — the raw
  LLM prompts and completions from the customer's end users. That is the most sensitive data in
  the product, sitting in a UK datacenter for up to a day.

GDPR Art. 4(2) defines processing to include storage; there is no cache exemption, and a 24-hour
TTL is not ephemeral. The UK holds a UK-GDPR regime and an EU adequacy decision, so transfers are lawful today — but
adequacy is renewable and has been challenged, and "EU data residency" is a factual claim that
London hosting does not satisfy. Many EU buyers (public sector, health, finance) exclude UK
hosting outright. Shipping `eu.cloud.tracify.tech` on this infrastructure while calling it EU
would repeat exactly the overclaim this EU-first decision was made to avoid.

DECISION 2026-08-18: Option A. BN-KR is recreating the Tinybird workspace in `eu-west-1`
(AWS Ireland — genuinely EU). Remaining work for that move:
- [ ] Create the new `eu-west-1` Tinybird workspace.
- [ ] Redeploy all four definitions from `tinybird/` into it — `spans.datasource`,
      `evaluation_scores.datasource`, `endpoints/recent_runs_summary.pipe`,
      `endpoints/spans_by_run.pipe`. The 2026-08-17 europe-west2 deployment does not carry over.
      ⚠ SEQUENCING: as of 2026-08-18 Vercel's `TINYBIRD_HOST`/`TINYBIRD_TOKEN` already point at
      the new workspace, but the schema has NOT been pushed there — so the EU deployment is
      currently wired to an empty workspace. Ingestion (`/v0/events?name=spans`) and every
      dashboard read (`recent_runs_summary`, `spans_by_run`) would fail until this push happens.
      Push the schema BEFORE deploying or verifying anything else.
- [x] FIXED 2026-08-18: `TINYBIRD_HOST` set to `https://api.eu-west-1.aws.tinybird.co`
      (Production + Preview) via `npx vercel env add --force`. Host verified live before setting:
      `GET /v0/sql` returns 403 (valid endpoint, no token supplied) and it resolves to
      `52.211.129.79`, published by AWS as `eu-west-1` (Ireland) — genuinely EU. Note the write
      flipped the variable from Non-sensitive to Sensitive, so its value is no longer visible in
      `vercel env ls` for future audits.
- [x] `INNGEST_EVENT_KEY` added by BN-KR 2026-08-18. All ten variables in the
      `src/instrumentation.ts` required set are now present on `tracify-cloud-eu`.
- [x] Tinybird MCP server wired for future agents 2026-08-18: `.mcp.json` registers an `http`
      server at `https://mcp.tinybird.co?token=${TINYBIRD_MCP_TOKEN}`. The token is referenced by
      env-var expansion, never written to the file — `.mcp.json` is NOT gitignored, so a literal
      token there would be committed to the repo. Set `TINYBIRD_MCP_TOKEN` in the environment or
      in the gitignored `.claude/settings.local.json`.
- [ ] ROTATE the Tinybird MCP token — pasted unmasked into a chat transcript 2026-08-18. Its JWT
      payload decodes to `host: aws-eu-west-1`, which independently corroborates that the new
      Tinybird workspace is in AWS Ireland (EU).
- [ ] ⚠ STILL SUSPECT — `TINYBIRD_TOKEN` has not been touched since the original swapped-value
      entry and may contain the *host* string rather than the token. Re-add it with `--force` and
      confirm. Symptom if wrong: every Tinybird call fails auth with 403.
- [x] HISTORICAL — `TINYBIRD_HOST` originally held a TOKEN, not a URL. Audited via
      `npx vercel env ls production --project tracify-cloud-eu` on 2026-08-18: the variable is
      marked Non-sensitive so its value is visible, and it begins `eyJ2IjoidjIiLCJjIj…`, which
      base64-decodes to `{"v":"v2","c"…` — a Tinybird JWT. The host and token values were
      swapped when added. Every Tinybird call would throw on an invalid URL. Fix: set
      `TINYBIRD_HOST` to the new eu-west-1 workspace host (`https://…`) and confirm
      `TINYBIRD_TOKEN` holds the token.
- [x] `REDIS_URL` added to `tracify-cloud-eu` (Production + Preview) 2026-08-18, confirmed by
      `vercel env ls`. Value hidden, so the `rediss://` scheme could not be verified — if the
      deployment can't reach Redis, check that first.
- [ ] ⚠ STILL MISSING — `INNGEST_EVENT_KEY` is absent from `tracify-cloud-eu`. It is in the
      `src/instrumentation.ts` required set, so the EU deployment still hard-throws at boot:
      "Regional cloud deployment is missing required environment variables: INNGEST_EVENT_KEY".
- [x] Generate a fresh `TINYBIRD_TOKEN` from the new workspace and update Vercel. Reported done
      2026-08-18, same verification caveat.
- [x] SECURITY FIX 2026-08-18: `.tinyb` — the Tinybird CLI credentials file — was **tracked in
      git** with a live 205-char token committed (`git show HEAD:.tinyb` confirmed it). Untracked
      via `git rm --cached` and added to `.gitignore`. This mattered urgently: the next `tb login`
      would have written the new EU token into that same tracked file and committed it. The
      exposed token is for the London workspace being deleted, which limits the damage.
- [x] DONE 2026-08-18 — schema deployed to the new EU workspace. `tb login` (by BN-KR) then
      `tb deploy` from the repo root (NOT `tinybird/` — `.tinyb` lives at the root, and running
      from the subdirectory fails with "requires authentication"). Deployment #1 to workspace
      `tracify_eu_west1` created all four objects, verified via the API:
        datasources: `spans` (MergeTree), `evaluation_scores` (MergeTree)
        pipes:       `recent_runs_summary` (endpoint), `spans_by_run` (endpoint)
      Both endpoints smoke-tested: HTTP 200, 0 rows (expected — nothing ingested yet).
      Note: `tb deploy` ends with a `'charmap' codec can't encode '✓'` error on Windows —
      that is a console encoding failure printing a checkmark, NOT a deployment failure.
- [x] HISTORICAL — the new eu-west-1 workspace is a **Tinybird Forward** workspace: schema changes
      are only accepted through `tb deploy` (the deployments flow). Both `POST /v0/datasources`
      and `POST /v0/pipes` return HTTP 403 "can only be done via deployments", so the REST API
      cannot create them. Verified 2026-08-18 with a working token.
      The MCP token (`https://mcp.tinybird.co?token=…`) authenticates for READS — `GET
      /v0/datasources` returns 200 and confirms the workspace is empty (`{"datasources": []}`) —
      but `tb deploy` rejects it with "This action requires authentication. Run 'tb login' first".
      ONLY REMAINING STEP: BN-KR runs `tb login` (interactive browser), then `tb deploy` from
      `C:\Tracify	inybird`. Nothing else is outstanding; all four datafiles are staged and valid.
      `.tinyb` now points at `https://api.eu-west-1.aws.tinybird.co` so login targets the right host.
- [x] The old TRAP note (local `.tinyb` pointed at London) is resolved — it now points at eu-west-1.
- [ ] Superseded note: local `.tinyb` used to read `host: https://api.europe-west2.gcp.tinybird.co`,
      `name: tracify_eu` — i.e. the CLI is still authenticated against the OLD London workspace.
      Running `tb push`/`tb deploy` right now would deploy the four definitions to London, not to
      the new eu-west-1 workspace. Re-auth (`tb auth`) before pushing anything.
- [ ] Re-verify by IP once created, same method as below.
- [ ] Delete the old europe-west2 workspace so nothing can silently write to London.
- [x] Redis moved to a real EU region 2026-08-18. New database `tracify-eu-west1` at
      `patient-microsteady-porter-27084.db.redis.io:19790` → `52.214.68.234`, which AWS publishes
      in `https://ip-ranges.amazonaws.com/ip-ranges.json` as region `eu-west-1` (Ireland).
      Independently verified — this one is genuinely EU.
- [ ] ⚠ UNRESOLVED (2026-08-18): Upstash database `concrete-buffalo-140061.upstash.io` may be a
      **Global** (multi-region replicated) database, which would break EU residency outright.
      Evidence: the hostname CNAMEs to `p2-global.upstash.io` and `global-latency.upstash.io`.
      All four IPs it returns here (63.182.22.87, 3.79.250.206, 35.158.17.96, 52.28.247.228)
      are AWS `eu-central-1` (Frankfurt) — but Upstash Global databases use latency-based DNS,
      so a lookup from Norway only ever reveals the *nearest* replica. A lookup from the US would
      return US replicas. DNS from one location CANNOT prove single-region residency.
      - [x] Checked 2026-08-18: it IS a Global-type database (it exposes "Manage Regions —
            add/remove read regions"), but **Primary = Ireland `eu-west-1`**, which is EU. The
            Frankfurt IPs seen via DNS are Upstash's latency-routing/proxy layer in
            `eu-central-1` — also EU. So both the primary and the observed edge are in the EU.
      - [ ] CONFIRM the read-region list is **empty**. Any read region outside the EU replicates
            span `input`/`output` text out of the EU and breaks the residency claim.
      - [ ] ONGOING GUARD: because this is a Global-type database, adding a non-EU read region is
            a one-click, silent residency break with no code change and no deploy. Never add one;
            re-check the read-region list as part of the pre-release sequence in
            `docs/regional-cloud-runbook.md`.
- [ ] `REDIS_URL` format: the Upstash console shows `redis-cli --tls -u redis://...`, where TLS
      comes from the `--tls` flag. `node-redis` takes TLS from the URL scheme instead, so
      `REDIS_URL` must start with **`rediss://`** (two s). Pasting the console's `redis://` value
      verbatim silently disables TLS.
- [ ] Redis hardening still open on the new database:
      - [ ] TLS: NOT AVAILABLE on the Redis Cloud free 30MB Essentials tier — it is gated behind
            a paid plan, so this cannot be toggled on. Decision 2026-08-18: move to Upstash Redis
            instead, which includes TLS by default and has EU regions. Choose the **Redis**
            product (not Ratelimit — `consumeRateLimit`'s Lua script runs fine on plain Redis,
            and Upstash supports EVAL). Use the native `rediss://` connection string with the
            existing `node-redis` client: zero code change, only the `REDIS_URL` value differs.
            Do NOT use the `upstash-redis-start` skill — that provisions temporary 3-day
            unauthenticated scratch databases explicitly not intended for production or PII.
            Optional later: the `@upstash/redis` REST SDK removes connection limits entirely but
            requires rewriting `src/lib/redis-cache.ts`; not needed now.
      - [ ] ACL: still the all-privileges `default` user. Create a scoped user — the app only
            needs GET, SET, INCRBY, EXPIRE, TTL, PING and EVAL on `analytics:*` plus the
            rate-limit keys.
      - [x] Both superseded Redis Cloud databases deleted 2026-08-19; EU health check still
            returns `redis: ok`, confirming the live Upstash database was untouched.
      - [x] (superseded) Delete the old London database `database-MSZ2JEQR`, and treat its password as burned
            (it was pasted in plaintext into a chat transcript on 2026-08-18).
      - [x] Clerk DNS records deleted 2026-08-19 (accounts/clerk/clkmail/clk._domainkey/
            clk2._domainkey all confirmed no longer resolving) — closes the dangling-CNAME
            subdomain-takeover risk left over from the Better Auth migration.
      - [x] The London Tinybird token committed in `.tinyb` history appears already dead: the
            committed token returns HTTP 404 against `api.europe-west2.gcp.tinybird.co`, and
            `tb workspace ls` earlier returned "workspace not found" — consistent with the
            europe-west2 workspace having been deleted. Suggestive, not conclusive; if the
            workspace is confirmed gone, no rotation is needed for that credential.
      - [ ] STILL OUTSTANDING — rotate the **eu-west-1** workspace token. Rotating the API token
            also invalidates the MCP URL, since `https://mcp.tinybird.co?token=…` embeds that
            same token; one rotation covers both. This workspace is live and holds the deployed
            schema, so this is the exposure that actually matters.
      - [ ] ROTATE the Upstash REST token for `concrete-buffalo-140061` — it was pasted
            unmasked into a chat transcript on 2026-08-18 and must be considered compromised.
            Upstash console → database → rotate/reset token.
      - [ ] Also delete the short-lived Redis Cloud Ireland database `tracify-eu-west1`
            (`patient-microsteady-porter-27084`), superseded by Upstash.

- [ ] Option A (keeps the "EU" claim): recreate the Tinybird workspace **and** the Redis database
      in a real EU region — `europe-west1` (Belgium), `europe-west3` (Frankfurt), `europe-west4`
      (Netherlands), or `europe-north1` (Finland) — then re-verify by IP as above. Convex EU is
      already `eu-west-1`, which is Ireland and genuinely EU.
- [ ] Option B (keeps the current infrastructure): relabel the region as "UK/Europe" rather than
      "EU" across the selector, docs, `/status`, `config/regional-cloud.json`, and marketing, and
      state the actual hosting location plainly.
- [ ] Re-check Inngest's processing region the same way; it has not been verified either.

### EU launch — required
- [x] Update PR #14 so the public selector and documentation expose EU only; retain the dormant
      US architecture without offering it to customers. DONE 2026-08-18:
      - `src/lib/regions.ts` — added an `available` flag to `TracifyRegion` (eu: true, us: false)
        plus `getAvailableRegions()` / `isRegionAvailable()`. Public surfaces must iterate the
        helper, never `TRACIFY_REGIONS` directly, so a dormant region can't be advertised by
        accident.
      - `src/app/(frontend)/cloud/page.tsx` — selector lists only available regions; the
        hardcoded "02 regions" label is now derived from the count.
      - `src/app/(frontend)/api/region/select/route.ts` — rejects dormant regions server-side, so
        a hand-typed `?region=us` can no longer set the cookie and redirect into the US host.
      - `src/components/status/regional-status-board.tsx` — only probes/lists available regions.
      - `src/lib/regions.test.ts` — two new tests: EU-only is advertised, and the dormant US
        region stays routable so US keys are still detected as wrong-region rather than silently
        treated as EU.
      - Verified: `tsc --noEmit` clean, `npm run test:regions` 6/6, `npm run verify:regions` OK.
      - ⚠ DEPLOY TARGET: `/cloud` only renders when `NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND=marketing`
        — `src/proxy.ts:22` redirects it to `www.tracify.tech` on a cloud deployment. So the
        region selector lives on the **marketing** project (`tracify` / www.tracify.tech), NOT on
        `tracify-cloud-eu`. This EU-only change must ship to the marketing project or the public
        selector will keep offering the US region regardless of what the EU project runs.
      - NOT visually verified: local `/cloud` 307-redirects to production because `.env.local`
        sets `DEPLOYMENT_KIND=cloud`. Correctness rests on the unit tests, not a rendered page.
- [!] ⚠ REGION CLAIM IS WRONG — see the "europe-west2 is not the EU" blocker below. Tinybird workspace `tracify_eu` (host `api.europe-west2.gcp.tinybird.co`, GCP europe-west2) was recorded as "confirmed EU-located" and deployed 2026-08-17, but europe-west2 is London, United Kingdom, which is not in the EU: `spans` and `evaluation_scores` datasources plus `recent_runs_summary`/`spans_by_run` endpoint pipes are live (deployment #4). Datasources are schema-only right now — no data has been ingested yet, since nothing in the app currently pushes events to this workspace. Auth for this project's `.tinyb` was broken (blank token) and had to be re-logged-in; CLI browser login kept timing out in this environment, so credentials were copied from a working session instead. Next: wire actual span/eval ingestion (Events API or existing logging hook) to `tracify_eu`.
- [x] Redis confirmed EU (Upstash, Ireland primary — see below).
- [ ] ⚠⚠ BLOCKER FOUND 2026-08-18 — **INNGEST RUNS IN THE UNITED STATES.** `inn.gs` (event
      ingestion) and `api.inngest.com` both resolve exclusively to AWS `us-east-2` (Ohio):
      `3.20.90.35`, `3.13.225.237`, `18.221.3.32`, `18.227.206.98` — all four confirmed against
      Amazon's published ranges, with no latency-based routing aliases.
      This is worse than the earlier Redis/Tinybird findings because Inngest is the PRIMARY
      INGESTION PATH, not a cache. `src/app/(frontend)/api/ingest/route.ts:206` and
      `src/app/(frontend)/api/otel/route.ts:401` both call `inngest.send()` with the full span
      payload — `SpanIngestedEvent` (`src/lib/inngest.ts:6`) includes `input` and `output`, i.e.
      raw LLM prompts and completions. So 100% of customer traces transit and are queued in Ohio,
      and Inngest retains event payloads for replay/history. `eu.cloud.tracify.tech` cannot be
      described as EU-resident while this is true.
      Partial mitigation already in code: when a project enables redaction, `redactPayload()` runs
      BEFORE the send, so redacted projects leak less. It is opt-in per project, not the default.
      Options:
      - [ ] A: move to an Inngest EU region if the plan supports data residency (check billing tier).
      - [ ] B: replace Inngest on the EU deployment with an EU-region queue. Upstash QStash is
            already available on this account (skills installed 2026-08-18) and is a direct
            HTTP-queue equivalent with EU regions — but this is a real code change to both ingest
            routes plus `src/lib/inngest-functions.ts`.
      - [ ] C: keep Inngest and drop the EU-residency claim, stating US event processing plainly
            on `/security` and `/status`.
- [ ] Document the final choice; do not launch the EU region claim until one of A/B/C is done.
- [x] FIXED 2026-08-18 (`tsc --noEmit` clean). BUG found 2026-08-17 while reviewing `src/lib/redis-cache.ts` against the newly installed
      `redis/agent-skills` pack: `connectRedis()` caches the connect promise with `??=` and never
      clears it. (a) If `client.connect()` rejects, the rejected promise is cached on `globalThis`
      forever — every later call re-awaits it and throws even after Redis recovers, until the
      serverless instance is recycled. (b) If the connection later drops, `client.isOpen` goes false
      but `??=` re-awaits the old *resolved* promise, which returns instantly without reconnecting,
      so the next command runs against a closed client. Both land on the ingest hot path
      (`consumeRateLimit`) and on `/api/health/region`. Fix: clear the global in `.finally()` so only
      an in-flight connect is shared. Also `createClient({ url })` sets no socket timeouts — add
      `connectTimeout` so a hung connect fails fast instead of burning the function budget.
- [ ] Use `rediss://` (TLS) for the EU `REDIS_URL`, not `redis://` — credentials and cached trace
      data otherwise cross the wire in clear text.
- [x] Add `eu.cloud.tracify.tech` at Domeneshop as an A record to `76.76.21.21` and verify Vercel TLS issuance. Confirmed done by BN-KR 2026-08-17.
- [x] Reuse the existing Stripe account/catalog; created the EU webhook endpoint (`we_1U5YRMV05QqKbrt9FFuI0zWx`, live mode) at `https://eu.cloud.tracify.tech/api/stripe/webhook` with the same event set as production, 2026-08-17. Signing secret generated and added by BN-KR as `STRIPE_WEBHOOK_SECRET` in the `tracify-cloud-eu` Vercel project, confirmed 2026-08-17.
- [x] Register the EU Google/GitHub callback URLs if authentication will run on `eu.cloud.tracify.tech`. Confirmed done by BN-KR 2026-08-17.
- [ ] Add the existing EU Tinybird, Redis, and Inngest credentials to `tracify-cloud-eu` without printing or committing them. Env-var checklists live at `scratch/tracify-regional/env/{eu,us,production}.env`.
    CORRECTION 2026-08-18: an earlier note here claimed Vercel env vars were unreachable from this
    environment. That was wrong. `vercel` is not on PATH, but `npx vercel` works and the CLI is
    still authenticated as `bnkr` (scope `tracify-tech`) — the same route
    `scratch/tracify-regional/configure-vercel-env.mjs` used on 2026-08-15. So `vercel env ls`,
    `add`, `rm`, and `pull` are all available; only *typing secret values* is off-limits, not
    Vercel access itself. Use `npx vercel env ls production --project tracify-cloud-eu --scope
    tracify-tech` to audit which names are set. EU's `STRIPE_WEBHOOK_SECRET` is already filled in there (created 2026-08-17); everything else needs BN-KR to fill in by hand from the Vercel dashboard / provider consoles. Older redacted `vercel env pull` dumps (`eu-vercel-production.env`, `us-vercel-production.env`, `marketing-production.env`) also exist in `scratch/tracify-regional/` from 2026-08-15 but only show `[SENSITIVE]` placeholders, not usable values.
  - GOTCHA (found 2026-08-17): `TINYBIRD_HOST` must include the `https://` scheme —
    `https://api.europe-west2.gcp.tinybird.co`, not the bare hostname. `src/lib/tinybird.ts:6`
    interpolates it directly into `fetch()` (lines 13/76/103/379) with no normalization, and its
    fallback is `https://api.tinybird.co`. A bare hostname makes every Tinybird call throw on an
    invalid URL. A first draft of `env/eu.env` had the bare hostname; corrected.
  - The authoritative required-at-boot list is `src/instrumentation.ts:9-20` (10 vars), which
    hard-throws when `NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND=cloud` and any are blank. Note the
    Tinybird fallback means a *missing* `TINYBIRD_HOST` on a non-cloud deployment would silently
    hit the global `api.tinybird.co` host instead of the EU workspace.
  - `INNGEST_SIGNING_KEY` is not read anywhere in `src/` or `convex/` — only `INNGEST_EVENT_KEY`.
- [x] DONE 2026-08-19 — PR #17 merged (squash, all checks green incl. GitGuardian) as
      `091d9da`, now the tip of `origin/main`. Deployed that exact commit to BOTH projects from a
      clean detached worktree (never from the dirty main tree, so no `scratch/` upload):
        `tracify-cloud-eu`  -> tracify-cloud-d4pqdn0fh, Ready, production
        `tracify` (marketing) -> tracify-1zmm63ov5, Ready, production, serving www.tracify.tech
      Git automation remains disconnected on the regional project; deploys were done via
      `vercel deploy --prod` with a locally written `.vercel/project.json`. Reconnecting Git is
      still optional/outstanding.
- [x] VERIFIED LIVE 2026-08-19 — `https://eu.cloud.tracify.tech/api/health/region` returns
      HTTP 200 `{"ok":true,"region":"eu"}` with every dependency healthy:
      convex ok (592ms), tinybird ok (334ms), redis ok (404ms), inngest ok (configuration).
      This finally proves the two write-only Vercel values are correct: `TINYBIRD_TOKEN`
      authenticated against the new eu-west-1 workspace, and `REDIS_URL` connected over
      `rediss://`. The earlier suspicion that `TINYBIRD_TOKEN` held the host string was WRONG —
      BN-KR was right that it was correct.
- [x] EU-only selector verified live on www.tracify.tech: `/cloud` lists only "Europe" (US gone,
      count label correctly singular "region"), and `/api/region/select?region=us` returns
      307 back to `/cloud` instead of setting the cookie. `/security` shows the new
      "Data residency" family stating EU storage and US event processing.
- [ ] Verify EU DNS/TLS, authentication, onboarding, API-key creation, native/OTLP ingestion, Tinybird storage, Redis quotas, Inngest processing, Stripe billing, dashboard reads, and `/api/health/region`.

### US launch — deferred, must remain unavailable
- [ ] Keep `us.cloud.tracify.tech` without customer traffic and keep US out of the region selector.
- [ ] Before enabling US, obtain a physically US Tinybird workspace, Redis database, and event-processing environment with documented residency.
- [ ] Configure unique US credentials, OAuth callbacks, Stripe webhook signing secret, backups, retention, monitoring, and end-to-end isolation tests.
- [ ] Enable US only after proving an EU trace never appears in US and a US trace never appears in EU.

## Resilience Testing dashboard feature — merged (PR #16)
- [x] Built, committed, PR #16 opened and merged; Vercel + GitGuardian checks passed.
- [x] Fixed 2026-08-17: ran `npx convex codegen` for real with a working `CONVEX_DEPLOYMENT`
      (see "Local dev environment is broken" below) — replaced the hand-patched
      `convex/_generated/api.d.ts` `resilience` module entry with a real generated file. This
      also surfaced and fixed an invalid-identifier bug in the `failureMix` validator
      (`"429"`/`"500"` object keys renamed to `rate_limited`/`server_error`).
- [ ] Manually click through `/dashboard/<projectId>/resilience`, run a test, confirm results render.

## Light theme re-skin (2026-08-16) — dashboard now matches the marketing site
The dashboard was converted from the dark palette to the marketing site's editorial light
theme (`#eceae3` cream base, white cards, black borders, `#f4d44d` acid-yellow accent).
Design tokens in `globals.css` now drive every shadcn primitive; ~1,500 hardcoded utility
classes were rewritten across dashboard, onboarding, auth, and ui components. Code/payload
panels stay deliberately dark (`#050505` + `#f4d44d`), matching the docs/marketing convention.
Verified: `tsc --noEmit`, `eslint` (no new problems), `npm run test:content` (16/16),
`npm run build`, plus an automated WCAG-AA contrast audit driven through the browser —
`/`, `/pricing`, `/docs`, `/docs/quickstart`, `/integrations`, `/blog` all report **0 failures**
(down from 23, 21, 16, 21 respectively).
- [ ] Click through the authenticated dashboard visually (Overview, Runs, Trace Viewer,
      Costs charts, Evaluation, Resilience). I could not log in locally, so dashboard
      rendering is verified statically + by build only, not by eye. Charts (recharts)
      and the trace waterfall are the highest-risk surfaces to eyeball.
- [ ] Pre-existing, out of scope, worth a separate fix: the branded 404 in
      `src/app/(frontend)/not-found.tsx` is never shown for unmatched URLs — Next serves its
      built-in 404 because there is no `src/app/not-found.tsx`. Adding one naively would
      render it without the root layout (no `globals.css`), so it needs a deliberate fix.

## Local dev environment is broken — root cause of the two Convex codegen gaps above
Diagnosed 2026-08-16 while trying to preview the dashboard locally:
- [x] Fixed 2026-08-17: `.env.local`'s `CONVEX_DEPLOYMENT` had an inline `# team: ...` comment
      quoted into the value itself (`"dev:diligent-dragon-604 # team: kristoffer-bon-6fab2, project: tracify"`),
      so `npx convex codegen` tried to parse the whole string as one deployment name. Trimmed
      to `"dev:diligent-dragon-604"`.
- [x] Fixed 2026-08-17: added `NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND=cloud` to `.env.local` to stop
      the `/cloud` redirect for local dashboard testing.
- [x] Fixed 2026-08-17: re-ran `npx convex codegen` for real. It then surfaced a second, real bug —
      `resilience.ts`'s `failureMixValidator`/schema used object keys `"429"` and `"500"`, which
      Convex rejects (`Invalid first character '4' in 429: Identifiers must start with an
      alphabetic character or underscore`). Renamed the `FailureMode` variants and every
      `failureMix`/schema/frontend reference from `"429"`/`"500"` to `rate_limited`/`server_error`
      across `convex/resilience.ts`, `convex/schema.ts`, and
      `src/components/dashboard/resilience-testing-dashboard.tsx`. `npx convex codegen` now
      completes cleanly (Downloading deployment state → Uploading functions → Generating
      TypeScript bindings → Running TypeScript, no errors) — no more hand-patched
      `convex/_generated/api.d.ts`/`dataModel.d.ts`.
- [ ] Do the manual dashboard click-through / resilience-run test noted elsewhere in this file
      now that localhost auth/dashboard routing and real codegen both work.

---

# Robots standards cleanup — 2026-08-13

1. [completed] Remove the Google-unsupported `Host` directive from the generated robots file.

# Sitewide link audit — 2026-08-12

1. [completed] Audit static, generated, public, and dashboard internal link targets against the application route manifest.
2. [completed] Replace stale `/docs/quickstart` links with the existing `/docs/typescript` quickstart.
3. [completed] Replace stale `/docs/api-reference` with `/docs/api` and retire the unavailable `docs.tracify.tech` navigation target in favor of `/docs`.
4. [pending] Re-run the production build after the currently active Next.js build releases `.next/lock`.

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
  - [x] Prepare `tracify` build output for npm package contents
  - [x] Rename TypeScript package/install docs to public package name `tracify`
  - [x] Rename TypeScript package/install docs to new public package name `tracify`
  - [ ] Publish `tracify` with npm 2FA OTP or granular publish token
  - [x] Rename Python SDK distribution/install docs to public package name `tracify`
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
- [x] Prepare Python SDK for `pip install tracify` and verify local wheel install
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
- [ ] Run `npm run smoke:beta` with `TRACIFY_SMOKE_API_KEY` and `TRACIFY_SMOKE_PROJECT_ID`

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
- [x] Updated all TypeScript SDK install/import snippets from `tracify` to `tracify`
- [x] Verified manual API key issuance via `projects:createProjectForUser`
- [x] Fixed local ingest dev environment so `npm install tracify` user test returns `202 Accepted`
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
- [x] Expose Payload as `Content` in the dashboard for whitelisted administrators.
- [x] Protect `/cms` with the existing server-side administrator allowlist.

# 2026-08-12 — Unified production release

- [x] Consolidate recent SEO, blog/Payload, Stripe, and Site 1/dashboard changes.
- [x] Exclude scratch logs and temporary reference downloads.
- [ ] Commit the unified release, fast-forward `main`, push, and verify the Git-backed production deployment.
# Future 19 public-site migration — 2026-08-11

- [x] Inventory legacy public route families outside the dashboard.
- [x] Create shared Future 19 page primitives.
- [x] Migrate blog, docs, pricing, product, use-case, and demo surfaces.
- [x] Migrate integrations, changelog, contact, roadmap, status, security, privacy, and terms.
- [x] Verify representative routes at desktop and mobile widths.
- [x] Pass focused lint, TypeScript, diff hygiene, and production build.
## Direct pricing checkout (2026-08-12)

- [x] Route paid homepage and pricing-page CTAs to a dedicated checkout handoff.
- [x] Preserve selected plan and billing interval through authentication.
- [x] Allow first-time customers to create a project and continue directly to Stripe Checkout.
- [x] Add Pricing to desktop and mobile site navigation.
- [ ] Confirm production Stripe server credential and production deployment.

## Managed Payments checkout (2026-08-13)

- [x] Create the managed-payments product command with the blueprint's digital-product tax code and monthly price.
- [x] Enable `managed_payments` on the existing linked Stripe Checkout route using the required preview API version.
- [x] Retain signed `checkout.session.completed` webhook synchronization to the project billing record.
- [x] Run focused tests, ESLint, TypeScript, and diff-hygiene checks.

## Root robots.txt route (2026-08-13)

- [x] Move the generated robots metadata route to `src/app/robots.ts`, as required by Next.js.
- [x] Verify the production build emits `/robots.txt`.
- [x] Commit, merge, and deploy the isolated fix without including unrelated workspace changes.

## Payload CMS dashboard access (2026-08-13)

- [x] Diagnose the missing live Content navigation and `/cms` 404 for the owner account.
- [x] Correct the allowlisted account email and use the shared server-side CMS access rule for dashboard visibility.
- [x] Deploy to production and verify the live dashboard Content link and `/cms` page.

## Admin hub (2026-08-13)

- [x] Replace the separate dashboard Content and Admin Library links with one Admin entry.
- [x] Add the protected `/admin` choice page for Admin Library and Payload CMS.
- [x] Verify the matching production deployment and live navigation.
# Dashboard onboarding escape and launch plan — 2026-08-12

1. [completed] Persist an intentional onboarding dismissal when the user leaves setup.
2. [completed] Keep existing-project quickstart actions within the dashboard.
3. [completed] Add a live, non-blocking Launch plan checklist to the dashboard overview.
4. [completed] Commit and push the verified dashboard changes to `main` (`410ebfc`).
# Payload-to-Markdoc assessment — 2026-08-13

- [x] Read the supplied Markdoc objective and rendering/Next.js notes.
- [x] Inventory Tracify's Payload dependencies, collections, CMS routes, blog rendering, and publishing features.
- [x] Estimate a lean Git-backed migration and a feature-parity migration.
- [x] Record the recommendation and principal migration risk.
# Payload-to-Markdoc migration — 2026-08-13

- [x] Export all Payload articles and media metadata to repository-backed Markdoc without publishing drafts.
- [x] Add a validated, tested Markdoc content repository and React renderer.
- [x] Switch blog pages, metadata, related posts, RSS, and sitemap to Markdoc.
- [x] Remove Payload routes, configuration, generated files, dependencies, scripts, and dashboard navigation.
- [x] Document Git-based article authoring and publishing.
- [x] Verify content tests, focused lint, TypeScript, production build, removed routes, public feeds, and draft privacy.
- [ ] Resolve the repository's 19 unrelated pre-existing full-lint errors in a separate cleanup task.
# Tracify content-authoring skill — 2026-08-13

- [x] Baseline-test existing guidance against content quality and storage-routing scenarios.
- [x] Create the project-local `writing-tracify-content` skill and UI metadata.
- [x] Document blog, internal-doc, public-doc, dashboard-doc, and media storage boundaries.
- [x] Add evidence-led blog/docs quality criteria and reusable source templates.
- [x] Validate skill structure, placeholder hygiene, length, and the Markdoc template contract.
- [x] Register the skill as mandatory for future blog and documentation tasks.

# Markdoc blog release — 2026-08-13

- [x] Publish the first repository-backed article.
- [x] Remove the article-level newsletter CTA while retaining the global footer signup.
- [x] Redesign the article author signature for the light editorial layout.
- [x] Pass content tests, focused lint, TypeScript, diff hygiene, and production build.
- [x] Publish the migration to `main`, verify Vercel, and restart localhost.

# Blog discovery and internal linking — 2026-08-13

- [x] Replace generic related-guide blocks with contextual anchored links across all 10 posts.
- [x] Add automated validation for distinct published targets and descriptive anchors.
- [x] Update the writing skill and template for future agents.
- [x] Remove the duplicate blog-page newsletter and retain the global footer signup.
- [x] Replace the oversized feature layout with a restrained responsive bento grid.
- [x] Complete production build and responsive layout-contract verification.
- [x] Commit, push, and run live checks.

# Interactive Markdoc authoring rule — 2026-08-13

- [x] Define when to use trace/evaluation demos, editable code sandboxes, focused widgets, or static prose.
- [x] Require centralized validated Markdoc tags and accessible isolated React components.
- [x] Update the future-agent skill, quality bar, publishing guide, and repository rules.
- [x] Validate the skill package and content contract.

# Agent Git workflow policy — 2026-08-13

- [x] Record branch, pull-request, direct-push, verification, and staging rules in root `AGENTS.md`.
- [x] Preserve scratch artifacts and unrelated user changes outside published scope.
# llms.txt and SEO audit — 2026-08-13

- [x] Audit canonical, robots, sitemap, metadata, and structured-data coverage.
- [x] Add a concise root `llms.txt` containing only canonical public resources.
- [x] Add a regression test and future-agent maintenance rules.
- [x] Run content tests and a production build.
# Product page depth and SEO hardening — 2026-08-13

- [x] Replace the nine repeated placeholder product pages with substantial feature-specific content.
- [x] Give each route a distinct restrained visual instrument while preserving the Tracify design language.
- [x] Ground product claims in the implemented trace, analytics, runtime policy, evaluation, alerting, and reporting code.
- [x] Replace false sitemap freshness dates with actual blog freshness or omitted dates.
- [x] Add product and blog breadcrumbs plus richer BlogPosting identity and publisher fields.
- [x] Verify focused lint, content tests, desktop/mobile rendering, accessibility semantics, and browser console output.
- [x] Run the final production build and publish the branch update.

# Vercel preview deployment recovery — 2026-08-13

- [x] Inspect the failed branch deployment and isolate the Vercel build error.
- [x] Confirm Preview lacked the two public Convex endpoints required at build time.
- [x] Add isolated development Convex endpoints to Vercel Preview without exposing production data.
- [x] Redeploy commit `45780f6` and verify Vercel reaches `READY`.
- [x] Update the staging runbook with both required variables and the current project name.

# Page-specific site redesign — 2026-08-14

- [x] Audit the repeated public-page skeleton and current mobile navigation.
- [x] Confirm that landing, blog, and docs are excluded from this pass.
- [x] Replace the tiny mobile navigation list with the selected Section Switchboard design.
- [x] Give every remaining public route a composition based on its specific user task.
  - [x] Rebuild Pricing as an interactive decision canvas.
  - [x] Rebuild Integrations as a protocol-and-connection map.
  - [x] Split Research, Support, Automation, and Tool Calling into four distinct compositions.
  - [x] Finish product, operational, company, legal, auth, and onboarding routes in the requested scope.
- [x] Differentiate onboarding and auth surfaces without breaking their workflows.
- [x] Complete repository type, content, and production-build verification (responsive, focused lint, content tests, TypeScript, and production build pass).
- [ ] Commit, push, open the default draft PR, and verify the preview deployment.

# SEO release guardrails — 2026-08-14

- [x] Record the post-merge commit ancestry failure from PR #5.
- [x] Add a mandatory public-page, merge, production deployment, IndexNow, and recrawl checklist for future agents.
- [x] Point repository-wide agent instructions to the checklist.
- [ ] Land SEO remediation commits `3474f98` and `191cbeb` through a follow-up pull request before claiming the audit fixes are live.

## SAML login
- [x] Add Better Auth SSO server/client plugins.
- [x] Add Convex `ssoProvider` schema fields and indexes.
- [x] Add email-domain-resolved SAML login action to `/sign-in` and `/sign-up`.
- [ ] Register each customer IdP provider with issuer, domain, entry point, certificate, and SAML mapping in the target Convex deployment.
# Documentation migration follow-up

- [x] Keep the Markdoc docs repository separate from blog content.
- [x] Preserve the `tracify` SDK contract in public examples.
- [x] Preserve critique learnings for future agents and avoid fabricated resource promises.
- [x] Include the Markdoc docs repository in Vercel output tracing.
- [x] Refine the docs overview into a three-column, grouped information architecture inspired by the supplied Langfuse reference.
- [x] Add responsive categorized docs navigation, article Markdown/share actions, and a public read-only docs MCP server.
- [x] Complete final checks, commit the scoped docs follow-up, and publish draft PR #13 against `main`.

# EU/US regional cloud — 2026-08-15

- [x] Add the EU/US region contract, selector, regional routing, and region-bound API keys.
- [x] Update native/OTLP ingestion, SDKs, onboarding, billing metadata, status, and documentation.
- [x] Create and initialize isolated EU and US Convex production deployments with unique runtime secrets.
- [x] Create EU and US Vercel projects, configure Next.js, and apply region-specific production/preview settings; keep Git automation disconnected until merged release readiness.
- [ ] ⚠ STALE CLAIM, corrected 2026-08-19 — "Attach `eu.cloud.tracify.tech` and
      `us.cloud.tracify.tech` to their matching Vercel projects" was marked done, but the Vercel
      API reports `domains: []` for `tracify-cloud-eu` (vs 7 domains on the main `tracify`
      project, so the field is reliable). The domain is NOT attached. Evidence:
      `eu.cloud.tracify.tech` resolves correctly to `76.76.21.21` (Vercel) but returns HTTP 404,
      i.e. Vercel receives the request and has no project bound to that hostname.
      Also `latestDeployment: null` — the EU project has never deployed anything, which is
      expected: Git automation is intentionally disconnected per
      `docs/regional-cloud-runbook.md:59`, to be reconnected only after the regional PR merges.
- [x] Add and deploy dependency-aware regional health endpoints; verify both live Convex health responses.
- [x] Add a shared atomic Redis quota for native and OTLP ingestion with regional isolation and `429` retry semantics.
- [ ] Add the two DNS A records at Domeneshop and verify Vercel TLS issuance. EU record confirmed done 2026-08-17 (see EU-first launch checklist above); US record remains deferred per the EU-only launch decision.
- [ ] Create and deploy independent Tinybird workspaces for EU and US; add unique hosts/tokens to Vercel.
- [ ] Create independent regional Redis databases and Inngest environments; add unique credentials to Vercel.
- [ ] Create regional Stripe webhooks and register Google/GitHub callback URLs.
- [x] Run repository/build and selector browser verification and publish draft PR #14.
- [ ] Reconnect Git and deploy the exact merged commit to both regional projects after all provider and DNS gates pass.

# Graph-derived feature opportunities — 2026-08-16

Sourced from a graphify knowledge-graph audit (weakly-connected nodes, thin communities, docs-vs-implementation gaps).

- [x] Surface the SDK chaos-engineering harness (`packages/ts-sdk/harness/chaos.ts`, `packages/python-sdk/harness/chaos.py`) as a documented resilience-testing workflow (`content/docs/resilience-testing.mdoc`, section "Evaluate"). Dashboard UI surfacing (a persisted run history) deferred — the harness itself is a local/CI tool, not a hosted feature.
- [x] Add Microsoft Teams as an alert channel: `teamsWebhookUrl` project field (schema, Convex validation/mutations, Inngest `notify-teams` alert step, settings UI test-send action) alongside the existing Slack webhook, plus a Teams entry on `/integrations` with a real brand mark.
  - [ ] `teams-bot/` (the separate BotFrameworkAdapter app) remains unwired into the alert pipeline — the webhook-based integration above covers the common case without standing up bot infrastructure; revisit if a full conversational bot is wanted.
- [x] Show ingest-quota/rate-limit usage in the dashboard: new `GET /api/projects/[projectId]/ingest-quota` route (`peekRateLimit` in `redis-cache.ts`) + `IngestQuotaCard` on the Billing page, polling every 15s.
- [x] Reconciled marketing vs. real Evaluation Engine: verified the "future" interaction prototypes (`ReleaseGateBuilder()`, `PersonaRouter()`, `CostSimulator()`) already live only in the private `/admin/library` gallery, not on public marketing pages — no public over-promising exists, so no change needed.
- [x] List the docs MCP server (`/api/docs/mcp`) as an integration: added to `/integrations` (Agent tooling category) and `public/llms.txt`.
- [x] Verified `/product/[feature]` pages already carry real, feature-specific content (commit `45780f6` "Deepen product pages and SEO structure") — the AGENTS.md placeholder note is stale; no change needed.

Follow-ups still open:
- [ ] Run `npx convex codegen` once a valid `CONVEX_DEPLOYMENT`/`CONVEX_URL` is available locally (codegen failed in this environment with `InvalidDeploymentName`) to refresh `convex/_generated/dataModel.d.ts` for the new `teamsWebhookUrl` schema field. `tsc --noEmit` and `eslint` both pass without it since the field is additive and optional.
- [ ] Update AGENTS.md's stale "Useful Pages This Project is Missing" and product-page-placeholder notes now that both are confirmed resolved.

# PR #19 light-theme rebase recovery — 2026-08-20

- [x] Rebase all four light-theme commits onto current `origin/main` in an isolated worktree without touching the owner's uncommitted primary checkout.
- [x] Resolve the sole `task.md` conflict by preserving current shipped-EU/codegen history and avoiding obsolete checklist resurrection.
- [x] Verify TypeScript, 16 content tests, diff hygiene, and the 99-route production build.
- [x] With explicit authorization, rebase on PR #23's merge, force-push with an exact `--force-with-lease`, and confirm PR #19 is mergeable with all GitGuardian and Vercel checks green.
- [ ] Complete a follow-up authenticated visual sweep of Overview charts, Trace Viewer waterfall, Costs charts, Evaluation, and Resilience; the in-app browser runtime could not initialize in this session, so merge safety relied on the earlier authenticated audit plus local and preview build gates.
- [x] Review and merge independent PR #23 first; it landed on `main` as `3e656e1` with all checks green.
- [x] Install namespaced gstack skills for personal Codex and Claude Code use without adding repository enforcement.
- [x] Squash-merge PR #19 as `1a5555f` after every required check passed.
- [x] Run the SDK publishing workflow in dry-run mode. Python tests/build pass; npm CI fails before credential validation because the workflow installs root dependencies instead of the standalone TypeScript SDK dependencies.
- [x] Merge the scoped workflow fix that runs `npm ci` from `packages/ts-sdk`, rerun the dry run, and confirm `NPM_TOKEN` belongs to npm user `tracifytech`.
- [x] Publish `tracify-sdk@0.2.0` to PyPI through the verified workflow and to npm through the owner's interactive 2FA session.
- [x] Verify both public registry records and clean-install/import the published npm and PyPI artifacts.

# AI agent monitoring article polish — 2026-08-21

- [x] Refine only `ai-agent-monitoring` with a closed structured TOC, yellow reading progress, command-prompt H2 treatment, and mobile-safe code/artifact styling.
- [x] Distribute six operator runthrough checkpoints, decision tables, rollout configuration, and an alert-packet example through the full article.
- [x] Replace the bottom related-guide dump with contextual links inside relevant explanations; retain a 3,626-word long-form article with 17 internal links.
- [x] Add an article-archetype repertoire to the mandatory authoring workflow for future agents.
- [x] Pass content tests, focused lint, rendered HTTP/DOM checks, and the full 116-route production build; document repository-wide lint failures as unrelated pre-existing issues.

# AI agent monitoring usability correction — 2026-08-22

- [x] Remove the decorative `C:\\MONITOR` runthrough treatment and use a simple `/` marker on article H2 headings.
- [x] Replace decorative checkpoints with concise decision-rule notes distributed through the article.
- [x] Remove the non-actionable pseudo-alert block; retain only clearly labeled illustrative YAML and JSON artifacts in neutral dark-gray code panels.
- [x] Render all four article comparisons as semantic tables inside mobile-safe horizontal scroll regions without mid-word breaks.
- [x] Fix article top clearance and Back to blog hover contrast, then place exactly three recommended posts at the bottom.
- [x] Keep 17 contextual internal links across the roughly 3,838-word article (about 4.43 links per 1,000 words).
- [x] Pass 19 content tests, focused ESLint, diff hygiene, desktop/mobile browser checks, and the full 116-route production build.

# LLM tracing article refinement — 2026-08-25

1. [completed] Read the mandatory content instructions and inspect the canonical article, renderer, media inventory, published corpus, and target article.
2. [completed] Rewrite `llm-tracing-explained.mdoc` on a clean branch with a focused operating model, evidence tables, one deterministic interaction, one FAQ section, contextual links, and a practical checklist.
3. [completed] Pass all 19 content tests, `git diff --check`, tracked-media verification, and HTTP 200 image verification.
4. [blocked] Complete the production build/rendered HTML check after supplying the required non-secret `CONVEX_SITE_URL` environment value in the isolated worktree.

# LLM observability metrics refinement — 2026-08-25

1. [completed] Read the mandatory content workflow and inspect the canonical article, renderer, CSS, media inventory, published slugs, and metrics article.
2. [completed] Rewrite `llm-observability-metrics-that-matter.mdoc` with a focused operational framework, evidence tables, one deterministic interaction, one FAQ section, contextual links, and a checklist.
3. [completed] Pass 19 content tests, production build, diff hygiene, asset inventory, HTTP 200 image check, FAQ count, and recommendation-dump audit.
4. [pending] Open the focused PR, verify rendered preview HTML and hosted checks, then merge only after all required checks pass.

# AI agent regression testing guide refinement — 2026-08-25

1. [completed] Read the mandatory content workflow and inspect the canonical article, renderer, CSS, media inventory, published slugs, and regression-testing guide.
2. [completed] Rewrite `ai-agent-regression-testing.mdoc` with a focused production-case loop, evidence tables, one deterministic interaction, one FAQ section, contextual links, and a checklist.
3. [completed] Pass 19 content tests, production build, diff hygiene, tracked-image inventory, FAQ count, and recommendation-dump audit.
4. [pending] Open the focused PR, verify rendered preview HTML and hosted checks, then merge only after all required checks pass.

# Production debugging guide refinement — 2026-08-25

1. [completed] Read the mandatory content workflow and inspect the canonical article, renderer, CSS, media inventory, published slugs, and production debugging guide.
2. [completed] Rewrite `debug-ai-agents-in-production.mdoc` with a focused incident workflow, evidence tables, one deterministic interaction, one FAQ section, contextual links, and a checklist.
3. [completed] Pass 19 content tests, production build, diff hygiene, tracked-image inventory, FAQ count, and recommendation-dump audit.
4. [pending] Open the focused PR, verify rendered preview HTML and hosted checks, then merge only after all required checks pass.

# RAG evaluation guide refinement — 2026-08-25

1. [completed] Read the mandatory content workflow and inspect the canonical article, renderer, CSS, media inventory, published slugs, and RAG evaluation guide.
2. [completed] Rewrite `rag-evaluation-guide.mdoc` with a focused retrieval/grounding/release loop, evidence tables, one deterministic interaction, one FAQ section, contextual links, and a checklist.
3. [completed] Pass 19 content tests, production build, diff hygiene, tracked-image inventory, FAQ count, and recommendation-dump audit.
4. [pending] Open the focused PR, verify rendered preview HTML and hosted checks, then merge only after all required checks pass.

# AI agent testing guide refinement — 2026-08-25

1. [completed] Read the mandatory content workflow and inspect the canonical article, renderer, CSS, media inventory, published slugs, and testing guide.
2. [completed] Rewrite `ai-agent-testing-unit-tests-production-evals.mdoc` with a focused layered-testing loop, evidence tables, one deterministic interaction, one FAQ section, contextual links, and a checklist.
3. [completed] Pass 19 content tests, production build, diff hygiene, tracked-image inventory, FAQ count, and recommendation-dump audit.
4. [pending] Open the focused PR, verify rendered preview HTML and hosted checks, then merge only after all required checks pass.

# AI agent observability guide refinement — 2026-08-25

1. [completed] Read the mandatory content workflow and inspect the canonical article, renderer, CSS, media inventory, published slugs, and observability guide.
2. [completed] Rewrite `ai-agent-observability-complete-guide.mdoc` with a focused evidence loop, signal tables, one deterministic interaction, one FAQ section, contextual links, and a checklist.
3. [completed] Pass 19 content tests, production build, diff hygiene, tracked-image inventory, FAQ count, and recommendation-dump audit.
4. [pending] Open the focused PR, verify rendered preview HTML and hosted checks, then merge only after all required checks pass.

# AI agent reliability guide refinement — 2026-08-25

1. [completed] Read the mandatory content workflow and inspect the canonical article, renderer, CSS, media inventory, published slugs, and reliability guide.
2. [completed] Rewrite `ai-agent-reliability-failures-retries-guardrails.mdoc` with a focused failure-control loop, evidence tables, one deterministic interaction, one FAQ section, contextual links, and a checklist.
3. [completed] Pass 19 content tests, production build, diff hygiene, tracked-image inventory, FAQ count, and recommendation-dump audit.
4. [pending] Open the focused PR, verify rendered preview HTML and hosted checks, then merge only after all required checks pass.

# AI agent evaluation guide refinement — 2026-08-25

1. [completed] Read the mandatory content workflow and inspect the canonical article, renderer, CSS, media inventory, published slugs, and evaluation guide.
2. [completed] Rewrite `ai-agent-evaluation-practical-guide.mdoc` with a focused evaluation loop, evidence tables, one deterministic interaction, one FAQ section, contextual links, and a checklist.
3. [completed] Pass 19 content tests, production build, diff hygiene, tracked-image inventory, FAQ count, and recommendation-dump audit.
4. [pending] Open the focused PR, verify rendered preview HTML and hosted checks, then merge only after all required checks pass.

# Production-ready AI agents article refinement — 2026-08-25

1. [completed] Read the mandatory content workflow and inspect the canonical article, renderer, CSS, media inventory, published slugs, and production-readiness article.
2. [completed] Rewrite `building-production-ready-ai-agents.mdoc` with a focused launch framework, goal/ownership/evidence/stage tables, one deterministic interaction, one FAQ section, contextual links, and a checklist.
3. [completed] Pass 19 content tests, production build, diff hygiene, tracked-image inventory, HTTP 200 image check, FAQ count, and recommendation-dump audit.
4. [pending] Open the focused PR, verify rendered preview HTML and hosted checks, then merge only after all required checks pass.

# AI agent architecture article refinement — 2026-08-25

1. [completed] Read the mandatory content workflow and inspect the canonical article, renderer, CSS, media inventory, published slugs, and architecture article.
2. [completed] Rewrite `ai-agent-architecture.mdoc` with a focused production-layer framework, boundary tables, typed decision example, one deterministic interaction, one FAQ section, contextual links, and a checklist.
3. [completed] Pass 19 content tests, production build, diff hygiene, tracked-image inventory, HTTP 200 image check, FAQ count, and recommendation-dump audit.
4. [pending] Open the focused PR, verify rendered preview HTML and hosted checks, then merge only after all required checks pass.

# LLM latency article refinement — 2026-08-25

1. [completed] Read the mandatory content workflow and inspect the canonical article, renderer, CSS, media inventory, published slugs, and latency article.
2. [completed] Rewrite `llm-latency-optimization.mdoc` with a focused latency framework, waterfall evidence, trade-off tables, one deterministic interaction, one FAQ section, contextual links, and a checklist.
3. [completed] Pass 19 content tests, production build, diff hygiene, tracked-image inventory, HTTP 200 image check, FAQ count, and recommendation-dump audit.
4. [pending] Open the focused PR, verify rendered preview HTML and hosted checks, then merge only after all required checks pass.
# Future content quality gate — 2026-08-24

- [x] Make completed launch-plan strikethrough decoration more opaque without changing completed text contrast.
- [x] Add a mandatory future-agent quality gate to the writing skill and blog publishing README covering evidence, hierarchy, interactions, links, rendering, and release checks.

## 2026-08-26 canonical blog refinement prompt

- [x] Add a reusable content-manager prompt to `docs/blog-canonical-format-playbook.md`, based on the refined AI Agent Monitoring article, for the remaining 26 published posts.
