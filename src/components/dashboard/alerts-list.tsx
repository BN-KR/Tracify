"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AlertCircle, DollarSign, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertsListProps {
  projectId: string;
}

export function AlertsList({ projectId }: AlertsListProps) {
  const alerts = useQuery(
    api.alerts.listByProject, 
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  if (alerts === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-none" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border">
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">No alerts triggered</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div 
          key={alert._id} 
          className="group border border-border bg-[#111111] p-4 flex items-start justify-between hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-2 border border-border",
              alert.type === "cost_exceeded" ? "text-amber-500" : "text-red-500"
            )}>
              {alert.type === "cost_exceeded" ? <DollarSign className="size-4" /> : <AlertCircle className="size-4" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={cn(
                  "rounded-none border-0 px-0 font-mono text-[10px]",
                  alert.type === "cost_exceeded" ? "text-amber-500" : "text-red-500"
                )}>
                  {alert.type.replace("_", " ").toUpperCase()}
                </Badge>
                <span className="text-[10px] text-zinc-600 font-mono">
                  {formatRelativeTime(alert.triggeredAt)}
                </span>
              </div>
              <p className="text-xs text-white font-sans leading-relaxed max-w-2xl">
                {alert.message}
              </p>
            </div>
          </div>
          
          <Link 
            href={`/dashboard/${projectId}/runs/${alert.runId}`}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            Inspect Run <ArrowRight className="size-3" />
          </Link>
        </div>
      ))}
    </div>
  );
}
