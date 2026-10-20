import assert from "node:assert/strict";
import test from "node:test";
import { buildOpenAiBody, friendlyOpenAiError, providerForKey } from "./openai-chat.ts";

test("reasoning models drop temperature and use the completion cap", () => {
  const body = buildOpenAiBody("gpt-5.6-luna", [], { temperature: 0.2, maxOutputTokens: 100 });
  assert.equal(body.temperature, undefined);
  assert.equal(body.max_completion_tokens, 100);
  assert.equal(body.reasoning_effort, "low");
});
test("classic models keep temperature", () => {
  const body = buildOpenAiBody("gpt-4o-mini", [], { temperature: 0.2, maxOutputTokens: 100 });
  assert.equal(body.temperature, 0.2);
  assert.equal(body.max_tokens, 100);
  assert.equal(body.reasoning_effort, undefined);
});
test("rate limit and credit errors read plainly", () => {
  assert.match(friendlyOpenAiError(429, "Rate limit reached"), /50 per day/);
  assert.match(friendlyOpenAiError(429, "You exceeded your current quota"), /out of credit/);
});
test("key prefix picks provider", () => {
  assert.equal(providerForKey("sk-ant-abc"), "anthropic");
  assert.equal(providerForKey("sk-proj-abc"), "openai");
});
