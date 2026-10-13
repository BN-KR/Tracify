"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import type { SpanTreeNode } from "@/lib/tracify-ports/treeBuilding";
import { compactNumber, formatCost, formatDuration } from "./format";

/** The span fields the timeline and graph need; the panel's Span type satisfies it. */
export type ViewSpan = {
  spanId: string; spanType: string; latencyMs: number; costUsd: number; inputTokens?: number; outputTokens?: number;
  errorType?: string;
};

/** Step colours, the same as the type badges in the tree. Failed steps are always red. */
const TYPE_FILL: Record<string, string> = {
  llm: "#F4D44D", generation: "#F4D44D", tool: "#8AB4FF", retrieval: "#7CF5C8", error: "#FF6B6B", agent: "#C9CED6",
};
const FAILED = "#FF6B6B";

function fill(span: ViewSpan, failed: boolean) {
  return failed ? FAILED : TYPE_FILL[(span.spanType || "").toLowerCase()] ?? "#8B93A1";
}

function describe(node: SpanTreeNode, span: ViewSpan, failed: boolean) {
  const tokens = Number(span.inputTokens ?? 0) + Number(span.outputTokens ?? 0);
  return [
    node.name, formatDuration(span.latencyMs), Number(span.costUsd) ? formatCost(Number(span.costUsd)) : "",
    tokens ? `${compactNumber(tokens)} tokens` : "", failed ? `failed${span.errorType ? `: ${span.errorType}` : ""}` : "",
  ].filter(Boolean).join(" · ");
}

function activate(event: KeyboardEvent, action: () => void) {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); action(); }
}

/**
 * Every step as a bar on one time axis, in tree order, so parallel work (overlapping bars) and waiting (gaps)
 * are visible. Hover or focus shows name, latency, cost and tokens.
 */
