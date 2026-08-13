import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { createBlogRepository } from "./markdoc-blog.ts";

function withContentDirectory(files: Record<string, string>, run: (directory: string) => void) {
  const directory = mkdtempSync(path.join(tmpdir(), "tracify-markdoc-"));
  try {
    for (const [filename, source] of Object.entries(files)) {
      writeFileSync(path.join(directory, filename), source, "utf8");
    }
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

const firstPost = `---
title: First post
slug: first-post
excerpt: The first excerpt.
publishedAt: 2026-01-02T12:00:00.000Z
author: Tracify Team
draft: false
categories: [Engineering]
tags: [agents]
relatedPosts: [second-post]
heroImage:
  src: /media/first.jpg
  alt: First image
seo:
  metaTitle: First SEO title
---
# First heading

First paragraph.
`;

const secondPost = `---
title: Second post
slug: second-post
excerpt: The second excerpt.
publishedAt: 2026-02-03T12:00:00.000Z
author: Tracify Team
draft: false
categories: [Observability]
tags: []
relatedPosts: []
---
# Second heading
`;

const draftPost = `---
title: Draft post
slug: draft-post
excerpt: This must stay private.
publishedAt: 2026-03-04T12:00:00.000Z
author: Tracify Team
draft: true
categories: [Engineering]
tags: []
relatedPosts: []
---
# Draft heading
`;

test("published posts exclude drafts and sort newest first", () => {
  withContentDirectory(
    { "first.mdoc": firstPost, "second.mdoc": secondPost, "draft.mdoc": draftPost },
    (directory) => {
      const repository = createBlogRepository(directory);
      assert.deepEqual(
        repository.getPublishedPosts().map((post) => post.slug),
        ["second-post", "first-post"],
      );
      assert.equal(repository.getPublishedPost("draft-post"), null);
    },
  );
});

test("category filtering and options use frontmatter categories", () => {
  withContentDirectory({ "first.mdoc": firstPost, "second.mdoc": secondPost }, (directory) => {
    const repository = createBlogRepository(directory);
    assert.deepEqual(
      repository.getPublishedPosts("Engineering").map((post) => post.slug),
      ["first-post"],
    );
    assert.deepEqual(repository.getCategoryOptions(), [
      { label: "Engineering", value: "Engineering" },
      { label: "Observability", value: "Observability" },
    ]);
  });
});

test("a post exposes validated metadata and a transformed Markdoc tree", () => {
  withContentDirectory({ "first.mdoc": firstPost }, (directory) => {
    const post = createBlogRepository(directory).getPublishedPost("first-post");
    assert.ok(post);
    assert.equal(post.heroImage?.src, "/media/first.jpg");
    assert.equal(post.seo.metaTitle, "First SEO title");
    assert.equal(post.content.name, "article");
    assert.equal((post.content.children[0] as { name: string }).name, "h1");
    assert.equal(post.plainText, "First heading First paragraph.");
  });
});

test("invalid frontmatter fails with the source filename", () => {
  withContentDirectory({ "broken.mdoc": "---\ntitle: Missing fields\n---\nBody" }, (directory) => {
    assert.throws(
      () => createBlogRepository(directory).getAllPosts(),
      /broken\.mdoc: frontmatter field “slug” must be a non-empty string/,
    );
  });
});
