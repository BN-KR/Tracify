import assert from "node:assert/strict";
import test from "node:test";
import { fallbackAssistantAnswer } from "./site-assistant.ts";

test("greetings get a friendly hello, not the stock block", () => {
  assert.match(fallbackAssistantAnswer("yo").answer, /^Hey!/);
  assert.match(fallbackAssistantAnswer("Hello!").answer, /^Hey!/);
});
test("off-topic questions are declined politely without citations", () => {
  const result = fallbackAssistantAnswer("how do i make a good loaf of bread");
  assert.equal(result.offTopic, true);
  assert.equal(result.citations.length, 0);
});
test("product questions still route to docs", () => {
  assert.equal(fallbackAssistantAnswer("how do I install the sdk").citations[0].href, "/docs/quickstart");
});
