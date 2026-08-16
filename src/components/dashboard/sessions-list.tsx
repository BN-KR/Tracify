"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardEmptyState } from "./dashboard-primitives";

export function SessionsList({ projectId }: { projectId: string }) {
  const sessions = useQuery(
    api.sessions.listByProject,
    projectId ? { projectId: projectId as Id<"projects">, limit: 100 } : "skip",
  );

  if (sessions === undefined) {
    return <div className="space-y-3">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-20 rounded-none" />)}</div>;
  }
  if (sessions.length === 0) {
    return <DashboardEmptyState title="No session context yet" description="Add session and end-user context to your traces to see complete user journeys here." href={`/dashboard/${projectId}/quickstart`} action="Open quickstart" />;
  }

  return (
    <div className="border border-border">
      <div className="hidden grid-cols-[minmax(0,1fr)_100px_100px_120px] gap-4 border-b border-border bg-muted/20 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-black/55 md:grid">
        <span>Session</span><span>Traces</span><span>Spans</span><span>Last seen</span>
      </div>
      {sessions.map((session) => (
        <Link key={session._id} href={`/dashboard/${projectId}/sessions/${encodeURIComponent(session.sessionId)}`} className="group grid gap-3 border-b border-border px-4 py-4 transition-colors last:border-0 hover:bg-muted/20 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white md:grid-cols-[minmax(0,1fr)_100px_100px_120px] md:items-center md:gap-4">
          <div className="min-w-0">
            <div className="truncate font-mono text-sm text-black group-hover:underline">{session.sessionId}</div>
            <div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px] text-black/55">
              {session.environment && <span>{session.environment}</span>}
              {session.endUserId && <span>user:{session.endUserId}</span>}
              <span className="dashboard-number">{formatCurrency(session.totalCostUsd)}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:contents">
            <span className="font-mono text-sm text-black/70"><span className="mr-2 text-[9px] uppercase tracking-widest text-black/55 md:hidden">Traces</span>{session.traceCount}</span>
            <span className="font-mono text-sm text-black/70"><span className="mr-2 text-[9px] uppercase tracking-widest text-black/55 md:hidden">Spans</span>{session.spanCount}</span>
            <span className="font-mono text-xs text-black/55"><span className="mr-2 text-[9px] uppercase tracking-widest text-black/55 md:hidden">Seen</span>{formatRelativeTime(session.lastSeenAt)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
