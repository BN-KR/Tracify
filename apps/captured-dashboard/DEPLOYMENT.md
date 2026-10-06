# Separate Vercel deployment handoff

This directory is the source boundary for a separate public Sandbox project.
It is additive: the root Tracify application continues to own authenticated
Build routes, Better Auth, Convex, Tinybird, Redis, production mutations, and
regional routing.

## Proposed Vercel project

Create a new Vercel project connected to the existing Tracify repository with:

```text
Root Directory: apps/captured-dashboard
Framework Preset: Next.js
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm build
Output Directory: default
Production Environment Variables: none initially
Preview Environment Variables: none initially
```

The app-local `vercel.json` contains the framework, install, and build
contract. The Root Directory, project URL, domain, Git path filtering, and
deployment settings are Vercel project settings and must be applied only after
explicit approval.

## Pre-preview checklist

Run from this directory:

```text
pnpm verify
pnpm pack --dry-run --json
```

The first command must pass the dependency-boundary scan, TypeScript, source
lint, production build, responsive checks, route/interaction checks, health
endpoint, and no-write/no-external-origin contracts. The second command must
contain only standalone source/configuration files and must not include
`node_modules`, `.next`, screenshots, temporary files, root Tracify source, or
production credentials.

After a preview is created, verify `GET /api/health` returns:

```json
{
  "status": "ok",
  "mode": "sandbox",
  "backend": "in-memory",
  "writesEnabled": false
}
```

Then verify the six responsive viewports and confirm that browser traffic stays
on the preview origin. Do not redirect `/playground` or any `/dashboard` route
until the preview has been reviewed and accepted.

## Explicit non-goals for the first deployment

- Do not add Better Auth or Clerk credentials.
- Do not add Convex, Tinybird, Redis, Stripe, or provider credentials.
- Do not connect Sandbox actions to production APIs.
- Do not move root dashboard files into this directory.
- Do not replace the root Tracify dashboard routes.
- Do not deploy the private reference archive or load it at runtime.

An authenticated live Build deployment is a later adapter project. It requires
separate decisions about hostname cookies, callback URLs, Convex issuer and
audience configuration, project authorization, regional routing, and live
mutation ownership.
