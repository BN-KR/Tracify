"use client";

import { useEffect, useRef, useState } from "react";

const H = 170;
const PAD = { left: 38, right: 8, top: 8, bottom: 22 };
const INK = "#E6E9EE";
const MUTED = "#6B7380";
const GRID = "#1A1F26";
export const YELLOW = "#F4D44D";
export const BLUE = "#8AB4FF";
export const RED = "#FF6B6B";
const MONO = "var(--font-geist-mono, monospace)";

type Format = (value: number) => string;
const niceMax = (value: number) => {
  if (value <= 0) return 1;
  const exponent = 10 ** Math.floor(Math.log10(value));
  const fraction = value / exponent;
  return (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * exponent;
};

/** The pixel width of a chart's box, so text and bars keep their real size in wide and narrow tiles. */
function useWidth() {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(520);
  useEffect(() => {
    const node = wrap.current;
    if (!node) return;
    const update = () => setWidth(Math.max(240, Math.round(node.getBoundingClientRect().width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [wrap, width] as const;
}

function Tooltip({ left, children }: { left: number; children: React.ReactNode }) {
  return <div className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded border border-[#262C35] bg-[#0E1115] px-2 py-1 font-mono text-[10px] leading-4 text-[#E6E9EE] shadow-lg" style={{ left: `${Math.min(86, Math.max(14, left))}%` }}>{children}</div>;
}

/** Thin columns with a 2px gap; `extra` is drawn over the base in red (failed runs). */
export function Columns({ points, format, extraLabel, label }: { points: Array<{ label: string; value: number; extra?: number }>; format: Format; extraLabel?: string; label: string }) {
  const [wrap, W] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...points.map((point) => point.value)));
  const inner = W - PAD.left - PAD.right;
  const slot = inner / Math.max(1, points.length);
  const barW = Math.max(1, slot - 2);
  const y = (value: number) => PAD.top + (1 - value / max) * (H - PAD.top - PAD.bottom);
  const every = Math.max(1, Math.ceil(points.length / 6));
  function move(event: React.MouseEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left;
    setHover(Math.min(points.length - 1, Math.max(0, Math.floor((px - PAD.left) / slot))));
  }
  const active = hover === null ? null : points[hover];
  return (
    <div ref={wrap} className="relative">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img" aria-label={label} onMouseMove={move} onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((fraction) => <g key={fraction}><line x1={PAD.left} x2={W - PAD.right} y1={y(max * fraction)} y2={y(max * fraction)} stroke={GRID} /><text x={PAD.left - 5} y={y(max * fraction) + 3} textAnchor="end" fontSize="9" fill={MUTED} fontFamily={MONO}>{format(max * fraction)}</text></g>)}
        {points.map((point, index) => {
          const x = PAD.left + index * slot + 1;
          return (
            <g key={index} opacity={hover === null || hover === index ? 1 : 0.55}>
              <rect x={x} y={y(point.value)} width={barW} height={Math.max(0, y(0) - y(point.value))} fill={YELLOW} />
              {point.extra ? <rect x={x} y={y(Math.min(point.extra, point.value))} width={barW} height={Math.max(0, y(0) - y(Math.min(point.extra, point.value)))} fill={RED} /> : null}
              {index % every === 0 ? <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="9" fill={MUTED} fontFamily={MONO}>{point.label}</text> : null}
            </g>
          );
        })}
      </svg>
      {active && hover !== null ? <Tooltip left={((PAD.left + hover * slot + slot / 2) / W) * 100}><div className="text-[#8B93A1]">{active.label}</div><div style={{ color: INK }}>{format(active.value)}</div>{active.extra ? <div className="text-[#FF8A8A]">{active.extra} {extraLabel ?? "failed"}</div> : null}</Tooltip> : null}
    </div>
  );
}

/** Two thin lines on one axis with a legend and a crosshair tooltip. */
export function Lines({ points, format, aLabel, bLabel, label }: { points: Array<{ label: string; a: number | null; b: number | null }>; format: Format; aLabel: string; bLabel: string; label: string }) {
  const [wrap, W] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...points.flatMap((point) => [point.a ?? 0, point.b ?? 0])));
  const inner = W - PAD.left - PAD.right;
  const x = (index: number) => PAD.left + (points.length === 1 ? inner / 2 : (index / (points.length - 1)) * inner);
  const y = (value: number) => PAD.top + (1 - value / max) * (H - PAD.top - PAD.bottom);
  const path = (key: "a" | "b") => points.map((point, index) => (point[key] === null ? null : `${x(index)},${y(point[key]!)}`)).filter(Boolean).join(" ");
  const every = Math.max(1, Math.ceil(points.length / 6));
  function move(event: React.MouseEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left;
    setHover(Math.min(points.length - 1, Math.max(0, Math.round(((px - PAD.left) / inner) * (points.length - 1)))));
  }
  const active = hover === null ? null : points[hover];
  return (
    <div ref={wrap} className="relative">
      <div className="mb-1 flex gap-4 font-mono text-[10px] text-[#8B93A1]"><span className="flex items-center gap-1.5"><span className="h-0.5 w-3" style={{ background: YELLOW }} />{aLabel}</span><span className="flex items-center gap-1.5"><span className="h-0.5 w-3" style={{ background: BLUE }} />{bLabel}</span></div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img" aria-label={label} onMouseMove={move} onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((fraction) => <g key={fraction}><line x1={PAD.left} x2={W - PAD.right} y1={y(max * fraction)} y2={y(max * fraction)} stroke={GRID} /><text x={PAD.left - 5} y={y(max * fraction) + 3} textAnchor="end" fontSize="9" fill={MUTED} fontFamily={MONO}>{format(max * fraction)}</text></g>)}
        {points.map((point, index) => index % every === 0 ? <text key={index} x={x(index)} y={H - 6} textAnchor="middle" fontSize="9" fill={MUTED} fontFamily={MONO}>{point.label}</text> : null)}
        <polyline points={path("b")} fill="none" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" />
        <polyline points={path("a")} fill="none" stroke={YELLOW} strokeWidth="2" strokeLinejoin="round" />
        {hover !== null ? <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={H - PAD.bottom} stroke={MUTED} strokeDasharray="3 3" /> : null}
        {active && hover !== null ? <>{active.a !== null ? <circle cx={x(hover)} cy={y(active.a)} r="4" fill={YELLOW} stroke="#0B0D10" strokeWidth="2" /> : null}{active.b !== null ? <circle cx={x(hover)} cy={y(active.b)} r="4" fill={BLUE} stroke="#0B0D10" strokeWidth="2" /> : null}</> : null}
      </svg>
      {active && hover !== null ? <Tooltip left={(x(hover) / W) * 100}><div className="text-[#8B93A1]">{active.label}</div><div>{aLabel} {active.a === null ? "–" : format(active.a)}</div><div>{bLabel} {active.b === null ? "–" : format(active.b)}</div></Tooltip> : null}
    </div>
  );
}

/** Ranked horizontal bars with the value at the end; the largest bar fills the row. */
export function Ranking({ rows, format, empty }: { rows: Array<{ label: string; value: number; note?: string }>; format: Format; empty: string }) {
  if (!rows.length) return <p className="py-6 text-center text-xs text-[#6B7380]">{empty}</p>;
  const max = Math.max(...rows.map((row) => row.value), 1e-9);
  return (
    <ul className="grid gap-2">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline gap-2 text-xs"><span className="min-w-0 flex-1 truncate font-mono text-[#C9CED6]" title={row.label}>{row.label || "unknown"}</span>{row.note ? <span className="font-mono text-[10px] text-[#6B7380]">{row.note}</span> : null}<span className="font-mono text-[#E6E9EE]">{format(row.value)}</span></div>
          <div className="mt-1 h-1.5 bg-[#161B22]"><div className="h-full" style={{ width: `${Math.max(2, (row.value / max) * 100)}%`, background: YELLOW }} /></div>
        </li>
      ))}
    </ul>
  );
}
