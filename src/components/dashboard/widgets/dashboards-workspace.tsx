"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { moveWidget, WIDGETS, widgetInfo } from "@/lib/widget-utils";
import { useWidgetData } from "./widget-data";
import { WidgetBody } from "./widget-views";

type Dashboard = FunctionReturnType<typeof api.dashboards.list>[number];
const RANGES = [{ days: 7, label: "7 days" }, { days: 30, label: "30 days" }, { days: 90, label: "90 days" }];
const STARTER = ["trace_volume", "error_rate", "cost_daily", "cost_by_model"];
const button = "h-7 rounded border border-[#262C35] bg-[#0E1115] px-2.5 text-xs text-[#C9CED6] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D] disabled:opacity-40";
const field = "w-full rounded border border-[#262C35] bg-[#0E1115] px-2.5 text-xs text-[#E6E9EE] placeholder:text-[#6B7380] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]";
const friendly = (reason: unknown, fallback: string) => ((reason instanceof Error ? reason.message : "").match(/Uncaught Error: ([^\n]+)/)?.[1] ?? fallback);

export function DashboardsWorkspace({ projectId, initialDashboard }: { projectId: string; initialDashboard?: string }) {
  const typedProjectId = projectId as Id<"projects">;
  const dashboards = useQuery(api.dashboards.list, { projectId: typedProjectId });
  const scores = useQuery(api.evaluation.scoreMetrics, { projectId: typedProjectId });
  const create = useMutation(api.dashboards.create);
  const addWidget = useMutation(api.dashboards.addWidget);
  const removeWidget = useMutation(api.dashboards.removeWidget);
  const reorder = useMutation(api.dashboards.reorderWidgets);
  const rename = useMutation(api.dashboards.rename);
  const removeDashboard = useMutation(api.dashboards.remove);
  const reset = useMutation(api.dashboards.reset);
  const [pick, setPick] = useState<string | null>(initialDashboard ?? null);
  const [days, setDays] = useState(30);
  const [edit, setEdit] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [naming, setNaming] = useState<"new" | "rename" | null>(null);
  const [name, setName] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const current: Dashboard | null = dashboards?.find((dashboard) => dashboard._id === pick) ?? dashboards?.find((dashboard) => dashboard.isDefault) ?? dashboards?.[0] ?? null;
  const widgets = useMemo(() => [...(current?.widgets ?? [])].sort((a, b) => a.position - b.position), [current]);
  const needs = useMemo(() => ({ traces: widgets.some((w) => widgetInfo(w.widgetType)?.source === "traces"), stats: widgets.some((w) => widgetInfo(w.widgetType)?.source === "stats") }), [widgets]);
  const data = useWidgetData(projectId, days, needs, refresh);

  useEffect(() => {
    if (current) window.history.replaceState(null, "", `${window.location.pathname}?d=${current._id}`);
  }, [current]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && gallery) setGallery(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gallery]);

  async function guarded(action: () => Promise<void>, fallback: string) {
    setBusy(true); setNotice(null);
    try { await action(); } catch (reason) { setNotice({ tone: "error", text: friendly(reason, fallback) }); } finally { setBusy(false); }
  }
  const submitName = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setNotice({ tone: "error", text: "Give the dashboard a name." });
    void guarded(async () => {
      if (naming === "rename" && current) { await rename({ projectId: typedProjectId, dashboardId: current._id, name: trimmed }); setNotice({ tone: "ok", text: "Renamed." }); }
      else {
        const first = !dashboards?.length;
        const id = await create({ projectId: typedProjectId, name: trimmed, isDefault: first });
        if (first) for (const type of STARTER) await addWidget({ projectId: typedProjectId, dashboardId: id, widgetType: type });
        setPick(id); setNotice({ tone: "ok", text: first ? `${trimmed} created with four starter widgets.` : `${trimmed} created. Add widgets to it.` });
      }
      setNaming(null); setName("");
    }, "That did not save. Check your connection and try again.");
  };
  const move = (widgetId: string, direction: -1 | 1) => current && guarded(async () => {
    const ids = moveWidget(widgets.map((w) => w._id as string), widgetId, direction);
    await reorder({ projectId: typedProjectId, dashboardId: current._id, widgetIds: ids as Id<"dashboardWidgets">[] });
  }, "Could not move that widget.");
  const add = (type: string) => current && guarded(async () => { await addWidget({ projectId: typedProjectId, dashboardId: current._id, widgetType: type }); }, "Could not add that widget.");
  const remove = (widgetId: Id<"dashboardWidgets">) => current && guarded(async () => { await removeWidget({ projectId: typedProjectId, dashboardId: current._id, widgetId }); }, "Could not remove that widget.");

  return (
    <div className="relative flex min-h-svh min-w-0 flex-col bg-[#0B0D10] font-[family-name:var(--font-geist-sans)] text-[13px] text-[#E6E9EE]">
      <header className="flex flex-wrap items-center gap-2 border-b border-[#1F242C] px-4 py-2">
        <h1 className="mr-2 text-base font-semibold tracking-tight">Dashboards</h1>
        <nav aria-label="Dashboards" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {(dashboards ?? []).map((dashboard) => <button key={dashboard._id} type="button" aria-current={dashboard._id === current?._id} onClick={() => { setPick(dashboard._id); setEdit(false); }} className={`h-7 shrink-0 rounded px-3 text-xs ${dashboard._id === current?._id ? "bg-[#161B22] text-white" : "text-[#8B93A1] hover:text-white"}`}>{dashboard.name}</button>)}
          {naming ? (
            <form onSubmit={submitName} className="flex items-center gap-1"><label className="sr-only" htmlFor="dash-name">Dashboard name</label><input id="dash-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus placeholder="Name" className={`${field} h-7 w-40`} /><button type="submit" disabled={busy} className={button}>{naming === "rename" ? "Rename" : "Create"}</button><button type="button" onClick={() => { setNaming(null); setName(""); }} className={button}>Cancel</button></form>
          ) : <button type="button" onClick={() => { setNaming("new"); setName(""); }} className={button}>+ New</button>}
        </nav>
        {current ? (
          <>
            <div role="radiogroup" aria-label="Time range" className="flex overflow-hidden rounded border border-[#262C35]">
              {RANGES.map((range) => <button key={range.days} type="button" role="radio" aria-checked={days === range.days} onClick={() => setDays(range.days)} className={`h-7 px-2.5 text-xs ${days === range.days ? "bg-[#F4D44D] font-medium text-[#090909]" : "bg-[#0E1115] text-[#C9CED6] hover:text-white"}`}>{range.label}</button>)}
            </div>
            <button type="button" onClick={() => setRefresh((n) => n + 1)} className={button}>Refresh</button>
            <button type="button" aria-pressed={edit} onClick={() => setEdit(!edit)} className={`${button} ${edit ? "border-[#F4D44D] text-white" : ""}`}>{edit ? "Done editing" : "Edit"}</button>
          </>
        ) : null}
        <Link href={`/dashboard/${projectId}/widgets`} className={`${button} inline-flex items-center`}>Widget library</Link>
      </header>
      {notice ? <p role={notice.tone === "error" ? "alert" : "status"} className={`mx-4 mt-3 rounded border px-3 py-2 text-xs ${notice.tone === "error" ? "border-[#5B2B2B] bg-[#1A1010] text-[#FF8A8A]" : "border-[#1F4D38] bg-[#0E1A14] text-[#5BE3A0]"}`}>{notice.text}</p> : null}
      {dashboards === undefined ? <div className="grid gap-3 p-4 md:grid-cols-2" role="status" aria-label="Loading dashboards">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-56 animate-pulse bg-[#11151A]" />)}</div>
        : !current ? (
          <div className="m-auto max-w-md p-10 text-center">
            <h2 className="text-sm font-semibold">Your own view of how the agent is doing</h2>
            <p className="mt-2 text-xs leading-5 text-[#8B93A1]">A dashboard is a page of charts you choose: runs, failures, speed, cost, quality. Start with a ready-made set and change it any time.</p>
            <form onSubmit={submitName} className="mt-4 flex gap-2"><label className="sr-only" htmlFor="first-dash">Dashboard name</label><input id="first-dash" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Overview" className={`${field} h-8`} /><button type="submit" disabled={busy} className="h-8 shrink-0 rounded bg-[#F4D44D] px-3 text-xs font-medium text-[#090909] disabled:opacity-50">Create with starter widgets</button></form>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto p-4">
            {edit ? (
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-[#3A3420] bg-[#1A170C] px-3 py-2 text-xs text-[#F4D44D]">
                <span>Editing {current.name}. Move widgets with the arrows, or remove them.</span>
                <button type="button" onClick={() => setGallery(true)} className="ml-auto h-7 rounded bg-[#F4D44D] px-3 text-xs font-medium text-[#090909]">Add widget</button>
                {!current.isDefault ? <><button type="button" onClick={() => { setNaming("rename"); setName(current.name); }} className={button}>Rename</button><button type="button" disabled={busy} onClick={() => { if (window.confirm(`Delete “${current.name}” and its widgets? This cannot be undone.`)) void guarded(async () => { await removeDashboard({ projectId: typedProjectId, dashboardId: current._id }); setPick(null); setEdit(false); setNotice({ tone: "ok", text: "Dashboard deleted." }); }, "Could not delete the dashboard."); }} className={`${button} text-[#FF8A8A]`}>Delete dashboard</button></> : null}
                {widgets.length ? <button type="button" disabled={busy} onClick={() => { if (window.confirm("Remove every widget from this dashboard?")) void guarded(async () => { await reset({ projectId: typedProjectId, dashboardId: current._id }); }, "Could not clear the dashboard."); }} className={button}>Clear all</button> : null}
              </div>
            ) : null}
            {!widgets.length ? (
              <div className="mx-auto max-w-md p-10 text-center"><h2 className="text-sm font-semibold">This dashboard is empty</h2><p className="mt-2 text-xs leading-5 text-[#8B93A1]">Pick the charts you want to see here.</p><button type="button" onClick={() => setGallery(true)} className="mt-4 h-8 rounded bg-[#F4D44D] px-4 text-xs font-medium text-[#090909]">Add a widget</button></div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {widgets.map((widget, index) => {
                  const info = widgetInfo(widget.widgetType);
                  return (
                    <section key={widget._id} aria-label={info?.title ?? widget.widgetType} className={`min-w-0 border border-[#1F242C] bg-[#0E1115] ${info?.wide ? "md:col-span-2" : ""}`}>
                      <header className="flex items-center gap-2 border-b border-[#1F242C] px-4 py-2.5">
                        <div className="min-w-0 flex-1"><h2 className="truncate text-xs font-semibold">{info?.title ?? "Unknown widget"}</h2>{info ? <p className="truncate text-[11px] text-[#6B7380]">{info.description}</p> : null}</div>
                        {edit ? <div className="flex gap-1"><button type="button" aria-label={`Move ${info?.title ?? "widget"} earlier`} disabled={busy || index === 0} onClick={() => void move(widget._id, -1)} className={button}>←</button><button type="button" aria-label={`Move ${info?.title ?? "widget"} later`} disabled={busy || index === widgets.length - 1} onClick={() => void move(widget._id, 1)} className={button}>→</button><button type="button" aria-label={`Remove ${info?.title ?? "widget"}`} disabled={busy} onClick={() => void remove(widget._id)} className={`${button} text-[#FF8A8A]`}>Remove</button></div> : null}
                      </header>
                      <div className="p-4"><WidgetBody id={widget.widgetType} traces={data.traces} stats={data.stats} scores={scores} /></div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        )}
      {gallery && current ? (
        <aside aria-label="Add a widget" className="absolute inset-y-0 right-0 z-20 flex w-full max-w-[400px] flex-col border-l border-[#1F242C] bg-[#0B0D10] shadow-[-24px_0_48px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 border-b border-[#1F242C] px-4 py-3"><h2 className="flex-1 text-sm font-semibold">Add a widget</h2><button type="button" onClick={() => setGallery(false)} className={button}>Done</button></div>
          <ul className="grid min-h-0 flex-1 content-start gap-2 overflow-auto p-4">
            {WIDGETS.map((widget) => {
              const added = widgets.some((w) => w.widgetType === widget.id);
              return <li key={widget.id} className="rounded border border-[#1F242C] bg-[#0E1115] p-3"><div className="flex items-center gap-2"><h3 className="flex-1 text-xs font-semibold">{widget.title}</h3><button type="button" disabled={added || busy} onClick={() => void add(widget.id)} className={button}>{added ? "Added" : "Add"}</button></div><p className="mt-1 text-[11px] leading-4 text-[#8B93A1]">{widget.description}</p></li>;
            })}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
