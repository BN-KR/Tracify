"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";

const WIDGET_TYPES = [
  { type: "run-volume", label: "Run volume", description: "Runs over time from project telemetry." },
  { type: "failure-rate", label: "Failure rate", description: "Share of runs that ended in failure." },
  { type: "cost-by-model", label: "Cost by model", description: "Spend broken down by model." },
  { type: "latency-p95", label: "p95 latency", description: "Tail latency across recent runs." },
  { type: "tool-calls", label: "Tool calls", description: "Most-used tools and their error rates." },
  { type: "open-alerts", label: "Open alerts", description: "Active alerts needing attention." },
];

export function WidgetLibrary({ projectId }: { projectId: string }) {
  const pid = projectId as Id<"projects">;
  const dashboards = useQuery(api.dashboards.list, projectId ? { projectId: pid } : "skip");
  const createDashboard = useMutation(api.dashboards.create);
  const addWidget = useMutation(api.dashboards.addWidget);
  const removeWidget = useMutation(api.dashboards.removeWidget);
  const [selectedId, setSelectedId] = useState<string>("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setStatus(null);
    try {
      await action();
      setStatus({ tone: "ok", text: success });
    } catch (error) {
      setStatus({ tone: "error", text: error instanceof Error ? error.message : "Action failed." });
    } finally {
      setBusy(false);
    }
  }

  if (dashboards === undefined) {
    return <div className="space-y-4" aria-busy="true"><Skeleton className="h-12 w-full rounded-none" /><Skeleton className="h-64 w-full rounded-none" /></div>;
  }

  const active = dashboards.find((d) => d._id === selectedId) ?? dashboards[0];
  const placed = new Set(active?.widgets.map((w) => w.widgetType));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        {dashboards.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center gap-2 border border-black/10 bg-white px-4 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">No dashboards yet</p>
            <p className="text-xs text-black/50">Create a dashboard to start adding widgets. If you cannot create one, you may lack access to this project.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Dashboards">
              {dashboards.map((d) => (
                <button key={d._id} type="button" role="tab" aria-selected={d._id === active?._id} onClick={() => setSelectedId(d._id)} className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] ${d._id === active?._id ? "border-black bg-black text-white" : "border-black/15 bg-white text-black/60 hover:border-black"}`}>{d.name}</button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {WIDGET_TYPES.map((w) => {
                const instance = active?.widgets.find((x) => x.widgetType === w.type);
                return (
                  <section key={w.type} className="flex flex-col gap-3 border border-black/10 bg-white p-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">{w.label}</p>
                      <p className="mt-2 text-xs text-black/60">{w.description}</p>
                    </div>
                    {active ? (
                      <button type="button" disabled={busy} onClick={() => run(() => instance ? removeWidget({ projectId: pid, dashboardId: active._id, widgetId: instance._id }) : addWidget({ projectId: pid, dashboardId: active._id, widgetType: w.type }), instance ? `${w.label} removed.` : `${w.label} added.`)} className="w-fit border border-black px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] hover:bg-black hover:text-white disabled:opacity-50">{placed.has(w.type) ? "Remove" : "Add to dashboard"}</button>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run(async () => { const id = await createDashboard({ projectId: pid, name, isDefault: dashboards.length === 0 }); setSelectedId(id); setName(""); }, "Dashboard created.");
        }}
        className="grid h-fit gap-4 border border-black/10 bg-white p-5"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">New dashboard</p>
        <label className="grid gap-2 text-xs text-black/65">Name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Reliability" className="h-10 border border-black/15 px-3 text-xs outline-none focus:border-black" /></label>
        <button type="submit" disabled={busy} className="border border-black bg-black px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white disabled:opacity-50">Create dashboard</button>
        {status ? <p role={status.tone === "error" ? "alert" : "status"} className={`text-xs ${status.tone === "error" ? "text-red-700" : "text-black/60"}`}>{status.text}</p> : null}
      </form>
    </div>
  );
}
