"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Globe2, Layers3, LockKeyhole, ServerCog, ShieldCheck, Siren, UserRoundCog } from "lucide-react";

const icons = { lock: LockKeyhole, layers: Layers3, globe: Globe2, user: UserRoundCog, server: ServerCog, shield: ShieldCheck, siren: Siren };

export type Control = { title: string; icon: keyof typeof icons; summary: string; items: readonly string[] };

/** Tabbed list of control families; the right pane swaps with a short wipe. */
export function ControlExplorer({ controls }: { controls: readonly Control[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = controls[active];
  const Icon = icons[current.icon];
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div role="tablist" aria-label="Control families" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {controls.map((c, i) => {
          const TabIcon = icons[c.icon];
          const on = i === active;
          return (
            <button
              key={c.title}
              role="tab"
              id={`control-tab-${i}`}
              aria-selected={on}
              aria-controls="control-panel"
              onClick={() => setActive(i)}
              className={`flex min-w-[200px] items-center gap-4 border px-4 py-4 text-left font-mono text-[11px] uppercase tracking-[0.12em] transition-colors lg:min-w-0 ${
                on ? "border-[#f4d44d] bg-[#f4d44d] text-black" : "border-white/15 bg-[#111] text-white/75 hover:border-white/40"
              }`}
            >
              <span className={`font-pixel text-2xl leading-none ${on ? "text-black" : "text-[#f4d44d]"}`}>0{i + 1}</span>
              <TabIcon className="size-4 shrink-0" aria-hidden="true" />
              {c.title}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id="control-panel" aria-labelledby={`control-tab-${active}`} className="relative min-h-[420px] overflow-hidden border border-white/15 bg-[#111] p-7 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.title}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
          >
            <Icon className="size-10 text-[#f4d44d]" strokeWidth={1.2} aria-hidden="true" />
            <h3 className="mt-8 font-pixel text-5xl leading-none tracking-[-0.06em] md:text-6xl">{current.title}</h3>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">{current.summary}</p>
            <ul className="mt-8 divide-y divide-white/15 border-y border-white/15">
              {current.items.map((item) => (
                <li key={item} className="flex gap-4 py-4 text-sm leading-6 text-white/65">
                  <span className="mt-2 size-2 shrink-0 bg-[#f4d44d]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
