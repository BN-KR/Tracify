import assert from "node:assert/strict";
import test from "node:test";

import { getDoc, getDocs } from "./markdoc-docs.ts";
import { getAllPosts } from "./markdoc-blog.ts";

test("public docs load from their dedicated Markdoc repository", () => {
  const docs = getDocs();
  assert.ok(docs.length >= 9);
  assert.equal(getDoc("quickstart")?.title, "Start with your first trace");
  assert.equal(getDoc("missing"), null);
  assert.ok(docs.every((doc) => !getAllPosts().some((post) => post.slug === doc.slug)));
});
