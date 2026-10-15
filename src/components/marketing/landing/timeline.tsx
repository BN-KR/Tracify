"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

/* ---------- Timeline: one run replayed second by second as you scroll ---------- */

type Step = {
  t: number;
  kind: string;
  title: string;
  detail: string;
  cost: number;
  tone?: "warn" | "root";
};

const steps: Step[] = [
  { t: 0, kind: "user.message", title: "“Where's my refund for order #4821?”", detail: "The run starts.", cost: 0 },
  { t: 0.12, kind: "llm.plan", title: "Plans: look up the order, then check the refund rules", detail: "gpt-4o · 412 tokens", cost: 0.004 },
  { t: 0.88, kind: "tool.orders.lookup", title: "Order found: delivered, refund requested", detail: "220 ms · ok", cost: 0 },
  { t: 1.4, kind: "tool.policy.search", title: "Refund rules search comes back empty", detail: "0 results · nobody noticed", cost: 0, tone: "warn" },
  { t: 2.1, kind: "llm.fallback", title: "A cheaper model guesses the refund already went out", detail: "gpt-4o-mini · 1,180 tokens", cost: 0.006, tone: "root" },
  { t: 3.02, kind: "tool.refund.issue", title: "Refund is never issued", detail: "skipped because of the guess", cost: 0 },
  { t: 3.4, kind: "reply", title: "“Your refund was issued on Monday.”", detail: "Sounds right. Is wrong.", cost: 0.002 },
];

const total = steps[steps.length - 1].t;

function StepRow({ step, i, progress, reduce }: { step: Step; i: number; progress: MotionValue<number>; reduce: boolean }) {
  const at = i / (steps.length - 1);
  const start = Math.max(0, at - 0.08);
  const show = useTransform(progress, [start, at], [0, 1]);
  const x = useTransform(progress, [start, at], [i % 2 ? 60 : -60, 0]);
  const dot = useTransform(progress, [at - 0.01, at], [0.4, 1]);
  const left = i % 2 === 0;

  const card = (
    <motion.div
      style={reduce ? undefined : { opacity: show, x }}
      className={`border p-5 ${
        step.tone === "root"
          ? "border-[#f4d44d] bg-[#f4d44d] text-black shadow-[6px_6px_0_#eceae3]"
          : step.tone === "warn"
            ? "border-dashed border-[#f4d44d] text-[#eceae3]"
            : "border-white/20 bg-[#0d0d0d] text-[#eceae3]"
      }`}
    >
      <div className={`flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] ${step.tone === "root" ? "text-black/70" : "text-white/50"}`}>
        <span>{step.kind}</span>
        <span>{step.t.toFixed(2)}s</span>
      </div>
      <p className="mt-3 font-pixel text-2xl leading-[1.05] tracking-[-0.05em]">{step.title}</p>
      <p className={`mt-2 text-sm ${step.tone === "root" ? "text-black/70" : "text-white/55"}`}>{step.detail}</p>
      {step.tone === "root" && <span className="mt-4 inline-block bg-black px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#f4d44d]">Root cause</span>}
      {step.tone === "warn" && <span className="mt-4 inline-block border border-[#f4d44d] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#f4d44d]">Warning</span>}
    </motion.div>
  );

  return (
    <li className="relative grid grid-cols-[28px_1fr] gap-5 md:grid-cols-[1fr_44px_1fr] md:gap-8">
      <div className={`hidden md:block ${left ? "" : "invisible"}`}>{left && card}</div>
      <div className="relative flex justify-center pt-6">
        <motion.span
          style={reduce ? undefined : { scale: dot, opacity: dot }}
          className={`relative z-10 block size-4 ${step.tone ? "bg-[#f4d44d]" : "bg-[#eceae3]"} ${step.tone === "root" ? "outline outline-4 outline-[#f4d44d]/30" : ""}`}
        />
      </div>
      <div className="md:hidden">{card}</div>
      <div className={`hidden md:block ${left ? "invisible" : ""}`}>{!left && card}</div>
    </li>
  );
}

export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.85"] });
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [clock, setClock] = useState({ t: 0, cost: 0, n: 0 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const p = Math.min(1, Math.max(0, v));
    const n = Math.min(steps.length, Math.floor(p * (steps.length - 1) + 0.0001) + 1);
    const cost = steps.slice(0, n).reduce((sum, s) => sum + s.cost, 0);
    setClock({ t: p * total, cost, n });
  });

  const shown = reduce ? { t: total, cost: steps.reduce((s, x) => s + x.cost, 0), n: steps.length } : clock;

  return (
    <section className="relative bg-[#090909] px-5 py-24 text-[#eceae3] md:px-10 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">Replay a run</p>
        <h2 className="mx-auto mt-5 max-w-4xl text-center font-pixel text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.07em]">
          3.4 seconds. <span className="text-[#f4d44d]">One wrong guess.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-center text-base leading-7 text-white/65">Scroll to play the run back one step at a time, the way Tracify records it.</p>

        <div ref={ref} className="relative mt-16">
          {/* The track and the line that draws down it */}
          <div className="absolute bottom-0 left-[13px] top-0 w-0.5 bg-white/10 md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />
          <motion.div
            style={reduce ? undefined : { scaleY: fill }}
            className="absolute bottom-0 left-[13px] top-0 w-0.5 origin-top bg-[#f4d44d] md:left-1/2 md:-translate-x-1/2"
            aria-hidden="true"
          />
          <ol className="relative grid gap-10 md:gap-6">
            {steps.map((s, i) => (
              <StepRow key={s.kind} step={s} i={i} progress={scrollYProgress} reduce={reduce} />
            ))}
          </ol>
        </div>
        {/* Live counter that rides the bottom of the screen and ticks as the run plays */}
        <div className="sticky bottom-5 z-20 mx-auto mt-12 flex w-fit divide-x divide-white/15 border border-white/20 bg-[#090909]/90 font-mono text-[11px] uppercase tracking-[0.12em] backdrop-blur">
          <span className="px-4 py-3">
            <span className="text-white/50">Time </span>
            <span className="tabular-nums text-[#f4d44d]">{shown.t.toFixed(2)}s</span>
          </span>
          <span className="px-4 py-3">
            <span className="text-white/50">Steps </span>
            <span className="tabular-nums">{shown.n}/{steps.length}</span>
          </span>
          <span className="px-4 py-3">
            <span className="text-white/50">Cost </span>
            <span className="tabular-nums">${shown.cost.toFixed(3)}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
