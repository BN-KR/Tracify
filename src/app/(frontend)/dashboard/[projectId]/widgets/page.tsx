"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Activity, AlertTriangle, BarChart3, Check, Gauge, Loader2, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type WidgetRecord = { _id: Id<"dashboardWidgets">; widgetType: string; position: number };
type DashboardRecord = {
  _id: Id<"dashboardConfigs">;
  name: string;
  isDefault: boolean;
  widgets: WidgetRecord[];
};

const WIDGET_TYPES: Array<{ type: string; description: string; href: string }> = [
  { type: "Trace volume", description: "All, running, completed, and failed run counts indexed across recent runs.", href: "tracing" },
  { type: "Cost by model", description: "Top model spend over the last 30 days from the cached analytics window.", href: "costs" },
  { type: "Latency percentiles", description: "p50, p75, and p95 latency per model from the cached analytics window.", href: "tracing?sort=duration" },
  { type: "Score analytics", description: "Average and pass-rate per score family recorded for the project.", href: "scores/analytics" },
];

const widgetIcon: Record<string, React.ReactNode> = {
  "Trace volume": <Activity className="size-4 text-zinc-400" aria-hidden="true" />,
  "Cost by model": <Gauge className="size-4 text-zinc-400" aria-hidden="true" />,
  "Latency percentiles": <AlertTriangle className="size-4 text-zinc-400" aria-hidden="true" />,
  "Score analytics": <BarChart3 className="size-4 text-zinc-400" aria-hidden="true" />,
};

