"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import type { SpanTreeNode } from "@/lib/tracify-ports/treeBuilding";
import { compactNumber, formatCost, formatDuration } from "./format";

/** The span fields the views need; the panel's Span type satisfies it. */
export type ViewSpan = {
  spanId: string; spanType: string; latencyMs: number; costUsd: number; inputTokens?: number; outputTokens?: number;
  errorType?: string;
};

/** Step colours, shared by the tree, timeline and graph. Failed steps are always red. */
export const TYPE_COLOR: Record<string, string> = {
  llm: "#F4D44D", generation: "#F4D44D", tool: "#8AB4FF", retrieval: "#7CF5C8", error: "#FF6B6B", agent: "#C9CED6",
};
const OTHER = "#8B93A1";
const FAILED = "#FF6B6B";

export function stepColor(type: string, failed: boolean) {
  return failed ? FAILED : TYPE_COLOR[(type || "").toLowerCase()] ?? OTHER;
}

const ICON_PATHS: Record<string, string> = {
  agent: "M8 3v2M5 7h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM6.5 10.5h0M9.5 10.5h0",
  llm: "M8 2l1.6 4.4L14 8l-4.4 1.6L8 14l-1.6-4.4L2 8l4.4-1.6z",
  tool: "M10.5 2.5a3 3 0 0 0-3.9 3.9L2.5 10.5l3 3 4.1-4.1a3 3 0 0 0 3.9-3.9l-2 2-1.5-1.5z",
  retrieval: "M7 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM10 10l3.5 3.5",
  error: "M8 2.5l6 11H2zM8 7v3M8 12h0",
  other: "M3 8h10M8 3v10",
};

/** Small type glyph in the step colour, used in every view. */
export function TypeIcon({ type, failed = false, size = 14 }: { type: string; failed?: boolean; size?: number }) {
  const lower = (type || "").toLowerCase();
  const key = failed ? "error" : lower === "generation" ? "llm" : lower;
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width={size} height={size} className="shrink-0" fill="none" stroke={stepColor(type, failed)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICON_PATHS[key] ?? ICON_PATHS.other} />
    </svg>
  );
}

function describe(name: string, span: ViewSpan, failed: boolean) {
  const tokens = Number(span.inputTokens ?? 0) + Number(span.outputTokens ?? 0);
  return [
    name, formatDuration(span.latencyMs), Number(span.costUsd) ? formatCost(Number(span.costUsd)) : "",
    tokens ? `${compactNumber(tokens)} tokens` : "", failed ? `failed${span.errorType ? `: ${span.errorType}` : ""}` : "",
  ].filter(Boolean).join(" · ");
}

function activate(event: KeyboardEvent, action: () => void) {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); action(); }
}

/** 1, 2 or 5 × 10ⁿ so the axis shows roughly six labelled ticks. */
function tickStep(totalMs: number, target = 6) {
  const raw = Math.max(totalMs / target, 1);
  const power = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((factor) => factor * power).find((step) => step >= raw) ?? power * 10;
}

function ZoomControls({ zoom, setZoom, min, max, fit }: { zoom: number; setZoom: (value: number) => void; min: number; max: number; fit: () => void }) {
  const button = "flex h-6 w-6 items-center justify-center rounded text-[#8B93A1] hover:bg-[#1A1F27] hover:text-white disabled:opacity-30";
  return (
    <div role="group" aria-label="Zoom" className="flex items-center gap-0.5">
      <button type="button" aria-label="Zoom out" className={button} disabled={zoom <= min + 1e-6} onClick={() => setZoom(Math.max(min, zoom / 1.5))}>−</button>
      <button type="button" aria-label="Zoom in" className={button} disabled={zoom >= max - 1e-6} onClick={() => setZoom(Math.min(max, zoom * 1.5))}>+</button>
      <button type="button" aria-label="Fit to view" className={button} onClick={fit}>
        <svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" /></svg>
      </button>
    </div>
  );
}

