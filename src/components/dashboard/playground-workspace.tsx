"use client";

import { useEffect, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Activity, ArrowRight, BarChart3, CheckCircle2, CircleAlert, Filter, Gauge, RotateCcw, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { DashboardTopbar } from "./dashboard-topbar";

type Scenario = "healthy" | "latency" | "failures";

const scenarios: Record<Scenario, { label: string; description: string; stats: [string, string, string][] }> = {
  healthy: { label: "Healthy production", description: "A stable support agent with a clean release signal.", stats: [["Runs", "12,842", "+18.4%"], ["Failure rate", "0.8%", "-0.4%"], ["P95 latency", "1.24s", "-12%"]] },
  latency: { label: "Latency regression", description: "A release has made retrieval and model calls noticeably slower.", stats: [["Runs", "12,842", "+18.4%"], ["Failure rate", "1.9%", "+1.1%"], ["P95 latency", "4.82s", "+288%"]] },
  failures: { label: "Tool-call failures", description: "A provider timeout is causing support-agent runs to fail open.", stats: [["Runs", "12,842", "+18.4%"], ["Failure rate", "8.6%", "+7.8%"], ["P95 latency", "2.11s", "+54%"]] },
};

const runs = [
  ["run_support_8f2c", "Refund status investigation", "completed", "gpt-4o-mini", "1.24s", "$0.018"],
  ["run_research_72ab", "Policy retrieval with citations", "completed", "gpt-4o", "2.08s", "$0.041"],
  ["run_support_19de", "Order lookup and escalation", "failed", "gpt-4o-mini", "4.82s", "$0.009"],
  ["run_agent_0c91", "Account context refresh", "running", "gpt-4o-mini", "0.82s", "$0.006"],
];

export function PlaygroundWorkspace() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const session = useQuery(api.sandbox.getWorkspace, {});
  const saveWorkspace = useMutation(api.sandbox.saveWorkspace);
  const [scenario, setScenario] = useState<Scenario>("healthy");
  const [dismissed, setDismissed] = useState(false);
  const [filter, setFilter] = useState<"all" | "failed">("all");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  useEffect(() => {
    // Hydrate the local control from the account-scoped Convex workspace once it arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (session?.scenarioId && session.scenarioId in scenarios) setScenario(session.scenarioId as Scenario);
  }, [session?.scenarioId]);

  async function changeScenario(next: Scenario) {
    setScenario(next);
    await saveWorkspace({ scenarioId: next, dismissedAlertIds: dismissed ? ["latency-alert"] : [], expectedUpdatedAt: session?.updatedAt });
  }

  async function dismissAlert() {
    setDismissed(true);
    await saveWorkspace({ scenarioId: scenario, dismissedAlertIds: ["latency-alert"], expectedUpdatedAt: session?.updatedAt });
  }

  const current = scenarios[scenario];
  const visibleRuns = useMemo(() => filter === "failed" ? runs.filter((run) => run[2] === "failed") : runs, [filter]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) window.location.assign("/sign-in?redirect=/playground");
  }, [authLoading, isAuthenticated]);

  if (authLoading || !isAuthenticated) return <div className="p-6 font-mono text-sm text-black/55">Checking playground access…</div>;

  return <div className="flex flex-col gap-6">
    <DashboardTopbar title="Explore / Playground" description="A simulated workspace with realistic agent telemetry." />
    <div className="px-6 pb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border border-black bg-black p-5 text-white">
        <div className="flex items-start gap-3"><Sparkles className="mt-0.5 size-5 text-[#f4d44d]" /><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f4d44d]">Simulated workspace</p><p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Everything here is safe to explore. No real project, region, API key, or telemetry is involved.</p></div></div>
        <Link href="/cloud?next=/onboarding" className="inline-flex items-center gap-2 bg-[#f4d44d] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.12em] text-black">Build a real project <ArrowRight className="size-4" /></Link>
      </div>
      <div className="grid gap-4 border-y border-black py-5 md:grid-cols-3">
        {Object.entries(scenarios).map(([id, item]) => <button key={id} type="button" onClick={() => void changeScenario(id as Scenario)} aria-pressed={scenario === id} className={`border p-4 text-left ${scenario === id ? "border-black bg-[#f4d44d]" : "border-black/15 bg-white hover:border-black"}`}><span className="font-mono text-[9px] uppercase tracking-[0.12em]">Scenario {id === "healthy" ? "01" : id === "latency" ? "02" : "03"}</span><span className="mt-3 block font-pixel text-2xl tracking-[-0.04em]">{item.label}</span><span className="mt-2 block text-xs leading-5 text-black/55">{item.description}</span></button>)}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">{current.stats.map(([label, value, delta]) => <div key={label} className="border border-black/15 bg-white p-5"><div className="flex items-center justify-between text-black/45"><span className="font-mono text-[9px] uppercase tracking-[0.14em]">{label}</span><Gauge className="size-4" /></div><div className="mt-7 flex items-end justify-between"><span className="font-pixel text-4xl tracking-[-0.06em]">{value}</span><span className={`font-mono text-[10px] ${delta.startsWith("+") && label !== "Runs" ? "text-[#b42318]" : "text-[#20744a]"}`}>{delta}</span></div></div>)}</div>
      {scenario !== "healthy" && !dismissed ? <div className="mt-6 flex items-start justify-between gap-4 border border-black bg-[#f4d44d] p-5"><div className="flex gap-3"><CircleAlert className="size-5" /><div><p className="font-mono text-[10px] uppercase tracking-[0.13em]">Active simulated alert</p><p className="mt-2 text-sm">{scenario === "latency" ? "P95 latency is above the 2 second release budget." : "Tool-call failures crossed the configured 5% threshold."}</p></div></div><button type="button" onClick={() => void dismissAlert()} aria-label="Dismiss simulated alert"><X className="size-4" /></button></div> : null}
      <section className="mt-6 border border-black bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-black p-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">Recent runs</p><h2 className="mt-2 font-pixel text-3xl tracking-[-0.05em]">Inspect the operating record</h2></div><div className="flex gap-2"><button type="button" onClick={() => setFilter("all")} className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] ${filter === "all" ? "bg-black text-white" : ""}`}><Activity className="size-3.5" /> All</button><button type="button" onClick={() => setFilter("failed")} className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] ${filter === "failed" ? "bg-black text-white" : ""}`}><Filter className="size-3.5" /> Failures</button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-black/15 font-mono text-[9px] uppercase tracking-[0.12em] text-black/45"><th className="p-4">Trace</th><th className="p-4">Name</th><th className="p-4">Status</th><th className="p-4">Model</th><th className="p-4">Latency</th><th className="p-4">Cost</th><th className="p-4">Action</th></tr></thead><tbody>{visibleRuns.map((run) => <tr key={run[0]} className="border-b border-black/10 text-xs last:border-0 hover:bg-[#f3f2ed]"><td className="p-4 font-mono">{run[0]}</td><td className="p-4">{run[1]}</td><td className="p-4"><span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase"><span className={`size-1.5 ${run[2] === "failed" ? "bg-[#b42318]" : run[2] === "running" ? "bg-[#f4d44d]" : "bg-[#20744a]"}`} />{run[2]}</span></td><td className="p-4 font-mono text-black/55">{run[3]}</td><td className="p-4 font-mono">{run[4]}</td><td className="p-4 font-mono">{run[5]}</td><td className="p-4"><button type="button" onClick={() => setSelectedRunId(run[0])} className="font-mono text-[9px] uppercase tracking-[0.1em] underline underline-offset-4">Open trace</button></td></tr>)}</tbody></table></div>{selectedRunId ? <TraceDetail runId={selectedRunId} onClose={() => setSelectedRunId(null)} scenario={scenario} /> : null}</section>
      <div className="mt-6 grid gap-4 md:grid-cols-3"><DemoLink icon={BarChart3} title="Cost analysis" body="Compare model spend and inspect the savings signal." /><DemoLink icon={CheckCircle2} title="Evaluation review" body="See how quality scores attach to production traces." /><DemoLink icon={RotateCcw} title="Trace timeline" body="Open the failure path and follow each decision." /></div>
    </div>
  </div>;
}

