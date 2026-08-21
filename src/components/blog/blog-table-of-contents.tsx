import type { BlogHeading } from "@/lib/markdoc-blog";

export function BlogTableOfContents({ headings }: { headings: BlogHeading[] }) {
  if (headings.length < 3) return null;

  return (
    <details className="blog-table-of-contents" open>
      <summary>In this guide</summary>
      <nav aria-label="Table of contents">
        <ol>
          {headings.map((heading) => (
            <li key={heading.id} className={heading.level === 3 ? "blog-table-of-contents__subitem" : undefined}>
              <a href={`#${heading.id}`}>{heading.text}</a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
