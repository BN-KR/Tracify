"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { compactNumber, formatCost } from "./format";

type Day = { day: string; traces: number; errors: number; costUsd: number };
type Metric = "traces" | "errors" | "cost";

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const WEEKS = 53;
const LEFT = 30;
const TOP = 18;
const EMPTY = "#161B22";
// One hue per measure, light on dark: more is brighter. Level 0 (no traces) is the neutral square.
const RAMPS: Record<Metric, string[]> = {
  traces: ["#3A3318", "#7A6A1E", "#BFA526", "#F4D44D"],
  errors: ["#3A1D1D", "#7A2B2B", "#C04646", "#FF6B6B"],
  cost: ["#1B2A44", "#2F4B7C", "#5C8AD6", "#8AB4FF"],
};
const METRICS: Array<{ id: Metric; label: string }> = [{ id: "traces", label: "Traces" }, { id: "errors", label: "With errors" }, { id: "cost", label: "Cost" }];

const pad = (value: number) => String(value).padStart(2, "0");
const key = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const parseKey = (value: string) => { const [y = 0, m = 1, d = 1] = value.split("-").map(Number); return new Date(y, m - 1, d); };
const prettyDay = (date: Date) => date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });

function value(day: Day | undefined, metric: Metric) {
  return !day ? 0 : metric === "traces" ? day.traces : metric === "errors" ? day.errors : day.costUsd;
}
const format = (amount: number, metric: Metric) => (metric === "cost" ? formatCost(amount) : compactNumber(amount));

/**
 * A GitHub-style activity grid: one square per day for the last 53 weeks, brighter for busier days.
 * Filters apply, the page's time range does not. Hover reads a day; click zooms the page to it.
 */
