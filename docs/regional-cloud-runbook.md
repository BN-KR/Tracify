# Regional cloud deployment and migration runbook

This runbook is the operating contract for `eu.cloud.tracify.tech` and `us.cloud.tracify.tech`. The application source is shared; all stateful services and credentials are isolated.

## Deployment inventory

The authoritative non-secret inventory is `config/regional-cloud.json`. Every cloud deployment requires its own Vercel project, Convex production deployment, Better Auth configuration, Tinybird workspace, Redis database, Inngest environment, API-key hash secret, Stripe webhook secret, and provider credentials.

The `externalReadiness` list in that inventory is a launch gate, not an informational backlog. A regional hostname must not receive production traffic while any item is `credentials-required` or `manual-action-required`.

Before a release, run:

```powershell
npm run verify:regions
npm run test:regions
npm run test:sdk:ts
npm run test:sdk:python
npm run build
```

Deploy the same verified commit to EU and US. Do not promote one region if the other region is built from a different commit. Verify `/api/health/region` returns the expected region and hostname before attaching or moving an alias.

## Environment invariants

Set `NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND=cloud`. Set both `NEXT_PUBLIC_TRACIFY_REGION` and `TRACIFY_REGION` to the deployment's region. `NEXT_PUBLIC_SITE_URL` must equal the regional origin. Startup validation intentionally fails a cloud deployment when regional or stateful-service variables are absent or inconsistent.

Better Auth `SITE_URL` and trusted origins must point to the same regional origin. OAuth applications require a callback URL for each region. Stripe requires a separately signed webhook endpoint per region. Do not reuse API-key hash secrets, webhook secrets, Tinybird tokens, Redis URLs, or Inngest signing keys across regions.

## Account and data migration

There is no automatic region switch. Schedule a migration window and stop writes to the source project before export.

1. Export the source Convex deployment with `npx convex export --deployment <source> --path <archive>.zip`.
2. Export Tinybird trace data for the project and record the final ingestion timestamp.
3. Create the destination account and project, then import only records whose ownership identifiers have been mapped to the destination Better Auth account.
4. Import trace data into the destination Tinybird workspace and verify project IDs, row counts, earliest/latest timestamps, and evaluation links.
5. Create a new destination-region API key. Never copy an API-key hash secret or plaintext key between regions.
6. Change the customer's SDK region and key together, send a canary trace, and verify it appears only in the destination.
7. Keep the source read-only for the agreed rollback window, then apply the customer's retention/deletion request.

Abort the migration if ownership mapping, row counts, timestamps, or canary isolation cannot be proven.

## Regional outage and rollback

If one region fails, keep the other region isolated; never route traffic across regions automatically because that would change the declared data location. Remove the affected region from the selector only during a confirmed onboarding outage, preserve existing account access messaging, and publish the incident on `/status`.

Rollback application code by reassigning the regional alias to the last verified deployment. A code rollback does not roll back Convex schema or data. Restore state only through the provider's tested backup procedure and record recovery point and recovery time evidence.

## Provisioned resources and handoff

- Vercel EU: `tracify-tech/tracify-cloud-eu`; Next.js preset; production and preview region/Convex settings applied.
- Vercel US: `tracify-tech/tracify-cloud-us`; Next.js preset; production and preview region/Convex settings applied.
- Convex EU: `jovial-owl-711` in `eu-west-1`; isolated runtime secrets; `/health` must report `region: eu`.
- Convex US: `flexible-anaconda-752` in `us-east-1`; isolated runtime secrets; `/health` must report `region: us`.
- Domains are attached to their matching Vercel projects. DNS remains at Domeneshop and requires A records to Vercel before certificates can issue.

Git automation is intentionally disconnected from both regional Vercel projects. Vercel classified the first branch deployment in each empty project as production even though the production branch was `main`. Those feature deployments were deleted. Reconnect `BN-KR/Tracify` only after this change is merged and all regional launch gates pass, then verify the deployed Git SHA is an ancestor of `origin/main` before assigning traffic.

Regional deploy-key files are local operator artifacts under the ignored `scratch/tracify-regional/` directory. They must never be committed. Rotate them if that directory leaves the trusted workstation. Values are also stored as sensitive Vercel environment variables for production and preview.
