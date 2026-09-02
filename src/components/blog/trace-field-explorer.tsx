"use client";

import { useId, useState } from "react";

type ExplorerMode = "debug" | "evaluate" | "cost";

type FieldLine = {
  text: string;
  modes: ExplorerMode[];
};

const MODES: Array<{ value: ExplorerMode; label: string; hint: string }> = [
  { value: "debug", label: "I need to debug", hint: "Reconstruct what happened and why" },
  { value: "evaluate", label: "I need to evaluate", hint: "Score correctness against an expected outcome" },
  { value: "cost", label: "I need to analyze cost", hint: "Attribute spend to a specific run and cause" },
];

// A single illustrative trace document (run -> trace -> two spans). Each line is tagged with the
// job(s) it primarily serves so the explorer can highlight a subset without changing the document.
const TRACE_LINES: FieldLine[] = [
  { text: "{", modes: [] },
  { text: '  "run_id": "run_8f2a1c",', modes: ["debug", "evaluate", "cost"] },
  { text: '  "goal": "Answer a billing question from account context",', modes: ["evaluate"] },
  { text: '  "user_id": "usr_4471",', modes: ["debug"] },
  { text: '  "outcome": "completed",', modes: ["debug", "evaluate"] },
  { text: '  "trace_id": "trc_9b7e0d",', modes: ["debug", "cost"] },
  { text: '  "correlation_id": "corr_3d5f88",', modes: ["debug", "cost"] },
  { text: '  "prompt_version": "billing-agent@2026-08-30",', modes: ["debug", "evaluate"] },
  { text: '  "release_id": "rel_1042",', modes: ["debug", "evaluate"] },
  { text: '  "spans": [', modes: [] },
  { text: "    {", modes: [] },
  { text: '      "span_id": "spn_01",', modes: ["debug", "cost"] },
  { text: '      "parent_span_id": null,', modes: ["debug"] },
  { text: '      "type": "model_call",', modes: ["debug", "evaluate", "cost"] },
  { text: '      "model": "gpt-billing-4o-mini",', modes: ["cost"] },
  { text: '      "input": "Customer asks why they were charged twice.",', modes: ["debug", "evaluate"] },
  { text: '      "output": "Calling refund-lookup before answering.",', modes: ["debug", "evaluate"] },
  { text: '      "started_at": "2026-08-30T14:02:01.100Z",', modes: ["debug"] },
  { text: '      "ended_at": "2026-08-30T14:02:01.900Z",', modes: ["debug"] },
  { text: '      "status": "ok",', modes: ["debug", "evaluate"] },
  { text: '      "retry_of": null,', modes: ["debug", "cost"] },
  { text: '      "prompt_tokens": 612,', modes: ["cost"] },
  { text: '      "completion_tokens": 84,', modes: ["cost"] },
  { text: '      "cost_usd": 0.00041', modes: ["cost"] },
  { text: "    },", modes: [] },
  { text: "    {", modes: [] },
  { text: '      "span_id": "spn_02",', modes: ["debug", "cost"] },
  { text: '      "parent_span_id": "spn_01",', modes: ["debug"] },
  { text: '      "type": "tool_call",', modes: ["debug", "evaluate", "cost"] },
  { text: '      "tool_name": "refund-lookup",', modes: ["debug", "evaluate"] },
  { text: '      "arguments": { "account_id": "acct_2291" },', modes: ["debug", "evaluate"] },
  { text: '      "result_summary": "2 refunds found, both settled",', modes: ["debug", "evaluate"] },
  { text: '      "started_at": "2026-08-30T14:02:02.010Z",', modes: ["debug"] },
  { text: '      "ended_at": "2026-08-30T14:02:02.640Z",', modes: ["debug", "cost"] },
  { text: '      "status": "ok",', modes: ["debug", "evaluate"] },
  { text: '      "retry_of": null,', modes: ["debug", "cost"] },
  { text: '      "api_cost_usd": 0.0002', modes: ["cost"] },
  { text: "    }", modes: [] },
  { text: "  ],", modes: [] },
  { text: '  "eval_score": 0.94,', modes: ["evaluate"] },
  { text: '  "eval_dataset_version": "billing-cases@14",', modes: ["evaluate"] },
  { text: '  "total_cost_usd": 0.00061', modes: ["cost"] },
  { text: "}", modes: [] },
];

export function TraceFieldExplorer({ title, intro }: { title: string; intro?: string }) {
  const headingId = useId();
  const [mode, setMode] = useState<ExplorerMode>("debug");

  return (
    <section aria-labelledby={headingId} className="my-8 border border-black bg-white p-5 text-black">
      <p id={headingId} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/70">
        {title}
      </p>
      {intro ? <p className="mt-2 text-sm leading-6 text-black/70">{intro}</p> : null}

      <div className="mt-4 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap" role="tablist" aria-label="Trace field job">
        {MODES.map((option) => {
          const selected = option.value === mode;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setMode(option.value)}
              className={`flex-1 min-w-[10rem] border px-3 py-2 text-left transition-colors ${
                selected ? "border-black bg-black text-white" : "border-black/40 bg-white text-black hover:border-black"
              }`}
            >
              <span className="block font-mono text-xs uppercase tracking-[0.06em]">{option.label}</span>
              <span className={`block text-[11px] leading-snug ${selected ? "text-white/80" : "text-black/60"}`}>
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="mt-4 overflow-x-auto border border-black/20 bg-black p-3 font-mono text-xs leading-6">
        <pre className="whitespace-pre">
          {TRACE_LINES.map((line, index) => {
            const relevant = line.modes.includes(mode);
            return (
              <div
                key={index}
                className={relevant ? "bg-[#f4d44d] text-black" : "text-[#f5f5f2]/50"}
              >
                {line.text || " "}
              </div>
            );
          })}
        </pre>
      </div>

      <p className="mt-3 text-xs text-black/60">
        This is one static illustrative trace document. Switching the toggle only changes which fields are highlighted
        locally in your browser — it does not call a model, fetch live telemetry, or alter the document. If scripting is
        unavailable, the same mapping is explained in the required-vs-optional field tables above.
      </p>
    </section>
  );
}
