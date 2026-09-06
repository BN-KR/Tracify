"use client";

import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export function TracifyUsersDashboard({ projectId }: { projectId: string }) {
  const [query, setQuery] = useState("");
  const sessions = useQuery(api.sessions.listByProject, projectId ? { projectId: projectId as Id<"projects">, limit: 100 } : "skip");
  const userRows = useMemo(() => {
    const grouped = new Map<string, { traces: number; spans: number; latest: string; cost: number }>();
    for (const session of sessions ?? []) {
      if (!session.endUserId) continue;
      const current = grouped.get(session.endUserId) ?? { traces: 0, spans: 0, latest: session.lastSeenAt, cost: 0 };
      grouped.set(session.endUserId, { traces: current.traces + session.traceCount, spans: current.spans + session.spanCount, latest: current.latest > session.lastSeenAt ? current.latest : session.lastSeenAt, cost: current.cost + session.totalCostUsd });
    }
    return [...grouped.entries()].map(([id, value]) => [id, `${value.traces} traces`, `${value.spans} spans`, formatCurrency(value.cost), formatRelativeTime(value.latest)]);
  }, [sessions]);
  const rows = useMemo(() => userRows.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase())), [query, userRows]);

  return <section className="tracify-module-shell">
    <div className="tracify-module-heading"><div><span className="tracify-eyebrow">OBSERVABILITY / IDENTITY</span><h1>Users</h1><p>Understand who interacts with your agents and how their journeys perform.</p></div><div className="tracify-users-count"><Users /> {sessions === undefined ? "…" : userRows.length} identities</div></div>
    <label className="tracify-module-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" aria-label="Search users" /></label>
    <div className="tracify-users-table" role="table" aria-label="Users"><div className="tracify-users-row tracify-users-header" role="row"><span>USER</span><span>TRACES</span><span>SPANS</span><span>LAST ACTIVITY</span></div>{rows.map((row) => <Link href={`/dashboard/${projectId}/users/${encodeURIComponent(row[0])}`} className="tracify-users-row" role="row" key={row[0]}><span><strong>{row[0]}</strong><small>Tracked end-user identity</small></span><span>{row[1]}</span><span className="tracify-users-score">{row[2]}</span><span>{row[4]}</span></Link>)}{sessions !== undefined && rows.length === 0 ? <div className="tracify-no-results">No users match the current search.</div> : null}</div>
  </section>;
}
