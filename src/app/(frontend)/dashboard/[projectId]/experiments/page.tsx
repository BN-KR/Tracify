"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Activity, ArrowRightLeft, CircleCheck, DollarSign, FlaskConical, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ExperimentSummary = {
  _id: Id<"experiments">;
  name: string;
  status: "draft" | "running" | "completed" | "failed";
  datasetId: Id<"datasets">;
  model?: string;
  createdAt: number;
  resultCount: number;
  avgScore: number | null;
  scoreDelta: number | null;
  totalCostUsd: number;
  avgLatencyMs: number | null;
  comparisonName: string | null;
};

const statusStyles: Record<ExperimentSummary["status"], string> = {
  draft: "border-zinc-700 bg-zinc-900 text-zinc-300",
  running: "border-sky-300/35 bg-sky-300/5 text-sky-200",
  completed: "border-emerald-400/35 bg-emerald-400/5 text-emerald-300",
  failed: "border-red-400/35 bg-red-400/5 text-red-300",
};

function formatDelta(value: number | null) {
  if (value === null) return "—";
  const rounded = value.toFixed(3);
  return value > 0 ? `+${rounded}` : rounded;
}

function Section({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="border-zinc-800 bg-[#111418] p-0 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 p-5">
        <div className="min-w-0">
          <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-100">{title}</h2>
          {subtitle ? <p className="mt-1 font-mono text-[10px] text-zinc-500">{subtitle}</p> : null}
        </div>
        {badge}
      </div>
      {children}
    </Card>
  );
}

