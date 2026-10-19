import assert from "node:assert/strict";
import test from "node:test";
import { currentFor, queueStats, traceDigest, type QueueItem } from "./review-utils.ts";

test("the digest takes the root step's question and answer", () => {
  const d = traceDigest([{ parentSpanId: "r", input: "inner in", output: "inner out", modelId: "gpt-4o", costUsd: 0.1 }, { parentSpanId: "", input: " hello ", output: "world", latencyMs: 300, costUsd: 0.2 }]);
  assert.equal(d.input, "hello"); assert.equal(d.output, "world"); assert.equal(d.model, "gpt-4o"); assert.equal(d.steps, 2); assert.equal(d.latencyMs, 300); assert.ok(Math.abs(d.costUsd - 0.3) < 1e-9);
});

test("without a root answer it falls back to the last step that produced text and ignores stream chunks", () => {
  const d = traceDigest([{ parentSpanId: "", input: "q" }, { parentSpanId: "x", output: "first" }, { parentSpanId: "x", output: "last" }, { parentSpanId: "x", output: "chunk", isStreamChunk: true }]);
  assert.equal(d.output, "last"); assert.equal(d.steps, 3);
});

test("errors are reported and very long text is cut", () => {
  assert.equal(traceDigest([{ errorMessage: "timeout" }]).error, "timeout");
  assert.equal(traceDigest([{ errorType: "RateLimit" }]).error, "RateLimit");
  assert.ok(traceDigest([{ input: "x".repeat(7000) }]).input.includes("more characters"));
  assert.deepEqual(traceDigest([]), { input: "", output: "", error: "", model: "", steps: 0, costUsd: 0, latencyMs: 0 });
});

const items: QueueItem[] = [
  { _id: "1", status: "in_review", assignee: "me", createdAt: 5 }, { _id: "2", status: "in_review", assignee: "me", createdAt: 2 },
  { _id: "3", status: "in_review", assignee: "you", createdAt: 1 }, { _id: "4", status: "queued", createdAt: 3 },
  { _id: "5", status: "completed", createdAt: 4, completedAt: 1_000_000 }, { _id: "6", status: "completed", createdAt: 4, completedAt: 100 },
];

test("current is my oldest item in review and never someone else's", () => {
  assert.equal(currentFor(items, "me")?._id, "2");
  assert.equal(currentFor(items, "nobody"), null);
  assert.equal(currentFor(items, undefined), null);
});

test("stats split the line into waiting, mine, others and done", () => {
  const s = queueStats(items, "me", 1_000_100);
  assert.deepEqual({ waiting: s.waiting, mine: s.mine, others: s.others, done: s.done, doneToday: s.doneToday, total: s.total }, { waiting: 1, mine: 2, others: 1, done: 2, doneToday: 2, total: 6 });
  assert.equal(queueStats([], "me", 0).share, 0);
});
