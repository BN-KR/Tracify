"use client";

import { BaseEdge, EdgeLabelRenderer, getStraightPath, useStore, type EdgeProps } from "@xyflow/react";

/** Direct straight connectors; self-repeats use an open, square loop above their card. */
export function TraceMapEdge(props: EdgeProps) {
  const zoom = useStore((state) => state.transform[2]);
  const data = props.data ?? {};
  const onActivate = data.onActivate as (() => void) | undefined;
  let path: string;
  let labelX: number;
  let labelY: number;

  if (props.source === props.target) {
    const top = Math.min(props.sourceY, props.targetY) - 28;
    path = `M ${props.sourceX} ${props.sourceY} V ${top} H ${props.targetX} V ${props.targetY}`;
    labelX = (props.sourceX + props.targetX) / 2;
    labelY = top;
  } else {
    [path, labelX, labelY] = getStraightPath({
      sourceX: props.sourceX, sourceY: props.sourceY,
      targetX: props.targetX, targetY: props.targetY,
    });
  }

  return (
    <g
      onClick={onActivate ? (event) => { event.stopPropagation(); onActivate(); } : undefined}
      onKeyDown={onActivate ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onActivate(); } } : undefined}
      role={onActivate ? "button" : undefined}
      tabIndex={onActivate ? 0 : undefined}
      aria-label={onActivate ? `${String(data.source)} to ${String(data.target)}: ${data.count} calls in ${data.traces} traces` : undefined}
    >
      <BaseEdge id={props.id} path={path} markerEnd={props.markerEnd} style={{ ...props.style, strokeWidth: zoom < 0.65 ? 0.75 : props.style?.strokeWidth }} interactionWidth={20} />
      {data.label !== undefined && zoom >= 0.8 ? (
        <EdgeLabelRenderer>
          <span className={`nodrag nopan rounded-sm border border-[#262C35] bg-[#0E1115] px-1 py-0.5 font-mono text-[10px] ${data.failed ? "text-[#FF8A8A]" : "text-[#C9CED6]"}`} style={{ position: "absolute", transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, pointerEvents: "none" }} aria-hidden="true">
            {String(data.label)}
          </span>
        </EdgeLabelRenderer>
      ) : null}
    </g>
  );
}
