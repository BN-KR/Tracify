import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("src/app/(frontend)/blog/page.tsx", "utf8");

test("blog index uses a restrained responsive bento grid", () => {
  assert.match(source, /md:grid-cols-2/);
  assert.match(source, /lg:grid-cols-3/);
  assert.match(source, /lg:col-span-2/);
  assert.match(source, /aspect-\[16\/7\]/);
  assert.match(source, /aspect-\[16\/10\]/);
});

test("blog index keeps newsletter signup in the global footer only", () => {
  assert.doesNotMatch(source, /NewsletterCta/);
  assert.doesNotMatch(source, /Monthly dispatch/);
});
