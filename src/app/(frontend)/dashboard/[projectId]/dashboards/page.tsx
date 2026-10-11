"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Loader2, Plus, Trash2, LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type DashboardRecord = {
  _id: Id<"dashboardConfigs">;
  projectId: Id<"projects">;
  name: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
  widgets: Array<{ _id: Id<"dashboardWidgets">; widgetType: string; position: number }>;
};

export default function DashboardsPage() {
  const params = useParams();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const dashboards = useQuery(api.dashboards.list, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const removeDashboard = useMutation(api.dashboards.remove);

  const [confirming, setConfirming] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleRemove(dashboard: DashboardRecord) {
    setPendingId(dashboard._id);
    setError("");
    try {
      await removeDashboard({ projectId: projectId as Id<"projects">, dashboardId: dashboard._id });
      setConfirming(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete dashboard.");
    } finally {
      setPendingId(null);
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
        <Skeleton className="h-64 w-full rounded-none bg-zinc-800" />
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500"><Loader2 className="size-3 animate-spin" aria-hidden="true" /> Loading dashboards…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 text-zinc-100 sm:p-6">
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Observe / dashboards</p>
          <h1 className="mt-2 font-pixel text-3xl leading-[0.9] tracking-tight text-zinc-100">Dashboards</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Saved views for cost, quality, latency, and trace volume. Widgets pull live project data each time the view loads.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
          <span className="border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400">{dashboards.length} saved views</span>
          <Link href={`/dashboard/${projectId}/dashboards/new`} className="inline-flex items-center gap-2 border border-zinc-100 bg-zinc-100 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100">
            <Plus className="size-3.5" aria-hidden="true" /> New dashboard
          </Link>
        </div>
      </header>

      {dashboards.length === 0 ? (
        <div className="border border-dashed border-zinc-700 bg-[#111418] px-6 py-14 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-300">No saved views yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">Create a dashboard, then add widgets for trace volume, model cost, latency percentiles, and score analytics.</p>
          <Link href={`/dashboard/${projectId}/dashboards/new`} className="mt-5 inline-flex items-center gap-2 border border-zinc-100 bg-zinc-100 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100">
            <Plus className="size-3.5" aria-hidden="true" /> Create a dashboard
          </Link>
        </div>
      ) : (
        <div className="grid gap-px border border-zinc-800 bg-zinc-800 md:grid-cols-2 xl:grid-cols-3">
          {dashboards.map((dashboard: DashboardRecord) => (
            <div key={dashboard._id} className="flex flex-col gap-4 bg-[#111418] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/dashboard/${projectId}/dashboards/${dashboard._id}`} className="block truncate text-base text-zinc-100 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100">
                    {dashboard.name}
                  </Link>
                  <p className="mt-1 font-mono text-[10px] text-zinc-500">Updated {new Date(dashboard.updatedAt).toLocaleDateString()}</p>
                </div>
                <span className={cn("shrink-0 border px-2 py-1 font-mono text-[10px] uppercase tracking-widest", dashboard.isDefault ? "border-zinc-100 bg-zinc-100 text-black" : "border-zinc-700 bg-zinc-900 text-zinc-400")}>
                  {dashboard.isDefault ? "Default" : "Saved"}
                </span>
              </div>
              <p className="font-mono text-[11px] text-zinc-400">
                {dashboard.widgets.length ? `${dashboard.widgets.length} widget${dashboard.widgets.length === 1 ? "" : "s"} · ${dashboard.widgets.slice().sort((a, b) => a.position - b.position).map((widget) => widget.widgetType).join(", ")}` : "No widgets yet"}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <Link href={`/dashboard/${projectId}/dashboards/${dashboard._id}`} className="inline-flex min-h-8 items-center border border-zinc-700 bg-zinc-900 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100">
                  Open
                </Link>
                {!dashboard.isDefault ? (
                  confirming === dashboard._id ? (
                    <>
                      <button type="button" onClick={() => void handleRemove(dashboard)} disabled={pendingId === dashboard._id} className="inline-flex min-h-8 items-center gap-1.5 border border-red-500/40 px-3 font-mono text-[10px] uppercase tracking-widest text-red-300 transition-colors hover:border-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100 disabled:opacity-50">
                        {pendingId === dashboard._id ? "Deleting…" : "Confirm delete"}
                      </button>
                      <button type="button" onClick={() => setConfirming(null)} className="inline-flex min-h-8 items-center border border-zinc-700 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-400 transition-colors hover:border-zinc-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirming(dashboard._id)} aria-label={`Delete dashboard ${dashboard.name}`} className="inline-flex min-h-8 items-center gap-1.5 border border-red-500/40 px-3 font-mono text-[10px] uppercase tracking-widest text-red-300 transition-colors hover:border-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100">
                      <Trash2 className="size-3" aria-hidden="true" /> Delete
                    </button>
                  )
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {error ? (
        <p role="alert" className="border border-red-500/30 bg-red-500/5 p-4 font-mono text-xs text-red-300">{error}</p>
      ) : null}

      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
        <LayoutDashboard className="size-3" aria-hidden="true" /> Custom widgets live inside each view; deleting a view removes its widget layout.
      </p>
    </div>
  );
}
