"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Span = { name: string; kind: string; start: number; width: number; ms: string; bad?: boolean };
type Run = { id: string; agent: string; status: "ok" | "failed"; note: string; spans: Span[]; total: string; tokens: string; cost: string };

const RUNS: Run[] = [
  {
    id: "run_8f3a", agent: "support-agent", status: "failed", note: "refund_api returned 503 at step 4",
    spans: [
      { name: "support-agent", kind: "agent", start: 0, width: 100, ms: "4.2s" },
      { name: "classify_intent", kind: "llm", start: 2, width: 14, ms: "610ms" },
      { name: "lookup_order", kind: "tool", start: 17, width: 20, ms: "880ms" },
      { name: "refund_api", kind: "tool", start: 38, width: 46, ms: "1.9s", bad: true },
      { name: "write_reply", kind: "llm", start: 85, width: 14, ms: "590ms" },
    ],
    total: "4.2s", tokens: "3,184", cost: "$0.021",
  },
  {
    id: "run_c71d", agent: "research-agent", status: "ok", note: "9 sources read, 1 retry",
    spans: [
      { name: "research-agent", kind: "agent", start: 0, width: 100, ms: "11.8s" },
      { name: "plan", kind: "llm", start: 1, width: 9, ms: "1.1s" },
      { name: "web_search", kind: "tool", start: 11, width: 25, ms: "2.9s" },
      { name: "read_pages", kind: "tool", start: 30, width: 38, ms: "4.4s" },
      { name: "synthesize", kind: "llm", start: 69, width: 30, ms: "3.5s" },
    ],
    total: "11.8s", tokens: "18,902", cost: "$0.164",
  },
  {
    id: "run_2be9", agent: "ops-agent", status: "failed", note: "retry loop: 6 identical calls",
    spans: [
      { name: "ops-agent", kind: "agent", start: 0, width: 100, ms: "7.3s" },
      { name: "check_status", kind: "tool", start: 3, width: 12, ms: "420ms" },
      { name: "restart_job", kind: "tool", start: 16, width: 12, ms: "380ms", bad: true },
      { name: "restart_job", kind: "tool", start: 30, width: 12, ms: "390ms", bad: true },
      { name: "restart_job", kind: "tool", start: 44, width: 12, ms: "400ms", bad: true },
    ],
    total: "7.3s", tokens: "5,240", cost: "$0.038",
  },
];

const dither = "repeating-linear-gradient(90deg,currentColor 0 2px,transparent 2px 4px)";

/** A product-like trace card that cycles through real-looking agent runs. */
export function TracePreview({ cycle = true, only }: { cycle?: boolean; only?: number }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(only ?? 0);
  useEffect(() => {
    if (!cycle || reduce || only !== undefined) return;
    const t = setInterval(() => setI((n) => (n + 1) % RUNS.length), 6500);
    return () => clearInterval(t);
  }, [cycle, reduce, only]);
  const run = RUNS[i];

  return (
    <div className="w-full max-w-lg border border-white/20 bg-[#090909]/70 font-mono text-[#eceae3] backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/15 px-4 py-3 text-[10px] uppercase tracking-[0.12em]">
        <span className="text-white/60">{run.id} · {run.agent}</span>
        <span className={`px-2 py-0.5 ${run.status === "failed" ? "bg-[#f4d44d] text-black" : "border border-white/30 text-white/80"}`}>{run.status}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={run.id} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="px-4 py-4">
          <ul className="grid gap-2.5">
            {run.spans.map((s, k) => (
              <li key={`${s.name}-${k}`} className="grid grid-cols-[96px_1fr_44px] items-center gap-3 text-[10px]">
                <span className={`truncate ${s.bad ? "text-[#f4d44d]" : "text-white/70"}`}>{s.name}</span>
                <div className="relative h-3 bg-white/[0.06]">
                  <motion.div
                    className={`absolute inset-y-0 origin-left ${s.bad ? "text-[#f4d44d]" : "text-white/55"}`}
                    style={{ left: `${s.start}%`, width: `${s.width}%` }}
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 + k * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="absolute inset-y-0 left-0 w-[40%]" style={{ backgroundImage: dither }} />
                    <div className="absolute inset-y-0 right-0 w-[60%] bg-current" />
                  </motion.div>
                </div>
                <span className="text-right text-white/45">{s.ms}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-white/10 pt-3 text-[10px] normal-case tracking-normal text-white/55">
            {run.status === "failed" ? "Found it: " : "Clean run: "}
            <span className="text-[#eceae3]">{run.note}</span>
          </p>
        </motion.div>
      </AnimatePresence>
      <div className="grid grid-cols-3 border-t border-white/15 text-[10px] uppercase tracking-[0.12em]">
        {[["Latency", run.total], ["Tokens", run.tokens], ["Cost", run.cost]].map(([k, v]) => (
          <div key={k} className="border-r border-white/15 px-4 py-3 last:border-r-0">
            <p className="text-white/40">{k}</p>
            <p className="mt-1 text-sm normal-case tracking-normal">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
