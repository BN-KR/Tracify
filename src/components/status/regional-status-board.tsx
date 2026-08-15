"use client";

import { useEffect, useState } from "react";
import { Activity, CircleAlert, LoaderCircle } from "lucide-react";
import { TRACIFY_REGIONS, type TracifyRegionId } from "@/lib/regions";

type RegionState = "checking" | "operational" | "unavailable";

export function RegionalStatusBoard() {
  const [states, setStates] = useState<Record<TracifyRegionId, RegionState>>({ eu: "checking", us: "checking" });

  useEffect(() => {
    const controllers = Object.values(TRACIFY_REGIONS).map((region) => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      fetch(`${region.origin}/api/health/region`, { cache: "no-store", signal: controller.signal })
        .then(async (response) => {
          const body = await response.json() as { ok?: boolean; region?: string };
          const operational = response.ok && body.ok === true && body.region === region.id;
          setStates((current) => ({ ...current, [region.id]: operational ? "operational" : "unavailable" }));
        })
        .catch(() => setStates((current) => ({ ...current, [region.id]: "unavailable" })))
        .finally(() => window.clearTimeout(timeout));
      return controller;
    });
    return () => controllers.forEach((controller) => controller.abort());
  }, []);

  return (
    <section className="border-b border-black bg-white">
      <div className="mx-auto max-w-[1440px]">
        <div className="border-b border-black px-5 py-4 font-mono text-[9px] uppercase tracking-[0.15em] text-black/50">Regional cloud probes</div>
        <div className="grid md:grid-cols-2">
          {Object.values(TRACIFY_REGIONS).map((region) => {
            const state = states[region.id];
            const Icon = state === "checking" ? LoaderCircle : state === "operational" ? Activity : CircleAlert;
            return (
              <article key={region.id} className="grid min-h-44 grid-cols-[1fr_auto] border-b border-r border-black p-6 md:border-b-0">
                <div><p className="font-mono text-[9px] uppercase tracking-[0.13em] text-black/45">{region.flag} {region.shortName} cloud</p><h2 className="mt-5 font-pixel text-4xl tracking-[-0.055em]">{region.location}</h2><p className="mt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-black/45">{region.hostname}</p></div>
                <div className={`flex min-w-32 flex-col items-end justify-between border-l border-black pl-5 ${state === "operational" ? "text-black" : state === "unavailable" ? "text-red-700" : "text-black/45"}`}><Icon className={`size-5 ${state === "checking" ? "animate-spin" : ""}`} /><span className="font-mono text-[9px] uppercase tracking-[0.12em]">{state}</span></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
