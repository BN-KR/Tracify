"use client";

import { Handle, Position, useStore, type NodeProps } from "@xyflow/react";
import { formatDuration } from "./format";

export function TraceCanvasNode({ data, selected }: NodeProps) {
  const zoom = useStore((state) => state.transform[2]);
  const kind = String(data.kind ?? "span");
  const name = String(data.name ?? "Step");
  const isAgent = kind === "tool" || kind === "model";
  const failed = Number(data.errors ?? data.failed ?? 0) > 0;
  const color = failed ? "#FF6B6B" : kind === "tool" ? "#8AB4FF" : kind === "model" || kind === "llm" || kind === "generation" ? "#F4D44D" : "#8B93A1";
  const count = Number(data.count ?? data.runs ?? 0);
  const traces = Number(data.traces ?? 0);
  const latency = Number(data.latencyMs ?? data.p50LatencyMs ?? 0);
  const errors = Number(data.errors ?? data.failed ?? 0);
  const compact = zoom < 0.84;
  const onActivate = data.onActivate as (() => void) | undefined;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!invisible !size-1" />
      <div
        className={`relative flex items-center gap-2 overflow-visible border font-sans text-[#E6E9EE] ${compact ? "border-transparent bg-transparent shadow-none" : "overflow-hidden bg-[#111418] shadow-sm"} ${!compact && selected ? "border-[#F4D44D]" : !compact && failed ? "border-[#5A2A2A]" : !compact ? "border-[#262C35]" : ""}`}
        style={{ width: isAgent ? 190 : 205, height: 62, borderLeft: compact ? undefined : `3px solid ${color}`, borderRadius: 3, cursor: onActivate ? "pointer" : undefined }}
        title={compact ? name : undefined}
        onClick={onActivate ? (event) => { event.stopPropagation(); onActivate(); } : undefined}
        onKeyDown={onActivate ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onActivate(); } } : undefined}
        role={onActivate ? "button" : undefined}
        tabIndex={onActivate ? 0 : undefined}
        aria-label={onActivate ? `${kind} ${name}: ${count} runs in ${traces} traces, ${errors} errors, median latency ${formatDuration(latency)}` : undefined}
      >
        {compact ? (
          <span className="absolute left-1/2 top-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-[#111418]" style={{ borderColor: color, transform: `translate(-50%, -50%) scale(${Math.max(1, 1 / zoom)})`, boxShadow: `0 0 0 1px #0B0D10` }} aria-hidden="true">
            <span className="size-2 rounded-full" style={{ background: color }} />
          </span>
        ) : (
          <div className="min-w-0 flex-1 px-2.5 py-1.5">
            <div className="truncate text-[12px] font-medium leading-4" title={name}>{name}</div>
            <div className="mt-1 truncate font-mono text-[10px] leading-3 text-[#8B93A1]">
              {isAgent ? `${count.toLocaleString()}× · ${formatDuration(latency)}${errors ? ` · ${errors} err` : ""}` : `${count > 1 ? `${count} steps · ` : ""}${formatDuration(latency)}${Number(data.costUsd) ? ` · $${Number(data.costUsd).toFixed(4)}` : ""}${errors ? ` · ${errors} err` : ""}`}
            </div>
          </div>
        )}
        {compact ? <span className={`absolute inset-0 rounded-sm ring-1 ring-inset ${selected ? "ring-[#F4D44D]" : "ring-[#262C35]"}`} aria-hidden="true" /> : null}
        <span className="sr-only">{name}; {count} runs in {traces} traces; {errors} errors; median latency {formatDuration(latency)}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!invisible !size-1" />
    </>
  );
}