export function TraceTimeline({ rows, spans, totalMs, selectedId, isFailed, onSelect }: {
  rows: SpanTreeNode[]; spans: Map<string, ViewSpan>; totalMs: number; selectedId: string | null;
  isFailed: (span: ViewSpan) => boolean; onSelect: (id: string) => void;
}) {
  const [hover, setHover] = useState<{ id: string; text: string; top: number; left: number } | null>(null);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className="relative" onMouseLeave={() => setHover(null)}>
      <div className="sticky top-0 z-10 grid grid-cols-[minmax(0,34%)_minmax(0,1fr)] border-b border-[#1F242C] bg-[#0E1115] font-mono text-[10px] text-[#6B7380]" aria-hidden="true">
        <span className="px-3 py-1">step</span>
        <span className="relative mr-4 h-5">
          {ticks.map((tick) => (
            <span key={tick} className="absolute top-1 -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full" style={{ left: `${tick * 100}%` }}>{formatDuration(totalMs * tick)}</span>
          ))}
        </span>
      </div>
      <ol aria-label="Timeline" className="py-1">
        {rows.length === 0 ? <li className="px-4 py-3 text-sm text-[#8B93A1]">No steps match.</li> : null}
        {rows.map((node) => {
          const span = spans.get(node.id);
          if (!span) return null;
          const failed = isFailed(span);
          const left = Math.min(100, (node.startTimeSinceRootMs / totalMs) * 100);
          const width = Math.max(0.6, Math.min(100 - left, (Number(span.latencyMs) / totalMs) * 100));
          const text = describe(node, span, failed);
          const selected = selectedId === node.id;
          return (
            <li key={node.id} id={`timeline-${node.id}`}>
              <button type="button" aria-label={text} aria-current={selected ? "true" : undefined} onClick={() => onSelect(node.id)}
                onMouseMove={(event) => {
                  const box = event.currentTarget.closest("ol")!.getBoundingClientRect();
                  setHover({ id: node.id, text, top: event.clientY - box.top + 28, left: Math.min(event.clientX - box.left + 12, box.width - 240) });
                }}
                onFocus={(event) => setHover({ id: node.id, text, top: event.currentTarget.offsetTop + 50, left: 12 })} onBlur={() => setHover(null)}
                className={`grid w-full grid-cols-[minmax(0,34%)_minmax(0,1fr)] items-center text-left ${selected ? "bg-[#161B22] shadow-[inset_3px_0_0_#F4D44D]" : "hover:bg-[#12161C]"}`}>
                <span className={`truncate py-1 pr-2 text-xs ${failed ? "text-[#FF8A8A]" : "text-[#C9CED6]"}`} style={{ paddingLeft: 12 + Math.min(node.depth, 6) * 8 }}>{node.name}</span>
                <span className="relative mr-4 h-5 border-l border-[#1A1F27]">
                  <span className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-sm" style={{ left: `${left}%`, width: `${width}%`, background: fill(span, failed) }} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {hover ? (
        <div role="tooltip" className="pointer-events-none absolute z-20 max-w-[240px] rounded-md border border-[#262C35] bg-[#111418] px-2.5 py-1.5 font-mono text-[11px] text-[#E6E9EE] shadow-2xl" style={{ top: hover.top, left: Math.max(4, hover.left) }}>
          {hover.text}
        </div>
      ) : null}
    </div>
  );
}

const COL_W = 150;
const ROW_H = 30;
const PAD = 20;

/**
 * Steps as nodes with parent → child arrows (left to right). Colour = step type, size = latency, failed = red.
 * Clicking a node selects the step, exactly like the tree.
 */
export function TraceGraph({ roots, spans, selectedId, isFailed, onSelect }: {
  roots: SpanTreeNode[]; spans: Map<string, ViewSpan>; selectedId: string | null;
  isFailed: (span: ViewSpan) => boolean; onSelect: (id: string) => void;
}) {
  const layout = useMemo(() => {
    // Leaves take consecutive rows; a parent sits at the middle of its children. Iterative post-order.
    const placed = new Map<string, { x: number; y: number }>();
    const edges: Array<[string, string]> = [];
    let nextRow = 0;
    let maxDepth = 0;
    const stack: Array<{ node: SpanTreeNode; done: boolean }> = [...roots].reverse().map((node) => ({ node, done: false }));
    while (stack.length) {
      const item = stack.pop()!;
      const { node } = item;
      maxDepth = Math.max(maxDepth, node.depth);
      if (!item.done && node.children.length) {
        stack.push({ node, done: true });
        for (let i = node.children.length - 1; i >= 0; i--) stack.push({ node: node.children[i]!, done: false });
        continue;
      }
      const ys = node.children.map((child) => placed.get(child.id)?.y).filter((y): y is number => y !== undefined);
      const y = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : PAD + ROW_H / 2 + nextRow++ * ROW_H;
      placed.set(node.id, { x: PAD + 14 + node.depth * COL_W, y });
      for (const child of node.children) edges.push([node.id, child.id]);
    }
    const all = [...placed.entries()];
    return { placed, edges, all, width: PAD * 2 + 14 + maxDepth * COL_W + 130, height: PAD * 2 + Math.max(1, nextRow) * ROW_H };
  }, [roots]);
  const maxLatency = Math.max(1, ...[...spans.values()].map((span) => Number(span.latencyMs) || 0));
  const nodes = new Map<string, SpanTreeNode>();
  const stack = [...roots];
  while (stack.length) { const node = stack.pop()!; nodes.set(node.id, node); stack.push(...node.children); }

  return (
    <svg role="group" aria-label="Step graph" width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} className="block">
      <defs>
        <marker id="graph-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 8 4 0 8z" fill="#4A5260" /></marker>
      </defs>
      {layout.edges.map(([from, to]) => {
        const a = layout.placed.get(from)!;
        const b = layout.placed.get(to)!;
        const mid = (a.x + b.x) / 2;
        return <path key={`${from}-${to}`} d={`M${a.x + 14} ${a.y} C${mid} ${a.y} ${mid} ${b.y} ${b.x - 16} ${b.y}`} fill="none" stroke="#4A5260" strokeWidth={1.2} markerEnd="url(#graph-arrow)" />;
      })}
      {layout.all.map(([id, point]) => {
        const node = nodes.get(id);
        const span = spans.get(id);
        if (!node || !span) return null;
        const failed = isFailed(span);
        const radius = 4 + 9 * Math.sqrt(Math.max(0, Number(span.latencyMs) || 0) / maxLatency);
        const selected = selectedId === id;
        const text = describe(node, span, failed);
        return (
          <g key={id} id={`graph-${id}`} role="button" tabIndex={0} aria-label={text} aria-pressed={selected} className="cursor-pointer outline-none"
            transform={`translate(${point.x},${point.y})`} onClick={() => onSelect(id)} onKeyDown={(event) => activate(event, () => onSelect(id))}>
            <title>{text}</title>
            {selected ? <circle r={radius + 4} fill="none" stroke="#F4D44D" strokeWidth={2} /> : null}
            <circle r={radius} fill={fill(span, failed)} stroke="#0E1115" strokeWidth={1.5} />
            <text x={radius + 6} y={4} fontSize={11} fill={failed ? "#FF8A8A" : selected ? "#FFFFFF" : "#C9CED6"}>{node.name.length > 18 ? `${node.name.slice(0, 17)}…` : node.name}</text>
          </g>
        );
      })}
    </svg>
  );
}