export function ActivityCalendar({ projectId, params, onZoom }: { projectId: string; params: URLSearchParams; onZoom: (from: number, to: number) => void }) {
  const [days, setDays] = useState<Day[] | null>(null);
  const [error, setError] = useState("");
  const [metric, setMetric] = useState<Metric>("traces");
  const [hover, setHover] = useState<{ date: Date; x: number; y: number } | null>(null);
  const [table, setTable] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const filterKey = params.toString();

  useEffect(() => {
    let active = true;
    let controller: AbortController | undefined;
    const load = async () => {
      if (document.hidden) return;
      controller?.abort();
      controller = new AbortController();
      const timeZone = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; } })();
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/traces/activity?${filterKey}&tz=${encodeURIComponent(timeZone)}`, { cache: "no-store", signal: controller.signal });
        const body = await response.json();
        if (!active) return;
        if (!response.ok) throw new Error(body.error ?? "Activity is unavailable.");
        setDays(body.days as Day[]); setError("");
      } catch (caught) {
        if (active && !(caught instanceof DOMException && caught.name === "AbortError")) setError(caught instanceof Error ? caught.message : "Activity is unavailable.");
      }
    };
    void load();
    const timer = setInterval(load, 60_000);
    return () => { active = false; clearInterval(timer); controller?.abort(); };
  }, [projectId, filterKey]);

  const byDay = useMemo(() => new Map((days ?? []).map((day) => [day.day, day])), [days]);
  const grid = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = addDays(today, -today.getDay() - (WEEKS - 1) * 7);
    const cells: Array<{ date: Date; col: number; row: number }> = [];
    for (let offset = 0; offset < WEEKS * 7; offset++) {
      const date = addDays(start, offset);
      if (date > today) break;
      cells.push({ date, col: Math.floor(offset / 7), row: offset % 7 });
    }
    const months: Array<{ col: number; label: string }> = [];
    for (let col = 0; col < WEEKS; col++) {
      const first = addDays(start, col * 7);
      if (col > 0 && first.getMonth() === addDays(start, (col - 1) * 7).getMonth()) continue;
      if (months.length && col - months[months.length - 1]!.col < 3) continue;
      months.push({ col, label: first.toLocaleDateString(undefined, { month: "short" }) });
    }
    return { cells, months, today };
  }, []);

  const max = useMemo(() => Math.max(0, ...grid.cells.map((cell) => value(byDay.get(key(cell.date)), metric))), [grid, byDay, metric]);
  const total = useMemo(() => grid.cells.reduce((sum, cell) => sum + value(byDay.get(key(cell.date)), metric), 0), [grid, byDay, metric]);
  const level = (amount: number) => (amount <= 0 || max <= 0 ? 0 : Math.min(4, Math.ceil((amount / max) * 4)));
  const color = (amount: number) => (level(amount) === 0 ? EMPTY : RAMPS[metric][level(amount) - 1]!);
  const activeDays = useMemo(() => (days ?? []).filter((day) => day.traces > 0).sort((a, b) => b.day.localeCompare(a.day)), [days]);

  // Start at the latest week once, when the grid first appears; later refreshes must not undo the reader's scrolling.
  const scrolled = useRef(false);
  useEffect(() => {
    if (days && scroller.current && !scrolled.current) { scroller.current.scrollLeft = scroller.current.scrollWidth; scrolled.current = true; }
  }, [days]);

  const cellFrom = (target: EventTarget) => {
    const dayKey = (target as SVGElement).dataset?.day;
    return dayKey ? parseKey(dayKey) : null;
  };
  const zoom = (date: Date) => onZoom(date.getTime(), Math.min(addDays(date, 1).getTime(), Date.now()));
  const hovered = hover ? byDay.get(key(hover.date)) : undefined;
  const width = LEFT + WEEKS * STEP;
  const height = TOP + 7 * STEP;
  const summary = days ? `${format(total, metric)} ${metric === "traces" ? "traces" : metric === "errors" ? "traces with errors" : "spent"} in the last year` : "Loading activity…";

  return (
    <section aria-label="Activity" className="min-w-0 rounded-lg border border-[#1F242C] bg-[#0E1115] px-3 pb-2 pt-2.5">
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-xs font-medium text-[#C9CED6]">Activity <span className="font-normal text-[#6B7380]">· last 12 months, ignores the time range</span></h3>
        <span className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] text-[#E6E9EE]">{summary}</span>
          <span role="group" aria-label="Activity measure" className="flex rounded-md border border-[#262C35] p-0.5 text-[11px]">
            {METRICS.map((item) => (
              <button key={item.id} type="button" aria-pressed={metric === item.id} onClick={() => setMetric(item.id)}
                className={`h-5 rounded px-2 ${metric === item.id ? "bg-[#232A34] text-white" : "text-[#8B93A1] hover:text-white"}`}>{item.label}</button>
            ))}
          </span>
        </span>
      </header>
      {error && !days ? (
        <p role="alert" className="py-6 text-center text-xs text-[#FF8A8A]">{error}</p>
      ) : (
        <div ref={scroller} className="overflow-x-auto pb-1">
          <svg role="img" aria-label={`Daily activity for the last 53 weeks. ${summary}.`} width={width} height={height} className="block"
            onPointerOver={(event) => { const date = cellFrom(event.target); setHover(date ? { date, x: event.clientX, y: event.clientY } : null); }}
            onPointerMove={(event) => { const date = cellFrom(event.target); setHover(date ? { date, x: event.clientX, y: event.clientY } : null); }}
            onPointerLeave={() => setHover(null)}
            onClick={(event) => { const date = cellFrom(event.target); if (date) zoom(date); }}>
            {grid.months.map((month) => <text key={month.col} x={LEFT + month.col * STEP} y={10} fontSize={10} fill="#6B7380" fontFamily="var(--font-geist-mono), monospace">{month.label}</text>)}
            {[1, 3, 5].map((row) => <text key={row} x={0} y={TOP + row * STEP + CELL - 1} fontSize={10} fill="#6B7380" fontFamily="var(--font-geist-mono), monospace">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][row]}</text>)}
            {grid.cells.map((cell) => {
              const dayKey = key(cell.date);
              return <rect key={dayKey} data-day={dayKey} x={LEFT + cell.col * STEP} y={TOP + cell.row * STEP} width={CELL} height={CELL} rx={2}
                fill={color(value(byDay.get(dayKey), metric))} stroke={hover && key(hover.date) === dayKey ? "#E6E9EE" : "none"} strokeWidth={1.5} style={{ cursor: "pointer" }} />;
            })}
          </svg>
        </div>
      )}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B7380]">
        <button type="button" aria-expanded={table} onClick={() => setTable((open) => !open)} className="text-[#8B93A1] hover:text-white">{table ? "Hide table" : "View as table"}</button>
        <span className="flex items-center gap-1.5">Less
          {[EMPTY, ...RAMPS[metric]].map((fill) => <span key={fill} aria-hidden="true" className="size-[11px] rounded-sm" style={{ background: fill }} />)}
          More
        </span>
      </div>
      {table ? (
        <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-[#1F242C]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#0E1115] text-[#8B93A1]"><tr>{["Day", "Traces", "With errors", "Cost"].map((head) => <th key={head} scope="col" className="px-3 py-1.5 font-medium">{head}</th>)}</tr></thead>
            <tbody className="font-mono text-[#C9CED6]">
              {activeDays.length === 0 ? <tr><td colSpan={4} className="px-3 py-2 text-[#8B93A1]">No activity in the last 12 months.</td></tr> : activeDays.map((day) => (
                <tr key={day.day} className="border-t border-[#1F242C]"><td className="px-3 py-1">{prettyDay(parseKey(day.day))}</td><td className="px-3 py-1">{day.traces}</td><td className="px-3 py-1">{day.errors}</td><td className="px-3 py-1">{formatCost(day.costUsd)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {hover ? (
        <div role="tooltip" className="pointer-events-none fixed z-50 rounded-md border border-[#262C35] bg-[#111418] px-2.5 py-1.5 text-[11px] shadow-2xl"
          style={{ left: Math.min(hover.x + 14, (typeof window === "undefined" ? 9999 : window.innerWidth) - 190), top: Math.max(8, hover.y - 64) }}>
          <div className="mb-0.5 font-mono text-[10px] text-[#8B93A1]">{prettyDay(hover.date)}</div>
          <div className="font-mono font-semibold text-[#E6E9EE]">{hovered ? `${hovered.traces} ${hovered.traces === 1 ? "trace" : "traces"}` : "No traces"}</div>
          {hovered ? <div className="font-mono text-[#8B93A1]">{hovered.errors} with errors · {formatCost(hovered.costUsd)}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
