# Tracify blog publishing

Blog posts are Markdoc files (`.mdoc`) in this directory. The filename is for authors; the public URL comes from the `slug` frontmatter field.

To publish a post:

1. Add or edit its `.mdoc` file.
2. Put referenced images in `public/media` and use paths such as `/media/example.jpg`.
3. Set `draft: false` and provide an ISO `publishedAt` timestamp.
4. Run `npm run test:content`, `npm run lint`, and `npm run build` before merging.

Required frontmatter fields are `title`, `slug`, `excerpt`, `publishedAt`, and `author`. `categories`, `tags`, and `relatedPosts` are string arrays. Related posts use slugs. `heroImage` accepts `src`, `alt`, and optional `card`, `hero`, `og`, and `caption` variants. SEO overrides live under `seo`.

Markdoc supports CommonMark plus Markdoc tags and annotations. The application validates every file before rendering, so malformed frontmatter or Markdoc fails the build instead of publishing a broken article.

## Mandatory Tracify editorial framework

Every published post follows the same editorial shape. This is a product requirement for the blog, not an optional style preference:

1. **Promise:** a specific title, useful excerpt, author/date metadata, and a meaningful hero image.
2. **Orientation:** open with the reader’s production situation, the decision they need to make, and the boundary of the article.
3. **Navigation:** the page automatically renders a collapsible table of contents from the article’s H2/H3 headings.
4. **Operating model:** name the article’s framework or decision model and explain its parts before diving into implementation.
5. **Evidence:** include at least one concrete example, code block, table, formula, trace, screenshot, or diagram where it improves understanding.
6. **Interaction:** include one deterministic, accessible Markdoc interaction—normally a trace scenario, evaluation explorer, calculator, checklist, or focused decision widget.
7. **Trade-offs:** state limitations, failure modes, security boundaries, and what the recommendation does not solve.
8. **Action:** close with a practical checklist, next step, or release decision and contextual links to the next Tracify guides.

Use this article rhythm for each major section:

> Point → evidence → example → trade-off → reader action

Do not satisfy the framework with decorative headings or a link dump. The content test checks the structural requirements for every published post, and the renderer supplies the shared table of contents and heading anchors automatically.

## Article archetype repertoire

Choose one primary archetype before outlining. The mandatory framework still applies, but the article's modules and pacing should match the reader's job instead of repeating one universal template.

| Archetype | Use when the reader needs to… | Core modules | Best-fit interaction |
| --- | --- | --- | --- |
| Definitive guide | Understand a system and complete a multi-step workflow | Plain-language definition, setup or model, sequential H2 steps, screenshots or diagrams, field notes, troubleshooting, FAQ | Guided checklist, trace walkthrough, or configuration explorer |
| Decision framework | Make or defend an operational choice | Metric chain, named framework, numbered stages, formulas or decision tables, worked example, limitations, operating cadence | Calculator, scenario chooser, or evaluation explorer |
| Practical library | Find and adapt a useful artifact quickly | Short starter set, adaptation framework, grouped library by role/use case, copyable examples, quality checks, navigation shortcuts | Copyable template, filter, generator, or focused sandbox |
| Implementation tutorial | Build and verify a specific capability | Prerequisites, architecture boundary, runnable steps, expected output after each step, failure cases, rollback, final verification | Sandboxed code, trace replay, or step validator |
| Comparison or benchmark | Select between approaches or interpret measured results | Explicit criteria, evidence and methodology, comparison table, scenario-based recommendations, trade-offs, conditions that change the answer | Weighted comparison, benchmark explorer, or cost/latency calculator |

Use a small repertoire of recurring editorial modules rather than a single page recipe: fast answer, named model, numbered runthrough, note or warning, code artifact, decision table, screenshot or diagram, worked example, FAQ accordion, and final action. Distribute these modules across the full article. Do not place every visual or interactive element in the opening section, and do not add a second widget when a static table or callout teaches the point better.

For a practical library, lead with a small high-value set before the long collection, teach readers how to adapt the artifacts, group entries under descriptive H2/H3 headings, and make each entry independently useful. For a long definitive guide, alternate explanation with proof—screenshots, code, tables, or field notes—so no long stretch becomes undifferentiated prose. For a decision framework, carry one example through the stages so the reader sees the framework produce a decision.

New posts must consider one purposeful interactive learning element at the point where it helps most: a trace/evaluation demo, an editable code sandbox, or a focused calculator, checklist, explorer, or scenario widget. Static prose is correct when reader-controlled state adds no value. Do not use MDX or raw JSX. Reuse an approved Markdoc tag, or add a validated tag in the centralized Markdoc configuration and map it to an accessible component in `src/components/blog/markdoc-rich-text.tsx`. Interactive examples must be deterministic and local; never execute arbitrary code on the server or access secrets or production data.
