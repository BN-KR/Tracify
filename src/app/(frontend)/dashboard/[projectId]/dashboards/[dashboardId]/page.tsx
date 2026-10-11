"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Activity, AlertTriangle, ArrowDown, ArrowUp, BarChart3, CircleCheck, Gauge, Loader2, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type WidgetRecord = { _id: Id<"dashboardWidgets">; widgetType: string; position: number; createdAt: number };
type DashboardRecord = {
  _id: Id<"dashboardConfigs">;
  name: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
  widgets: WidgetRecord[];
};

const WIDGET_TYPES = ["Trace volume", "Cost by model", "Latency percentiles", "Score analytics"] as const;

function formatCost(value: number) {
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(5)}`;
}

function TraceVolumeSurface({ projectId }: { projectId: string }) {
  const counts = useQuery(api.agentRuns.getRunCountsByProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  if (counts === undefined) return <Skeleton className="h-24 w-full rounded-none bg-zinc-800" />;
  if (counts === null) return <p className="font-mono text-xs text-zinc-500">Run counts are unavailable.</p>;
  return (
    <div>
      <div className="grid grid-cols-2 gap-px bg-zinc-800 sm:grid-cols-4">
        {[
          { label: "All runs", value: counts.all, href: `/dashboard/${projectId}/tracing` },
          { label: "Running", value: counts.running },
          { label: "Completed", value: counts.completed },
          { label: "Failed", value: counts.failed },
        ].map((entry) => (
          <Link
            key={entry.label}
            href={"href" in entry && entry.href ? entry.href : `/dashboard/${projectId}/tracing?status=${encodeURIComponent(entry.label.toLowerCase())}`}
            className="bg-[#111418] p-3 transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">{entry.label}</p>
            <p className="mt-2 font-pixel text-2xl tracking-tight text-zinc-100">{entry.value}</p>
          </Link>
        ))}
      </div>
      {counts.capped ? (
        <p className="border-t border-zinc-800 p-3 font-mono text-[10px] text-zinc-500">Counts capped at the 1,000 most recent runs.</p>
      ) : null}
    </div>
  );
}

function CostByModelSurface({ projectId }: { projectId: string }) {
  const stats = useQuery(api.analyticsCache.getStatsCache, projectId ? { projectId: projectId as Id<"projects">, rangeDays: 30 } : "skip");
  if (stats === undefined) return <Skeleton className="h-24 w-full rounded-none bg-zinc-800" />;
  const models = stats ? [...stats.modelCosts].sort((a, b) => b.totalCostUsd - a.totalCostUsd).slice(0, 6) : [];
  const totalCost = models.reduce((sum, model) => sum + model.totalCostUsd, 0);
  if (!models.length) {
    return <p className="p-5 font-mono text-xs text-zinc-500">No cached model cost data yet. Cost appears after analytics processes this project&apos;s spans.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Model</th>
            <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Cost</th>
            <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Spans</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {models.map((model) => (
            <tr key={model.modelId}>
              <td className="max-w-[220px] truncate px-4 py-2 font-mono text-xs text-zinc-200">{model.modelId}</td>
              <td className="px-4 py-2 font-mono text-xs text-zinc-200">{formatCost(model.totalCostUsd)}</td>
              <td className="px-4 py-2 font-mono text-xs text-zinc-400">{model.spanCount}</td>
            </tr>
          ))}
          <tr className="bg-zinc-900/60">
            <td className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Top models total</td>
            <td className="px-4 py-2 font-mono text-xs text-zinc-100">{formatCost(totalCost)}</td>
            <td className="px-4 py-2" />
          </tr>
        </tbody>
      </table>
      <p className="border-t border-zinc-800 p-3 font-mono text-[10px] text-zinc-500">
        30-day cache · {stats && "meta" in stats ? stats.meta.cacheStatus : "unknown"} · <Link href={`/dashboard/${projectId}/costs`} className="underline decoration-dotted hover:text-zinc-300">Open cost dashboard</Link>
      </p>
    </div>
  );
}

function LatencySurface({ projectId }: { projectId: string }) {
  const stats = useQuery(api.analyticsCache.getStatsCache, projectId ? { projectId: projectId as Id<"projects">, rangeDays: 30 } : "skip");
  if (stats === undefined) return <Skeleton className="h-24 w-full rounded-none bg-zinc-800" />;
  const models = stats ? [...stats.modelCosts].filter((model) => typeof model.p50LatencyMs === "number").sort((a, b) => b.spanCount - a.spanCount).slice(0, 6) : [];
  if (!models.length) {
    return <p className="p-5 font-mono text-xs text-zinc-500">No cached latency percentiles yet. Percentiles appear after analytics processes this project&apos;s spans.</p>;
  }
  return (
    <div className="overflow-x-auto pb-2">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Model</th>
            <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">p50</th>
            <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">p75</th>
            <th scope="col" className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">p95</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {models.map((model) => (
            <tr key={model.modelId}>
              <td className="max-w-[200px] truncate px-4 py-2 font-mono text-xs text-zinc-200">{model.modelId}</td>
              <td className="px-4 py-2 font-mono text-xs text-zinc-200">{model.p50LatencyMs}ms</td>
              <td className="px-4 py-2 font-mono text-xs text-zinc-400">{model.p75LatencyMs ?? "—"}ms</td>
              <td className={cn("px-4 py-2 font-mono text-xs", (model.p95LatencyMs ?? 0) > 10000 ? "text-amber-300" : "text-zinc-200")}>{model.p95LatencyMs ?? "—"}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreAnalyticsSurface({ projectId }: { projectId: string }) {
  const metrics = useQuery(api.evaluation.scoreMetrics, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  if (metrics === undefined) return <Skeleton className="h-24 w-full rounded-none bg-zinc-800" />;
  if (!metrics.length) {
    return <p className="p-5 font-mono text-xs text-zinc-500">No score metrics yet. Scores arrive from reviews, evaluators, and user feedback.</p>;
  }
  return (
    <div className="grid gap-px border-t border-zinc-800 bg-zinc-800 sm:grid-cols-2">
      {metrics.slice(0, 4).map((metric) => (
        <div key={metric.name} className="bg-[#111418] p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="block truncate text-sm text-zinc-100">{metric.name}</span>
            <span className="shrink-0 font-mono text-[10px] text-zinc-500">{metric.count}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">Avg</p>
              <p className="mt-1 font-pixel text-xl tracking-tight text-zinc-100">{metric.average === null ? "—" : metric.average.toFixed(3)}</p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">Pass</p>
              <p className={cn("mt-1 font-pixel text-xl tracking-tight", metric.passRate === null ? "text-zinc-300" : metric.passRate >= 0.9 ? "text-emerald-300" : "text-amber-300")}>
                {metric.passRate === null ? "—" : `${Math.round(metric.passRate * 100)}%`}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const dashboardId = typeof params?.dashboardId === "string" ? params.dashboardId : "";
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const dashboards = useQuery(api.dashboards.list, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const addWidget = useMutation(api.dashboards.addWidget);
  const removeWidget = useMutation(api.dashboards.removeWidget);
  const reorderWidgets = useMutation(api.dashboards.reorderWidgets);
  const renameDashboard = useMutation(api.dashboards.rename);
  const resetDashboard = useMutation(api.dashboards.reset);
  const deleteDashboard = useMutation(api.dashboards.remove);

  const [widgetType, setWidgetType] = useState<string>(WIDGET_TYPES[0]);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [confirming, setConfirming] = useState<"reset" | "delete" | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const dashboard = dashboards?.find((candidate: DashboardRecord) => candidate._id === dashboardId) ?? null;
  const widgets = dashboard ? [...dashboard.widgets].sort((a, b) => a.position - b.position) : [];
  const availableTypes = WIDGET_TYPES.filter((candidate) => !widgets.some((widget) => widget.widgetType === candidate));

  async function runMutation(action: () => Promise<unknown>) {
    setPending(true);
    setError("");
    try {
      await action();
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
          <Link href="/dashboard" className="mt-6 inline-flex items-center border border-zinc-700 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white">Back to dashboard</Link>
        </div>
      </div>
    );
  }
  if (project === undefined || dashboards === undefined) {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 sm:p-6">
        <Skeleton className="h-24 w-full rounded-none bg-zinc-800" />
        <Skeleton className="h-72 w-full rounded-none bg-zinc-800" />
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500"><Loader2 className="size-3 animate-spin" aria-hidden="true" /> Loading dashboard…</p>
      </div>
    );
  }
  if (!dashboard) {
    return (
      <div className="min-h-full bg-[#0b0d10] p-4 text-zinc-100 sm:p-6">
        <div role="alert" className="border border-zinc-800 bg-[#111418] p-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Dashboard unavailable</p>
          <h1 className="mt-3 font-pixel text-3xl tracking-tight text-zinc-100">That saved view could not be found.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">It may have been deleted, or it may belong to another project.</p>
          <Link href={`/dashboard/${projectId}/dashboards`} className="mt-6 inline-flex items-center border border-zinc-100 bg-zinc-100 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:border-zinc-400">Back to dashboards</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 text-zinc-100 sm:p-6">
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Observe / dashboards / {dashboard.isDefault ? "default view" : "saved view"}</p>
          {renaming && !dashboard.isDefault ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const next = nameDraft.trim();
                if (!next || next === dashboard.name) {
                  setRenaming(false);
                  return;
                }
                void runMutation(async () => {
                  await renameDashboard({ projectId: projectId as Id<"projects">, dashboardId: dashboard._id, name: next });
                  setRenaming(false);
                });
              }}
              className="mt-2 flex flex-wrap items-center gap-2"
            >
              <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} aria-label="Dashboard name" className="h-10 w-full max-w-sm border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-300" autoFocus />
              <button type="submit" disabled={pending} className="inline-flex min-h-8 items-center border border-zinc-100 bg-zinc-100 px-3 font-mono text-[10px] uppercase tracking-widest text-black disabled:opacity-50">Save name</button>
              <button type="button" onClick={() => setRenaming(false)} className="inline-flex min-h-8 items-center border border-zinc-700 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 hover:border-zinc-300 hover:text-white">Cancel</button>
            </form>
          ) : (
            <h1 className="mt-2 font-pixel text-3xl leading-[0.9] tracking-tight text-zinc-100">{dashboard.name}</h1>
          )}
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Widgets render live project data on every load. Layout changes apply immediately and persist for the whole workspace.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <Link href={`/dashboard/${projectId}/dashboards`} className="inline-flex min-h-8 items-center border border-zinc-700 bg-zinc-900 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white">All dashboards</Link>
          {!dashboard.isDefault ? (
            <button type="button" onClick={() => { setNameDraft(dashboard.name); setRenaming(true); }} className="inline-flex min-h-8 items-center border border-zinc-700 bg-zinc-900 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white">Rename</button>
          ) : null}
          {widgets.length ? (
            confirming === "reset" ? (
              <>
                <button type="button" onClick={() => void runMutation(async () => { await resetDashboard({ projectId: projectId as Id<"projects">, dashboardId: dashboard._id }); setConfirming(null); })} disabled={pending} className="inline-flex min-h-8 items-center border border-red-500/40 px-3 font-mono text-[10px] uppercase tracking-widest text-red-300 disabled:opacity-50">Confirm reset</button>
                <button type="button" onClick={() => setConfirming(null)} className="inline-flex min-h-8 items-center border border-zinc-700 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-400 hover:border-zinc-300 hover:text-white">Cancel</button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirming("reset")} className="inline-flex min-h-8 items-center gap-1.5 border border-zinc-700 bg-zinc-900 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white">
                <RotateCcw className="size-3" aria-hidden="true" /> Reset layout
              </button>
            )
          ) : null}
          {!dashboard.isDefault ? (
            confirming === "delete" ? (
              <>
                <button type="button" onClick={() => void runMutation(async () => { await deleteDashboard({ projectId: projectId as Id<"projects">, dashboardId: dashboard._id }); setConfirming(null); router.replace(`/dashboard/${projectId}/dashboards`); })} disabled={pending} className="inline-flex min-h-8 items-center border border-red-500/40 px-3 font-mono text-[10px] uppercase tracking-widest text-red-300 disabled:opacity-50">Confirm delete</button>
                <button type="button" onClick={() => setConfirming(null)} className="inline-flex min-h-8 items-center border border-zinc-700 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-400 hover:border-zinc-300 hover:text-white">Cancel</button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirming("delete")} aria-label={`Delete dashboard ${dashboard.name}`} className="inline-flex min-h-8 items-center gap-1.5 border border-red-500/40 px-3 font-mono text-[10px] uppercase tracking-widest text-red-300 transition-colors hover:border-red-400">
                <Trash2 className="size-3" aria-hidden="true" /> Delete
              </button>
            )
          ) : null}
        </div>
      </header>

      <Card className="border-zinc-800 bg-[#111418] p-0 shadow-none">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 p-5">
          <div>
            <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-100">Add a widget</h2>
            <p className="mt-1 font-mono text-[10px] text-zinc-500">Each widget type appears once per view and renders live project data.</p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void runMutation(async () => {
                await addWidget({ projectId: projectId as Id<"projects">, dashboardId: dashboard._id, widgetType });
              });
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <label className="sr-only" htmlFor="widget-type">Widget type</label>
            <select id="widget-type" value={widgetType} onChange={(event) => setWidgetType(event.target.value)} className="h-10 min-w-[200px] border border-zinc-700 bg-zinc-900 px-3 font-mono text-xs text-zinc-100 outline-none focus:border-zinc-300">
              {(availableTypes.length ? availableTypes : [widgetType]).map((candidate) => (
                <option key={candidate} value={candidate}>{candidate}</option>
              ))}
            </select>
            <button type="submit" disabled={pending || !availableTypes.length} className="inline-flex min-h-10 items-center gap-2 border border-zinc-100 bg-zinc-100 px-4 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50">
              <Plus className="size-3.5" aria-hidden="true" /> {availableTypes.length ? "Add widget" : "All widgets added"}
            </button>
          </form>
        </div>
        {error ? <p role="alert" className="border-b border-red-500/30 bg-red-500/5 p-4 font-mono text-xs text-red-300">{error}</p> : null}
      </Card>

      {widgets.length === 0 ? (
        <div className="border border-dashed border-zinc-700 bg-[#111418] px-6 py-14 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-300">No widgets yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">Add trace volume, cost by model, latency percentiles, or score analytics widgets to build this saved view.</p>
        </div>
      ) : (
        <div className="grid gap-px border border-zinc-800 bg-zinc-800 lg:grid-cols-2">
          {widgets.map((widget, index) => (
            <section key={widget._id} className="bg-[#111418]" aria-label={`Widget ${widget.widgetType}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 p-5">
                <div className="flex items-center gap-3">
                  {widget.widgetType === "Trace volume" ? <Activity className="size-4 text-zinc-400" aria-hidden="true" /> : null}
                  {widget.widgetType === "Cost by model" ? <Gauge className="size-4 text-zinc-400" aria-hidden="true" /> : null}
                  {widget.widgetType === "Latency percentiles" ? <AlertTriangle className="size-4 text-zinc-400" aria-hidden="true" /> : null}
                  {widget.widgetType === "Score analytics" ? <BarChart3 className="size-4 text-zinc-400" aria-hidden="true" /> : null}
                  <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-100">{widget.widgetType}</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => { if (index === 0) return; const order = widgets.map((entry) => entry._id); [order[index - 1], order[index]] = [order[index], order[index - 1]]; void runMutation(async () => { await reorderWidgets({ projectId: projectId as Id<"projects">, dashboardId: dashboard._id, widgetIds: order }); }); }} disabled={index === 0 || pending} aria-label={`Move ${widget.widgetType} up`} className="inline-flex size-8 items-center justify-center border border-zinc-700 text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white disabled:opacity-40">
                    <ArrowUp className="size-3" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => { if (index === widgets.length - 1) return; const order = widgets.map((entry) => entry._id); [order[index + 1], order[index]] = [order[index], order[index + 1]]; void runMutation(async () => { await reorderWidgets({ projectId: projectId as Id<"projects">, dashboardId: dashboard._id, widgetIds: order }); }); }} disabled={index === widgets.length - 1 || pending} aria-label={`Move ${widget.widgetType} down`} className="inline-flex size-8 items-center justify-center border border-zinc-700 text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white disabled:opacity-40">
                    <ArrowDown className="size-3" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => { setConfirming(null); void runMutation(async () => { await removeWidget({ projectId: projectId as Id<"projects">, dashboardId: dashboard._id, widgetId: widget._id }); }); }} disabled={pending} aria-label={`Remove ${widget.widgetType}`} className="inline-flex size-8 items-center justify-center border border-red-500/40 text-red-300 transition-colors hover:border-red-400 disabled:opacity-40">
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {widget.widgetType === "Trace volume" ? <TraceVolumeSurface projectId={projectId} /> : null}
              {widget.widgetType === "Cost by model" ? <CostByModelSurface projectId={projectId} /> : null}
              {widget.widgetType === "Latency percentiles" ? <LatencySurface projectId={projectId} /> : null}
              {widget.widgetType === "Score analytics" ? <ScoreAnalyticsSurface projectId={projectId} /> : null}
            </section>
          ))}
        </div>
      )}

      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
        <CircleCheck className="size-3" aria-hidden="true" /> Widget data refreshes on every load; no stored snapshots are rendered here.
      </p>
    </div>
  );
}
