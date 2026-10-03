"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname, useSearchParams } from "next/navigation";

export function SessionDetail({ projectId, sessionId }: { projectId: string; sessionId: string }) {
  const args = projectId ? { projectId: projectId as Id<"projects">, sessionId } : "skip" as const;
  const session = useQuery(api.sessions.getBySessionId, args);
  const runs = useQuery(api.sessions.getRecentRuns, args);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedRunId = searchParams.get("run");

  if (session === undefined || runs === undefined) return <Skeleton className="h-64 rounded-none" />;
  if (!session) return <div className="border border-border p-8 font-mono text-sm text-black/55">Session not found or unavailable.</div>;

  return (
    <div className="space-y-8">
      <section className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[["Traces", session.traceCount], ["Spans", session.spanCount], ["Cost", formatCurrency(session.totalCostUsd)], ["Last seen", formatRelativeTime(session.lastSeenAt)]].map(([label, value]) => (
          <div key={String(label)} className="bg-background p-5"><div className="font-mono text-[10px] uppercase tracking-widest text-black/55">{label}</div><div className="mt-3 font-mono text-lg text-black">{value}</div></div>
        ))}
      </section>
      <section className="border border-border bg-muted/10 p-4 sm:p-5">
        <div className="break-all font-mono text-sm text-black">{session.sessionId}</div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 font-mono text-xs text-black/55">
          {session.endUserId && <span>user:{session.endUserId}</span>}
          {session.environment && <span>env:{session.environment}</span>}
          {session.release && <span>release:{session.release}</span>}
          {session.tags.map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
      </section>
      <section>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-black/55">Runs in session</h2>
        <div className="border border-border">
          {runs.length === 0 ? <div className="p-6 font-mono text-sm text-black/55">No runs linked yet.</div> : runs.map((run) => (
            <Link key={run._id} href={`${pathname}?run=${encodeURIComponent(run.runId)}`} className={`flex flex-col items-start gap-2 border-b border-border p-4 last:border-0 hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between ${selectedRunId === run.runId ? "bg-black text-white hover:bg-black" : ""}`} aria-current={selectedRunId === run.runId ? "true" : undefined}>
              <span className="break-all font-mono text-sm">{run.runId}</span>
              <span className={`font-mono text-xs uppercase ${selectedRunId === run.runId ? "text-white/65" : "text-black/55"}`}>{run.status} · {formatCurrency(run.totalCostUsd)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
