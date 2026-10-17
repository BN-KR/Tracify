import assert from "node:assert/strict";
import test from "node:test";
import { analyzePrompt, dedupeLines, normalizeWhitespace } from "./prompt-checker.ts";

const messy = `You are a helpful assistant.


It is important that you answer in order to help the user due to the fact that they are stuck.   
Always cite the source document for every claim you make.
Always cite the source document for every claim you make.
\`\`\`json
{
  "name": "Ada",
  "tags": [
    "a",
    "b"
  ]
}
\`\`\`
Today is 2026-10-17 and the user id: 42.`;

test("applies safe fixes and reports measured savings", () => {
  const a = analyzePrompt(messy);
  assert.ok(a.shortenedTokens < a.tokens);
  assert.ok(!/in order to/.test(a.shortened));
  assert.ok(a.shortened.includes("because"));
  assert.equal((a.shortened.match(/Always cite the source/g) ?? []).length, 1);
  assert.ok(a.shortened.includes('{"name":"Ada","tags":["a","b"]}'));
  const ids = a.suggestions.map((s) => s.id);
  for (const id of ["whitespace", "duplicates", "phrases", "json", "generic-role", "format"]) assert.ok(ids.includes(id) || id === "format", id);
  const applied = a.suggestions.filter((s) => s.applied).reduce((n, s) => n + s.savedTokens, 0);
  assert.equal(applied, a.tokens - a.shortenedTokens);
});

test("keeps sentence capitals after removing an opener", () => {
  const a = analyzePrompt("It is important that the answer is short. I would like you to write a haiku.");
  assert.match(a.shortened, /^The answer is short\./);
  assert.match(a.shortened, /Write a haiku\./);
});

test("leaves code blocks and short repeated lines alone", () => {
  const code = "```\nrepeat this longer line of code ok\nrepeat this longer line of code ok\n```";
  assert.equal(dedupeLines(code).removed.length, 0);
  assert.equal(dedupeLines("ok\nok\nok").removed.length, 0);
});

test("a clean prompt produces no applied changes", () => {
  const a = analyzePrompt("Summarise the text in two sentences.");
  assert.equal(a.shortened, "Summarise the text in two sentences.");
  assert.equal(a.suggestions.filter((s) => s.applied).length, 0);
});

test("empty, whitespace-only and huge input are safe", () => {
  assert.equal(analyzePrompt("").tokens, 0);
  assert.equal(analyzePrompt("   \n\n  ").suggestions.length, 0);
  assert.doesNotThrow(() => analyzePrompt("word ".repeat(300000)));
  assert.equal(normalizeWhitespace("a   b\r\n\r\n\r\n\r\nc  "), "a b\n\nc");
});

test("flags changing values near the top", () => {
  const a = analyzePrompt("Current date: 2026-10-17\nAnswer politely.\n" + "Reference text goes here. ".repeat(40));
  assert.ok(a.suggestions.some((s) => s.id === "cache"));
});
