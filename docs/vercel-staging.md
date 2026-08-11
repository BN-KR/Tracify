# Vercel staging workflow

The repository uses `main` for production and `staging` for a persistent Vercel Preview environment.

## One-time Vercel setup

In the Vercel project **5to1r**:

1. Set **Production Branch** to `main`.
2. Add a Preview environment for the `staging` branch (or assign a staging domain to that branch).
3. Add the required environment variables to **Preview**. At minimum:

   - `NEXT_PUBLIC_CONVEX_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_JWT_ISSUER_DOMAIN`
   - `TRACIFY_API_KEY_HASH_SECRET`
   - `TINYBIRD_HOST`
   - `TINYBIRD_TOKEN`
   - `INNGEST_EVENT_KEY`

   Use a separate Convex/Tinybird project for staging when data isolation matters. Never commit `.env.prod`, `.env.local`, or Vercel tokens.

## Daily workflow

```bash
git switch staging
git pull --ff-only
git push origin staging
```

Each push updates the staging Preview. Review its Vercel URL or assigned staging domain. When approved, open a PR from `staging` to `main`; merging it creates the production deployment.

The current failure was caused by the Preview environment missing `NEXT_PUBLIC_CONVEX_URL`, which makes `ConvexReactClient` fail during prerendering.
