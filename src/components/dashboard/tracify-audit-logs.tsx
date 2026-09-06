"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function TracifyAuditLogs({ projectId }: { projectId: string }) {
  const logs = useQuery(api.auditLogs.listByProject, { projectId: projectId as Id<"projects">, limit: 100 });

  return (
    <section className="border border-black/15 bg-white">
      <div className="grid grid-cols-[minmax(0,1fr)_150px_190px] border-b border-black/15 bg-[#f3f2ed] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.12em] text-black/50">
        <span>Event</span><span>Actor</span><span>Timestamp</span>
      </div>
      {logs === undefined ? <p className="p-6 font-mono text-[10px] uppercase tracking-widest text-black/45">Loading audit events…</p> : logs.length === 0 ? <p className="p-6 text-sm text-black/55">No administrative activity has been recorded for this project yet.</p> : logs.map((log) => (
        <div key={log._id} className="grid grid-cols-[minmax(0,1fr)_150px_190px] items-center border-b border-black/10 px-4 py-4 last:border-b-0">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.1em] text-black/45">{log.action} · {log.resource}</p><p className="mt-1 text-sm text-black">{log.summary}</p></div>
          <span className="truncate font-mono text-[10px] text-black/60">{log.actorEmail || log.actorId}</span>
          <time className="font-mono text-[10px] text-black/50" dateTime={new Date(log.createdAt).toISOString()}>{new Date(log.createdAt).toLocaleString()}</time>
        </div>
      ))}
    </section>
  );
}
