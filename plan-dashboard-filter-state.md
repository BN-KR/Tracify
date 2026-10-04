# Dashboard tracing filter-state improvement plan

## Decision
Preserve the canonical pathname when the tracing surface updates filter, search, view, preset, page, and column URL state.

## Evidence
In `src/features/dashboard-workspace/components/captured-workspace.tsx`, `TracingSurface` calls `router.replace(\`?\${next.toString()}\`)` twice, while the parent workspace already uses the pathname-prefixed pattern. The tracing path therefore drops the route segment when updating state, which breaks shared and reloaded filter URLs.

## Scope
- Update the two tracing URL updates to the pathname-prefixed pattern with a clean empty-query case.
- Add focused regression assertions in `tests/e2e/account-access-contract.spec.ts` that existing query parameters survive tracing filter, search, and view updates and that the pathname is preserved.
- No Convex schema changes, no fixture replacement, no billing, deployment, or destructive data action.

## Verification gates
- ESLint on changed files.
- TypeScript.
- Focused browser test with a hard 60-second timeout, terminated if it hangs.
- Production build.
- Diff and secret review.

## Provider roles
- Codex GPT-5.6 Luna: implementation.
- Claude Sonnet: review.
- Antigravity: visual/responsive review.
- OpenCode: regression review.
