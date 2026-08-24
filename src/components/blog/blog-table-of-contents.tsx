import type { BlogHeading } from "@/lib/markdoc-blog";

type BlogHeadingNode = BlogHeading & { children: BlogHeadingNode[] };

function nestHeadings(headings: BlogHeading[]) {
  const roots: BlogHeadingNode[] = [];
  let currentRoot: BlogHeadingNode | undefined;

  for (const heading of headings) {
    const node: BlogHeadingNode = { ...heading, children: [] };
    if (heading.level === 2 || !currentRoot) {
      roots.push(node);
      currentRoot = node;
    } else {
      currentRoot.children.push(node);
    }
  }

  return roots;
}

function HeadingList({ headings }: { headings: BlogHeadingNode[] }) {
  return (
    <ol>
      {headings.map((heading) => (
        <li key={heading.id} className={heading.level === 3 ? "blog-table-of-contents__subitem" : undefined}>
          <a href={`#${heading.id}`}>{heading.text}</a>
          {heading.children.length ? <HeadingList headings={heading.children} /> : null}
        </li>
      ))}
    </ol>
  );
}

export function BlogTableOfContents({ headings }: { headings: BlogHeading[] }) {
  if (headings.length < 3) return null;
  const tree = nestHeadings(headings);
  const sectionCount = tree.filter((heading) => heading.level === 2).length;

  return (
    <details className="blog-table-of-contents">
      <summary>
        <span>In this guide</span>
        <span className="blog-table-of-contents__count">{sectionCount} sections</span>
      </summary>
      <nav aria-label="Table of contents">
        <HeadingList headings={tree} />
      </nav>
    </details>
  );
}
