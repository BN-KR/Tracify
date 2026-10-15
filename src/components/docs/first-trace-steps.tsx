"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const installs = {
  npm: "npm install tracify-sdk",
  pnpm: "pnpm add tracify-sdk",
  pip: "pip install tracify",
} as const;

const wrap = `import { traceAgent } from "tracify-sdk";

const runAgent = traceAgent(
  async (question: string) => callModel(question),
  { apiKey: process.env.TRACIFY_API_KEY },
);

await runAgent("Where is my order?");`;

const spans = [
  { name: "support-agent", kind: "AGENT", start: 0, width: 100 },
  { name: "chat", kind: "LLM", start: 2, width: 34 },
  { name: "order.lookup", kind: "TOOL", start: 38, width: 18 },
  { name: "chat · answer", kind: "LLM", start: 58, width: 38 },
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
      className="inline-flex items-center gap-1.5 border border-white/30 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#f4d44d] hover:text-black"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function FirstTraceSteps() {
  const [tab, setTab] = useState<keyof typeof installs>("npm");
  const reduce = useReducedMotion();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="flex min-w-0 flex-col border border-black bg-[#090909] text-[#eceae3]">
        <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4d44d]">01 · Install</span>
          <CopyButton text={installs[tab]} />
        </div>
        <div className="flex border-b border-white/15" role="tablist" aria-label="Package manager">
          {(Object.keys(installs) as (keyof typeof installs)[]).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${tab === key ? "bg-[#f4d44d] text-black" : "text-white/60 hover:text-white"}`}
            >
              {key}
            </button>
          ))}
        </div>
        <pre className="flex-1 overflow-x-auto p-4 font-mono text-[13px] leading-6"><span className="text-white/40">$ </span>{installs[tab]}</pre>
      </div>

      <div className="flex min-w-0 flex-col border border-black bg-[#090909] text-[#eceae3]">
        <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4d44d]">02 · Wrap one run</span>
          <CopyButton text={wrap} />
        </div>
        <pre className="flex-1 overflow-x-auto p-4 font-mono text-[12px] leading-6 text-white/85">{wrap}</pre>
      </div>

      <div className="flex min-w-0 flex-col border border-black bg-[#eceae3]">
        <div className="flex items-center justify-between border-b border-black px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em]">03 · See the trace</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]"><span className="size-1.5 animate-pulse bg-[#f4d44d] outline outline-1 outline-black" />live</span>
        </div>
        <ul className="flex-1 space-y-3 p-4" aria-label="Example trace waterfall">
          {spans.map((span, i) => (
            <li key={span.name}>
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-black/65">
                <span>{span.name}</span>
                <span>{span.kind}</span>
              </div>
              <div className="mt-1 h-3 bg-black/10">
                <motion.div
                  className={`h-full ${span.kind === "AGENT" ? "bg-[#090909]" : span.kind === "TOOL" ? "bg-[#f4d44d] outline outline-1 outline-black" : "bg-[#090909]/70"}`}
                  style={{ marginLeft: `${span.start}%`, maxWidth: `${100 - span.start}%` }}
                  initial={reduce ? false : { width: 0 }}
                  whileInView={{ width: `${span.width}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="border-t border-black p-4 text-sm leading-6 text-black/70">Open the newest run in the dashboard. Every model and tool call shows up as a span.</p>
      </div>
    </div>
  );
}
