"use client";

import { useState } from "react";

const sampleSteps = [
  {
    id: "model",
    time: "12:41:08.120",
    kind: "MODEL",
    detail: "response drafted",
    summary: "The model drafted a response, but the run is not ready to release on this step alone.",
    rootCause: "Draft response needs downstream evidence.",
    decision: "Hold",
  },
  {
    id: "tool",
    time: "12:41:08.604",
    kind: "TOOL",
    detail: "knowledge.search → 0 results",
    summary: "Retrieval returned no supporting context before the agent continued.",
    rootCause: "Empty retrieval reached fallback.",
    decision: "Hold",
  },
  {
    id: "retry",
    time: "12:41:09.011",
    kind: "RETRY",
    detail: "fallback model invoked",
    summary: "The fallback path ran after retrieval failed, changing the model decision and cost profile.",
    rootCause: "Fallback was invoked without a retrieval guard.",
    decision: "Reject",
  },
  {
    id: "eval",
    time: "12:41:09.842",
    kind: "EVAL",
    detail: "groundedness → 0.42",
    summary: "The evaluation result is below the release threshold for this illustrative run.",
    rootCause: "Groundedness failed the sample release gate.",
    decision: "Reject",
  },
] as const;

export function LandingSampleRun() {
  const [selectedId, setSelectedId] = useState<(typeof sampleSteps)[number]["id"]>("tool");
  const selected = sampleSteps.find((step) => step.id === selectedId) ?? sampleSteps[1];

  return (
    <div className="bg-black p-6 text-white md:p-8">
      <div className="flex items-start justify-between gap-5 border-b border-white/15 pb-6">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/62">
            Sample run / illustrative evidence
          </p>
          <p className="mt-3 font-mono text-sm">support-agent / v2.4</p>
        </div>
        <span className="border border-[#f4d44d] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#f4d44d]">
          Review
        </span>
      </div>
      <div className="mt-7 border border-white/15" aria-label="Sample run steps">
        {sampleSteps.map((step) => {
          const isSelected = step.id === selected.id;

          return (
            <button
              key={step.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${step.kind}: ${step.detail}`}
              onClick={() => setSelectedId(step.id)}
              className={`grid w-full grid-cols-[auto_auto_minmax(0,1fr)] gap-2 border-b border-white/10 px-3 py-4 text-left font-mono text-[9px] last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#f4d44d] sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:gap-3 sm:px-4 ${isSelected ? "bg-[#f4d44d] text-black" : "text-white/72 hover:bg-white/10"}`}
            >
              <span className="text-[8px] opacity-60">{step.time}</span>
              <span className="text-[8px] opacity-60">{step.kind}</span>
              <span className="min-w-0 break-words">{step.detail}</span>
            </button>
          );
        })}
      </div>
      <div
        id="sample-run-detail"
        className="mt-7 grid gap-6 border-t border-white/15 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
        aria-live="polite"
      >
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/55">
            Root cause
          </p>
          <p className="mt-2 text-sm">{selected.rootCause}</p>
          <p className="mt-3 max-w-md text-xs leading-5 text-white/55">{selected.summary}</p>
        </div>
        <div className="sm:text-right">
          <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#f4d44d]">
            Release decision
          </p>
          <p className="mt-2 font-pixel text-3xl tracking-[-0.05em]">{selected.decision}</p>
        </div>
      </div>
    </div>
  );
}
