"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActivityCalendar } from "./activity-calendar";
import { compactNumber, formatCost, formatDuration } from "./format";

export type ChartBucket = {
  bucket: string; traces: number; errors: number; costUsd: number; tokens: number;
  p50DurationMs: number | null; p95DurationMs: number | null;
};
type Histogram = { bucketSeconds: number; buckets: ChartBucket[] };
type Point = { start: number; data: ChartBucket | null };
type Series = { key: string; color: string; values: Array<number | null> };
type TooltipRow = { label: string; color: string; value: string };

const YELLOW = "#F4D44D";
const RED = "#FF6B6B";
const BLUE = "#8AB4FF";
const GRAY = "#8B93A1";
const MARGIN = { left: 50, right: 8, top: 8, bottom: 22 };

const bucketStart = (bucket: ChartBucket) => Date.parse(bucket.bucket.replace(" ", "T") + "Z");

/** Every bucket across the range, including empty ones, so a quiet hour shows as a gap instead of being skipped. */
function fillBuckets(histogram: Histogram, range?: { from: number; to: number }): Point[] {
  const step = histogram.bucketSeconds * 1000;
  const byStart = new Map(histogram.buckets.map((bucket) => [bucketStart(bucket), bucket]));
  const starts = new Set(byStart.keys());
  if (range) for (let at = Math.floor(range.from / step) * step; at <= range.to && starts.size < 500; at += step) starts.add(at);
  return [...starts].sort((a, b) => a - b).map((start) => ({ start, data: byStart.get(start) ?? null }));
}