/**
 * Drag with the mouse to move a scrollable view. A drag of more than a few pixels swallows the click that
 * follows, so dragging across a bar or card does not select it.
 */
export function useDragToMove(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: { x: number; y: number; left: number; top: number } | null = null;
    let moved = false;
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || event.pointerType === "touch") return;
      start = { x: event.clientX, y: event.clientY, left: el.scrollLeft, top: el.scrollTop };
      moved = false;
    };
    const move = (event: PointerEvent) => {
      if (!start) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      if (!moved) { moved = true; el.setPointerCapture(event.pointerId); el.style.cursor = "grabbing"; }
      el.scrollLeft = start.left - dx;
      el.scrollTop = start.top - dy;
    };
    const up = () => {
      if (moved) {
        const swallow = (event: MouseEvent) => { event.stopPropagation(); event.preventDefault(); };
        el.addEventListener("click", swallow, { capture: true, once: true });
        setTimeout(() => el.removeEventListener("click", swallow, { capture: true }), 0);
      }
      start = null;
      el.style.cursor = "";
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [ref]);
}

/** Wheel zoom around the cursor. `shouldZoom` decides which wheel events zoom; the others scroll normally. */
export function useWheelZoom(ref: RefObject<HTMLElement | null>, zoom: number, setZoom: (value: number) => void, limits: { min: number; max: number },
  shouldZoom: (event: WheelEvent) => boolean, anchorFor: (event: WheelEvent, el: HTMLElement, from: number, to: number) => { left: number; top: number }) {
  const state = useRef({ zoom, pending: null as null | { left: number; top: number } });
  useLayoutEffect(() => {
    state.current.zoom = zoom;
    const el = ref.current;
    const pending = state.current.pending;
    if (el && pending) { el.scrollLeft = pending.left; el.scrollTop = pending.top; state.current.pending = null; }
  }, [zoom, ref]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const wheel = (event: WheelEvent) => {
      if (!shouldZoom(event)) return;
      event.preventDefault();
      const from = state.current.zoom;
      const to = Math.min(limits.max, Math.max(limits.min, from * Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0015))));
      if (Math.abs(to - from) < 1e-4) return;
      state.current.pending = anchorFor(event, el, from, to);
      setZoom(to);
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [ref, setZoom, limits.min, limits.max, shouldZoom, anchorFor]);
}

const timelineZooms = (event: WheelEvent) => event.ctrlKey || event.metaKey;
const graphZooms = () => true;

const NAME_COL = 190;

/**
 * Every step as a bar on one time axis, in tree order: overlapping bars show parallel work, gaps show waiting.
 * Each bar is labelled with its duration and cost; hover or focus adds tokens. Zoom widens the time axis.
 */
const TIMELINE_LIMITS = { min: 1, max: 64 };
const GRAPH_LIMITS = { min: 0.25, max: 2.5 };

