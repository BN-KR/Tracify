"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { formatDuration, stepKind } from "./format";

export function TraceCanvasNode({ data, selected }: NodeProps) {
  const kind = stepKind(String(data.kind ?? "span"));
  const name = String(data.name ?? "Step");
  const isAgent = kind === "tool" || kind === "model";
  const failed = Number(data.errors ?? data.failed ?? 0) > 0;
  const color = failed ? "#FF6B6B" : kind === "tool" ? "#8AB4FF" : kind === "model" || kind === "llm" || kind === "generation" ? "#F4D44D" : "#8B93A1";
  const count = Number(data.count ?? data.runs ?? 0);
  const traces = Number(data.traces ?? 0);
  const latency = Number(data.latencyMs ?? data.p50LatencyMs ?? 0);
  const errors = Number(data.errors ?? data.failed ?? 0);
  const onActivate = data.onActivate as (() => void) | undefined;
  const flowHandles = (
    <>
      <Handle id="in-top-center" type="target" position={Position.Top} className="!invisible !size-1" />
      <Handle id="out-bottom" type="source" position={Position.Bottom} className="!invisible !size-1" />
      <Handle id="out-right" type="source" position={Position.Right} style={{ top: "70%" }} className="!invisible !size-1" />
    </>
  );

  if (kind === "__start__" || kind === "__end__") {
    const start = kind === "__start__";
    return (
      <>
        <Handle id="in-right" type="target" position={Position.Right} className="!invisible !size-1" />
        {flowHandles}
        <div className="flex items-center justify-center font-mono text-[11px] font-semibold text-[#0B0D10]"
          style={{ width: 120, height: 62, padding: "15px 0" }}>
          <span className="flex h-8 w-full items-center justify-center rounded" style={{ background: start ? "#3DDC84" : "#FF6B6B" }}>{start ? "start" : "end"}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <Handle type="target" position={Position.Left} className="!invisible !size-1" />
      <Handle type="source" position={Position.Right} className="!invisible !size-1" />
      <Handle id="in-right" type="target" position={Position.Right} className="!invisible !size-1" />
      <Handle id="in-top" type="target" position={Position.Top} style={{ left: "66%" }} className="!invisible !size-1" />
      <div
        className={`relative flex items-center gap-2 overflow-hidden border bg-[#111418] font-sans text-[#E6E9EE] shadow-sm ${selected ? "border-[#F4D44D]" : failed ? "border-[#5A2A2A]" : "border-[#262C35]"}`}
        style={{ width: isAgent ? 190 : 205, height: 62, borderLeft: `3px solid ${color}`, borderRadius: 3, cursor: onActivate ? "pointer" : undefined }}
        title={name}
        onClick={onActivate ? (event) => { event.stopPropagation(); onActivate(); } : undefined}
        onKeyDown={onActivate ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onActivate(); } } : undefined}
        role={onActivate ? "button" : undefined}
        tabIndex={onActivate ? 0 : undefined}
        aria-label={onActivate ? `${kind} ${name}: ${count} runs in ${traces} traces, ${errors} errors, median latency ${formatDuration(latency)}` : undefined}
      >
        <div className="min-w-0 flex-1 px-2.5 py-1.5">
          <div className="truncate text-[12px] font-medium leading-4" title={name}>{name}</div>
          <div className="mt-1 truncate font-mono text-[10px] leading-3 text-[#8B93A1]">
            {data.aggregate ? `${count.toLocaleString()}× · p50 ${formatDuration(latency)} · ${errors} err` : isAgent ? `${count.toLocaleString()}× · ${formatDuration(latency)}${errors ? ` · ${errors} err` : ""}` : `${count > 1 ? `${count} steps · ` : ""}${formatDuration(latency)}${Number(data.costUsd) ? ` · $${Number(data.costUsd).toFixed(4)}` : ""}${errors ? ` · ${errors} err` : ""}`}
          </div>
        </div>
        <span className="sr-only">{name}; {count} runs in {traces} traces; {errors} errors; median latency {formatDuration(latency)}</span>
      </div>
      {flowHandles}
      <Handle id="out-left" type="source" position={Position.Left} className="!invisible !size-1" />
      <Handle id="out-top" type="source" position={Position.Top} style={{ left: "33%" }} className="!invisible !size-1" />
    </>
  );
}
