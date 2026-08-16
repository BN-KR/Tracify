"use client";

import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, DollarSign, ArrowRight, Check, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DashboardEmptyState } from "./dashboard-primitives";

interface AlertsListProps {
  projectId: string;
}

export function AlertsList({ projectId }: AlertsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("view");
  const [filter, setFilter] = useState<"all" | "active" | "resolved" | "muted">(initialFilter === "active" || initialFilter === "resolved" || initialFilter === "muted" ? initialFilter : "all");
  const alerts = useQuery(
    api.alerts.listByProject, 
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  const markAllRead = useMutation(api.alerts.markAllRead);
  const markRead = useMutation(api.alerts.markRead);
  const updateState = useMutation(api.alerts.updateState);

  if (alerts === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-none" />
        ))}
      </div>
    );
  }

  const visibleAlerts = filter === "all" ? alerts : alerts.filter((alert) => (alert.state ?? "active") === filter);
  const groupedAlerts = Array.from(visibleAlerts.reduce((groups, alert) => {
    const key = `${alert.type}:${alert.message}`;
    const existing = groups.get(key);
    if (existing) existing.count += 1;
    else groups.set(key, { alert, count: 1 });
    return groups;
  }, new Map<string, { alert: (typeof alerts)[number]; count: number }>()).values());

  if (alerts.length === 0) {
    return <DashboardEmptyState title="No alerts triggered" description="Alert rules will appear here when a run crosses a configured cost, duration, or failure threshold." href={`/dashboard/${projectId}/settings`} action="Configure thresholds" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/10 p-3">
        <div className="flex gap-2">
          {(["all", "active", "resolved", "muted"] as const).map((value) => (
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => { setFilter(value); const params = new URLSearchParams(searchParams.toString()); if (value === "all") params.delete("view"); else params.set("view", value); router.replace(`${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false }); }} className={cn("border px-3 py-2 font-mono text-[10px] uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black", filter === value ? "border-black bg-black text-white" : "border-black/15 text-black/55 hover:border-black/30 hover:text-black")}>{value}</button>
          ))}
        </div>
        <button type="button" onClick={() => void markAllRead({ projectId: projectId as Id<"projects"> })} disabled={!alerts.some((alert) => !alert.readAt)} className="border border-black/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-black/55 hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40">Mark all read</button>
      </div>
      {visibleAlerts.length === 0 ? <DashboardEmptyState title={`No ${filter} alerts`} description={filter === "all" ? "Alert rules will appear here when a run crosses a configured threshold." : `There are no ${filter} alerts in this project.`} /> : groupedAlerts.map(({ alert, count }) => (
        <div 
          key={alert._id} 
          className={cn("group flex items-start justify-between border p-4 transition-colors hover:border-black/25", alert.readAt ? "border-border bg-white" : "border-black/30 bg-white/[0.04]")}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-2 border border-border",
              alert.type === "cost_exceeded" ? "text-amber-500" : "text-red-600"
            )}>
              {alert.type === "cost_exceeded" ? <DollarSign className="size-4" /> : <AlertCircle className="size-4" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={cn(
                  "rounded-none border-0 px-0 font-mono text-[10px]",
                  alert.type === "cost_exceeded" ? "text-amber-500" : "text-red-600"
                )}>
                  {alert.type.replace("_", " ").toUpperCase()}
                </Badge>
                <span className="text-[10px] text-black/55 font-mono">
                  {formatRelativeTime(alert.triggeredAt)}
                </span>
                {count > 1 ? <span className="border border-black/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-black/60">{count} occurrences</span> : null}
              </div>
              <p className="text-xs text-black font-sans leading-relaxed max-w-2xl">
                {alert.message}
              </p>
              <div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest text-black/55">
                <span>{alert.state ?? "active"}</span>
                <span>run:{alert.runId}</span>
              </div>
              <p className="mt-2 text-[11px] text-black/55">
                <span className="font-mono text-[9px] uppercase tracking-widest text-black/55">Recommended action · </span>
                {alert.type === "cost_exceeded"
                  ? "Inspect the run cost and compare it with the recent baseline."
                  : "Open the triggering run and start at the first actionable error."}
              </p>
            </div>
          </div>
          
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Link href={`/dashboard/${projectId}/runs/${alert.runId}`} onClick={() => { if (!alert.readAt) void markRead({ alertId: alert._id }); }} className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/55 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">Inspect Run <ArrowRight className="size-3" /></Link>
            <div className="flex gap-1">
              {(alert.state ?? "active") === "active" ? <button type="button" aria-label={`Resolve alert ${alert.message}`} onClick={() => { if (window.confirm("Resolve this alert? You can reopen it later.")) void updateState({ alertId: alert._id, state: "resolved" }); }} className="border border-black/15 p-1.5 text-black/55 hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"><Check className="size-3" /></button> : null}
              {(alert.state ?? "active") === "active" ? <button type="button" aria-label={`Mute alert ${alert.message}`} onClick={() => { if (window.confirm("Mute this alert? You can reopen it later from the muted tab.")) void updateState({ alertId: alert._id, state: "muted" }); }} className="border border-black/15 p-1.5 text-black/55 hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"><VolumeX className="size-3" /></button> : null}
              {(alert.state ?? "active") !== "active" ? <button type="button" aria-label={`Reopen alert ${alert.message}`} onClick={() => void updateState({ alertId: alert._id, state: "active" })} className="border border-black/15 px-2 py-1 font-mono text-[9px] uppercase text-black/55 hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">Reopen</button> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
