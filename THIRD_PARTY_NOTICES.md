# Third-Party Notices

This project incorporates code adapted from third-party open-source software.
Each entry below lists the original project, its license, and which files here
were adapted from it. Per-file provenance is also noted in a header comment at
the top of each adapted file.

## Langfuse

- **Project:** [langfuse/langfuse](https://github.com/langfuse/langfuse)
- **License:** MIT
- **Copyright:** Copyright (c) Langfuse GmbH / Finto Technologies Inc.
- **Scope of this notice:** only files under `langfuse/langfuse`'s MIT-licensed
  tree were used. Code under `ee/`, `web/src/ee/`, and `worker/src/ee/` in that
  repository is separately licensed under the Langfuse Enterprise License and
  was **not** used, viewed as a source for copying, or adapted in any form here.

Files in this repository adapted from Langfuse:

| File in this repo | Adapted from (Langfuse path) |
|---|---|
| `src/lib/langfuse-ports/treeBuilding.ts` | `web/src/features/traces/fns/treeBuilding.ts` |
| `src/lib/langfuse-ports/flattenTree.ts` | `web/src/features/traces/fns/flattenTree.ts` |
| `src/lib/langfuse-ports/filterTransform.ts` | `web/src/features/filters/lib/filter-transform.ts` |
| `src/lib/langfuse-ports/facetDisplay.ts` | `web/src/features/filters/lib/facet-display.ts` |
| `src/lib/langfuse-ports/searchRank.ts` | `web/src/features/search-bar/lib/rank.ts` |
| `src/lib/langfuse-ports/aggregateScores.ts` | `web/src/features/scores/lib/aggregateScores.ts` |
| `src/lib/langfuse-ports/mergeScoresWithCache.ts` | `web/src/features/scores/lib/mergeScoresWithCache.ts` |

Each of these files was adapted (not copied verbatim): type shapes were
rewritten to match this project's Convex schema (`convex/schema.ts`) instead
of Langfuse's Prisma/Clickhouse/tRPC types. The core algorithms (iterative
tree building, tree flattening for virtualization, filter column remapping,
facet summary formatting, score aggregation and cache-merge logic) originate
from Langfuse and are reproduced here under the terms of the MIT License:

```
MIT License

Copyright (c) Langfuse GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See `langfuse-reuse-assessment.md` at the repo root for the full reuse
feasibility analysis this port was scoped from.