export default function ExperimentsPage() {
  const params = useParams();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const experiments = useQuery(api.experiments.list, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const datasets = useQuery(api.evaluation.listDatasets, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const createExperiment = useMutation(api.experiments.create);

  const [name, setName] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [model, setModel] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"info" | "error">("info");
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");

  const rows = useMemo(() => {
    if (!experiments) return [];
    return experiments.map((experiment) => {
      const dataset = datasets?.find((candidate) => candidate._id === experiment.datasetId);
      return { experiment, datasetName: dataset ? dataset.name : "Unknown dataset" };
    });
  }, [datasets, experiments]);

  const left = rows.find((row) => row.experiment._id === leftId) ?? rows[0] ?? null;
  const right = rows.find((row) => row.experiment._id === rightId) ?? rows[1] ?? rows[0] ?? null;

  const leftResult = left && experiments ? experiments.find((candidate) => candidate._id === left.experiment._id) ?? null : null;
  const rightResult = right && experiments ? experiments.find((candidate) => candidate._id === right.experiment._id) ?? null : null;

  const comparisonRows: Array<{ label: string; first: string; second: string; changed: boolean }> = [];
  if (leftResult && rightResult) {
    const entries: Array<[string, string, string]> = [
      ["Status", leftResult.status, rightResult.status],
      ["Model", leftResult.model || "default", rightResult.model || "default"],
      ["Avg score", leftResult.avgScore === null ? "—" : leftResult.avgScore.toFixed(3), rightResult.avgScore === null ? "—" : rightResult.avgScore.toFixed(3)],
      [
        "Score delta vs previous run",
        leftResult.scoreDelta === null ? "—" : formatDelta(leftResult.scoreDelta),
        rightResult.scoreDelta === null ? "—" : formatDelta(rightResult.scoreDelta),
      ],
      [
        "Avg latency",
        leftResult.avgLatencyMs === null ? "—" : `${leftResult.avgLatencyMs.toFixed(0)}ms`,
        rightResult.avgLatencyMs === null ? "—" : `${rightResult.avgLatencyMs.toFixed(0)}ms`,
      ],
      ["Total cost", `$${leftResult.totalCostUsd.toFixed(5)}`, `$${rightResult.totalCostUsd.toFixed(5)}`],
      ["Results", String(leftResult.resultCount), String(rightResult.resultCount)],
    ];
    for (const [label, first, second] of entries) {
      comparisonRows.push({ label, first, second, changed: first !== second });
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    const chosen = datasetId || datasets?.[0]?._id || "";
    if (!trimmed || !chosen || pending) return;
    setPending(true);
    setFeedback("");
    try {
      await createExperiment({
        projectId: projectId as Id<"projects">,
        name: trimmed,
        datasetId: chosen as Id<"datasets">,
        model: model.trim() ? model.trim() : undefined,
      });
      setName("");
      setModel("");
      setFeedbackTone("info");
      setFeedback(`Experiment "${trimmed}" created as a draft.`);
    } catch (cause) {
      setFeedbackTone("error");
      setFeedback(cause instanceof Error ? cause.message : "Could not create experiment.");
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
  if (project === undefined || experiments === undefined || datasets === undefined) {
    return (
      <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 sm:p-6">
        <Skeleton className="h-24 w-full rounded-none bg-zinc-800" />
        <div className="grid grid-cols-2 gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[132px] rounded-none bg-zinc-800" />
          ))}
        </div>
        <Skeleton className="h-56 w-full rounded-none bg-zinc-800" />
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500"><Loader2 className="size-3 animate-spin" aria-hidden="true" /> Loading experiments…</p>
      </div>
    );
  }

  const running = experiments.filter((experiment) => experiment.status === "running").length;
  const scored = experiments.filter((experiment) => experiment.avgScore !== null);
  const latestScore = scored[0]?.avgScore ?? null;
  const latestScoreDetail = scored[0] ? `${scored[0].name} · latest recorded average` : "No scored experiments yet";
  const totalCost = experiments.reduce((sum, experiment) => sum + experiment.totalCostUsd, 0);
  const resultTotal = experiments.reduce((sum, experiment) => sum + experiment.resultCount, 0);

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#0b0d10] p-4 text-zinc-100 sm:p-6">
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Improve / experiments</p>
          <h1 className="mt-2 font-pixel text-3xl leading-[0.9] tracking-tight text-zinc-100">Experiments</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Compare prompts, models, quality, cost, and latency across controlled runs against your datasets.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
          {experiments.length ? (
            <span className="border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400">{experiments.length} experiments</span>
          ) : null}
          <Link href={`/dashboard/${projectId}/evaluation/datasets`} className="inline-flex min-h-8 items-center border border-zinc-700 bg-zinc-900 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100">
            Manage datasets
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-4">
        <Card className="min-h-[132px] justify-between p-5 shadow-none">
          <div className="flex items-start justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Experiments</span>
            <span className="border border-zinc-700 bg-zinc-900 p-2 text-zinc-300"><FlaskConical className="size-4" aria-hidden="true" /></span>
          </div>
          <div>
            <div className="font-pixel text-3xl tracking-tight text-zinc-100">{experiments.length}</div>
            <div className="mt-2 font-mono text-[10px] text-zinc-500">{running} running</div>
          </div>
        </Card>
        <Card className="min-h-[132px] justify-between p-5 shadow-none">
          <div className="flex items-start justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Latest avg score</span>
            <span className={cn("border p-2", latestScore === null ? "border-zinc-700 bg-zinc-900 text-zinc-400" : latestScore >= 0.8 ? "border-emerald-400/35 bg-emerald-400/5 text-emerald-300" : "border-amber-400/35 bg-amber-400/5 text-amber-300")}>
              <CircleCheck className="size-4" aria-hidden="true" />
            </span>
          </div>
          <div>
            <div className="font-pixel text-3xl tracking-tight text-zinc-100">{latestScore === null ? "—" : latestScore.toFixed(3)}</div>
            <div className="mt-2 font-mono text-[10px] text-zinc-500">{latestScoreDetail}</div>
          </div>
        </Card>
        <Card className="min-h-[132px] justify-between p-5 shadow-none">
          <div className="flex items-start justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Recorded cost</span>
            <span className="border border-zinc-700 bg-zinc-900 p-2 text-zinc-300"><DollarSign className="size-4" aria-hidden="true" /></span>
          </div>
          <div>
            <div className="font-pixel text-3xl tracking-tight text-zinc-100">${totalCost.toFixed(4)}</div>
            <div className="mt-2 font-mono text-[10px] text-zinc-500">Across all experiment results</div>
          </div>
        </Card>
        <Card className="min-h-[132px] justify-between p-5 shadow-none">
          <div className="flex items-start justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Result samples</span>
            <span className="border border-zinc-700 bg-zinc-900 p-2 text-zinc-300"><Activity className="size-4" aria-hidden="true" /></span>
          </div>
          <div>
            <div className="font-pixel text-3xl tracking-tight text-zinc-100">{resultTotal}</div>
            <div className="mt-2 font-mono text-[10px] text-zinc-500">Rows captured by experiments</div>
          </div>
        </Card>
      </div>

      <Section
        title="New experiment"
        subtitle="Creates a draft run. Results arrive when the run records dataset outputs."
        badge={
          datasets.length === 0 ? (
            <span className="border border-amber-400/35 bg-amber-400/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-300">Dataset required</span>
          ) : undefined
        }
      >
        <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-[1.3fr_1fr_0.8fr_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Experiment name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Support agent v3" className="h-10 w-full border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-300" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Dataset</span>
            <select value={datasetId || datasets[0]?._id || ""} onChange={(event) => setDatasetId(event.target.value)} className="h-10 w-full border border-zinc-700 bg-zinc-900 px-3 font-mono text-xs text-zinc-100 outline-none focus:border-zinc-300">
              {datasets.length === 0 ? <option value="">No datasets yet</option> : null}
              {datasets.map((dataset) => (
                <option key={dataset._id} value={dataset._id}>{dataset.name} · {dataset.items.length} items</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Model (optional)</span>
            <input value={model} onChange={(event) => setModel(event.target.value)} placeholder="gpt-4.1" className="h-10 w-full border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-300" />
          </label>
          <button type="submit" disabled={pending || !name.trim() || datasets.length === 0} className="inline-flex min-h-10 items-center justify-center gap-2 border border-zinc-100 bg-zinc-100 px-4 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-50">
            {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            {pending ? "Creating…" : "Create experiment"}
          </button>
        </form>
        {feedback ? (
          <p role="status" className={feedbackTone === "error" ? "border-t border-red-500/30 bg-red-500/5 p-4 font-mono text-xs text-red-300" : "border-t border-emerald-400/30 bg-emerald-400/5 p-4 font-mono text-xs text-emerald-200"}>
            {feedback}
          </p>
        ) : null}
      </Section>

      <Section title="Compare runs" subtitle="Side-by-side evidence from two experiments. Deltas are computed from recorded results.">
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <label className="block min-w-0">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Candidate</span>
            <select value={leftResult?._id ?? ""} onChange={(event) => setLeftId(event.target.value)} className="h-10 w-full border border-zinc-700 bg-zinc-900 px-3 font-mono text-xs text-zinc-100 outline-none focus:border-zinc-300">
              {experiments.map((experiment) => (
                <option key={experiment._id} value={experiment._id}>{experiment.name}</option>
              ))}
            </select>
          </label>
          <ArrowRightLeft className="hidden size-5 text-zinc-500 lg:block" aria-hidden="true" />
          <label className="block min-w-0">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Baseline</span>
            <select value={rightResult?._id ?? ""} onChange={(event) => setRightId(event.target.value)} className="h-10 w-full border border-zinc-700 bg-zinc-900 px-3 font-mono text-xs text-zinc-100 outline-none focus:border-zinc-300">
              {experiments.map((experiment) => (
                <option key={experiment._id} value={experiment._id}>{experiment.name}</option>
              ))}
            </select>
          </label>
        </div>
        {leftResult && rightResult ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Signal</th>
                  <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400">{leftResult.name}</th>
                  <th scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400">{rightResult.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {comparisonRows.map((row) => (
                  <tr key={row.label} className={row.changed ? "bg-zinc-900/40" : undefined}>
                    <th scope="row" className="px-4 py-3 align-top font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">{row.label}</th>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-200">{row.first}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-200">{row.second}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 font-mono text-xs text-zinc-500">Create two experiments to compare their recorded results.</p>
        )}
      </Section>

      <Section title="Experiment records" subtitle={experiments.length ? "Score deltas compare each run with the previous run on the same dataset." : "Runs will appear here once you create the first experiment."}>
        {experiments.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">No experiments recorded yet. Create a draft above, then record outputs through the evaluation suite lineage.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Experiment", "Status", "Avg score", "Δ vs baseline", "Latency", "Cost", "Results", "Created"].map((column) => (
                    <th key={column} scope="col" className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {rows.map(({ experiment, datasetName }) => (
                  <tr key={experiment._id} className="transition-colors hover:bg-zinc-900/60">
                    <td className="max-w-[220px] px-4 py-3 align-top">
                      <span className="block truncate text-sm text-zinc-100">{experiment.name}</span>
                      <span className="mt-1 block truncate font-mono text-[10px] text-zinc-500">{datasetName}</span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={cn("inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-widest", statusStyles[experiment.status])}>
                        <span className="size-1.5 bg-current" aria-hidden="true" />
                        {experiment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-200">{experiment.avgScore === null ? "—" : experiment.avgScore.toFixed(3)}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {experiment.scoreDelta === null ? (
                        <span className="text-zinc-500">—</span>
                      ) : (
                        <span className={experiment.scoreDelta >= 0 ? "text-emerald-300" : "text-red-300"}>{formatDelta(experiment.scoreDelta)}</span>
                      )}
                      {experiment.comparisonName ? <span className="mt-1 block font-mono text-[10px] text-zinc-500">vs {experiment.comparisonName}</span> : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-200">{experiment.avgLatencyMs === null ? "—" : `${experiment.avgLatencyMs.toFixed(0)}ms`}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-200">${experiment.totalCostUsd.toFixed(5)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-200">{experiment.resultCount}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{new Date(experiment.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Score deltas and costs come only from recorded experiment results.</p>
    </div>
  );
}