function niceMax(value: number) {
  if (!(value > 0)) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  return ([1, 2, 2.5, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= value * 0.9999) ?? power * 10);
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.floor(el.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry?.contentRect.width ?? 0)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function tickLabel(start: number, bucketSeconds: number, spanMs: number) {
  const date = new Date(start);
  if (bucketSeconds >= 21_600) return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (spanMs > 86_400_000) return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

const fullLabel = (start: number) => new Date(start).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

/** The period a bar covers: "Jul 23, 10:00 – 12:00", or "Jul 23" for whole days. */
function periodLabel(start: number, bucketSeconds: number) {
  const from = new Date(start), to = new Date(start + bucketSeconds * 1000);
  const day = (date: Date) => date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const time = (date: Date) => date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
  if (bucketSeconds >= 86_400) return day(from);
  const sameDay = from.toDateString() === to.toDateString() || (to.getHours() === 0 && to.getMinutes() === 0 && to.getTime() - from.getTime() <= 86_400_000);
  return sameDay ? `${day(from)}, ${time(from)} – ${time(to)}` : `${day(from)}, ${time(from)} – ${day(to)}, ${time(to)}`;
}

function SeriesChart({ kind, stacked = false, series, points, bucketSeconds, height = 150, format, tooltip, label, onZoom }: {
  kind: "bars" | "line"; stacked?: boolean; series: Series[]; points: Point[]; bucketSeconds: number; height?: number;
  format: (value: number) => string; tooltip: (index: number) => TooltipRow[]; label: string; onZoom: (from: number, to: number) => void;
}) {
  const [ref, width] = useWidth();
  const [hovered, setHovered] = useState<{ shape: string; index: number } | null>(null);
  const count = points.length;
  // A hovered position belongs to the time axis it was read from. When the range or bucket size changes, the chart can
  // shrink under the pointer (zooming to one minute leaves two points), so an index from another axis is never used.
  // Live refreshes keep the same axis, so hovering survives them.
  const shape = `${points[0]?.start ?? 0}:${bucketSeconds}:${count}`;
  const hover = hovered && hovered.shape === shape && hovered.index < count ? hovered.index : null;
  const setHover = (index: number | null) => setHovered(index === null ? null : { shape, index });
  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = height - MARGIN.top - MARGIN.bottom;
  const step = count ? plotWidth / count : 0;
  const peak = useMemo(() => {
    let best = 0;
    for (let i = 0; i < count; i++) {
      const total = stacked ? series.reduce((sum, item) => sum + (item.values[i] ?? 0), 0) : Math.max(0, ...series.map((item) => item.values[i] ?? 0));
      best = Math.max(best, total);
    }
    return niceMax(best);
  }, [series, count, stacked]);
  const y = (value: number) => MARGIN.top + plotHeight - (value / peak) * plotHeight;
  const xCenter = (index: number) => MARGIN.left + (index + 0.5) * step;
  const span = count > 1 ? points[count - 1]!.start - points[0]!.start : 0;
  // As many labels as fit without touching: roughly one per 110px, between two and five.
  const tickCount = Math.max(2, Math.min(5, Math.floor(plotWidth / 110)));
  const ticks = count > 1 ? [...new Set(Array.from({ length: tickCount }, (_, i) => Math.round((i * (count - 1)) / (tickCount - 1))))] : count ? [0] : [];

  const lines = kind === "line" ? series.map((item) => {
    const segments: string[] = [];
    let open = "";
    item.values.forEach((value, index) => {
      if (value === null) { if (open) segments.push(open); open = ""; return; }
      open += `${open ? "L" : "M"}${xCenter(index).toFixed(1)} ${y(value).toFixed(1)}`;
    });
    if (open) segments.push(open);
    return { item, path: segments.join(" ") };
  }) : [];

  const indexAt = (event: React.PointerEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(count - 1, Math.floor((event.clientX - box.left) / step)));
  };
  const move = (event: React.PointerEvent<SVGRectElement>) => setHover(indexAt(event));
  const rows = hover !== null ? tooltip(hover) : [];

  return (
    <div ref={ref} className="relative" style={{ height }}>
      {width > 0 && count > 0 ? (
        <>
          <svg role="img" aria-label={label} width={width} height={height} className="block overflow-visible">
            {[0, 0.5, 1].map((fraction) => (
              <g key={fraction}>
                <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(peak * fraction)} y2={y(peak * fraction)} stroke="#1F242C" strokeWidth={1} />
                <text x={MARGIN.left - 6} y={y(peak * fraction) + 3} textAnchor="end" fontSize={10} fill="#6B7380" fontFamily="var(--font-geist-mono), monospace">{format(peak * fraction)}</text>
              </g>
            ))}
            {ticks.map((index) => (
              <text key={index} x={Math.min(width - MARGIN.right, Math.max(MARGIN.left, xCenter(index)))} y={height - 6} fontSize={10} fill="#6B7380" textAnchor={index === 0 ? "start" : index === count - 1 ? "end" : "middle"} fontFamily="var(--font-geist-mono), monospace">
                {tickLabel(points[index]!.start, bucketSeconds, span)}
              </text>
            ))}
            {kind === "bars" ? points.map((point, index) => {
              let base = 0;
              return series.map((item) => {
                const value = item.values[index] ?? 0;
                if (value <= 0) return null;
                const top = y(base + value), bottom = y(base);
                base += stacked ? value : 0;
                const barWidth = Math.max(2, step - 2);
                return <rect key={`${index}-${item.key}`} x={xCenter(index) - barWidth / 2} y={top} width={barWidth} height={Math.max(2, bottom - top - (stacked && base > value ? 1 : 0))} rx={2} fill={item.color} opacity={hover === null || hover === index ? 1 : 0.55} />;
              });
            }) : lines.map(({ item, path }) => (
              <g key={item.key}>
                <path d={path} fill="none" stroke={item.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {/* A lone value has no neighbour to join a line to, so it is always drawn as a dot. */}
                {item.values.map((value, index) => value === null || (count > 31 && (item.values[index - 1] ?? null) !== null || count > 31 && (item.values[index + 1] ?? null) !== null) ? null : <circle key={index} cx={xCenter(index)} cy={y(value)} r={3} fill={item.color} stroke="#0E1115" strokeWidth={2} />)}
              </g>
            ))}
            {hover !== null ? (
              <g pointerEvents="none">
                <line x1={xCenter(hover)} x2={xCenter(hover)} y1={MARGIN.top} y2={MARGIN.top + plotHeight} stroke="#4A5260" strokeWidth={1} />
                {kind === "line" ? series.map((item) => item.values[hover] === null || item.values[hover] === undefined ? null : <circle key={item.key} cx={xCenter(hover)} cy={y(item.values[hover]!)} r={4} fill={item.color} stroke="#0E1115" strokeWidth={2} />) : null}
              </g>
            ) : null}
            <rect x={MARGIN.left} y={MARGIN.top} width={plotWidth} height={plotHeight} fill="transparent" style={{ cursor: "pointer" }}
              onPointerMove={move} onPointerDown={move} onPointerLeave={() => setHover(null)}
              onClick={(event) => { const at = points[indexAt(event)]; if (at) onZoom(at.start, at.start + bucketSeconds * 1000); }} />
          </svg>
          {hover !== null ? (
            <div role="tooltip" className="pointer-events-none absolute z-10 min-w-[150px] rounded-md border border-[#262C35] bg-[#111418] px-2.5 py-1.5 text-[11px] shadow-2xl"
              style={{ top: 4, left: xCenter(hover) > width / 2 ? undefined : xCenter(hover) + 12, right: xCenter(hover) > width / 2 ? width - xCenter(hover) + 12 : undefined }}>
              <div className="mb-1 font-mono text-[10px] text-[#8B93A1]">{periodLabel(points[hover]!.start, bucketSeconds)}</div>
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-[#C9CED6]"><span aria-hidden="true" className="size-2 rounded-sm" style={{ background: row.color }} />{row.label}</span>
                  <span className="font-mono font-semibold text-[#E6E9EE]">{row.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function Card({ title, summary, legend, children, wide = false }: { title: string; summary: string; legend?: Array<{ label: string; color: string }>; children: React.ReactNode; wide?: boolean }) {
  return (
    <section aria-label={title} className={`min-w-0 rounded-lg border border-[#1F242C] bg-[#0E1115] px-3 pb-2 pt-2.5 ${wide ? "lg:col-span-2" : ""}`}>
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-xs font-medium text-[#C9CED6]">{title}</h3>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#8B93A1]">
          {legend?.map((item) => <span key={item.label} className="flex items-center gap-1"><span aria-hidden="true" className="size-2 rounded-sm" style={{ background: item.color }} />{item.label}</span>)}
          <span className="font-mono text-[#E6E9EE]">{summary}</span>
        </span>
      </header>
      {children}
    </section>
  );
}

/**
 * The bar chart above the trace list: traces per period on a continuous time axis (empty periods are gaps),
 * split into ok and with errors. Hover reads a period, click zooms the page to it.
 */
export function TracesOverTime({ histogram, range, onZoom }: { histogram?: Histogram; range?: { from: number; to: number }; onZoom: (from: number, to: number) => void }) {
  const points = useMemo(() => (histogram ? fillBuckets(histogram, range) : []), [histogram, range]);
  const traces = points.map((point) => point.data?.traces ?? 0);
  const errors = points.map((point) => point.data?.errors ?? 0);
  const empty = Boolean(histogram) && !histogram!.buckets.length;
  return (
    <div className="px-4 pt-3">
      <div className="mb-1.5 flex items-center justify-between text-xs text-[#8B93A1]">
        <span>Traces over time{!empty && histogram ? " · click a bar to zoom" : ""}</span>
        <span className="flex items-center gap-3"><span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-[#F4D44D]" />traces</span><span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-[#FF6B6B]" />with errors</span></span>
      </div>
      <div className="rounded-lg border border-[#1F242C] bg-[#0E1115] px-2" style={{ minHeight: 100 }}>
        {empty ? <p className="py-8 text-center text-xs text-[#4A5260]">No traces to chart</p> : histogram ? (
          <SeriesChart kind="bars" stacked height={100} points={points} bucketSeconds={histogram.bucketSeconds} label="Traces over time, split into ok and with errors"
            format={(v) => compactNumber(Math.round(v))} onZoom={onZoom}
            series={[{ key: "ok", color: YELLOW, values: traces.map((n, i) => n - errors[i]!) }, { key: "errors", color: RED, values: errors }]}
            tooltip={(i) => [{ label: "Traces", color: YELLOW, value: String(traces[i]) }, { label: "With errors", color: RED, value: String(errors[i]) }]} />
        ) : null}
      </div>
    </div>
  );
}

/**
 * The Chart view: the filtered traces over time, one small chart per measure (never two scales on one chart).
 * Hover reads values, click zooms the whole page to that period, and a table view lists the same numbers.
 */
export function TraceCharts({ projectId, filterParams, histogram, range, onZoom }: {
  projectId: string; filterParams: URLSearchParams; histogram?: Histogram; range?: { from: number; to: number }; onZoom: (from: number, to: number) => void;
}) {
  return (
    <div className="space-y-3 pb-4 pt-1">
      <ActivityCalendar projectId={projectId} params={filterParams} onZoom={onZoom} />
      <RangeCharts histogram={histogram} range={range} onZoom={onZoom} />
    </div>
  );
}

function RangeCharts({ histogram, range, onZoom }: { histogram?: Histogram; range?: { from: number; to: number }; onZoom: (from: number, to: number) => void }) {
  const points = useMemo(() => (histogram ? fillBuckets(histogram, range) : []), [histogram, range]);
  const [table, setTable] = useState(false);
  if (!histogram || !histogram.buckets.length) {
    return <p className="my-10 text-center text-sm text-[#8B93A1]">{histogram ? "No traces in this time range for these filters." : "Loading charts…"}</p>;
  }
  const bucketSeconds = histogram.bucketSeconds;
  const value = (pick: (bucket: ChartBucket) => number | null, empty: number | null) => points.map((point) => (point.data ? pick(point.data) : empty));
  const traces = value((b) => b.traces, 0) as number[];
  const errors = value((b) => b.errors, 0) as number[];
  const totals = histogram.buckets.reduce((sum, b) => ({ traces: sum.traces + b.traces, errors: sum.errors + b.errors, cost: sum.cost + b.costUsd, tokens: sum.tokens + b.tokens }), { traces: 0, errors: 0, cost: 0, tokens: 0 });
  const rate = value((b) => (b.traces ? (b.errors / b.traces) * 100 : null), null);
  const p50 = value((b) => b.p50DurationMs, null);
  const p95 = value((b) => b.p95DurationMs, null);
  const finishedP95 = Math.max(0, ...(p95 as Array<number | null>).map((v) => v ?? 0));
  const common = { points, bucketSeconds, onZoom };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[#6B7380]">Hover for values · click a point to zoom the page to that period</p>
      <div className="grid gap-3 lg:grid-cols-2">
        <Card wide title="Traces" summary={`${compactNumber(totals.traces)} total · ${compactNumber(totals.errors)} with errors`} legend={[{ label: "ok", color: YELLOW }, { label: "with errors", color: RED }]}>
          <SeriesChart {...common} kind="bars" stacked height={170} label="Traces over time, split into ok and with errors" format={(v) => compactNumber(Math.round(v))}
            series={[{ key: "ok", color: YELLOW, values: traces.map((n, i) => n - errors[i]!) }, { key: "errors", color: RED, values: errors }]}
            tooltip={(i) => [{ label: "Traces", color: YELLOW, value: String(traces[i]) }, { label: "With errors", color: RED, value: String(errors[i]) }]} />
        </Card>
        <Card title="Error rate" summary={totals.traces ? `${((totals.errors / totals.traces) * 100).toFixed(1)}% overall` : "—"}>
          <SeriesChart {...common} kind="line" label="Share of traces with errors over time" format={(v) => `${v < 10 ? v.toFixed(1) : Math.round(v)}%`}
            series={[{ key: "rate", color: RED, values: rate }]}
            tooltip={(i) => [{ label: "Error rate", color: RED, value: rate[i] === null ? "—" : `${rate[i]!.toFixed(1)}%` }, { label: "Traces", color: GRAY, value: String(traces[i]) }]} />
        </Card>
        <Card title="Latency (finished traces)" summary={finishedP95 ? `peak p95 ${formatDuration(finishedP95)}` : "none finished"} legend={[{ label: "p50", color: GRAY }, { label: "p95", color: YELLOW }]}>
          <SeriesChart {...common} kind="line" label="Median and 95th percentile latency over time" format={(v) => formatDuration(Math.round(v))}
            series={[{ key: "p50", color: GRAY, values: p50 }, { key: "p95", color: YELLOW, values: p95 }]}
            tooltip={(i) => [{ label: "p95", color: YELLOW, value: p95[i] === null ? "—" : formatDuration(p95[i]) }, { label: "p50", color: GRAY, value: p50[i] === null ? "—" : formatDuration(p50[i]) }]} />
        </Card>
        <Card title="Cost" summary={`${formatCost(totals.cost)} total`}>
          <SeriesChart {...common} kind="bars" label="Cost in US dollars over time" format={(v) => formatCost(v)}
            series={[{ key: "cost", color: BLUE, values: value((b) => b.costUsd, 0) }]}
            tooltip={(i) => [{ label: "Cost", color: BLUE, value: formatCost(points[i]!.data?.costUsd ?? 0) }]} />
        </Card>
        <Card title="Tokens" summary={`${compactNumber(totals.tokens)} total`}>
          <SeriesChart {...common} kind="bars" label="Tokens used over time" format={(v) => compactNumber(Math.round(v))}
            series={[{ key: "tokens", color: BLUE, values: value((b) => b.tokens, 0) }]}
            tooltip={(i) => [{ label: "Tokens", color: BLUE, value: compactNumber(points[i]!.data?.tokens ?? 0) }]} />
        </Card>
      </div>
      <button type="button" aria-expanded={table} onClick={() => setTable((open) => !open)} className="text-xs text-[#8B93A1] hover:text-white">{table ? "Hide table" : "View as table"}</button>
      {table ? (
        <div className="max-h-72 overflow-auto rounded-lg border border-[#1F242C]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#0E1115] text-[#8B93A1]"><tr>{["Period", "Traces", "With errors", "Error rate", "p50", "p95", "Cost", "Tokens"].map((head) => <th key={head} scope="col" className="px-3 py-1.5 font-medium">{head}</th>)}</tr></thead>
            <tbody className="font-mono text-[#C9CED6]">
              {points.filter((point) => point.data).map((point) => {
                const b = point.data!;
                return (
                  <tr key={point.start} className="border-t border-[#1F242C]">
                    <td className="px-3 py-1">{fullLabel(point.start)}</td><td className="px-3 py-1">{b.traces}</td><td className="px-3 py-1">{b.errors}</td>
                    <td className="px-3 py-1">{b.traces ? `${((b.errors / b.traces) * 100).toFixed(1)}%` : "—"}</td>
                    <td className="px-3 py-1">{b.p50DurationMs === null ? "—" : formatDuration(b.p50DurationMs)}</td><td className="px-3 py-1">{b.p95DurationMs === null ? "—" : formatDuration(b.p95DurationMs)}</td>
                    <td className="px-3 py-1">{formatCost(b.costUsd)}</td><td className="px-3 py-1">{compactNumber(b.tokens)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
