import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("src/app/(frontend)/blog/page.tsx", "utf8");

test("blog index composes the journal hero, topic story and trace archive", () => {
  assert.match(source, /JournalHero/);
  assert.match(source, /TopicStory/);
  assert.match(source, /TraceArchive/);
});

test("blog index keeps newsletter signup in the global footer only", () => {
  assert.doesNotMatch(source, /NewsletterCta/);
  assert.doesNotMatch(source, /Monthly dispatch/);
});
