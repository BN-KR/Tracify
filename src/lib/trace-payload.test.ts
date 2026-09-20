import { describe, expect, it } from "vitest";

import { measureTracePayload } from "./trace-payload";

describe("measureTracePayload", () => {
  it("counts duplicate messages independent of object key order", () => {
    const stats = measureTracePayload(
      JSON.stringify([
        { role: "user", content: "hello" },
        { content: "hello", role: "user" },
      ]),
      "done",
    );

    expect(stats.messageCount).toBe(2);
    expect(stats.uniqueMessageCount).toBe(1);
    expect(stats.repeatedMessageBytes).toBeGreaterThan(0);
  });

  it("does not treat ordinary JSON objects as message histories", () => {
    const stats = measureTracePayload('{"prompt":"hello"}', '{"answer":"done"}');
    expect(stats.messageCount).toBe(0);
    expect(stats.uniqueMessageCount).toBe(0);
    expect(stats.repeatedMessageBytes).toBe(0);
  });
});
