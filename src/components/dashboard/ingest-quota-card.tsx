"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface IngestQuota {
  used: number;
  limit: number;
  remaining: number;
  resetSeconds: number;
  windowSeconds: number;
  available: boolean;
}

const POLL_INTERVAL_MS = 15_000;

export function IngestQuotaCard({ projectId }: { projectId: string }) {
  const [quota, setQuota] = useState<IngestQuota | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/projects/${projectId}/ingest-quota`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load ingest quota");
        const data = (await res.json()) as IngestQuota;
        if (!cancelled) {
          setQuota(data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [projectId]);

  if (!quota && !error) {
    return <Skeleton className="h-28 w-full rounded-none" />;
  }

  const usedPct = quota && quota.limit > 0 ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0;
  const nearLimit = usedPct >= 80;

  return (
    <Card className="p-6 rounded-none border-border bg-[#111111] shadow-none space-y-4">
      <div>
        <h3 className="font-mono text-[14px] text-white uppercase tracking-widest">Ingest Rate Limit</h3>
        <p className="text-[11px] text-[#666666] mt-1">
          Spans accepted per rolling 60-second window. Requests beyond the limit return HTTP 429.
        </p>
      </div>

      {error || !quota?.available ? (
        <p className="text-[11px] font-mono text-zinc-500 uppercase">Quota data unavailable right now.</p>
      ) : (
        <>
          <div className="flex items-baseline justify-between font-mono">
            <span className={`text-2xl ${nearLimit ? "text-red-500" : "text-white"}`}>
              {quota.used.toLocaleString()}
            </span>
            <span className="text-[11px] text-zinc-500">/ {quota.limit.toLocaleString()} per minute</span>
          </div>
          <div className="h-2 w-full border border-zinc-800 bg-black">
            <div
              className={`h-full ${nearLimit ? "bg-red-500" : "bg-white"}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <p className="text-[9px] text-zinc-600 font-mono uppercase">
            {quota.remaining.toLocaleString()} requests remaining this window
            {quota.resetSeconds > 0 ? ` · resets in ${quota.resetSeconds}s` : ""}
          </p>
        </>
      )}
    </Card>
  );
}