export default function WidgetsPage() {
  const params = useParams();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const dashboards = useQuery(api.dashboards.list, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const addWidget = useMutation(api.dashboards.addWidget);
  const removeWidget = useMutation(api.dashboards.removeWidget);

  const [targetId, setTargetId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const target = dashboards?.find((candidate: DashboardRecord) => candidate._id === targetId) ?? dashboards?.[0] ?? null;

  async function apply(action: () => Promise<unknown>, message: string) {
    setPending(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That change could not be applied.");
    } finally {
      setPending(false);
    }
  }

  if (project === null) {
    return (
      <div className="min-h-full bg-[#0b0d10] p-4 text-zinc-100 sm:p-6">
        <div role="alert" className="border border-zinc-800 bg-[#111418] p-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Project unavailable</p>
          <h1 className="mt-3 font-pixel text-3xl tracking-tight text-zinc-100">This project could not be loaded.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">The selected project may have been deleted, or your session may not have access to it.</p>
        </div>
      </div>
    );
  }
  if (project === undefined || dashboards === undefined) {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 sm:p-6">
        <Skeleton className="h-24 w-full rounded-none bg-zinc-800" />
        <Skeleton className="h-72 w-full rounded-none bg-zinc-800" />
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500"><Loader2 className="size-3 animate-spin" aria-hidden="true" /> Loading widgets…</p>
      </div>
    );
  }

  const installedTotal = dashboards.reduce((sum, dashboard: DashboardRecord) => sum + dashboard.widgets.length, 0);

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 text-zinc-100 sm:p-6">
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Observe / dashboards / widgets</p>
          <h1 className="mt-2 font-pixel text-3xl leading-[0.9] tracking-tight text-zinc-100">Widgets</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Each widget type renders live project data and can appear once per saved view. Choose a target dashboard, then add or remove widget types below.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
          <span className="border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400">{installedTotal} installed · {dashboards.length} views</span>
          <Link href={`/dashboard/${projectId}/dashboards`} className="inline-flex min-h-8 items-center border border-zinc-700 bg-zinc-900 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white">Saved views</Link>
        </div>
      </header>

      <Card className="border-zinc-800 bg-[#111418] p-0 shadow-none">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 p-5">
          <div>
            <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-100">Target dashboard</h2>
            <p className="mt-1 font-mono text-[10px] text-zinc-500">Widget changes below apply to the selected view.</p>
          </div>
          {target ? (
            <label className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Dashboard</span>
              <select aria-label="Target dashboard" value={target._id} onChange={(event) => setTargetId(event.target.value)} className="h-10 min-w-[220px] border border-zinc-700 bg-zinc-900 px-3 font-mono text-xs text-zinc-100 outline-none focus:border-zinc-300">
                {dashboards.map((dashboard: DashboardRecord) => (
                  <option key={dashboard._id} value={dashboard._id}>{dashboard.name}{dashboard.isDefault ? " · default" : ""}</option>
                ))}
              </select>
              <Link href={`/dashboard/${projectId}/dashboards/${target._id}`} className="inline-flex min-h-10 items-center border border-zinc-700 bg-zinc-900 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white">Open view</Link>
            </label>
          ) : null}
        </div>
        {error ? <p role="alert" className="border-b border-red-500/30 bg-red-500/5 p-4 font-mono text-xs text-red-300">{error}</p> : null}
        {notice ? <p role="status" className="border-b border-emerald-400/30 bg-emerald-400/5 p-4 font-mono text-xs text-emerald-200">{notice}</p> : null}
      </Card>

      {dashboards.length === 0 ? (
        <div className="border border-dashed border-zinc-700 bg-[#111418] px-6 py-14 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-300">No saved views yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">Create a dashboard first, then return here to manage its widgets.</p>
          <Link href={`/dashboard/${projectId}/dashboards/new`} className="mt-5 inline-flex items-center gap-2 border border-zinc-100 bg-zinc-100 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:border-zinc-400">
            <Plus className="size-3.5" aria-hidden="true" /> Create a dashboard
          </Link>
        </div>
      ) : (
        <div className="grid gap-px border border-zinc-800 bg-zinc-800 md:grid-cols-2">
          {WIDGET_TYPES.map((widget) => {
            const installedHere = target ? target.widgets.some((entry) => entry.widgetType === widget.type) : false;
            const usedBy = dashboards.filter((dashboard: DashboardRecord) => dashboard.widgets.some((entry) => entry.widgetType === widget.type));
            const existingTargetWidget = target?.widgets.find((entry) => entry.widgetType === widget.type);
            return (
              <Card key={widget.type} className="flex flex-col gap-4 bg-[#111418] p-5 shadow-none">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {widgetIcon[widget.type]}
                    <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-100">{widget.type}</h2>
                  </div>
                  <span className={cn("shrink-0 border px-2 py-1 font-mono text-[10px] uppercase tracking-widest", installedHere ? "border-emerald-400/35 bg-emerald-400/5 text-emerald-300" : "border-zinc-700 bg-zinc-900 text-zinc-400")}>
                    {usedBy.length ? `On ${usedBy.length} of ${dashboards.length} views` : "Not installed"}
                  </span>
                </div>
                <p className="text-sm leading-6 text-zinc-400">{widget.description}</p>
                {target ? (
                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    {installedHere ? (
                      <>
                        <span className="inline-flex min-h-8 items-center gap-1.5 border border-emerald-400/35 px-3 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
                          <Check className="size-3" aria-hidden="true" /> In {target.name}
                        </span>
                        <button
                          type="button"
                          disabled={pending || !existingTargetWidget}
                          onClick={() => void apply(async () => { await removeWidget({ projectId: projectId as Id<"projects">, dashboardId: target._id, widgetId: existingTargetWidget!._id }); }, `${widget.type} removed from ${target.name}.`)}
                          className="inline-flex min-h-8 items-center gap-1.5 border border-red-500/40 px-3 font-mono text-[10px] uppercase tracking-widest text-red-300 transition-colors hover:border-red-400 disabled:opacity-50"
                        >
                          <X className="size-3" aria-hidden="true" /> Remove
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => void apply(async () => { await addWidget({ projectId: projectId as Id<"projects">, dashboardId: target._id, widgetType: widget.type }); }, `${widget.type} added to ${target.name}.`)}
                        className="inline-flex min-h-8 items-center gap-2 border border-zinc-100 bg-zinc-100 px-3 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:border-zinc-400 disabled:opacity-50"
                      >
                        <Plus className="size-3" aria-hidden="true" /> Add to {target.name}
                      </button>
                    )}
                  </div>
                ) : null}
                {usedBy.length ? (
                  <p className="font-mono text-[10px] text-zinc-500">Used by {usedBy.map((dashboard: DashboardRecord) => dashboard.name).join(", ")}</p>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
