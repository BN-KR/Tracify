"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export function UserDetail({ projectId, userId }: { projectId: string; userId: string }) {
  const sessions = useQuery(api.sessions.listByProject, { projectId: projectId as Id<"projects">, limit: 250 });
  const userSessions = sessions?.filter((session) => session.endUserId === userId) ?? [];
  const totals = userSessions.reduce((value, session) => ({ traces: value.traces + session.traceCount, spans: value.spans + session.spanCount, cost: value.cost + session.totalCostUsd }), { traces: 0, spans: 0, cost: 0 });

  return <div className="space-y-6"><div className="grid gap-3 md:grid-cols-3"><Metric label="Traces" value={String(totals.traces)} /><Metric label="Spans" value={String(totals.spans)} /><Metric label="Cost" value={formatCurrency(totals.cost)} /></div><section className="border border-black/15 bg-white"><div className="border-b border-black/15 p-5"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">End-user identity</p><h1 className="mt-2 font-pixel text-4xl tracking-[-0.05em]">{userId}</h1></div>{userSessions.map((session) => <Link key={session._id} href={`/dashboard/${projectId}/sessions/${encodeURIComponent(session.sessionId)}`} className="flex items-center justify-between gap-4 border-b border-black/10 p-4 hover:bg-[#f3f2ed]"><div><p className="font-mono text-sm">{session.sessionId}</p><p className="mt-1 font-mono text-[10px] uppercase text-black/45">{session.environment || "default"} · {session.traceCount} traces · {session.spanCount} spans</p></div><span className="font-mono text-[10px] text-black/50">{formatRelativeTime(session.lastSeenAt)}</span></Link>)}{sessions !== undefined && userSessions.length === 0 ? <p className="p-6 text-sm text-black/55">No sessions found for this user.</p> : null}</section></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="border border-black/15 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-black/45">{label}</p><p className="mt-3 font-pixel text-3xl">{value}</p></div>; }
