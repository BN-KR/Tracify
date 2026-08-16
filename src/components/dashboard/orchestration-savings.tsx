"use client";

import { Card } from "@/components/ui/card";
import { Shield, RotateCcw, ArrowDownCircle, Ban } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface OrchestrationSavingsProps {
  projectId: string;
  range: number;
}

interface SavingsData {
  callsRetried: number;
  callsFellBack: number;
  callsBlocked: number;
  totalOrchestratedCalls: number;
}

export function OrchestrationSavings({ projectId, range }: OrchestrationSavingsProps) {
  const [data, setData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetch(`/api/orchestration-savings?projectId=${projectId}&days=${range}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) {
          setData(json);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [projectId, range]);

  if (loading) {
    return <Skeleton className="h-24 w-full rounded-none" />;
  }

  if (!data || data.totalOrchestratedCalls === 0) {
    return null;
  }

  return (
    <Card className="p-5 rounded-none border-border bg-white shadow-none">
      <div className="flex items-start gap-3 mb-4">
        <Shield className="size-4 text-black/55 mt-0.5" />
        <div>
          <h4 className="font-mono text-[14px] text-black uppercase tracking-widest">
            Orchestration Savings
          </h4>
          <p className="text-[10px] text-black/55 font-mono uppercase mt-1">
            {data.totalOrchestratedCalls.toLocaleString()} calls orchestrated in this period
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SavingsStat
          icon={RotateCcw}
          label="Retried"
          value={data.callsRetried}
          description="Saved by retry on transient error"
        />
        <SavingsStat
          icon={ArrowDownCircle}
          label="Fell Back"
          value={data.callsFellBack}
          description="Saved by automatic model fallback"
        />
        <SavingsStat
          icon={Ban}
          label="Blocked"
          value={data.callsBlocked}
          description="Blocked by cost ceiling"
        />
      </div>
    </Card>
  );
}

function SavingsStat({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3 text-black/55" />
        <span className="text-[10px] uppercase tracking-widest text-black/55 font-mono">
          {label}
        </span>
      </div>
      <p className="text-xl font-mono text-black">{value.toLocaleString()}</p>
      <p className="text-[9px] text-black/55 font-mono uppercase">{description}</p>
    </div>
  );
}
