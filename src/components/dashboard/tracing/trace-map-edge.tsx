"use client";

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

/** Keep cycle-closing and self-repeat routes outside the card field; forward routes use ELK's left-to-right order. */
export function TraceMapEdge(props: EdgeProps) {
  const data = props.data ?? {};
  const bounds = data.bounds as { maxX: number; minY: number } | undefined;
  const lane = Number(data.routeIndex ?? 0) % 8;
  const isReturn = props.targetX <= props.sourceX;
  let path: string;
  let labelX: number;
  let labelY: number;

  if (isReturn) {
    const outerX = (bounds?.maxX ?? Math.max(props.sourceX, props.targetX)) + 44 + (lane % 4) * 12;
    const laneY = (bounds?.minY ?? Math.min(props.sourceY, props.targetY)) - 36 - Math.floor(lane / 4) * 12;
    const entryX = props.targetX - 22;
    path = `M ${props.sourceX} ${props.sourceY} H ${outerX} V ${laneY} H ${entryX} V ${props.targetY} H ${props.targetX}`;
    labelX = (outerX + entryX) / 2;
    labelY = laneY - 5;
  } else {
    const result = getSmoothStepPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: props.sourcePosition,
      targetX: props.targetX,
      targetY: props.targetY,
      targetPosition: props.targetPosition,
      borderRadius: 6,
      offset: 18,
    });
    [path, labelX, labelY] = result;
  }

  return (
    <>
      <BaseEdge id={props.id} path={path} markerEnd={props.markerEnd} style={props.style} interactionWidth={20} />
      {data.label !== undefined ? (
        <EdgeLabelRenderer>
          <span className={`nodrag nopan rounded-sm border border-[#262C35] bg-[#0E1115] px-1 py-0.5 font-mono text-[10px] ${data.failed ? "text-[#FF8A8A]" : "text-[#C9CED6]"}`} style={{ position: "absolute", transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, pointerEvents: "none" }} aria-hidden="true">
            {String(data.label)}
          </span>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