function DemoLink({ icon: Icon, title, body }: { icon: typeof BarChart3; title: string; body: string }) {
  return <div className="border border-black/15 bg-white p-5"><Icon className="size-5" /><p className="mt-8 font-pixel text-2xl tracking-[-0.04em]">{title}</p><p className="mt-2 text-sm leading-6 text-black/55">{body}</p><span className="mt-5 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-black/45">Available in the simulator <ArrowRight className="size-3.5" /></span></div>;
}

function TraceDetail({ runId, scenario, onClose }: { runId: string; scenario: Scenario; onClose: () => void }) {
  const failed = scenario === "failures" || runId === "run_support_19de";
  return <div className="border-t border-black bg-[#f3f2ed] p-5"><div className="flex items-center justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/45">Trace detail / simulated</p><p className="mt-2 font-mono text-sm text-black">{runId}</p></div><button type="button" onClick={onClose} aria-label="Close trace detail"><X className="size-4" /></button></div><div className="mt-5 grid gap-3 md:grid-cols-3"><div className="border border-black/15 bg-white p-4"><p className="font-mono text-[9px] uppercase text-black/45">agent.run</p><p className="mt-3 text-sm">{failed ? "Completed with a failed dependency" : "Completed successfully"}</p></div><div className="border border-black/15 bg-white p-4"><p className="font-mono text-[9px] uppercase text-black/45">model.response</p><p className="mt-3 text-sm">{failed ? "Fallback answer selected" : "Answer grounded with citations"}</p></div><div className="border border-black/15 bg-white p-4"><p className="font-mono text-[9px] uppercase text-black/45">tool.call</p><p className="mt-3 text-sm">{failed ? "order_status · timeout" : "order_status · 214ms"}</p></div></div><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-black/45">This trace is simulated. Use Build to send real telemetry.</p></div>;
}
