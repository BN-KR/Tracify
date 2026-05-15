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
