import assert from "node:assert/strict";
import test from "node:test";
import { PlaywrightReporter, eventToSpan } from "../dist/index.js";

test("event contract maps browser events to ingest-compatible spans", () => {
  const span = eventToSpan({
    eventType: "network_request",
    name: "GET /api/orders",
    status: "passed",
    startedAt: "2026-08-20T10:00:00.000Z",
    durationMs: 42,
    metadata: { statusCode: 200 },
  }, { runId: "run-1", environment: "ci" });

  assert.equal(span.runId, "run-1");
  assert.equal(span.spanType, "network_request");
  assert.equal(span.latencyMs, 42);
  assert.equal(span.metadata.eventType, "network_request");
  assert.equal(span.metadata.statusCode, 200);
  assert.equal(span.input, '{"name":"GET /api/orders"}');
});

test("reporter flushes manual events and the final run event", async () => {
  const spans = [];
  const reporter = new PlaywrightReporter({ runId: "run-2", transport: (span) => spans.push(span) });
  reporter.recordBrowserAction("click submit", { selector: "button[type=submit]" });
  reporter.recordConsoleError("page error", { source: "browser" });
  await reporter.onEnd({ status: "failed" });

  assert.equal(spans.length, 3);
  assert.equal(spans[0].spanType, "browser_action");
  assert.equal(spans[1].errorMessage, "page error");
  assert.equal(spans[2].spanType, "run_end");
  assert.equal(spans[2].spanId, "run-2:run_end");
});
