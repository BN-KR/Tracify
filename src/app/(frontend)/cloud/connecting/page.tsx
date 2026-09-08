"use client";

import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { TRACIFY_REGIONS, parseTracifyRegion } from "@/lib/regions";

export default function CloudConnectingPage() {
  const params = useSearchParams();
  const regionId = parseTracifyRegion(params.get("region")) ?? "eu";
  const next = params.get("next") || "/sign-up";
  const intent = params.get("intent") || "build";
  const region = TRACIFY_REGIONS[regionId];

  useEffect(() => {
    const target = `/api/region/select?region=${encodeURIComponent(regionId)}&next=${encodeURIComponent(next)}&intent=${encodeURIComponent(intent)}`;
    const timer = window.setTimeout(() => window.location.assign(target), 1200);
    return () => window.clearTimeout(timer);
  }, [intent, next, regionId]);

  return <main className="flex min-h-screen items-center justify-center bg-[#101010] p-6 text-white"><div role="status" aria-live="polite" className="max-w-lg text-center"><LoaderCircle className="mx-auto size-8 animate-spin text-[#f4d44d]" /><p className="mt-5 font-pixel text-4xl tracking-[-0.05em]">Connecting to {region.name} cloud…</p><p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">Preparing your regional handoff</p></div></main>;
}
