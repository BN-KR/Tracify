import { describe, expect, it } from "vitest";
import { criticalPath, type CriticalPathSpan } from "./trace-critical-path";

const span = (spanId: string, startMs: number, latencyMs: number, parentSpanId = ""): CriticalPathSpan => ({
  spanId, parentSpanId, spanType: "tool_call", label: spanId, startMs, latencyMs, costUsd: 0,
});

describe("criticalPath", () => {
  it("returns an empty result for no spans", () => {
    expect(criticalPath([])).toMatchObject({ wallClockMs: 0, path: [], parallelism: 0 });
  });

  it("follows a serial chain and reports waiting time between steps", () => {
    const result = criticalPath([span("a", 0, 100), span("b", 150, 200), span("c", 400, 100)]);
    expect(result.path.map((s) => s.spanId)).toEqual(["a", "b", "c"]);
    expect(result.wallClockMs).toBe(500);
    expect(result.busyMs).toBe(400);
    expect(result.idleMs).toBe(100);
  });

  it("skips the shorter of two parallel spans", () => {
    const result = criticalPath([span("start", 0, 50), span("slow", 50, 300), span("fast", 50, 100), span("end", 350, 50)]);
    expect(result.path.map((s) => s.spanId)).toEqual(["start", "slow", "end"]);
    expect(result.pathSpanIds.has("fast")).toBe(false);
    expect(result.parallelism).toBeGreaterThan(1);
  });

  it("ignores spans that only wrap other spans", () => {
    const result = criticalPath([span("root", 0, 500), span("a", 0, 200, "root"), span("b", 200, 300, "root")]);
    expect(result.path.map((s) => s.spanId)).toEqual(["a", "b"]);
  });

  it("ranks bottlenecks by duration with their share of the run", () => {
    const result = criticalPath([span("a", 0, 100), span("b", 100, 300), span("c", 400, 100)]);
    expect(result.bottlenecks[0]).toMatchObject({ spanId: "b", share: 0.6 });
  });
});
