# Tracify blog publishing

Blog posts are Markdoc files (`.mdoc`) in this directory. The filename is for authors; the public URL comes from the `slug` frontmatter field.

To publish a post:

1. Add or edit its `.mdoc` file.
2. Put referenced images in `public/media` and use paths such as `/media/example.jpg`.
3. Set `draft: false` and provide an ISO `publishedAt` timestamp.
4. Run `npm run test:content`, `npm run lint`, and `npm run build` before merging.

Required frontmatter fields are `title`, `slug`, `excerpt`, `publishedAt`, and `author`. `categories`, `tags`, and `relatedPosts` are string arrays. Related posts use slugs. `heroImage` accepts `src`, `alt`, and optional `card`, `hero`, `og`, and `caption` variants. SEO overrides live under `seo`.

Markdoc supports CommonMark plus Markdoc tags and annotations. The application validates every file before rendering, so malformed frontmatter or Markdoc fails the build instead of publishing a broken article.

New posts must consider one purposeful interactive learning element at the point where it helps most: a trace/evaluation demo, an editable code sandbox, or a focused calculator, checklist, explorer, or scenario widget. Static prose is correct when reader-controlled state adds no value. Do not use MDX or raw JSX. Reuse an approved Markdoc tag, or add a validated tag in the centralized Markdoc configuration and map it to an accessible component in `src/components/blog/markdoc-rich-text.tsx`. Interactive examples must be deterministic and local; never execute arbitrary code on the server or access secrets or production data.
