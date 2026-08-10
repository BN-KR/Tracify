"use client";

import Image from "next/image";
import { useState, type CSSProperties, type PointerEvent } from "react";
import { CircleDot } from "lucide-react";

const nodes = [
  {
    label: "Model",
    detail: "842ms · $0.018",
    color: "#f4d44d",
    position: "left-[12%] top-[18%]",
  },
  {
    label: "Tool",
    detail: "search_docs · 218ms",
    color: "#ff655a",
    position: "right-[11%] top-[28%]",
  },
  {
    label: "Eval",
    detail: "quality · 0.94",
    color: "#8b7cff",
    position: "left-[22%] bottom-[20%]",
  },
  {
    label: "Release",
    detail: "v2.4.0 · passed",
    color: "#7ee0b8",
    position: "right-[14%] bottom-[18%]",
  },
] as const;

function spotlightFrom(event: PointerEvent<HTMLDivElement>) {
  const bounds = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * 100,
    y: ((event.clientY - bounds.top) / bounds.height) * 100,
  };
}

export function InteractiveSignalMap() {
  const [active, setActive] = useState(0);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  return (
    <div
      onPointerMove={(event) => setSpotlight(spotlightFrom(event))}
      className="group relative min-h-[620px] overflow-hidden border border-white/15 bg-black"
      style={
        {
          "--spot-x": `${spotlight.x}%`,
          "--spot-y": `${spotlight.y}%`,
        } as CSSProperties
      }
    >
      <Image
        src="/images/explorations/agent-signal-map.png"
        alt="Abstract agent execution graph with model, tool, evaluation, and release signal paths"
        fill
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-70 transition-opacity group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle 220px at var(--spot-x) var(--spot-y), rgba(244,212,77,.2), transparent 70%)",
        }}
      />
      {nodes.map((node, index) => (
        <button
          key={node.label}
          type="button"
          onClick={() => setActive(index)}
          aria-pressed={active === index}
          className={`absolute ${node.position} border bg-black/90 px-3 py-2 text-left font-mono text-[8px] uppercase tracking-[0.12em] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${active === index ? "scale-105 text-white" : "border-white/20 text-zinc-500"}`}
          style={
            active === index
              ? {
                  borderColor: node.color,
                  boxShadow: `0 0 24px ${node.color}40`,
                }
              : undefined
          }
        >
          <span className="flex items-center gap-2">
            <span
              className="size-1.5 animate-pulse motion-reduce:animate-none"
              style={{ backgroundColor: node.color }}
            />
            {node.label}
          </span>
        </button>
      ))}
      <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4 border border-white/15 bg-black/90 p-4 backdrop-blur-md">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-zinc-600">
            Selected signal
          </p>
          <p className="mt-2 font-pixel text-2xl tracking-[-0.04em]">
            {nodes[active].label}
          </p>
        </div>
        <p className="font-mono text-[9px] text-zinc-400">
          {nodes[active].detail}
        </p>
      </div>
    </div>
  );
}

export function MotionArtwork() {
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  return (
    <div
      onPointerMove={(event) => setSpotlight(spotlightFrom(event))}
      className="group relative h-[760px] overflow-hidden"
      style={
        {
          "--spot-x": `${spotlight.x}%`,
          "--spot-y": `${spotlight.y}%`,
        } as CSSProperties
      }
    >
      <Image
        src="/images/explorations/failure-to-release.png"
        alt="Abstract black fragments resolving through an evaluation gate into a precise release structure"
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-1000 group-hover:scale-[1.03] motion-reduce:transition-none"
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(circle 300px at var(--spot-x) var(--spot-y), transparent, rgba(0,0,0,.2))",
        }}
      />
      <div className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/30 bg-[#f4d44d] text-black transition-transform duration-500 group-hover:rotate-180 motion-reduce:transition-none">
        <CircleDot className="size-5" />
      </div>
    </div>
  );
}
