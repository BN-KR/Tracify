"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";

type RegionOption = { id: string; name: string; flag: string; hostname: string; location: string; infrastructure: string };

export function RegionOptions({ regions, next, intent }: { regions: RegionOption[]; next: string; intent: "explore" | "build" }) {
  const [pendingRegion, setPendingRegion] = useState<string | null>(null);

  function chooseRegion(regionId: string) {
    if (pendingRegion) return;
    setPendingRegion(regionId);
    const target = `/cloud/connecting?region=${encodeURIComponent(regionId)}&next=${encodeURIComponent(next)}&intent=${intent}`;
    // Give the user an explicit handoff state before the browser may cross to a
    // different regional origin. This avoids a click appearing to do nothing.
    window.setTimeout(() => { window.location.assign(target); }, 300);
  }

  return <div className="relative border border-black bg-white">
    {regions.map((region) => <button key={region.id} type="button" onClick={() => chooseRegion(region.id)} disabled={Boolean(pendingRegion)} className="group grid min-h-32 w-full grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-black p-5 text-left last:border-b-0 hover:bg-[#f4d44d] disabled:cursor-wait disabled:opacity-60 sm:grid-cols-[80px_1fr_auto] sm:p-7"><span className="text-3xl" aria-hidden="true">{region.flag}</span><span><span className="block font-pixel text-4xl leading-none tracking-[-0.055em]">{region.name}</span><span className="mt-3 block font-mono text-[9px] uppercase tracking-[0.1em] text-black/50">{region.hostname} · {region.location} · {region.infrastructure}</span></span>{pendingRegion === region.id ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />}</button>)}
    {pendingRegion ? <div role="status" aria-live="polite" className="absolute inset-0 flex items-center justify-center bg-black/90 p-6 text-center text-white"><div><LoaderCircle className="mx-auto size-7 animate-spin text-[#f4d44d]" /><p className="mt-4 font-pixel text-3xl tracking-[-0.04em]">Connecting to {regions.find((region) => region.id === pendingRegion)?.name} cloud…</p><p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/55">Preparing your regional handoff</p></div></div> : null}
  </div>;
}
