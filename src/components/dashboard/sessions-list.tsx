"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardEmptyState } from "./dashboard-primitives";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export function SessionsList({ projectId }: { projectId: string }) {
  const [query, setQuery] = useState("");
  const [environment, setEnvironment] = useState("all");
  const sessions = useQuery(
    api.sessions.listByProject,
    projectId ? { projectId: projectId as Id<"projects">, limit: 100 } : "skip",
  );
  const sessionRows = sessions ?? [];
  const environments = [...new Set(sessionRows.map((session) => session.environment).filter((value): value is string => Boolean(value)))].sort();
  const filteredSessions = useMemo(() => (sessions ?? []).filter((session) => {
    const matchesQuery = `${session.sessionId} ${session.endUserId ?? ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (environment === "all" || session.environment === environment);
  }), [environment, query, sessions]);

  if (sessions === undefined) {
    return <div className="space-y-3">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-20 rounded-none" />)}</div>;
  }
  if (sessions.length === 0) {
    return <DashboardEmptyState title="No session context yet" description="Add session and end-user context to your traces to see complete user journeys here." href={`/dashboard/${projectId}/quickstart`} action="Open quickstart" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 border border-border bg-white p-3 sm:flex-row">
        <label className="relative flex min-w-0 flex-1 items-center"><Search className="pointer-events-none absolute left-3 size-4 text-black/45" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sessions or users…" aria-label="Search sessions or users" className="h-10 w-full border border-black/15 bg-white pl-10 pr-3 font-mono text-[11px] text-black outline-none focus:border-black" /></label>
        <label className="flex items-center border border-black/15 bg-white px-3"><span className="mr-2 font-mono text-[9px] uppercase tracking-widest text-black/45">Environment</span><select value={environment} onChange={(event) => setEnvironment(event.target.value)} className="h-8 bg-transparent font-mono text-[10px] uppercase text-black outline-none"><option value="all">All</option>{environments.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      </div>
      <div className="border border-border">
      <div className="hidden grid-cols-[minmax(0,1fr)_100px_100px_120px] gap-4 border-b border-border bg-muted/20 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-black/55 md:grid">
        <span>Session</span><span>Traces</span><span>Spans</span><span>Last seen</span>
      </div>
      {filteredSessions.map((session) => (
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
      {filteredSessions.length === 0 ? <p className="p-6 font-mono text-[10px] uppercase tracking-widest text-black/45">No sessions match the current filters.</p> : null}
    </div>
    </div>
  );
}
