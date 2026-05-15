"use client";

import { motion, Variants } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────

type SpanType = "llm_call" | "tool_call" | "decision" | "error" | "run_end";

interface SpanRow {
  type: SpanType;
  label: string;
  latency: string;
  cost: string;
}

// ── Data ───────────────────────────────────────────────────────────────────

const SPANS: SpanRow[] = [
  { type: "llm_call",  label: "claude-sonnet-4-5",  latency: "420ms", cost: "$1.86" },
  { type: "tool_call", label: "web_search",          latency: "180ms", cost: "$0.42" },
  { type: "decision",  label: "route_to_summary",    latency: "32ms",  cost: "$0.00" },
  { type: "llm_call",  label: "gpt-4o-mini",         latency: "310ms", cost: "$1.24" },
  { type: "run_end",   label: "completed",            latency: "1.24s", cost: "$3.52" },
];

// ── Semantic Style Maps (Color allowed for DATA) ──────────────────────────

const DATA_STYLES: Record<SpanType, { color: string; bg: string }> = {
  llm_call:  { color: "#818CF8", bg: "rgba(129, 140, 248, 0.1)" },
  tool_call: { color: "#34D399", bg: "rgba(52, 211, 153, 0.1)" },
  decision:  { color: "#FBBF24", bg: "rgba(251, 191, 36, 0.1)" },
  error:     { color: "#F87171", bg: "rgba(248, 113, 113, 0.1)" },
  run_end:   { color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
};

// ── Animation Variants ─────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
  },
};

// ── Components ─────────────────────────────────────────────────────────────

function SpanBadge({ type }: { type: SpanType }) {
  const style = DATA_STYLES[type];
  const labels: Record<SpanType, string> = {
    llm_call: "llm_call",
    tool_call: "tool_call",
    decision: "decision",
    error: "error",
    run_end: "run_end",
  };

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
      style={{
        color: style.color,
        border: `1px solid ${style.color}40`,
        backgroundColor: style.bg,
      }}
    >
      {labels[type]}
    </span>
  );
}

export function TracePreview() {
  return (
    <div
      className="w-full max-w-[520px]"
      style={{ border: "1px solid #2A2A2A", backgroundColor: "#111111" }}
      aria-label="Example live agent trace"
    >
      {/* Top Bar — Monochrome */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid #2A2A2A", backgroundColor: "#161616" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="w-2 h-2 bg-[#2A2A2A]" />
            <div className="w-2 h-2 bg-[#2A2A2A]" />
            <div className="w-2 h-2 bg-[#2A2A2A]" />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#666666]">
            live trace
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Status dot — white pulse (UI indicator, but tied to live state) */}
          <div className="w-1.5 h-1.5 bg-white animate-mono-pulse" />
          <span className="font-mono text-[11px] text-[#999999]">run_8f21a9</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col"
        >
          {SPANS.map((span, i) => (
            <motion.div
              key={i}
              variants={rowVariants}
              className="flex items-center px-4 h-11 transition-all duration-200 ease-out hover:bg-[#161616] active:scale-[0.99]"
              style={{
                borderBottom: i < SPANS.length - 1 ? "1px solid #2A2A2A" : "none",
              }}
            >
              <div className="w-24 shrink-0">
                <SpanBadge type={span.type} />
              </div>
              <div className="flex-1 font-mono text-[13px] text-[#CCCCCC] truncate px-3">
                {span.label}
              </div>
              <div className="w-16 font-mono text-[12px] text-[#666666] text-right">
                {span.latency}
              </div>
              <div className="w-16 font-mono text-[12px] text-[#999999] text-right">
                {span.cost}
              </div>
              <div className="w-8 flex justify-end pl-2">
                {span.type === "run_end" ? (
                  <span className="text-[#10B981] text-[12px]">✓</span>
                ) : span.type === "error" ? (
                  <span className="text-[#F87171] text-[12px]">!</span>
                ) : (
                  <div className="w-1 h-1 bg-[#2A2A2A]" />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer — Monochrome */}
      <div
        className="px-4 py-3 border-t flex items-center gap-4"
        style={{ borderColor: "#2A2A2A", backgroundColor: "#161616" }}
      >
        <span className="font-mono text-[11px] text-[#666666]">
          Total cost: <span className="text-[#CCCCCC]">$3.52</span>
        </span>
        <span className="w-px h-3 bg-[#2A2A2A]" />
        <span className="font-mono text-[11px] text-[#666666]">
          Duration: <span className="text-[#CCCCCC]">1.24s</span>
        </span>
        <span className="w-px h-3 bg-[#2A2A2A]" />
        <span className="font-mono text-[11px] text-[#666666]">
          Spans: <span className="text-[#CCCCCC]">5</span>
        </span>
      </div>
    </div>
  );
}
