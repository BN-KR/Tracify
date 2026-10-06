"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check, ChevronRight, Circle, Database, Sparkles, TriangleAlert, Wrench } from "lucide-react";
import { motion } from "framer-motion";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionPreference() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeToReducedMotion, getReducedMotionPreference, () => false);
}

const TraceSelectionContext = createContext<{
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
} | null>(null);

export function LandingTraceProvider({ children }: { children: ReactNode }) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (
    <TraceSelectionContext.Provider value={{ selectedIndex, setSelectedIndex }}>
      {children}
    </TraceSelectionContext.Provider>
  );
}

function useTraceSelection() {
  const context = useContext(TraceSelectionContext);
  if (!context) throw new Error("Landing trace elements must be inside LandingTraceProvider");
  return context;
}

export function LandingTraceLandscape() {
  const { selectedIndex, setSelectedIndex } = useTraceSelection();
  const reduceMotion = usePrefersReducedMotion();
  const nodes = [
    { x: 20, y: 80, label: "MODEL" },
    { x: 49, y: 54, label: "TOOL" },
    { x: 66, y: 41, label: "RETRIEVAL" },
    { x: 86, y: 19, label: "MISSING EVIDENCE" },
  ];

  return (
    <div className="landing-atlas-stage pointer-events-none absolute inset-0 overflow-hidden bg-[#050505]" data-active-event={nodes[selectedIndex]?.label.toLowerCase()} data-trace-reduced-motion={reduceMotion ? "true" : "false"}>
      <Image src="/media/tracify-trace-atlas-hero.png" alt="" fill sizes="100vw" priority className="landing-atlas-stage-image object-cover object-center" />
      {nodes.map((node, index) => {
        const isSelected = selectedIndex === index;
        return (
          <button
            key={node.label}
            type="button"
            aria-pressed={isSelected}
            aria-label={`Select ${node.label.toLowerCase()} event`}
            data-trace-event={index}
            onClick={() => setSelectedIndex(index)}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className="group pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-none p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
          >
            <span className={`landing-atlas-node block size-3 border ${isSelected ? "border-[#e8ff4c] bg-[#e8ff4c]" : "border-white bg-black"}`} aria-hidden="true" />
            <span className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.13em] transition-colors ${isSelected ? "text-[#e8ff4c]" : "text-white/55 group-hover:text-white"}`}>{node.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function LandingReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const events = [
  {
    time: "14:08:31.104",
    type: "MODEL",
    name: "support-agent · gpt-4.1",
    duration: "842 ms",
    detail: "The model drafted a response after receiving the customer question and the available conversation context.",
    finding: "Response drafted",
    status: "complete",
  },
  {
    time: "14:08:31.502",
    type: "TOOL",
    name: "orders.lookup",
    duration: "241 ms",
    detail: "The order lookup returned a record, but it did not establish whether the refund had been processed.",
    finding: "State not confirmed",
    status: "review",
  },
  {
    time: "14:08:32.017",
    type: "RETRIEVAL",
    name: "knowledge.search",
    duration: "118 ms",
    detail: "Retrieval returned no supporting sources. The run continued to response generation without evidence.",
    finding: "0 sources returned",
    status: "failure",
  },
  {
    time: "14:08:32.884",
    type: "EVALUATION",
    name: "groundedness",
    duration: "306 ms",
    detail: "The illustrative groundedness score is below the review threshold because the answer had no supporting source.",
    finding: "0.42 · review",
    status: "review",
  },
] as const;

const heroEvents = [
  { title: "Run started", detail: "", time: "00.0s", index: 0, kind: "play" },
  { title: "Model call", detail: "gpt-4o", time: "00.8s", index: 0, kind: "model" },
  { title: "Tool call", detail: "web_search", time: "12.4s", index: 1, kind: "tool" },
  { title: "Retrieval", detail: "vector_search", time: "28.1s", index: 2, kind: "retrieval" },
  { title: "No relevant results", detail: "Consider broader search or different query", time: "42.7s", index: 2, kind: "empty" },
] as const;

export function LandingHeroRunList() {
  const { selectedIndex, setSelectedIndex } = useTraceSelection();

  return (
    <div className="px-3">
      {heroEvents.map((event) => {
        const isSelected = selectedIndex === event.index;
        return (
          <button key={event.title} type="button" aria-pressed={isSelected} onClick={() => setSelectedIndex(event.index)} className={`trace-run-row group relative grid min-h-[47px] w-full grid-cols-[26px_minmax(0,1fr)_auto_12px] items-center gap-2 border-b border-white/10 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-white ${isSelected ? "is-selected" : ""}`}>
            <span className={`trace-run-icon ${event.kind === "empty" ? "trace-run-icon-empty" : ""}`} aria-hidden="true">{event.kind === "play" ? <span className="trace-play" /> : event.kind === "model" ? <Sparkles /> : event.kind === "tool" ? <Wrench /> : event.kind === "retrieval" ? <Database /> : null}</span>
            <span className="min-w-0"><span className="block truncate text-[10px] leading-4">{event.title}</span>{event.detail && <span className="block truncate text-[9px] leading-3 text-white/50">{event.detail}</span>}</span>
            <span className="font-mono text-[8px] tabular-nums text-white/45">{event.time}</span>
            {event.kind !== "play" && <ChevronRight className="size-3 text-white/65 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

export function LandingTraceStepPicker() {
  const { selectedIndex, setSelectedIndex } = useTraceSelection();

  return (
    <div role="group" aria-label="Choose a sample trace event" className="grid border-l border-t border-black/20 sm:grid-cols-4">
      {events.map((event, index) => {
        const isSelected = selectedIndex === index;
        return (
          <button
            key={event.type}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setSelectedIndex(index)}
            className={`group flex min-h-[130px] flex-col justify-between border-b border-r border-black/20 p-4 text-left transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] sm:min-h-[172px] sm:p-5 ${isSelected ? "bg-black text-white" : "bg-transparent text-black hover:bg-black hover:text-white"}`}
          >
            <span className={`flex items-center justify-between font-mono text-[9px] ${isSelected ? "text-white/55" : "text-black/45 group-hover:text-white/55"}`}>
              <span>{String(index + 1).padStart(2, "0")} / {event.name}</span>
              <span className={`size-2 ${isSelected ? "bg-[#e8ff4c]" : "bg-black group-hover:bg-[#e8ff4c]"}`} aria-hidden="true" />
            </span>
            <span className="font-pixel text-2xl uppercase tracking-[-0.04em] sm:text-3xl">{event.type}</span>
            <span className={`font-mono text-[8px] uppercase tracking-[0.12em] ${isSelected ? "text-white/45" : "text-black/40 group-hover:text-white/45"}`}>{event.duration}</span>
          </button>
        );
      })}
    </div>
  );
}

export function LandingTraceRecord() {
  const { selectedIndex, setSelectedIndex } = useTraceSelection();
  const selected = events[selectedIndex] ?? events[0];

  return (
    <div className="overflow-hidden border border-white/20 bg-black text-white shadow-[16px_16px_0_#cfcfcf]">
      <div className="flex flex-col justify-between gap-5 border-b border-white/15 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/55">
            Illustrative trace · sample data
          </p>
          <p className="mt-2 font-mono text-sm">support-agent / run_018</p>
        </div>
        <div className="grid grid-cols-3 gap-6 font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
          <div><span className="block text-white/35">Duration</span><span className="mt-1 block text-white">3.84 s</span></div>
          <div><span className="block text-white/35">Cost</span><span className="mt-1 block text-white">$0.0214</span></div>
          <div><span className="block text-white/35">Status</span><span className="mt-1 inline-flex items-center gap-1.5 text-white"><TriangleAlert className="size-3" aria-hidden="true" /> Review</span></div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-white/15 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-white/15 px-5 py-3 font-mono text-[8px] uppercase tracking-[0.14em] text-white/40 sm:px-7">
            <span>Run timeline</span><span>4 events</span>
          </div>
          <div role="group" aria-label="Sample trace events">
            {events.map((event, index) => {
              const isSelected = selectedIndex === index;
              const StatusIcon = event.status === "failure" ? TriangleAlert : event.status === "complete" ? Check : Circle;
              return (
                <button
                  key={event.type}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={event.type + ": " + event.name}
                  onClick={() => setSelectedIndex(index)}
                  className={"grid min-h-[76px] w-full grid-cols-[78px_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 px-4 text-left last:border-b-0 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:px-7 " + (isSelected ? "bg-white text-black" : "text-white/72 hover:bg-white/10")}
                >
                  <span className={"font-mono text-[8px] tabular-nums " + (isSelected ? "text-black/50" : "text-white/40")}>{event.time}</span>
                  <span className="min-w-0">
                    <span className={"flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.12em] " + (isSelected ? "text-black/55" : "text-white/45")}><StatusIcon className="size-3 shrink-0" aria-hidden="true" />{event.type}</span>
                    <span className="mt-1 block truncate font-mono text-[10px] sm:text-xs">{event.name}</span>
                  </span>
                  <span className={"font-mono text-[8px] tabular-nums " + (isSelected ? "text-black/50" : "text-white/40")}>{event.duration}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex min-h-[280px] flex-col justify-between p-5 sm:p-7" aria-live="polite">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/40">
              Selected event / {String(selectedIndex + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-4 font-pixel text-3xl leading-tight tracking-[-0.05em] sm:text-4xl">{selected.finding}</h3>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/65">{selected.detail}</p>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-4 font-mono text-[8px] uppercase tracking-[0.12em]">
            <span className="text-white/40">Event evidence</span>
            <Link href="/demo" className="inline-flex items-center gap-2 text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Open sample run <ArrowUpRight className="size-3" aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
