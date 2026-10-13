"use client";

import {
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

export type CanvasNodeData = Record<string, unknown>;
export type CanvasNode = Node<CanvasNodeData, "traceCard">;
export type CanvasEdge = Edge<Record<string, unknown>>;

const controlClass = "flex size-8 items-center justify-center border border-[#262C35] bg-[#111418] text-sm text-[#C9CED6] hover:bg-[#1A1F27] hover:text-white disabled:opacity-40";

export function TraceCanvas({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  focusId,
  label,
  onNodeClick,
  onEdgeClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onEdgeMouseEnter,
  onEdgeMouseLeave,
  onEscape,
  onZoomChange,
  children,
  className = "",
}: {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  nodeTypes: NodeTypes;
  edgeTypes?: EdgeTypes;
  focusId?: string | null;
  label: string;
  onNodeClick?: (node: CanvasNode) => void;
  onEdgeClick?: (edge: CanvasEdge) => void;
  onNodeMouseEnter?: (node: CanvasNode) => void;
  onNodeMouseLeave?: (node: CanvasNode) => void;
  onEdgeMouseEnter?: (edge: CanvasEdge) => void;
  onEdgeMouseLeave?: (edge: CanvasEdge) => void;
  onEscape?: () => void;
  onZoomChange?: (zoom: number) => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ReactFlowProvider>
      <TraceCanvasViewport {...{ nodes, edges, nodeTypes, edgeTypes, focusId, label, onNodeClick, onEdgeClick, onNodeMouseEnter, onNodeMouseLeave, onEdgeMouseEnter, onEdgeMouseLeave, onEscape, onZoomChange, children, className }} />
    </ReactFlowProvider>
  );
}

function TraceCanvasViewport({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  focusId,
  label,
  onNodeClick,
  onEdgeClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onEdgeMouseEnter,
  onEdgeMouseLeave,
  onEscape,
  onZoomChange,
  children,
  className,
}: Parameters<typeof TraceCanvas>[0]) {
  const flow = useReactFlow<CanvasNode, CanvasEdge>();
  const [instance, setInstance] = useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const lastFocus = useRef<string | null>(null);
  const center = useCallback((id: string, duration = 450) => {
    const node = flow.getNode(id);
    if (node) flow.setCenter(node.position.x + (node.measured?.width ?? 184) / 2, node.position.y + (node.measured?.height ?? 48) / 2, { zoom: Math.max(flow.getZoom(), 0.8), duration });
  }, [flow]);

  useEffect(() => {
    if (!focusId) { lastFocus.current = null; return; }
    if (lastFocus.current === focusId) return;
    lastFocus.current = focusId;
    center(focusId);
  }, [center, focusId]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (fullscreen) setFullscreen(false);
      onEscape?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, onEscape]);

  const fit = useCallback(() => flow.fitView({ padding: 0.18, duration: 500, minZoom: 0.1, maxZoom: 4 }), [flow]);
  const zoomBy = (factor: number) => flow.zoomTo(Math.max(0.1, Math.min(4, flow.getZoom() * factor)), { duration: 180 });
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button,input,select,textarea,[contenteditable=true]")) return;
    const step = 100 / Math.max(0.4, zoom);
    if (event.key === "ArrowLeft") { const view = flow.getViewport(); flow.setViewport({ ...view, x: view.x + step }, { duration: 120 }); }
    else if (event.key === "ArrowRight") { const view = flow.getViewport(); flow.setViewport({ ...view, x: view.x - step }, { duration: 120 }); }
    else if (event.key === "ArrowUp") { const view = flow.getViewport(); flow.setViewport({ ...view, y: view.y + step }, { duration: 120 }); }
    else if (event.key === "ArrowDown") { const view = flow.getViewport(); flow.setViewport({ ...view, y: view.y - step }, { duration: 120 }); }
    else if (event.key === "+" || event.key === "=") zoomBy(1.2);
    else if (event.key === "-") zoomBy(1 / 1.2);
    else if (event.key === "0") fit();
    else return;
    event.preventDefault();
  };
  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button,input,select,textarea,.react-flow__minimap")) return;
    const root = event.currentTarget.querySelector(".react-flow");
    if (!root) return;
    const bounds = root.getBoundingClientRect();
    const px = event.clientX - bounds.left;
    const py = event.clientY - bounds.top;
    const current = flow.getViewport();
    const zoom = Math.min(4, current.zoom * 1.2);
    const worldX = (px - current.x) / current.zoom;
    const worldY = (py - current.y) / current.zoom;
    void flow.setViewport({ x: px - worldX * zoom, y: py - worldY * zoom, zoom }, { duration: 180 });
  };

  return (
    <div role="group" aria-label={label} className={`${fullscreen ? "fixed inset-2 z-[100]" : "relative h-full min-h-[300px] w-full"} ${className}`} onKeyDown={handleKeyDown} onDoubleClick={handleDoubleClick}>
      <div className="absolute inset-0 overflow-hidden border border-[#1F242C] bg-[#0B0D10]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onInit={(value) => { setInstance(value); setZoom(value.getZoom()); }}
          onMove={(_, viewport) => { setZoom(viewport.zoom); onZoomChange?.(viewport.zoom); }}
          onNodeClick={(_, node) => onNodeClick?.(node as CanvasNode)}
          onEdgeClick={(_, edge) => onEdgeClick?.(edge as CanvasEdge)}
          onNodeMouseEnter={(_, node) => onNodeMouseEnter?.(node as CanvasNode)}
          onNodeMouseLeave={(_, node) => onNodeMouseLeave?.(node as CanvasNode)}
          onEdgeMouseEnter={(_, edge) => onEdgeMouseEnter?.(edge as CanvasEdge)}
          onEdgeMouseLeave={(_, edge) => onEdgeMouseLeave?.(edge as CanvasEdge)}
          minZoom={0.1}
          maxZoom={4}
          fitView
          fitViewOptions={{ padding: 0.18, minZoom: 0.1, maxZoom: 1.15 }}
          panOnDrag
          panOnScroll={false}
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          edgesFocusable
          nodesFocusable
          aria-label={label}
          role="group"
          proOptions={{ hideAttribution: true }}
          className="tracing-flow"
        />
        <MiniMap pannable zoomable position="bottom-left" style={{ width: 196, height: 128 }} ariaLabel={`${label} minimap`} className="!bottom-3 !left-3 !m-0 !border !border-[#262C35] !bg-[#111418]" maskColor="rgba(11,13,16,0.78)" nodeColor="#6B7380" />
        {children}
        <div role="group" aria-label="Canvas controls" className="absolute bottom-3 right-3 z-10 flex items-center divide-x divide-[#262C35] border border-[#262C35] bg-[#111418] shadow-lg">
          <button type="button" aria-label="Zoom out" className={controlClass} onClick={() => zoomBy(1 / 1.25)}>−</button>
          <span aria-live="polite" className="w-14 px-1 text-center font-mono text-[10px] text-[#8B93A1]">{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="Zoom in" className={controlClass} onClick={() => zoomBy(1.25)}>+</button>
          <button type="button" aria-label="Fit to view" title="Fit to view" className={controlClass} onClick={fit}>↗</button>
          <button type="button" aria-label="Zoom to selection" title="Zoom to selection" className={controlClass} disabled={!focusId} onClick={() => focusId && center(focusId)}>◎</button>
          <button type="button" aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"} title={fullscreen ? "Exit fullscreen" : "Fullscreen"} className={controlClass} onClick={() => setFullscreen((value) => !value)}>
            {fullscreen ? <Minimize2 aria-hidden="true" size={14} /> : <Maximize2 aria-hidden="true" size={14} />}
          </button>
        </div>
        {fullscreen ? <button type="button" aria-label="Close fullscreen canvas" className="sr-only" onClick={() => setFullscreen(false)}>Close</button> : null}
      </div>
      <span className="sr-only">{instance ? "Canvas ready. Drag to pan, scroll or pinch to zoom, use arrow keys to pan, plus or minus to zoom, and zero to fit." : "Preparing canvas…"}</span>
    </div>
  );
}
