# Implementation Plan - Vercel Build Recovery

## Objective
Make the app build reliably on Vercel and locally without requiring an interactive Convex deploy during the Next.js build.

## Current Phase
- [x] Reproduce the non-interactive build failure from `npx convex deploy`.
- [x] Change `npm run build` to run `next build` only.
- [x] Add a separate `npm run deploy:convex` command for explicit Convex deployments.
- [x] Stop ignoring `convex/_generated` so generated Convex bindings are available in Vercel.
- [x] Fix TypeScript blockers found by `next build`.
- [x] Verify `npm run build` passes.
- [x] Push fix commit `c24be95` to `origin/main`.
- [x] Apply `.env.prod` values to Vercel production.
- [x] Deploy production and verify Vercel Ready status.
- [x] Diagnose production 500 as invalid Clerk publishable key from `.env.prod` placeholder values.
- [x] Temporarily overwrite Vercel production with non-placeholder `.env.local` test/dev values.
- [x] Redeploy production and verify Ready status plus no recent 500 logs.
- [x] Update Vercel production with live Clerk keys.
- [x] Update ignored local `.env.prod` with live Clerk entries.
- [x] Redeploy production and verify Ready status.
- [x] Update Vercel production and ignored `.env.prod` with production Convex URLs.
- [x] Make Convex auth config read `CLERK_JWT_ISSUER_DOMAIN` with local dev fallback.
- [x] Set production Clerk issuer and API-key hash secret in Convex prod.
- [x] Deploy Convex functions to `focused-otter-289`.
- [x] Redeploy Vercel production and verify Ready status/no recent 500 logs.

## Scope Boundaries
- Do not redesign dashboard or onboarding UI.
- Do not build trace viewer, runs list, costs, or alerts.
- Do not change production environment secrets in source control.

## Next Steps
- Clean up existing lint issues in a separate quality pass.
- Document the final Convex deploy-key workflow once production deployment credentials are confirmed.
- Replace temporary Inngest/webhook Vercel production values with real production secrets.
- Confirm Tinybird production workspace/token status.
- Keep `.env.prod` clearly marked as a template or replace placeholder entries with non-secret setup notes.

---

# Implementation Plan - Login and Dashboard Redirect Fix

## Objective
Keep the authenticated user flow simple: landing -> sign-in -> dashboard, with onboarding accessible from the dashboard shell instead of being the default redirect.

## Current Phase
- [x] Redirect Clerk sign-in/sign-up back to `/dashboard`.
- [x] Stop `/dashboard` from redirecting into onboarding.
- [x] Add a dashboard shell onboarding button for explicit quickstart re-entry.

## Scope Boundaries
- Do not modify the landing page.
- Do not build trace viewer, runs list, cost dashboard, or alerts.
- Keep the change navigation-only.

## Next Steps
- If needed, decide whether the dashboard onboarding button should become context-aware later.
- Revisit build/type issues in unrelated Convex code separately.

---

# Implementation Plan - Convex Sync Recovery

## Objective
Keep the deployment syncable despite legacy data so public Convex functions register and the app can create projects again.

## Current Phase
- [x] Make `agentRuns.createdAt` backward compatible for legacy rows.
- [x] Keep new run writes populating `createdAt`.
- [x] Restore `npx convex dev` sync to a healthy state.

## Scope Boundaries
- Do not build trace viewer, runs list, cost dashboard, or landing page changes.
- Do not change onboarding UX or dashboard navigation for this fix.

## Next Steps
- If needed, backfill legacy `agentRuns.createdAt` values later through a dedicated migration.

---

# Previous Implementation Plan - Onboarding Convex Error Fix

## Objective
Fix the "Could not find public function for 'projects:createProject'" error by ensuring the Convex mutation is correctly exported, registered, and matches the expected fields and types (identity subject, numeric timestamps).

## Current Phase
- [x] Update `convex/schema.ts` to support numeric timestamps and flexible legacy fields (optional fields).
- [x] Update `convex/projects.ts` to use `identity.subject` for `clerkUserId` and `Date.now()` for timestamps.
- [x] Update `convex/projects.ts` to ensure `createProject` is correctly exported as a public mutation.
- [x] Update `src/app/api/ingest/route.ts` to use numeric timestamps for `markApiKeyUsed`.
- [x] Update `convex/agentRuns.ts` to use `identity.subject` for project access checks.
- [x] Successfully run `npx convex dev --once` to verify function registration and schema validation.
- [x] Verify frontend `project-step.tsx` and `CreateProjectModal.tsx` use the correct generated `api.projects.createProject` reference.

## Scope Boundaries
- Do not redesign onboarding UI.
- Do not build full trace viewer or other deferred surfaces.
- Do not change existing landing page or dashboard shell logic.

## Next Steps
- Verify onboarding flow end-to-end in the browser.
- Monitor for any other registration issues in the Convex dashboard.