export function TraceTimeline({ rows, spans, totalMs, selectedId, isFailed, onSelect }: {
  rows: SpanTreeNode[]; spans: Map<string, ViewSpan>; totalMs: number; selectedId: string | null;
  isFailed: (span: ViewSpan) => boolean; onSelect: (id: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [hover, setHover] = useState<{ text: string; top: number; left: number } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  useDragToMove(scroller);
  // Ctrl/⌘ + wheel (or a trackpad pinch) zooms the time axis around the cursor; a plain wheel scrolls the rows.
  const anchor = useMemo(() => (event: WheelEvent, el: HTMLElement, from: number, to: number) => {
    const x = Math.max(0, event.clientX - el.getBoundingClientRect().left - NAME_COL);
    const at = (el.scrollLeft + x) / from;
    return { left: Math.max(0, at * to - x), top: el.scrollTop };
  }, []);
  useWheelZoom(scroller, zoom, setZoom, TIMELINE_LIMITS, timelineZooms, anchor);
  const step = tickStep(totalMs / zoom);
  const ticks: number[] = [];
  for (let at = 0; at < totalMs * 0.98; at += step) ticks.push(at);
  const width = zoom === 1 ? "100%" : `calc(${NAME_COL}px + ${zoom} * (100% - ${NAME_COL}px))`;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-[#1F242C] px-2 py-1">
        <ZoomControls zoom={zoom} setZoom={setZoom} min={TIMELINE_LIMITS.min} max={TIMELINE_LIMITS.max} fit={() => setZoom(1)} />
        <span className="hidden text-[11px] text-[#6B7380] sm:inline">Ctrl + scroll to zoom · drag to move</span>
        <span className="font-mono text-[10px] text-[#6B7380]">{formatDuration(totalMs)} total</span>
      </div>
      <div ref={scroller} className="relative min-h-0 flex-1 cursor-grab select-none overflow-auto" onMouseLeave={() => setHover(null)}>
        <div className="relative min-w-full" style={{ width }}>
          <div className="sticky top-0 z-20 flex h-6 border-b border-[#1F242C] bg-[#0E1115] font-mono text-[10px] text-[#6B7380]" aria-hidden="true">
            <span className="sticky left-0 z-10 shrink-0 border-r border-[#1F242C] bg-[#0E1115]" style={{ width: NAME_COL }} />
            <span className="relative flex-1 overflow-hidden">
              {ticks.map((at) => <span key={at} className="absolute top-1.5 whitespace-nowrap pl-1" style={{ left: `${(at / totalMs) * 100}%` }}>{at === 0 ? "0" : formatDuration(at)}</span>)}
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-0 top-6" style={{ left: NAME_COL, right: 0 }} aria-hidden="true">
            {ticks.map((at) => <span key={at} className="absolute inset-y-0 border-l border-[#171B21]" style={{ left: `${(at / totalMs) * 100}%` }} />)}
          </div>
          <ol aria-label="Timeline" className="relative">
            {rows.length === 0 ? <li className="px-4 py-3 text-sm text-[#8B93A1]">No steps match.</li> : null}
            {rows.map((node) => {
              const span = spans.get(node.id);
              if (!span) return null;
              const failed = isFailed(span);
              const left = Math.min(99.6, (node.startTimeSinceRootMs / totalMs) * 100);
              const barWidth = Math.max(0.4, Math.min(100 - left, (Number(span.latencyMs) / totalMs) * 100));
              const text = describe(node.name, span, failed);
              const selected = selectedId === node.id;
              const label = `${formatDuration(span.latencyMs)}${Number(span.costUsd) ? `  ${formatCost(Number(span.costUsd))}` : ""}`;
              const inside = barWidth * zoom > 24;
              const labelBefore = left + barWidth > 72;
              return (
                <li key={node.id} id={`timeline-${node.id}`}>
                  <button type="button" aria-label={text} aria-current={selected ? "true" : undefined} onClick={() => onSelect(node.id)}
                    onMouseMove={(event) => {
                      const area = event.currentTarget.closest("ol")!.getBoundingClientRect();
                      setHover({ text, top: event.clientY - area.top + 40, left: Math.max(8, event.clientX - area.left - 40) });
                    }}
                    className={`group flex h-7 w-full items-center text-left ${selected ? "bg-[#161B22]" : "hover:bg-[#12161C]"}`}>
                    <span className={`sticky left-0 z-10 flex h-full shrink-0 items-center gap-1.5 border-r border-[#1F242C] pr-2 text-xs ${selected ? "bg-[#161B22] shadow-[inset_3px_0_0_#F4D44D]" : "bg-[#0E1115] group-hover:bg-[#12161C]"} ${failed ? "text-[#FF8A8A]" : "text-[#C9CED6]"}`}
                      style={{ width: NAME_COL, paddingLeft: 8 + Math.min(node.depth, 8) * 12 }}>
                      <TypeIcon type={span.spanType} failed={failed} size={12} /><span className="truncate">{node.name}</span>
                    </span>
                    <span className="relative h-full min-w-0 flex-1">
                      <span className={`absolute top-1 flex h-5 items-center overflow-hidden rounded-[3px] font-mono text-[10px] font-medium text-[#0B0D10] ${inside ? "px-1.5" : ""} ${selected ? "outline outline-2 outline-offset-1 outline-[#F4D44D]" : ""}`}
                        style={{ left: `${left}%`, width: `max(3px, ${barWidth}%)`, background: stepColor(span.spanType, failed) }}>
                        {inside ? <span className="truncate">{label}</span> : null}
                      </span>
                      {!inside ? (
                        <span className="absolute top-1 flex h-5 items-center whitespace-nowrap px-1.5 font-mono text-[10px] text-[#8B93A1]"
                          style={labelBefore ? { right: `calc(${100 - left}% + 2px)` } : { left: `calc(${left + barWidth}% + 5px)` }}>{label}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {hover ? (
            <div role="tooltip" className="pointer-events-none absolute z-30 max-w-[260px] rounded-md border border-[#262C35] bg-[#111418] px-2.5 py-1.5 font-mono text-[11px] text-[#E6E9EE] shadow-2xl" style={{ top: hover.top, left: hover.left }}>
              {hover.text}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type GraphNode = {
  key: string; name: string; type: string; spanIds: string[]; failed: number; latencyMs: number; costUsd: number;
  children: GraphNode[]; depth: number;
};

/** Expanded: one node per step. */
function expandedTree(roots: SpanTreeNode[], spans: Map<string, ViewSpan>, isFailed: (span: ViewSpan) => boolean) {
  const build = (node: SpanTreeNode, depth: number): GraphNode => {
    const span = spans.get(node.id);
    return {
      key: node.id, name: node.name, type: span?.spanType ?? "", spanIds: [node.id], failed: span && isFailed(span) ? 1 : 0,
      latencyMs: Number(span?.latencyMs ?? 0), costUsd: Number(span?.costUsd ?? 0), depth,
      children: node.children.map((child) => build(child, depth + 1)),
    };
  };
  return roots.map((root) => build(root, 0));
}

/** Aggregated: siblings with the same name and type merge into one node (×N), and so do their children. */
function aggregatedTree(roots: SpanTreeNode[], spans: Map<string, ViewSpan>, isFailed: (span: ViewSpan) => boolean) {
  const merge = (nodes: SpanTreeNode[], depth: number, path: string): GraphNode[] => {
    const groups = new Map<string, SpanTreeNode[]>();
    for (const node of nodes) {
      const id = `${spans.get(node.id)?.spanType ?? ""}:${node.name}`;
      groups.set(id, [...(groups.get(id) ?? []), node]);
    }
    return [...groups.entries()].map(([id, members]) => {
      const list = members.map((member) => spans.get(member.id)).filter((span): span is ViewSpan => Boolean(span));
      const key = `${path}/${id}`;
      return {
        key, name: members[0]!.name, type: list[0]?.spanType ?? "", spanIds: members.map((member) => member.id),
        failed: list.filter(isFailed).length, latencyMs: list.reduce((sum, span) => sum + Number(span.latencyMs || 0), 0),
        costUsd: list.reduce((sum, span) => sum + Number(span.costUsd || 0), 0), depth,
        children: merge(members.flatMap((member) => member.children), depth + 1, key),
      };
    });
  };
  return merge(roots, 0, "");
}

const NODE_W = 184;
const NODE_H = 44;
const COL_GAP = 40;
const ROW_GAP = 10;
const PAD = 16;

/**
 * Steps as cards with parent → child connectors, left to right. Aggregated merges repeated steps (×N);
 * Expanded shows every step. Colour = type, the bar inside = latency, failed = red. Clicking selects the step.
 */
export function TraceGraph({ roots, spans, selectedId, isFailed, onSelect }: {
  roots: SpanTreeNode[]; spans: Map<string, ViewSpan>; selectedId: string | null;
  isFailed: (span: ViewSpan) => boolean; onSelect: (id: string) => void;
}) {
  const [mode, setMode] = useState<"aggregated" | "expanded">("expanded");
  const [zoom, setZoom] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  useDragToMove(box);
  // The wheel zooms around the cursor, like a map; drag to move.
  const anchor = useMemo(() => (event: WheelEvent, el: HTMLElement, from: number, to: number) => {
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    return { left: Math.max(0, ((el.scrollLeft + x) / from) * to - x), top: Math.max(0, ((el.scrollTop + y) / from) * to - y) };
  }, []);
  useWheelZoom(box, zoom, setZoom, GRAPH_LIMITS, graphZooms, anchor);
  const tree = useMemo(() => (mode === "aggregated" ? aggregatedTree : expandedTree)(roots, spans, isFailed), [mode, roots, spans, isFailed]);
  const layout = useMemo(() => {
    // Leaves take consecutive rows; a parent sits level with the middle of its children. Iterative post-order.
    const placed: Array<{ node: GraphNode; x: number; y: number }> = [];
    const yOf = new Map<string, number>();
    const edges: Array<[string, string]> = [];
    let row = 0;
    let maxDepth = 0;
    const stack: Array<{ node: GraphNode; done: boolean }> = [...tree].reverse().map((node) => ({ node, done: false }));
    while (stack.length) {
      const item = stack.pop()!;
      const { node } = item;
      maxDepth = Math.max(maxDepth, node.depth);
      if (!item.done && node.children.length) {
        stack.push({ node, done: true });
        for (let i = node.children.length - 1; i >= 0; i--) stack.push({ node: node.children[i]!, done: false });
        continue;
      }
      const ys = node.children.map((child) => yOf.get(child.key)!);
      const y = ys.length ? (ys[0]! + ys[ys.length - 1]!) / 2 : PAD + row++ * (NODE_H + ROW_GAP);
      yOf.set(node.key, y);
      placed.push({ node, x: PAD + node.depth * (NODE_W + COL_GAP), y });
      for (const child of node.children) edges.push([node.key, child.key]);
    }
    const xOf = new Map(placed.map((item) => [item.node.key, item.x]));
    return {
      placed, edges, yOf, xOf,
      width: PAD * 2 + (maxDepth + 1) * NODE_W + maxDepth * COL_GAP,
      height: PAD * 2 + Math.max(1, row) * (NODE_H + ROW_GAP) - ROW_GAP,
    };
  }, [tree]);
  const maxLatency = Math.max(1, ...layout.placed.map((item) => item.node.latencyMs));

  // Fit to the pane width (never above 1:1, never so small the text is unreadable) when the layout changes.
  const fit = () => {
    const width = box.current?.clientWidth ?? layout.width;
    setZoom(Math.max(0.55, Math.min(1, (width - 8) / layout.width)));
    box.current?.scrollTo({ left: 0, top: 0 });
  };
  useEffect(fit, [layout.width]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#1F242C] px-2 py-1">
        <div role="group" aria-label="Graph mode" className="flex rounded-md border border-[#262C35] p-0.5 text-xs">
          {([["expanded", "All steps", "Every step as its own card"], ["aggregated", "Grouped", "Repeated steps with the same name under the same parent are merged into one card (×N)"]] as const).map(([item, label, hint]) => (
            <button key={item} type="button" aria-pressed={mode === item} onClick={() => setMode(item)} title={hint}
              className={`rounded px-2 py-0.5 ${mode === item ? "bg-[#232A34] text-white" : "text-[#8B93A1] hover:text-white"}`}>{label}</button>
          ))}
        </div>
        <span className="hidden text-[11px] text-[#6B7380] sm:inline">Scroll to zoom · drag to move</span>
        <ZoomControls zoom={zoom} setZoom={setZoom} min={GRAPH_LIMITS.min} max={GRAPH_LIMITS.max} fit={fit} />
      </div>
      <div ref={box} className="min-h-0 flex-1 cursor-grab select-none overflow-auto">
        <svg role="group" aria-label="Step graph" width={layout.width * zoom} height={layout.height * zoom} viewBox={`0 0 ${layout.width} ${layout.height}`} className="block">
          {layout.edges.map(([from, to]) => {
            const x1 = layout.xOf.get(from)! + NODE_W, y1 = layout.yOf.get(from)! + NODE_H / 2;
            const x2 = layout.xOf.get(to)!, y2 = layout.yOf.get(to)! + NODE_H / 2;
            const mid = x1 + COL_GAP / 2;
            const r = Math.min(6, Math.abs(y2 - y1) / 2);
            const dir = Math.sign(y2 - y1);
            const d = Math.abs(y2 - y1) < 0.5 ? `M${x1} ${y1} H${x2}`
              : `M${x1} ${y1} H${mid - r} Q${mid} ${y1} ${mid} ${y1 + dir * r} V${y2 - dir * r} Q${mid} ${y2} ${mid + r} ${y2} H${x2}`;
            return <path key={`${from}>${to}`} data-edge="" d={d} fill="none" stroke="#3A414C" strokeWidth={1.25} />;
          })}
          {layout.placed.map(({ node, x, y }) => {
            const selected = selectedId !== null && node.spanIds.includes(selectedId);
            const failed = node.failed > 0;
            const runs = node.spanIds.length;
            const label = [node.name, runs > 1 ? `${runs} runs` : "", formatDuration(node.latencyMs), node.costUsd ? formatCost(node.costUsd) : "", failed ? `${node.failed} failed` : ""].filter(Boolean).join(" · ");
            const select = () => onSelect(selected ? selectedId! : node.spanIds[0]!);
            const room = runs > 1 ? 18 : 22;
            return (
              <g key={node.key} id={`graph-${node.spanIds[0]}`} role="button" tabIndex={0} aria-label={label} aria-pressed={selected}
                className="cursor-pointer outline-none" transform={`translate(${x},${y})`} onClick={select} onKeyDown={(event) => activate(event, select)}>
                <title>{label}</title>
                <rect width={NODE_W} height={NODE_H} rx={7} fill={failed ? "#1E1314" : selected ? "#161B22" : "#111418"} stroke={selected ? "#F4D44D" : failed ? "#5A2A2A" : "#262C35"} strokeWidth={selected ? 2 : 1} />
                <svg x={10} y={8} width={13} height={13} viewBox="0 0 16 16" fill="none" stroke={stepColor(node.type, failed)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={ICON_PATHS[failed ? "error" : (node.type || "").toLowerCase() === "generation" ? "llm" : (node.type || "").toLowerCase()] ?? ICON_PATHS.other} />
                </svg>
                <text x={29} y={19} fontSize={12} fill={failed ? "#FF8A8A" : "#E6E9EE"} fontFamily="var(--font-geist-sans), sans-serif">{node.name.length > room ? `${node.name.slice(0, room - 1)}…` : node.name}</text>
                {runs > 1 ? <text x={NODE_W - 10} y={19} fontSize={10} textAnchor="end" fill="#8B93A1" fontFamily="var(--font-geist-mono), monospace">×{runs}</text> : null}
                <text x={10} y={34} fontSize={10} fill={failed ? "#FF8A8A" : "#8B93A1"} fontFamily="var(--font-geist-mono), monospace">
                  {formatDuration(node.latencyMs)}{node.costUsd ? ` · ${formatCost(node.costUsd)}` : ""}{failed ? ` · ${node.failed} err` : ""}
                </text>
                <rect x={6} y={NODE_H - 5} width={NODE_W - 12} height={2} rx={1} fill="#1A1F27" />
                <rect x={6} y={NODE_H - 5} width={Math.max(2, (NODE_W - 12) * (node.latencyMs / maxLatency))} height={2} rx={1} fill={stepColor(node.type, failed)} />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
