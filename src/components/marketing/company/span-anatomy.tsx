"use client";

import { useState } from "react";

const kinds = {
  AGENT: { label: "Agent run", text: "The root. One run from request to final answer. Everything below hangs off it." },
  LLM: { label: "Model call", text: "One generation: model, tokens, cost and latency. Retries show as separate spans." },
  TOOL: { label: "Tool call", text: "One function the agent invoked, with its input, output and status." },
} as const;
type Kind = keyof typeof kinds;

const rows: { name: string; kind: Kind; start: number; width: number; fail?: boolean }[] = [
  { name: "support-agent", kind: "AGENT", start: 0, width: 100 },
  { name: "chat", kind: "LLM", start: 2, width: 26 },
  { name: "docs.search", kind: "TOOL", start: 30, width: 12 },
  { name: "chat · retry", kind: "LLM", start: 44, width: 22 },
  { name: "refund.issue", kind: "TOOL", start: 68, width: 30, fail: true },
];

/** A trace drawn as bars. Hover or focus a bar to learn what that kind of span is. */
export function SpanAnatomy() {
  const [kind, setKind] = useState<Kind>("AGENT");
  return (
    <div className="grid gap-px border border-black bg-black lg:grid-cols-[1.6fr_1fr]">
      <div className="bg-[#090909] p-5 text-[#eceae3] md:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">One trace / five spans</p>
        <ul className="mt-6 space-y-2">
          {rows.map((r) => (
            <li key={r.name} className="grid grid-cols-[110px_1fr] items-center gap-3 font-mono text-[11px] sm:grid-cols-[140px_1fr]">
              <span className="truncate text-white/60">{r.name}</span>
              <button
                type="button"
                onMouseEnter={() => setKind(r.kind)}
                onFocus={() => setKind(r.kind)}
                onClick={() => setKind(r.kind)}
                aria-label={`${r.name}, ${kinds[r.kind].label}`}
                className="relative h-6 w-full bg-white/[0.06] text-left"
              >
                <span
                  className={`absolute inset-y-0 transition-colors ${r.fail ? "bg-[#f4d44d]" : kind === r.kind ? "bg-[#eceae3]" : "bg-white/35"}`}
                  style={{ left: `${r.start}%`, width: `${r.width}%` }}
                />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[#f4d44d]">Yellow = the step that failed</p>
      </div>
      <div className="bg-[#f4d44d] p-5 text-black md:p-8" role="status">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em]">{kind}</p>
        <h3 className="mt-4 font-pixel text-4xl leading-none tracking-[-0.06em]">{kinds[kind].label}</h3>
        <p className="mt-4 text-sm leading-6 text-black/75">{kinds[kind].text}</p>
      </div>
    </div>
  );
}
