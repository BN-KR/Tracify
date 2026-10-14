import { stepKind } from "../components/dashboard/tracing/format";

export type FlowStep = { id: string; parentSpanId?: string; name: string; type: string; startedAt: number; latencyMs: number; costUsd: number; failed: boolean };
export type FlowNode = { key: string; name: string; type: string; spanIds: string[]; failed: number; latencyMs: number; costUsd: number; children: FlowNode[]; depth: number };
export type FlowEdge = { id: string; source: string; target: string; count: number; back?: number; errors: number; traces: number; latencies: number[] };
export const flowEdgeId = (source: string, target: string) => JSON.stringify([source, target]);
export const flowPairId = (source: string, target: string) => JSON.stringify([source, target].sort());
export const median = (values: number[]) => values.length ? [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]! : 0;
export const flowNodeWidth = (type: string) => type === "__start__" || type === "__end__" ? 120 : ["tool", "model"].includes(stepKind(type)) ? 190 : 205;

/** One return pair is one selectable arrow, with the union of its traces rather than their sum. */
export function collapseFlowReturns(nodes: Array<{ key: string }>, input: FlowEdge[], pairs?: Map<string, number>) {
  const edges = new Map(input.map((edge) => [flowEdgeId(edge.source, edge.target), { ...edge }]));
  const order = new Map(nodes.map((node, index) => [node.key, index]));
  for (const edge of [...edges.values()]) {
    const reverse = edges.get(flowEdgeId(edge.target, edge.source));
    if (!reverse || !edges.has(edge.id) || edge.source === edge.target) continue;
    const [keep, drop] = (order.get(edge.source) ?? 0) <= (order.get(reverse.source) ?? 0) ? [edge, reverse] : [reverse, edge];
    keep.back = drop.count;
    keep.errors += drop.errors;
    keep.latencies = [...keep.latencies, ...drop.latencies];
    keep.traces = pairs?.get(flowPairId(keep.source, keep.target)) ?? 1;
    edges.delete(drop.id);
  }
  return [...edges.values()];
}

/** Shared Flow rules for one trace and server aggregation: parent-aware first-seen order, callers and returns. */
export function flowGraph(steps: FlowStep[], collapseReturns = true) {
  const byId = new Map(steps.map((step) => [step.id, step]));
  const children = new Map<string, FlowStep[]>();
  for (const step of byId.values()) {
    const parent = step.parentSpanId && byId.has(step.parentSpanId) ? step.parentSpanId : "";
    const list = children.get(parent) ?? []; list.push(step); children.set(parent, list);
  }
  const sort = (list: FlowStep[]) => list.sort((a, b) => a.startedAt - b.startedAt || a.id.localeCompare(b.id));
  for (const list of children.values()) sort(list);
  const ordered: FlowStep[] = [], visited = new Set<string>();
  const visit = (roots: FlowStep[]) => {
    const stack = [...roots].reverse();
    while (stack.length) {
      const step = stack.pop()!;
      if (visited.has(step.id)) continue;
      visited.add(step.id); ordered.push(step);
      stack.push(...[...(children.get(step.id) ?? [])].reverse());
    }
  };
  visit(children.get("") ?? []);
  visit(sort([...byId.values()])); // Malformed/cyclic parent references must not hide steps.
  const nodes = new Map<string, FlowNode>(), edges = new Map<string, FlowEdge>();
  const durations = new Map<string, number[]>();
  const marker = (key: string, name: string): FlowNode => ({ key, name, type: key, spanIds: [], failed: 0, latencyMs: 0, costUsd: 0, children: [], depth: 0 });
  const link = (source: string, target: string, step?: FlowStep) => {
    const id = flowEdgeId(source, target);
    const edge = edges.get(id) ?? { id, source, target, count: 0, errors: 0, traces: 1, latencies: [] };
    edge.count++; edge.errors += step?.failed ? 1 : 0;
    edge.latencies.push(Number(step?.latencyMs ?? 0)); edges.set(id, edge);
  };
  nodes.set("__start__", marker("__start__", "start"));
  let previous = "__start__", caller = previous;
  for (const step of ordered) {
    const type = stepKind(step.type), key = `${type}:${step.name}`;
    const node = nodes.get(key) ?? { key, name: step.name, type, spanIds: [], failed: 0, latencyMs: 0, costUsd: 0, children: [], depth: 0 };
    node.spanIds.push(step.id); node.failed += step.failed ? 1 : 0; node.costUsd += Number(step.costUsd || 0);
    nodes.set(key, node);
    const times = durations.get(key) ?? []; times.push(Number(step.latencyMs || 0)); durations.set(key, times);
    const tool = ["tool", "retrieval"].includes(type);
    const previousTool = ["tool", "retrieval"].includes(nodes.get(previous)?.type ?? "");
    const source = tool && previousTool ? caller : previous;
    if (source !== key) link(source, key, step);
    previous = key; if (!tool) caller = key;
  }
  for (const [key, values] of durations) nodes.get(key)!.latencyMs = median(values);
  nodes.set("__end__", marker("__end__", "end"));
  if (ordered.length) link(previous, "__end__");
  const items = [...nodes.values()];
  return { items, edges: collapseReturns ? collapseFlowReturns(items, [...edges.values()]) : [...edges.values()] };
}

/** Shared arrow presentation: downwards cards, two heads for returns, dashed genuine back edges, red failures. */
export function flowEdgePresentation(edge: Pick<FlowEdge, "count" | "back" | "errors">, loop: boolean) {
  const color = edge.errors ? "#FF6B6B" : loop ? "#6B7380" : "#4A5260";
  const count = edge.back ? edge.back === edge.count ? `${edge.count}× ⇅` : `${edge.count}↓ ${edge.back}↑` : edge.count > 1 ? `${edge.count}×` : "";
  const marker = { type: "arrowclosed" as const, color, width: 12, height: 12 };
  return {
    type: loop ? "smoothstep" : "straight",
    pathOptions: { borderRadius: 0 },
    sourceHandle: loop ? "out-right" : "out-bottom", targetHandle: loop ? "in-right" : "in-top-center",
    label: [count, edge.errors ? `${edge.errors} failed` : ""].filter(Boolean).join(" · ") || undefined,
    labelStyle: { fill: edge.errors ? "#FF8A8A" : "#C9CED6", fontSize: 10, fontFamily: "var(--font-geist-mono), monospace" },
    labelBgStyle: { fill: "#0E1115", fillOpacity: 0.95 }, labelBgPadding: [4, 2] as [number, number],
    style: { stroke: color, strokeWidth: 1.5, strokeDasharray: loop ? "4 3" : undefined },
    markerEnd: marker, markerStart: edge.back ? marker : undefined,
  };
}
