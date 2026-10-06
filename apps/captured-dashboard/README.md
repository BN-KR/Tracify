# Captured dashboard application

## Surface

This is the isolated, public Sandbox deployment of the captured dashboard UI.
It preserves the reference-shaped routes and responsive presentation without
owning Tracify authentication, Convex data, Tinybird telemetry, or production
mutations.

## Entry points

- `app/playground/page.tsx` mounts the populated home surface.
- `app/playground/[...slug]/page.tsx` mounts all nested captured Sandbox
  surfaces.
- `app/api/health/route.ts` exposes the read-only deployment health contract.
- `scripts/verify-boundary.mjs` prevents root-app/backend dependencies from
  entering the public deployment surface.

The catch-all route has explicit compatibility aliases for the documented
dashboard families, including overview/custom dashboards, tracing/search/
comparison, costs, prompt versions, scores, evaluators, datasets,
experiments, annotation queues, settings, and legacy management paths. These
aliases intentionally resolve to a captured surface; they do not imply that a
live Build adapter exists in this public app.

Unsupported first-level paths return a real 404 instead of silently rendering
the Home surface. Record IDs and nested route segments remain accepted after a
known surface alias.

The typed in-memory Sandbox adapter lives in
`features/dashboard-workspace/sandbox-adapter.ts`. It owns capabilities and
simulated action results while keeping the captured presentation independent of
backend details. A future live adapter can implement the same contract without
adding production credentials to this public project.

Route ownership is centralized in
`features/dashboard-workspace/route-map.ts`, which is shared by the client
surface resolver and the server-side 404 gate.
- `app/playground/layout.tsx` owns the standalone shell lifecycle.

## Structure

- `components/captured-shell.tsx` owns the local sidebar, account presentation,
  mobile drawer, and shell-level browser event integration.
- `features/dashboard-workspace/contracts.ts` defines the normalized view
  model.
- `features/dashboard-workspace/sandbox-data.ts` owns deterministic fixtures.
- `features/dashboard-workspace/captured-workspace.tsx` renders the captured
  page surfaces and local interaction state.
- `features/dashboard-workspace/*.css` owns the reference-specific responsive
  geometry.

## External consumers

The isolated application has no imports from the root Tracify app. The root
application remains a separate consumer of its own captured renderer and keeps
ownership of authenticated Build routes.

## State ownership

- Fixture state is created from `sandbox-data.ts`.
- Route state is read by the captured renderer through Next navigation hooks.
- Surface filters, tabs, drawers, and simulated actions remain local to the
  mounted Sandbox view.
- No Convex, Better Auth, Tinybird, Redis, or production API state is loaded.

## Performance and stability boundaries

- Table and chart rendering remains inside the captured workspace surface.
- Mobile drawer state is owned by the shell and changes only shell navigation.
- The shell uses one browser event listener for the existing captured mobile
  menu affordance and cleans it up on unmount.
- The reference screenshot suite should run against an explicit
  `REFERENCE_BASE_URL`; the reference archive is never bundled into this app.
- Playwright-managed runs build the isolated app and use `next start` on the
  dedicated default port rather than reusing a development server. This keeps
  route-contract evidence tied to the same production output that a separate
  Vercel project would serve.

## Migration state

- Improved: Sandbox fixtures, normalized contracts, route rendering, shell
  ownership, and production static prerendering are isolated.
- Still intentionally in the root app: authenticated Build adapters, live
  mutations, Better Auth, Convex bindings, and regional cloud routing.
- Verified locally: the standalone production build and app-local Playwright
  route/interaction contract run without the root application.
- Next slice: verify the six-viewport screenshot matrix against the standalone
  build, then review a preview deployment before creating any production
  Vercel project settings.

## Deployment boundary

This directory is intended to be configured as a separate Vercel project with
Root Directory `apps/captured-dashboard`. Do not add production credentials to
this project and do not redirect the root `/playground` route until standalone
verification and an explicit deployment approval are complete.

## Local verification

Run the complete standalone check from this directory:

```text
pnpm verify
```

The command first checks the standalone dependency boundary, then type-checks
and lints only the isolated source/test directories,
builds the same production output that a nested Vercel project would build,
and runs the app-local Chromium route and interaction contract with a managed
production server. The test harness uses a dedicated port and does not reuse
an existing server. Existing unused-state warnings in the captured renderer
are allowed; generated `.next` output is intentionally outside the lint scope.

The standalone project intentionally has no live-data environment contract.
Adding Convex, Better Auth, Tinybird, Redis, or provider credentials requires a
separate adapter design and explicit approval; those systems remain owned by
the root Tracify application.

The app-local `vercel.json` provides the build contract when a Vercel project is
created with this directory as its Root Directory. It does not create a Vercel
project or alter the existing root project. Git path filtering and the separate
project URL remain external Vercel settings that must be reviewed before they
are applied.

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the reviewable project setup and
preview acceptance checklist. No Vercel project or setting is created by this
repository configuration.

The deployment health check is `GET /api/health`. It reports `mode: sandbox`,
`backend: in-memory`, and `writesEnabled: false`; it must remain a read-only
deployment check and must not be changed to probe or mutate production systems.

The route contract also rejects browser requests to external runtime origins;
the reference archive and production APIs are never loaded by this project.

The Playwright suite also includes a responsive contract covering 1440x900,
1280x800, 1024x768, 768x1024, 390x844, and 375x812. It checks shell sizing,
session-surface visibility, no-write behavior, and mobile drawer opening. These
checks are deployment safety checks; they do not replace pixel comparison with
the authoritative reference server.

Settings tabs remain route-backed in the Sandbox. For example,
`/playground/settings?tab=Members` survives a reload and keeps the Members tab
selected.
