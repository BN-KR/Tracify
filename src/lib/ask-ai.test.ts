import assert from "node:assert/strict";
import test from "node:test";
import { buildDigest, quickAnswer, redactSecrets, resolveCitations, type AskSpan } from "./ask-ai.ts";

const spans: AskSpan[] = [
  { spanId: "a", spanType: "llm", modelId: "gpt-x", createdAt: "2026-01-01 10:00:00", latencyMs: 900, costUsd: 0.02, input: "hi tracify_sk_live_abc123 me@x.com" },
  { spanId: "b", parentSpanId: "a", spanType: "tool", toolName: "search", createdAt: "2026-01-01 10:00:01", latencyMs: 4000, costUsd: 0 },
  { spanId: "c", spanType: "tool", toolName: "send_email", createdAt: "2026-01-01 10:00:05", latencyMs: 50, errorType: "Timeout", errorMessage: "smtp down", timedOut: true },
];

test("redacts keys and emails", () => {
  assert.equal(redactSecrets("k tracify_sk_live_abc and a@b.io"), "k [redacted-key] and [redacted-email]");
});
test("digest labels steps and hides secrets", () => {
  const digest = buildDigest(spans);
  assert.match(digest, /s1 llm/);
  assert.match(digest, /parent=s1/);
  assert.match(digest, /FAILED Timeout/);
  assert.doesNotMatch(digest, /tracify_sk_live_abc123|me@x\.com/);
});
test("citations map back to step ids and ignore unknown labels", () => {
  const result = resolveCitations("Failed at [s3] and [s9] and [s3].", spans);
  assert.deepEqual(result.stepIds, ["c"]);
});
test("quick answers cover failures, slowness, cost", () => {
  assert.deepEqual(quickAnswer("What went wrong?", spans)?.stepIds, ["c"]);
  assert.equal(quickAnswer("which step was slowest", spans)?.stepIds[0], "b");
  assert.equal(quickAnswer("where did the cost come from", spans)?.stepIds[0], "a");
  assert.equal(quickAnswer("tell me a joke", spans), null);
});
