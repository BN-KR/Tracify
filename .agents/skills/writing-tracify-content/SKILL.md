---
name: writing-tracify-content
description: Use when writing, editing, reviewing, storing, or publishing Tracify blog posts, Markdoc `.mdoc` articles, repository Markdown documentation, public product docs, tutorials, API guides, SEO metadata, or content images.
---

# Writing Tracify Content

Create useful, accurate content and place it where Tracify actually consumes it. Treat storage, publication state, and verification as part of writing.

## Workflow

1. Read `references/content-map.md` and select the destination before drafting. Never create an orphan Markdown file for a public route.
2. Inspect the product source, SDK, API, or nearby content that proves technical claims. Mark uncertain claims instead of inventing details.
3. State the reader, their job, and the outcome in one sentence. Build an outline where every section advances that outcome.
4. For a new blog or internal document, copy the matching file from `assets/`. Preserve existing frontmatter and publication state when editing.
5. Draft using the applicable criteria in `references/quality-bar.md`. Prefer concrete explanations, runnable examples, explicit prerequisites, and honest limitations.
6. For a new or materially edited blog post, inspect published slugs and place at least two truthful links to distinct posts inside explanatory sentences. Use descriptive topic words as anchors; targets must exist and be published. Typo-only edits do not require retrofitting.
7. For a new post, read `references/interactive-content.md`. Add the one interaction that materially improves learning—trace/evaluation demo, editable code sandbox, or focused widget—or keep the article static when none helps.
8. Add meaningful image alt text. Put blog media in `public/media`; use `/media/<filename>` URLs.
9. Review the rendered result, not only the source. Verify headings, code, links, interaction accessibility, mobile readability, metadata, and draft privacy.

## Content Contract

| Content                   | Source                        | Required finish                                                         |
| ------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| Public blog               | `content/blog/*.mdoc`         | Valid frontmatter, focused article, SEO, `draft` preserved              |
| Internal engineering docs | `docs/**/*.md`                | Clear scope, current commands/paths, maintenance owner/context          |
| Public `/docs`            | `content/docs/*.mdoc` through the dedicated docs repository | Keep docs separate from `content/blog/*.mdoc`; update the loader/routes and render the affected route |
| Blog images               | `public/media/*`              | Optimized dimensions, descriptive filename and alt text                 |

## Non-negotiable Rules

- Keep blog bodies in CommonMark/Markdoc, never MDX or raw JSX.
- Implement interactive content only as centralized, validated Markdoc tags with mapped React components; never add one-off route parsing or unsafe server-side code execution.
- Keep `draft: true` private. Change it only when the user explicitly requests publication.
- Never fabricate customers, benchmarks, compatibility, security posture, roadmap dates, or product behavior.
- Never present code as runnable until checked against the current implementation and package names.
- Keep one canonical source for each fact; link instead of duplicating volatile procedures across files.
- Put internal links in natural prose. Never use `click here`, `read more`, `Related guide`, a bare URL, a self-link, or a draft/missing target.
- Preserve Tracify terminology and lowercase product name where the surrounding copy uses it.

## Verification

For blog changes, run:

```powershell
npm run test:content
npm run build
```

For internal Markdown, run relevant commands/examples and `git diff --check`. For public docs, also inspect the actual `/docs` route and affected slug in a browser. Report any pre-existing verification failure separately.
