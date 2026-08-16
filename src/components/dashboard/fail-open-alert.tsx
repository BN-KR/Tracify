"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface FailOpenData {
  totalOrchestrations: number;
  failOpenCount: number;
  failOpenRate: number;
  elevated: boolean;
}

export function FailOpenAlert({ projectId }: { projectId: string }) {
  const [data, setData] = useState<FailOpenData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `/api/orchestration-failopen?projectId=${projectId}&days=7`
        );
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // silent
      }
    };
    load();
  }, [projectId]);

  if (!data || data.totalOrchestrations === 0) return null;

  if (!data.elevated) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 text-sm">
      <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
      <span className="text-black/60">
        <span className="font-mono text-yellow-500">
          {(data.failOpenRate * 100).toFixed(1)}%
        </span>{" "}
        of orchestrated calls fell through ({data.failOpenCount}/
        {data.totalOrchestrations}) in the last 7 days. The cost ceiling check
        endpoint may be unreachable.
      </span>
    </div>
  );
}
