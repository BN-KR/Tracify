---
name: writing-tracify-content
description: Use when writing, editing, reviewing, storing, or publishing Tracify blog posts, Markdoc `.mdoc` articles, repository Markdown documentation, public product docs, tutorials, API guides, SEO metadata, or content images.
---

# Writing Tracify Content

Create useful, accurate content and place it where Tracify actually consumes it. Treat storage, publication state, and verification as part of writing.

## Workflow

### Hard length gate

Every new or materially rewritten published blog post must contain 3,000–10,000 words in its body, excluding frontmatter. This is a mandatory release gate. Do not produce or publish a 300-word or 1,000-word article. Expand with original, topic-specific explanation, evidence, examples, limitations, failure modes, security boundaries, operating guidance, FAQs, and next actions; never pad with repetition or keyword stuffing. Verify the count with the repository content contract before PR review.

1. Read `references/content-map.md` and select the destination before drafting. Never create an orphan Markdown file for a public route.
2. Inspect the product source, SDK, API, or nearby content that proves technical claims. Mark uncertain claims instead of inventing details.
3. State the reader, their job, and the outcome in one sentence. Choose the closest article archetype from the repertoire in `content/blog/README.md`, then build an outline where every section advances that outcome. Do not force every topic into the same structure.
4. For a new blog or internal document, copy the matching file from `assets/`. Preserve existing frontmatter and publication state when editing.
5. Draft using the applicable criteria in `references/quality-bar.md`. Prefer concrete explanations, runnable examples, explicit prerequisites, and honest limitations.
6. For a new or materially edited blog post, inspect published slugs and place at least two truthful links to distinct posts inside explanatory sentences. Use descriptive topic words as anchors; targets must exist and be published. Typo-only edits do not require retrofitting.
7. For a new post, read `references/interactive-content.md`. Add the one interaction that materially improves learning—trace/evaluation demo, editable code sandbox, or focused widget—or keep the article static when none helps.
8. Add meaningful image alt text. Put blog media in `public/media`; use `/media/<filename>` URLs.
9. Review the rendered result, not only the source. Verify headings, code, links, interaction accessibility, mobile readability, metadata, and draft privacy.

## Mandatory editorial framework

Every published Tracify blog post must use the Semrush-inspired editorial pattern documented in content/blog/README.md:

- Make a clear promise with title, excerpt, metadata, and hero image.
- Orient the reader in the opening: situation, job, outcome, and scope boundary.
- Use the automatic table of contents generated from H2/H3 headings.
- Select and follow one primary article archetype: definitive guide, decision framework, practical library, implementation tutorial, or comparison/benchmark.
- Name and teach a topic-specific operating model or decision framework.
- Support the explanation with evidence such as a worked example, code, table, formula, trace, screenshot, or diagram.
- Include one purposeful deterministic interaction using an approved Markdoc tag.
- Explain limitations, failure modes, security boundaries, and trade-offs.
- End with a checklist or next action plus contextual internal links.

This framework is mandatory even when the user does not mention it. The content contract test is authoritative for published posts.

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

## Mandatory future-agent quality gate

Every future content agent must complete this gate before calling a blog post finished. Treat each item as a release requirement, not a suggestion.

### Before writing

- Read `AGENTS.md`, this skill, `references/content-map.md`, `references/quality-bar.md`, and `references/interactive-content.md`.
- Inspect the current article, published slugs, product implementation, and available media before making claims or choosing examples.
- Write down the reader, their job, the promised outcome, the article boundary, the chosen article archetype, and the one interaction that earns its place.

### While writing

- Preserve frontmatter and publication state. Use CommonMark/Markdoc only; never raw JSX, MDX, fake capabilities, or unverified runnable code.
- Build visible hierarchy: H2 sections, H3 subsections, and H4 detail only when the layer helps the reader navigate. Keep the generated table of contents readable and structured.
- Use concrete evidence throughout the article: useful code, semantic tables, formulas, trace examples, screenshots, diagrams, or decision notes. A code block must be tested or clearly labeled illustrative and must teach an adaptable action.
- Add one deterministic, accessible interaction at the point of need. It must work without secrets, production data, arbitrary code execution, or a network dependency.
- Add meaningful images with descriptive alt text. Keep FAQ content in the shared accordion pattern. Use notes for rules, limits, trade-offs, and next actions instead of decorative callouts.
- For long-form posts, target 4–7 contextual internal links per 1,000 words, using descriptive anchors to existing published posts. Never use a link dump, self-link, bare URL, “click here,” or “read more.”
- End with a practical checklist or next action and three useful recommended posts when eligible targets exist.

### Before shipping

- Render the complete article and inspect it at desktop and mobile widths. Confirm no page-level horizontal overflow, no mid-word breaking, readable tables and code, visible focus states, a usable ToC, working accordions/interactions, images, links, and recommendation cards.
- Run `npm run test:content`, `npm run lint`, `npm run build`, and `git diff --check`. Re-run after any review fix.
- Audit the final diff for accidental drafts, missing assets, fabricated claims, dead links, duplicated sections, decorative modules that do not teach, and changes outside the requested scope.
- Do not open or merge a PR until the rendered behavior and all required checks are evidenced. Record any pre-existing failure separately instead of hiding it.
