"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { compactNumber, formatDuration } from "./format";
import { useDragToMove, useWheelZoom } from "./trace-views";

type MapNode = { id: string; kind: "tool" | "model"; name: string; count: number; traces: number; errors: number; p50LatencyMs: number };
type MapEdge = { source: string; target: string; count: number; traces: number; errorRate: number; p50LatencyMs: number };
type MapResponse = { nodes: MapNode[]; edges: MapEdge[]; totalNodes: number; totalEdges: number; limits: { nodes: number; edges: number }; error?: string };

const NODE_W = 168;
const NODE_H = 40;
const COL_GAP = 72;
const ROW_GAP = 18;
const PAD = 24;
const BAND_GAP = 64;
const MAP_LIMITS = { min: 0.3, max: 2 };
const always = () => true;

export function stepLabel(key: string) {
  return key.replace(/^(tool|model):/, "");
}

/**
 * Aggregate agent map: tools and models as nodes, an arrow A → B for each time B ran directly after A in the
 * same trace. Data comes from /traces/map for the page's filters and refreshes like the list (live, with back-off).
 */
export function AgentMap({ projectId, params, live, rangeMs, onNode, onEdge }: {
  projectId: string; params: URLSearchParams; live: boolean; rangeMs: number | null;
  onNode: (id: string) => void; onEdge: (source: string, target: string) => void;
}) {
  const key = params.toString();
  const [state, setState] = useState<{ key: string; data: MapResponse | null; error: string | null } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let delay = 5000;
    let last = "";
    const url = (moving: boolean) => {
      const next = new URLSearchParams(key);
      if (moving && rangeMs) { const to = Date.now(); next.set("to", String(to)); next.set("from", String(to - rangeMs)); }
      return `/api/projects/${encodeURIComponent(projectId)}/traces/map?${next}`;
    };
    const load = async (moving: boolean) => {
      const response = await fetch(url(moving), { cache: "no-store" });
      const body = (await response.json()) as MapResponse;
      if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
      return body;
    };
    load(false)
      .then((body) => { if (!stopped) { last = JSON.stringify(body.nodes) + JSON.stringify(body.edges); setState({ key, data: body, error: null }); } })
      .catch((reason: unknown) => { if (!stopped) setState({ key, data: null, error: reason instanceof Error ? reason.message : "Could not load the map" }); })
      .finally(() => { if (!stopped && live && rangeMs) timer = setTimeout(tick, delay); });
    // Live: same rules as the list. Skip hidden tabs, re-render only on change, back off to 60s when idle or failing.
    async function tick() {
      if (!document.hidden) {
        try {
          const body = await load(true);
          const signature = JSON.stringify(body.nodes) + JSON.stringify(body.edges);
          const changed = signature !== last;
          last = signature;
          if (!stopped && changed) setState({ key, data: body, error: null });
          else if (!stopped) setState((current) => (current?.error ? { key, data: body, error: null } : current));
          delay = changed ? 5000 : Math.min(delay * 2, 60_000);
        } catch {
          delay = Math.min(delay * 2, 60_000);
        }
      }
      if (!stopped) timer = setTimeout(tick, delay);
    }
    return () => { stopped = true; clearTimeout(timer); };
  }, [projectId, key, live, rangeMs, attempt]);

  const current = state?.key === key ? state : null;
  const data = current?.data ?? (state?.data ?? null);
  // The map wraps its columns into rows that fit the box, so it reads top to bottom instead of scrolling sideways.
  const box = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(1100);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setBoxWidth(Math.round(entry!.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  });
  useDragToMove(box);
  const anchor = useMemo(() => (event: WheelEvent, el: HTMLElement, from: number, to: number) => {
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    return { left: Math.max(0, ((el.scrollLeft + x) / from) * to - x), top: Math.max(0, ((el.scrollTop + y) / from) * to - y) };
  }, []);
  useWheelZoom(box, zoom, setZoom, MAP_LIMITS, always, anchor);
  const layout = useMemo(() => (data ? layoutMap(data.nodes, data.edges, boxWidth) : null), [data, boxWidth]);

  if (current?.error) {
    return (
      <div role="alert" className="my-6 rounded-lg border border-[#5A2A2A] bg-[#1E1314] p-4 text-sm">
        <p className="font-medium text-[#FF8A8A]">{current.error}</p>
        <button type="button" className="mt-3 rounded-md border border-[#5A2A2A] px-3 py-1.5 text-xs hover:bg-[#2A1A1C]" onClick={() => { setState(null); setAttempt((value) => value + 1); }}>Try again</button>
      </div>
    );
  }
  if (!data || !layout) return <p className="my-6 text-sm text-[#8B93A1]">Loading the agent map…</p>;
  if (!data.nodes.length) {
    return (
      <div className="my-10 rounded-lg border border-dashed border-[#262C35] p-8 text-center">
        <p className="font-medium">No tools or models in this range</p>
        <p className="mt-2 text-sm text-[#8B93A1]">The map shows tool and model steps of the traces that match your filters. Try a wider range or fewer filters.</p>
      </div>
    );
  }

  const nodeById = new Map(layout.nodes.map((node) => [node.id, node]));
  const maxEdge = Math.max(1, ...data.edges.map((edge) => edge.count));
  return (
    <div className={`flex flex-col gap-4 py-4 ${current ? "" : "opacity-60"}`} aria-busy={!current}>
      <p className="text-xs text-[#8B93A1]">
        <span className="font-mono">{data.nodes.length}</span>{data.totalNodes > data.nodes.length ? ` of ${compactNumber(data.totalNodes)}` : ""} steps ·{" "}
        <span className="font-mono">{data.edges.length}</span>{data.totalEdges > data.edges.length ? ` of ${compactNumber(data.totalEdges)}` : ""} arrows (B ran directly after A in the same trace) · click a step or arrow to list its traces
      </p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#8B93A1]">
        <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-[#F4D44D]" />model</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-[#8AB4FF]" />tool</span>
        <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-[#FF6B6B]" />arrow with failures</span>
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-[#6B7380]">
        <span>Scroll to zoom · drag to move</span>
        <span role="group" aria-label="Zoom" className="flex items-center gap-0.5">
          {([["Zoom out", "−", () => setZoom(Math.max(MAP_LIMITS.min, zoom / 1.5))], ["Zoom in", "+", () => setZoom(Math.min(MAP_LIMITS.max, zoom * 1.5))], ["Fit to view", "⤢", () => setZoom(1)]] as const).map(([name, glyph, action]) => (
            <button key={name} type="button" aria-label={name} onClick={action} className="flex h-6 w-6 items-center justify-center rounded text-[#8B93A1] hover:bg-[#1A1F27] hover:text-white">{glyph}</button>
          ))}
        </span>
      </div>
      <div ref={box} className="max-h-[70vh] cursor-grab select-none overflow-auto rounded-lg border border-[#1F242C] bg-[#0E1115]">
        <svg role="group" aria-label="Agent map" width={layout.width * zoom} height={layout.height * zoom} viewBox={`0 0 ${layout.width} ${layout.height}`} className="block">
          <defs>
            <marker id="map-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 8 4 0 8z" fill="#4A5260" /></marker>
            <marker id="map-arrow-error" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 8 4 0 8z" fill="#FF6B6B" /></marker>
          </defs>
          {data.edges.map((edge) => {
            const from = nodeById.get(edge.source);
            const to = nodeById.get(edge.target);
            if (!from || !to) return null;
            const id = `${edge.source}→${edge.target}`;
            const failed = edge.errorRate > 0;
            const path = edgePath(from, to, layout.bandTop);
            const label = `${stepLabel(edge.source)} → ${stepLabel(edge.target)}: ${edge.count} times in ${edge.traces} traces, ${(edge.errorRate * 100).toFixed(0)}% failed, median ${formatDuration(edge.p50LatencyMs)}`;
            const dim = hover && hover !== id && hover !== edge.source && hover !== edge.target;
            return (
              <g key={id} role="button" tabIndex={0} aria-label={label} className="cursor-pointer outline-none"
                onClick={() => onEdge(edge.source, edge.target)} onKeyDown={(event) => activate(event, () => onEdge(edge.source, edge.target))}
                onMouseEnter={() => setHover(id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(id)} onBlur={() => setHover(null)} opacity={dim ? 0.25 : 1}>
                <title>{label}</title>
                <path d={path.d} fill="none" stroke="transparent" strokeWidth={12} />
                <path d={path.d} fill="none" stroke={failed ? "#FF6B6B" : hover === id ? "#C9CED6" : "#4A5260"} strokeWidth={1 + 3 * Math.sqrt(edge.count / maxEdge)} markerEnd={`url(#${failed ? "map-arrow-error" : "map-arrow"})`} />
                <text x={path.lx} y={path.ly} textAnchor="middle" className="font-mono" fontSize={10} fill={failed ? "#FF8A8A" : "#8B93A1"} stroke="#0E1115" strokeWidth={3} paintOrder="stroke">{compactNumber(edge.count)}</text>
              </g>
            );
          })}
          {layout.nodes.map((node) => {
            const label = `${node.kind} ${node.name}: ${node.count} runs in ${node.traces} traces, ${node.errors} failed, median ${formatDuration(node.p50LatencyMs)}`;
            const dim = hover && hover !== node.id && !hover.includes(node.id);
            return (
              <g key={node.id} role="button" tabIndex={0} aria-label={label} className="cursor-pointer outline-none" transform={`translate(${node.x},${node.y})`}
                onClick={() => onNode(node.id)} onKeyDown={(event) => activate(event, () => onNode(node.id))}
                onMouseEnter={() => setHover(node.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(node.id)} onBlur={() => setHover(null)} opacity={dim ? 0.35 : 1}>
                <title>{label}</title>
                <rect width={NODE_W} height={NODE_H} rx={6} fill="#111418" stroke={node.errors ? "#FF6B6B" : hover === node.id ? "#F4D44D" : "#262C35"} strokeWidth={hover === node.id ? 2 : 1} />
                <rect width={4} height={NODE_H} rx={2} fill={node.kind === "model" ? "#F4D44D" : "#8AB4FF"} />
                <text x={12} y={16} fontSize={12} fill="#E6E9EE">{truncate(node.name, 22)}</text>
                <text x={12} y={31} fontSize={10} className="font-mono" fill={node.errors ? "#FF8A8A" : "#8B93A1"}>{compactNumber(node.count)}× · {formatDuration(node.p50LatencyMs)}{node.errors ? ` · ${compactNumber(node.errors)} err` : ""}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-0 text-sm">
          <caption className="mb-2 text-left text-xs text-[#8B93A1]">Arrows, busiest first</caption>
          <thead>
            <tr className="text-left text-xs text-[#8B93A1]">
              <th scope="col" className="border-b border-[#1F242C] px-3 py-2 font-medium">From → to</th>
              <th scope="col" className="border-b border-[#1F242C] px-3 py-2 font-medium">Times</th>
              <th scope="col" className="border-b border-[#1F242C] px-3 py-2 font-medium">Traces</th>
              <th scope="col" className="border-b border-[#1F242C] px-3 py-2 font-medium">Failed</th>
              <th scope="col" className="border-b border-[#1F242C] px-3 py-2 font-medium">Median latency</th>
            </tr>
          </thead>
          <tbody>
            {data.edges.slice(0, 25).map((edge) => (
              <tr key={`${edge.source}→${edge.target}`} className="hover:bg-[#12161C]">
                <td className="max-w-[320px] truncate border-b border-[#171B21] px-3 py-2">
                  <button type="button" className="truncate text-left text-[#8AB4FF] hover:underline" onClick={() => onEdge(edge.source, edge.target)}>{stepLabel(edge.source)} → {stepLabel(edge.target)}</button>
                </td>
                <td className="border-b border-[#171B21] px-3 py-2 font-mono text-xs">{compactNumber(edge.count)}</td>
                <td className="border-b border-[#171B21] px-3 py-2 font-mono text-xs">{compactNumber(edge.traces)}</td>
                <td className={`border-b border-[#171B21] px-3 py-2 font-mono text-xs ${edge.errorRate > 0 ? "text-[#FF8A8A]" : "text-[#8B93A1]"}`}>{(edge.errorRate * 100).toFixed(edge.errorRate && edge.errorRate < 0.1 ? 1 : 0)}%</td>
                <td className="border-b border-[#171B21] px-3 py-2 font-mono text-xs">{formatDuration(edge.p50LatencyMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function activate(event: React.KeyboardEvent, action: () => void) {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); action(); }
}

function truncate(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

type Placed = MapNode & { x: number; y: number; rank: number; band: number };

/**
 * Left-to-right layered layout. Arrows are added busiest first and skipped when they would close a cycle, the
 * remaining DAG gives each node a column (longest path), and each column is ordered by its parents' positions.
 */
function layoutMap(nodes: MapNode[], edges: MapEdge[], boxWidth: number) {
  const ids = new Set(nodes.map((node) => node.id));
  const forward = new Map<string, string[]>(nodes.map((node) => [node.id, []]));
  const reaches = (from: string, to: string) => {
    const seen = new Set<string>();
    const stack = [from];
    while (stack.length) {
      const id = stack.pop()!;
      if (id === to) return true;
      if (seen.has(id)) continue;
      seen.add(id);
      stack.push(...(forward.get(id) ?? []));
    }
    return false;
  };
  for (const edge of [...edges].sort((a, b) => b.count - a.count)) {
    if (edge.source === edge.target || !ids.has(edge.source) || !ids.has(edge.target)) continue;
    if (!reaches(edge.target, edge.source)) forward.get(edge.source)!.push(edge.target);
  }
  const indegree = new Map(nodes.map((node) => [node.id, 0]));
  for (const targets of forward.values()) for (const target of targets) indegree.set(target, indegree.get(target)! + 1);
  const rank = new Map(nodes.map((node) => [node.id, 0]));
  const queue = nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id);
  while (queue.length) {
    const id = queue.shift()!;
    for (const target of forward.get(id)!) {
      rank.set(target, Math.max(rank.get(target)!, rank.get(id)! + 1));
      indegree.set(target, indegree.get(target)! - 1);
      if (indegree.get(target) === 0) queue.push(target);
    }
  }
  const columns: MapNode[][] = [];
  for (const node of nodes) (columns[rank.get(node.id)!] ??= []).push(node);
  const row = new Map<string, number>();
  const parents = new Map<string, string[]>();
  for (const [source, targets] of forward) for (const target of targets) parents.set(target, [...(parents.get(target) ?? []), source]);
  // Wrap the columns into bands (rows of columns) that fit the box width; each band is as tall as its tallest column.
  const perBand = Math.max(1, Math.floor((boxWidth - 2 * PAD + COL_GAP) / (NODE_W + COL_GAP)));
  const bands = Math.ceil(columns.length / perBand);
  const bandTop: number[] = [];
  let top = PAD;
  for (let band = 0; band < bands; band++) {
    bandTop.push(top);
    const tallest = Math.max(1, ...columns.slice(band * perBand, (band + 1) * perBand).map((column) => column?.length ?? 0));
    top += tallest * NODE_H + (tallest - 1) * ROW_GAP + BAND_GAP;
  }
  const placed: Placed[] = [];
  columns.forEach((column, index) => {
    const ordered = index === 0 ? column : [...column].sort((a, b) => center(a.id) - center(b.id));
    const band = Math.floor(index / perBand);
    ordered.forEach((node, position) => {
      row.set(node.id, position);
      placed.push({ ...node, rank: index, band, x: PAD + (index % perBand) * (NODE_W + COL_GAP), y: bandTop[band]! + position * (NODE_H + ROW_GAP) });
    });
  });
  function center(id: string) {
    const list = (parents.get(id) ?? []).map((parent) => row.get(parent) ?? 0);
    return list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : Number.MAX_SAFE_INTEGER;
  }
  const used = Math.min(perBand, columns.length);
  return {
    nodes: placed,
    bandTop,
    width: PAD * 2 + used * NODE_W + (used - 1) * COL_GAP + 24,
    height: top - BAND_GAP + PAD + 24,
  };
}

/**
 * Forward arrows in the same band curve right; arrows into another band leave right, run through the gap above
 * the target band and enter it from the left; arrows back within a band loop below; self-repeats loop above.
 */
function edgePath(from: Placed, to: Placed, bandTop: number[]) {
  if (from.id === to.id) {
    const x = from.x + NODE_W - 36;
    return { d: `M${x} ${from.y} C${x} ${from.y - 26} ${x + 26} ${from.y - 26} ${x + 24} ${from.y}`, lx: x + 12, ly: from.y - 20 };
  }
  if (to.band !== from.band) {
    const lane = (hash(from.id + to.id) % 5) * 4;
    const gap = (to.band === 0 ? PAD / 2 : bandTop[to.band]! - BAND_GAP / 2) - 8 + lane;
    const x1 = from.x + NODE_W, y1 = from.y + NODE_H / 2, x2 = to.x - 2, y2 = to.y + NODE_H / 2;
    const out = x1 + 12 + lane, into = to.x - 20 - lane;
    return { d: `M${x1} ${y1} H${out} V${gap} H${into} V${y2} H${x2}`, lx: (out + into) / 2, ly: gap - 4 };
  }
  if (to.rank > from.rank) {
    const x1 = from.x + NODE_W, y1 = from.y + NODE_H / 2, x2 = to.x - 2, y2 = to.y + NODE_H / 2;
    const mid = (x1 + x2) / 2;
    return { d: `M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`, lx: mid, ly: (y1 + y2) / 2 - 4 };
  }
  const x1 = from.x + NODE_W / 2 + 10, y1 = from.y + NODE_H, x2 = to.x + NODE_W / 2 - 10, y2 = to.y + NODE_H + 2;
  const drop = Math.max(y1, y2) + 22 + Math.abs(from.rank - to.rank) * 6;
  return { d: `M${x1} ${y1} C${x1} ${drop} ${x2} ${drop} ${x2} ${y2}`, lx: (x1 + x2) / 2, ly: drop - 6 };
}

function hash(text: string) {
  let value = 0;
  for (let i = 0; i < text.length; i++) value = (value * 31 + text.charCodeAt(i)) >>> 0;
  return value;
}
