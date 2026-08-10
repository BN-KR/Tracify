"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function SessionDetail({ projectId, sessionId }: { projectId: string; sessionId: string }) {
  const args = projectId ? { projectId: projectId as Id<"projects">, sessionId } : "skip" as const;
  const session = useQuery(api.sessions.getBySessionId, args);
  const runs = useQuery(api.sessions.getRecentRuns, args);

  if (session === undefined || runs === undefined) return <Skeleton className="h-64 rounded-none" />;
  if (!session) return <div className="border border-border p-8 font-mono text-sm text-zinc-500">Session not found or unavailable.</div>;

  return (
    <div className="space-y-8">
      <section className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[["Traces", session.traceCount], ["Spans", session.spanCount], ["Cost", formatCurrency(session.totalCostUsd)], ["Last seen", formatRelativeTime(session.lastSeenAt)]].map(([label, value]) => (
          <div key={String(label)} className="bg-background p-5"><div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</div><div className="mt-3 font-mono text-lg text-white">{value}</div></div>
        ))}
      </section>
      <section className="border border-border bg-muted/10 p-5">
        <div className="font-mono text-sm text-white">{session.sessionId}</div>
        <div className="mt-3 flex flex-wrap gap-3 font-mono text-xs text-zinc-500">
          {session.endUserId && <span>user:{session.endUserId}</span>}
          {session.environment && <span>env:{session.environment}</span>}
          {session.release && <span>release:{session.release}</span>}
          {session.tags.map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
      </section>
      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-500">Runs in session</h2>
        <div className="border border-border">
          {runs.length === 0 ? <div className="p-6 font-mono text-sm text-zinc-500">No runs linked yet.</div> : runs.map((run) => (
            <Link key={run._id} href={`/dashboard/${projectId}/runs/${run.runId}`} className="flex items-center justify-between gap-4 border-b border-border p-4 last:border-0 hover:bg-muted/20">
              <span className="font-mono text-sm text-white">{run.runId}</span>
              <span className="font-mono text-xs uppercase text-zinc-500">{run.status} · {formatCurrency(run.totalCostUsd)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
