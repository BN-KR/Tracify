"use client";

import { RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProjectStats } from "@/hooks/use-project-stats";

export function AnalyticsRefreshControl({
  stats,
  refreshing,
  onRefresh,
}: {
  stats: ProjectStats | null;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const label = formatStatsStatus(stats);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        aria-label={refreshing ? "Refreshing analytics" : "Refresh analytics"}
        className="flex h-8 items-center gap-2 border border-[#2A2A2A] bg-black px-3 font-mono text-[11px] uppercase text-[#999999] transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw className={cn("size-3", refreshing && "animate-spin")} />
        Refresh
      </button>
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#666666]">
        {label}
      </span>
    </div>
  );
}

function formatStatsStatus(stats: ProjectStats | null) {
  const meta = stats?.meta;
  if (!meta) return "Cached analytics";

  if (meta.reason === "rate_limited") return "Refresh cooling down";
  if (meta.reason === "budget_low" || meta.reason === "budget_hard_limit") {
    return "Refresh limit reached";
  }
  if (meta.reason === "tinybird_error") {
    return meta.updatedAt
      ? `Updated ${formatAge(Date.now() - meta.updatedAt)} ago`
      : "Cached analytics";
  }
  if (meta.cacheStatus === "fresh" && meta.reason === "manual_refresh") return "Fresh";
  if (meta.updatedAt) return `Updated ${formatAge(Date.now() - meta.updatedAt)} ago`;
  return "Cached analytics";
}

function formatAge(ageMs: number) {
  const seconds = Math.max(0, Math.floor(ageMs / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}
