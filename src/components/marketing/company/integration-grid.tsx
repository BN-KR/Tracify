"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PlugZap } from "lucide-react";
import { getThirdPartyBrand, ThirdPartyLogo } from "@/components/third-party-logo";

export type Integration = { name: string; description: string; badge?: string; category: string };

/** Filterable adapter grid. Chips filter by category; cards animate in and out. */
export function IntegrationGrid({ integrations }: { integrations: readonly Integration[] }) {
  const categories = ["All", ...new Set(integrations.map((i) => i.category))];
  const [active, setActive] = useState("All");
  const reduce = useReducedMotion();
  const shown = active === "All" ? integrations : integrations.filter((i) => i.category === active);
  return (
    <div>
      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={active === c}
            onClick={() => setActive(c)}
            className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
              active === c ? "border-[#f4d44d] bg-[#f4d44d] text-black" : "border-white/25 text-white/75 hover:border-white hover:text-white"
            }`}
          >
            {c}
            <span className="ml-2 opacity-60">{c === "All" ? integrations.length : integrations.filter((i) => i.category === c).length}</span>
          </button>
        ))}
      </div>
      <motion.ul layout={!reduce} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((integration) => {
            const brand = getThirdPartyBrand(integration.name);
            return (
              <motion.li
                key={integration.name}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="group flex min-h-[260px] flex-col justify-between border border-white/15 bg-[#111] p-6 transition-colors hover:border-[#f4d44d]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-12 items-center justify-center bg-[#eceae3] text-black">
                    {brand ? <ThirdPartyLogo brand={brand} className="size-6 object-contain" /> : <PlugZap className="size-5" strokeWidth={1.5} aria-hidden="true" />}
                  </span>
                  {integration.badge && <span className="bg-[#f4d44d] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-black">{integration.badge}</span>}
                </div>
                <div>
                  <h3 className="mt-8 font-pixel text-3xl leading-none tracking-[-0.05em]">{integration.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{integration.description}</p>
                  <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">{integration.category}</p>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
