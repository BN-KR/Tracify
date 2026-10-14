import { describe, expect, it } from "vitest";
import { flowGraph, flowPairId, collapseFlowReturns, flowEdgePresentation, median, type FlowStep } from "./trace-flow";
import { formatDuration } from "../components/dashboard/tracing/format";

const step = (id: string, type: string, name: string, time: number, parentSpanId = "", failed = false): FlowStep => ({ id, type, name, parentSpanId, startedAt: time, latencyMs: time + 100, costUsd: 0, failed });

describe("shared trace Flow", () => {
  it("normalizes SDK types, groups repeated calls and computes their exact median", () => {
    const flow = flowGraph([step("1", "tool_call", "search", 0), step("2", "tool", "search", 100), step("3", "tool_call", "search", 200)]);
    expect(flow.items.map(n => n.key)).toEqual(["__start__", "tool:search", "__end__"]);
    expect(flow.items[1]).toMatchObject({ spanIds: ["1", "2", "3"], latencyMs: 200 });
  });
  it("hangs consecutive tools from their caller and collapses returns into two heads", () => {
    const flow = flowGraph([step("1", "llm_call", "think", 0), step("2", "tool_call", "a", 100), step("3", "tool_call", "b", 200, "", true), step("4", "llm", "think", 300)]);
    expect(flow.edges.some(e => e.source === "tool:a" && e.target === "tool:b")).toBe(false);
    const pair = flow.edges.find(e => e.source === "llm:think" && e.target === "tool:b")!;
    expect(pair).toMatchObject({ count: 1, back: 1, traces: 1, errors: 1 });
    expect(flowEdgePresentation(pair, false)).toMatchObject({ label: "1× ⇅ · 1 failed", style: { stroke: "#FF6B6B" }, markerStart: { type: "arrowclosed" } });
  });
  it("keeps each run independent and unions bidirectional trace counts", () => {
    const raw = flowGraph([step("1", "llm", "think", 0), step("2", "tool", "a", 1), step("3", "llm", "think", 2)], false);
    const pair = collapseFlowReturns(raw.items, raw.edges.map(e => ({ ...e, count: e.count * 2, traces: 2 })), new Map([[flowPairId("llm:think", "tool:a"), 2]]));
    expect(pair.find(e => e.source === "llm:think" && e.target === "tool:a")).toMatchObject({ count: 2, back: 2, traces: 2 });
    expect(flowGraph([step("isolated", "tool", "b", 0)]).edges.some(e => e.source === "tool:a")).toBe(false);
  });
  it("visits parent subtrees in first-seen order and tolerates malformed parent cycles", () => {
    const flow = flowGraph([step("c", "tool", "c", 2, "r"), step("r", "agent", "r", 0), step("a", "tool", "a", 1, "r"), step("x", "agent", "x", 3, "y"), step("y", "agent", "y", 4, "x")]);
    expect(flow.items.map(n => n.name)).toEqual(["start", "r", "a", "c", "x", "y", "end"]);
  });
  it("uses dashed genuine back edges, and stable upper medians", () => {
    expect(flowEdgePresentation({ count: 3, errors: 0 }, true).style.strokeDasharray).toBe("4 3");
    expect(median([400, 100, 200, 300])).toBe(300);
  });
});

describe("long duration labels", () => {
  it("shows days/hours and hours/minutes rather than thousands of minutes", () => {
    expect(formatDuration(49 * 3600000)).toBe("2d 1h");
    expect(formatDuration((3 * 60 + 12) * 60000)).toBe("3h 12m");
    expect(formatDuration(3599999)).toBe("59m 59s");
  });
});
