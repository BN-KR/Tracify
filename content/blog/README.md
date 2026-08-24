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

## Future-agent quality gate

Agents editing blog content must follow this sequence and leave evidence for each stage:

1. **Understand:** read `AGENTS.md`, the writing skill and its three references; inspect the current post, product source, published slugs, and media; state the reader job, outcome, boundary, archetype, and interaction.
2. **Build:** preserve frontmatter and draft state; write Markdoc with layered H2/H3/H4 headings, useful evidence, tested or honestly labeled code, meaningful images, semantic tables, accessible accordion FAQs, decision notes, and one deterministic interaction.
3. **Connect:** add 4–7 descriptive contextual links per 1,000 words for long-form posts, link only to existing published posts, finish with a checklist or next action, and include three eligible recommended posts.
4. **Inspect:** render the entire page on desktop and mobile. Check the ToC, heading anchors, interactions, tables, code, images, links, recommendation cards, focus states, word wrapping, and page-level overflow.
5. **Release:** run `npm run test:content`, `npm run lint`, `npm run build`, and `git diff --check`; review the exact diff for scope, drafts, fabricated claims, dead links, and untested examples before creating or merging the PR.

If an item cannot be verified, the post is not finished. Explain the blocker or fix it before shipping.

New posts must consider one purposeful interactive learning element at the point where it helps most: a trace/evaluation demo, an editable code sandbox, or a focused calculator, checklist, explorer, or scenario widget. Static prose is correct when reader-controlled state adds no value. Do not use MDX or raw JSX. Reuse an approved Markdoc tag, or add a validated tag in the centralized Markdoc configuration and map it to an accessible component in `src/components/blog/markdoc-rich-text.tsx`. Interactive examples must be deterministic and local; never execute arbitrary code on the server or access secrets or production data.
