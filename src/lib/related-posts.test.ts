import assert from "node:assert/strict";
import test from "node:test";

import { selectRelatedPosts, type RelatedPostCandidate } from "./related-posts.ts";

function post(slug: string, publishedAt: string, categories: string[], draft = false): RelatedPostCandidate {
  return { id: slug, slug, title: slug, publishedAt, categories, draft };
}

const posts = [
  post("current", "2026-08-26T12:00:00.000Z", ["evaluation"]),
  post("curated", "2026-01-01T12:00:00.000Z", ["engineering"]),
  post("category-new", "2026-08-25T12:00:00.000Z", ["evaluation"]),
  post("category-old", "2026-08-20T12:00:00.000Z", ["evaluation"]),
  post("newest-other", "2026-08-24T12:00:00.000Z", ["operations"]),
  post("draft-match", "2026-08-27T12:00:00.000Z", ["evaluation"], true),
];

test("keeps curated posts first and fills with same-category posts", () => {
  const selected = selectRelatedPosts({
    posts,
    preferredSlugs: ["curated"],
    currentSlug: "current",
    categories: ["evaluation"],
  });
  assert.deepEqual(selected.map((item) => item.slug), ["curated", "category-new", "category-old"]);
});

test("ignores missing, duplicate, draft, and current slugs", () => {
  const selected = selectRelatedPosts({
    posts,
    preferredSlugs: ["missing", "draft-match", "current", "curated", "curated"],
    currentSlug: "current",
    categories: ["evaluation"],
  });
  assert.deepEqual(selected.map((item) => item.slug), ["curated", "category-new", "category-old"]);
});

test("fills final gaps from newest published posts", () => {
  const selected = selectRelatedPosts({
    posts,
    preferredSlugs: [],
    currentSlug: "current",
    categories: ["missing-category"],
  });
  assert.deepEqual(selected.map((item) => item.slug), ["category-new", "newest-other", "category-old"]);
});
