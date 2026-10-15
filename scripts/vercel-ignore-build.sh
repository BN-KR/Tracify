#!/bin/bash
# Vercel Ignored Build Step: exit 0 = skip the build, exit 1 = run the build.
# Only main and staging build by default. Any other branch (PRs) is skipped
# unless the head commit message contains "[vercel preview]".
branch="${VERCEL_GIT_COMMIT_REF:-}"
message="${VERCEL_GIT_COMMIT_MESSAGE:-}"

if [[ "$branch" == "main" || "$branch" == "staging" ]]; then
  echo "Building protected branch: $branch"
  exit 1
fi

if [[ "$message" == *"[vercel preview]"* ]]; then
  echo "Building preview: commit message contains [vercel preview]"
  exit 1
fi

echo "Skipping Vercel build for branch '$branch' (add [vercel preview] to the commit message to build)"
exit 0
