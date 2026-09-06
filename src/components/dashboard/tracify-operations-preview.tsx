"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatRelativeTime } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock3, Search, Users, Workflow } from "lucide-react";

type Section = "sessions" | "users" | "alerts";

const sessions = [
  ["sess_support_8841", "Support escalation", "12 traces", "48 spans", "2 min ago", "completed"],
  ["sess_checkout_1032", "Checkout assistant", "8 traces", "31 spans", "18 min ago", "active"],
  ["sess_research_7720", "Research workflow", "24 traces", "126 spans", "1 hr ago", "completed"],
  ["sess_voice_4421", "Voice conversation", "3 traces", "19 spans", "3 hr ago", "failed"],
];

const users = [
  ["Maya Chen", "maya@example.com", "84 traces", "0.91", "Last seen 4 min ago"],
  ["Jon Bell", "jon@example.com", "52 traces", "0.86", "Last seen 28 min ago"],
  ["Ari Singh", "ari@example.com", "31 traces", "0.78", "Last seen 2 hr ago"],
  ["Support Bot", "bot@tracify.local", "1,284 traces", "0.88", "Last seen just now"],
];

const alerts = [
  ["Latency threshold exceeded", "production / handle-chatbot-message", "8.92s observed against 5s threshold", "critical", "4 min ago"],
  ["Trace volume increased", "default / support-agent", "42% above the previous 1d window", "info", "32 min ago"],
  ["Evaluation score dropped", "production / refund assistant", "Groundedness moved from 0.86 to 0.64", "warning", "1 hr ago"],
];

export function TracifyOperationsPreview({ projectId }: { projectId?: string }) {
  const [section, setSection] = useState<Section>("sessions");
  const [query, setQuery] = useState("");
  const [alertFilter, setAlertFilter] = useState("all");
  const liveSessions = useQuery(api.sessions.listByProject, projectId ? { projectId: projectId as Id<"projects">, limit: 100 } : "skip");
  const liveAlerts = useQuery(api.alerts.listByProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const sessionRows = projectId && liveSessions ? liveSessions.map((row) => [row.sessionId, row.traceName || "Session activity", `${row.traceCount} traces`, `${row.spanCount} spans`, formatRelativeTime(row.lastSeenAt), row.latestStatus]) : sessions;
  const userRows = projectId && liveSessions ? [...new Set(liveSessions.map((row) => row.endUserId).filter((value): value is string => Boolean(value)))].map((id) => [id, id, `${liveSessions.filter((row) => row.endUserId === id).reduce((total, row) => total + row.traceCount, 0)} traces`, "—", "live activity"]) : users;
  const alertRows = projectId && liveAlerts ? liveAlerts.map((row) => [row.type, row.runId, row.message, row.state === "active" ? "critical" : "info", formatRelativeTime(row.triggeredAt)]) : alerts;
  const filteredSessions = useMemo(() => sessionRows.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase())), [query, sessionRows]);
  const filteredUsers = useMemo(() => userRows.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase())), [query, userRows]);
  const filteredAlerts = useMemo(() => alertRows.filter((row) => (alertFilter === "all" || row[3] === alertFilter) && row.join(" ").toLowerCase().includes(query.toLowerCase())), [alertFilter, query, alertRows]);

  return <div className="tracify-overview min-h-screen">
    <header className="tracify-page-header"><div className="tracify-breadcrumbs"><span className="tracify-crumb">Tracify workspace</span><span>/</span><span className="tracify-crumb">Operate</span></div><div className="tracify-header-actions"><span className="tracify-control">1d</span><span className="tracify-assistant">Assistant <kbd>Ctrl I</kbd></span></div></header>
    <div className="tracify-toolbar"><h1>Operations</h1><div className="tracify-toolbar-spacer" /><span className="tracify-control">default</span><span className="tracify-control">Filters</span></div>
    <nav className="tracify-operations-tabs" aria-label="Operations sections">{(["sessions", "users", "alerts"] as Section[]).map((item) => <button key={item} type="button" className={section === item ? "is-active" : ""} onClick={() => { setSection(item); setQuery(""); }}>{item === "sessions" ? <Workflow /> : item === "users" ? <Users /> : <AlertTriangle />}{item}</button>)}</nav>
    <section className="tracify-operations-content"><div className="tracify-operations-heading"><div><p className="tracify-eyebrow">{section === "sessions" ? "Multi-turn activity" : section === "users" ? "Trace consumers" : "Actionable signals"}</p><h2>{section === "sessions" ? "Sessions" : section === "users" ? "Users" : "Alerts"}</h2></div><label className="tracify-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${section}`} aria-label={`Search ${section}`} /></label></div>
      {section === "sessions" ? <SessionRows rows={filteredSessions} /> : null}
      {section === "users" ? <UserRows rows={filteredUsers} /> : null}
      {section === "alerts" ? <AlertRows rows={filteredAlerts} filter={alertFilter} setFilter={setAlertFilter} /> : null}
    </section>
  </div>;
}

function SessionRows({ rows }: { rows: string[][] }) { return <div className="tracify-operations-list">{rows.map((row) => <article key={row[0]} className="tracify-operation-row"><div className="tracify-operation-icon"><Workflow /></div><div className="tracify-operation-main"><strong>{row[1]}</strong><small>{row[0]}</small></div><div><b>{row[2]}</b><small>{row[3]}</small></div><div><b>{row[4]}</b><small>last activity</small></div><span className={`tracify-operation-state is-${row[5]}`}>{row[5]}</span></article>)}{rows.length === 0 ? <div className="tracify-no-results">No sessions match the current search.</div> : null}</div>; }
function UserRows({ rows }: { rows: string[][] }) { return <div className="tracify-operations-list">{rows.map((row) => <article key={row[1]} className="tracify-operation-row"><div className="tracify-operation-icon"><Users /></div><div className="tracify-operation-main"><strong>{row[0]}</strong><small>{row[1]}</small></div><div><b>{row[2]}</b><small>activity</small></div><div><b>{row[3]}</b><small>quality score</small></div><span className="tracify-operation-muted">{row[4]}</span></article>)}{rows.length === 0 ? <div className="tracify-no-results">No users match the current search.</div> : null}</div>; }
function AlertRows({ rows, filter, setFilter }: { rows: string[][]; filter: string; setFilter: (value: string) => void }) { return <><div className="tracify-alert-filters">{["all", "critical", "warning", "info"].map((value) => <button key={value} type="button" className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{value}</button>)}</div><div className="tracify-operations-list">{rows.map((row) => <article key={row[0]} className="tracify-operation-row"><div className={`tracify-operation-icon is-${row[3]}`}>{row[3] === "critical" ? <AlertTriangle /> : <CheckCircle2 />}</div><div className="tracify-operation-main"><strong>{row[0]}</strong><small>{row[1]}</small></div><div className="tracify-operation-alert-message">{row[2]}</div><span className="tracify-operation-muted"><Clock3 />{row[4]}</span></article>)}{rows.length === 0 ? <div className="tracify-no-results">No alerts match the current filters.</div> : null}</div></>; }
