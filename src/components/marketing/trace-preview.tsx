"use client";

import { useState } from "react";

const spans = [
  { name: "Plan research", kind: "LLM", duration: "0.6s", tone: "bg-zinc-400", detail: "Claude Sonnet · 1,842 input tokens" },
  { name: "Search sources", kind: "Tool", duration: "1.4s", tone: "bg-white", detail: "12 results returned · cache miss" },
  { name: "Fetch source", kind: "Tool", duration: "5.0s", tone: "bg-zinc-500", detail: "Timeout from source-api after 5 seconds" },
  { name: "Retry source", kind: "Retry", duration: "5.0s", tone: "bg-zinc-600", detail: "Automatic retry consumed remaining latency budget" },
  { name: "Fallback summary", kind: "Decision", duration: "0.0s", tone: "bg-white", detail: "Fallback chosen to preserve a helpful response" },
];

export function TracePreview() {
  const [activeIndex, setActiveIndex] = useState(2);
  const active = spans[activeIndex];

  return (
    <section className="overflow-hidden border border-white/20 bg-[#101010] shadow-2xl" aria-label="Interactive agent run trace">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Research agent / production</p><p className="mt-1 font-sans text-sm text-white">Investigate a failed response</p></div><span className="font-mono text-[10px] text-zinc-500">run_8f21a9</span></div>
      <div className="grid gap-0 border-b border-white/10 sm:grid-cols-[1.2fr_0.8fr]">
        <div className="divide-y divide-white/10">
          {spans.map((span, index) => <button key={span.name} type="button" onClick={() => setActiveIndex(index)} aria-pressed={index === activeIndex} className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white ${index === activeIndex ? "bg-white/[0.08]" : ""}`}><span className={`size-2 ${span.tone}`} /><span><span className="block font-sans text-sm text-zinc-100">{span.name}</span><span className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600">{span.kind}</span></span><span className="font-mono text-[11px] text-zinc-500">{span.duration}</span></button>)}
        </div>
        <div className="border-t border-white/10 bg-black p-5 sm:border-l sm:border-t-0"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">Selected step</p><p className="mt-5 font-sans text-xl text-white">{active.name}</p><p className="mt-3 text-sm leading-6 text-zinc-400">{active.detail}</p><div className="mt-8 border-t border-white/10 pt-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">What to do next</p><p className="mt-2 font-sans text-sm text-white">Add a fallback for source-api</p></div></div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.13em] text-zinc-500"><span>11.67s total</span><span>$0.22 cost</span><span className="text-white">Root cause found</span></div>
    </section>
  );
}
