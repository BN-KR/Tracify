"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function SessionsList({ projectId }: { projectId: string }) {
  const sessions = useQuery(
    api.sessions.listByProject,
    projectId ? { projectId: projectId as Id<"projects">, limit: 100 } : "skip",
  );

  if (sessions === undefined) {
    return <div className="space-y-3">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-20 rounded-none" />)}</div>;
  }
  if (sessions.length === 0) {
    return <div className="border border-border py-20 text-center font-mono text-sm uppercase tracking-widest text-zinc-500">No session context received yet</div>;
  }

  return (
    <div className="border border-border">
      <div className="grid grid-cols-[minmax(0,1fr)_100px_100px_120px] gap-4 border-b border-border bg-muted/20 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        <span>Session</span><span>Traces</span><span>Spans</span><span>Last seen</span>
      </div>
      {sessions.map((session) => (
        <Link key={session._id} href={`/dashboard/${projectId}/sessions/${encodeURIComponent(session.sessionId)}`} className="grid grid-cols-[minmax(0,1fr)_100px_100px_120px] gap-4 border-b border-border px-4 py-4 transition-colors last:border-0 hover:bg-muted/20">
          <div className="min-w-0">
            <div className="truncate font-mono text-sm text-white">{session.sessionId}</div>
            <div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px] text-zinc-500">
              {session.environment && <span>{session.environment}</span>}
              {session.endUserId && <span>user:{session.endUserId}</span>}
              <span>{formatCurrency(session.totalCostUsd)}</span>
            </div>
          </div>
          <span className="font-mono text-sm text-zinc-300">{session.traceCount}</span>
          <span className="font-mono text-sm text-zinc-300">{session.spanCount}</span>
          <span className="font-mono text-xs text-zinc-500">{formatRelativeTime(session.lastSeenAt)}</span>
        </Link>
      ))}
    </div>
  );
}
