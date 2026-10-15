"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";

const steps = [
  { kind: "AGENT", name: "support-agent", ms: 0, cost: 0, state: "ok", input: '"Refund order #4821 — arrived broken"', output: "plan: look up order, check policy, refund" },
  { kind: "LLM", name: "chat", ms: 820, cost: 0.0041, state: "ok", input: "system + user message (412 tokens)", output: "call order.lookup, docs.search" },
  { kind: "TOOL", name: "order.lookup", ms: 140, cost: 0, state: "ok", input: '{ "id": "4821" }', output: '{ "total": 64.0, "status": "delivered" }' },
  { kind: "TOOL", name: "docs.search", ms: 310, cost: 0, state: "ok", input: '{ "q": "refund policy broken item" }', output: "0 results" },
  { kind: "LLM", name: "chat · retry", ms: 1180, cost: 0.0187, state: "warn", input: "fallback model, no retrieved context", output: "call refund.issue (policy guessed)" },
  { kind: "TOOL", name: "refund.issue", ms: 5000, cost: 0, state: "fail", input: '{ "order": "4821", "amount": 64.0 }', output: "502 Bad Gateway after 5000 ms timeout" },
] as const;

const total = steps.reduce((a, s) => a + s.ms, 0);
const totalCost = steps.reduce((a, s) => a + s.cost, 0);

export function RunReplay() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(5);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing || reduce) return;
    const id = window.setInterval(() => {
      setActive((a) => {
        if (a >= steps.length - 1) {
          setPlaying(false);
          return a;
        }
        return a + 1;
      });
    }, 1400);
    return () => window.clearInterval(id);
  }, [playing, reduce]);

  const step = steps[active];
  const elapsed = steps.slice(0, active + 1).reduce((a, s) => a + s.ms, 0);
  const cost = steps.slice(0, active + 1).reduce((a, s) => a + s.cost, 0);

  return (
    <div className="border border-black bg-white shadow-[10px_10px_0_#090909]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black bg-black px-4 py-3 font-mono text-[9px] uppercase tracking-[0.13em] text-white">
        <span>run_9f3a · support-agent · illustrative</span>
        <button
          type="button"
          onClick={() => {
            if (!playing && active >= steps.length - 1) setActive(0);
            setPlaying((p) => !p);
          }}
          className="inline-flex min-h-9 items-center gap-2 bg-[#f4d44d] px-3 text-black hover:bg-white"
        >
          {playing ? <Pause className="size-3" aria-hidden="true" /> : <Play className="size-3" aria-hidden="true" />}
          {playing ? "Pause" : "Replay run"}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <ol className="border-b border-black lg:border-b-0 lg:border-r">
          {steps.map((s, i) => {
            const on = i === active;
            return (
              <li key={s.name + i}>
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setActive(i);
                  }}
                  aria-current={on}
                  className={`relative flex w-full items-center gap-4 border-b border-black/15 px-4 py-4 text-left transition-colors ${on ? "bg-[#f4d44d]" : i > active ? "opacity-40 hover:opacity-80" : "hover:bg-[#eceae3]"}`}
                >
                  <span className="font-mono text-[9px] text-black/55">0{i + 1}</span>
                  <span className="w-12 font-mono text-[9px] uppercase tracking-[0.1em]">{s.kind}</span>
                  <span className="flex-1 font-mono text-sm">{s.name}</span>
                  <span className="font-mono text-[10px]">{s.state === "fail" ? "FAILED" : s.ms ? `${s.ms} ms` : "root"}</span>
                  {on && <motion.span layoutId="replay-bar" className="absolute inset-y-0 left-0 w-1 bg-black" />}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-col justify-between gap-6 p-5">
          <motion.div key={active} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-black/55">
              {step.kind} / {step.name}
            </p>
            <dl className="mt-4 grid gap-4 text-sm">
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-black/55">Input</dt>
                <dd className="mt-1 break-words border border-black/20 bg-[#eceae3] p-3 font-mono text-xs">{step.input}</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-black/55">Output</dt>
                <dd className={`mt-1 break-words border p-3 font-mono text-xs ${step.state === "fail" ? "border-black bg-[#f4d44d]" : "border-black/20 bg-[#eceae3]"}`}>{step.output}</dd>
              </div>
            </dl>
            {step.state === "warn" && (
              <p className="mt-4 border-l-4 border-black pl-3 text-sm text-black/70">
                Search found nothing, so the agent fell back to a pricier model and guessed the policy. This step cost over 4x the first model call.
              </p>
            )}
            {step.state === "fail" && (
              <p className="mt-4 border-l-4 border-black pl-3 text-sm text-black/70">
                Root cause: empty retrieval led to a guessed refund call that timed out. Fix the search, not the tool.
              </p>
            )}
          </motion.div>

          <div>
            <div className="h-2 w-full bg-black/10">
              <motion.div className="h-full bg-black" animate={{ width: `${(elapsed / total) * 100}%` }} transition={{ duration: reduce ? 0 : 0.5 }} />
            </div>
            <div className="mt-3 flex justify-between font-mono text-[9px] uppercase tracking-[0.1em]">
              <span>{(elapsed / 1000).toFixed(1)}s elapsed</span>
              <span>${cost.toFixed(4)} spent</span>
              <span className="text-black/45">of {(total / 1000).toFixed(1)}s / ${totalCost.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
