"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ExperimentLab({ projectId }: { projectId: string }) {
  const datasets = useQuery(api.evaluation.listDatasets, { projectId: projectId as never });
  const prompts = useQuery(api.prompts.list, { projectId: projectId as never });
  const experiments = useQuery(api.experiments.list, { projectId: projectId as never });
  const evaluationOverview = useQuery(api.evaluationEngine.overview, { projectId: projectId as never });
  const createExperiment = useMutation(api.experiments.create);
  const setStatus = useMutation(api.experiments.setStatus);
  const recordResult = useMutation(api.experiments.recordResult);
  const [datasetId, setDatasetId] = useState<string>();
  const [promptId, setPromptId] = useState<string>();
  const [promptVersionId, setPromptVersionId] = useState<string>();
  const [suiteId, setSuiteId] = useState<string>();
  const [name, setName] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [status, setMessage] = useState("");
  const [selectedExperiment, setSelectedExperiment] = useState<string>();
  const [itemId, setItemId] = useState<string>();
  const [output, setOutput] = useState("");
  const [traceId, setTraceId] = useState("");
  const [score, setScore] = useState("");
  const [latency, setLatency] = useState("");
  const [cost, setCost] = useState("");
  const [runningProvider, setRunningProvider] = useState(false);
  const selectedPrompt = prompts?.find((prompt) => prompt._id === promptId);
  const selectedRun = experiments?.find((experiment) => experiment._id === selectedExperiment);
  const selectedDataset = datasets?.find((dataset) => dataset._id === selectedRun?.datasetId);

  async function create() {
    if (!datasetId) return;
    try { await createExperiment({ projectId: projectId as never, datasetId: datasetId as never, promptId: promptId as never, promptVersionId: promptVersionId as never, suiteId: suiteId as never, name, model }); setName(""); setMessage("Experiment created with its evaluation suite criteria."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not create experiment."); }
  }
  async function toggle(experimentId: string, next: "running" | "completed") {
    await setStatus({ projectId: projectId as never, experimentId: experimentId as never, status: next });
    setMessage(next === "running" ? "Experiment marked running." : "Experiment marked complete.");
  }
  async function addResult() {
    if (!selectedRun || !itemId) return;
    try {
      await recordResult({ projectId: projectId as never, experimentId: selectedRun._id, datasetItemId: itemId as never, output, traceId: traceId || undefined, score: score ? Number(score) : undefined, latencyMs: latency ? Number(latency) : undefined, costUsd: cost ? Number(cost) : undefined });
      setOutput(""); setTraceId(""); setScore(""); setLatency(""); setCost(""); setMessage("Experiment result recorded.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not record result."); }
  }
  async function runProvider() {
    if (!selectedRun) return;
    setRunningProvider(true);
    try {
      const response = await fetch("/api/experiments/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId, experimentId: selectedRun._id }) });
      const data = await response.json() as { error?: string; results?: Array<{ ok: boolean }> };
      if (!response.ok) throw new Error(data.error || "Experiment run failed");
      setMessage("Provider run completed: " + (data.results?.filter((result) => result.ok).length ?? 0) + " successful items.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Experiment run failed."); }
    finally { setRunningProvider(false); }
  }

  const regressionRuns = experiments?.filter((experiment) => experiment.scoreDelta !== null) ?? [];

  return <div className="space-y-6">
    <section className="border border-zinc-800 bg-zinc-950/60 p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Regression report</p><h2 className="mt-2 text-lg text-white">Quality change by run</h2><div className="mt-4 grid gap-2 md:grid-cols-2">{regressionRuns.map((experiment) => <div key={experiment._id} className="border border-zinc-800 p-3"><div className="flex items-center justify-between"><span className="text-sm text-white">{experiment.name}</span><span className={experiment.scoreDelta! >= 0 ? "font-mono text-xs text-emerald-400" : "font-mono text-xs text-rose-400"}>{experiment.scoreDelta! >= 0 ? "+" : ""}{experiment.scoreDelta!.toFixed(2)}</span></div><p className="mt-2 font-mono text-[10px] uppercase text-zinc-600">vs {experiment.comparisonName} · {experiment.scoreDelta! >= 0 ? "improvement" : "regression"}</p></div>)}</div>{experiments?.length && regressionRuns.length === 0 ? <p className="mt-4 text-sm text-zinc-500">Run the same dataset more than once to generate a regression baseline.</p> : null}</section>
    <section className="border border-zinc-800 bg-zinc-950/60 p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Experiment runner</p><h2 className="mt-2 text-xl text-white">Compare prompts against a dataset</h2><p className="mt-1 max-w-2xl text-sm text-zinc-500">Create a durable run, execute your task locally or from CI, and record each output, trace, cost, latency, and score back into Tracify.</p><div className="mt-5 grid gap-3 md:grid-cols-2"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="support-prompt-v2-regression" /><Input value={model} onChange={(event) => setModel(event.target.value)} placeholder="Model" /><select value={datasetId ?? ""} onChange={(event) => setDatasetId(event.target.value)} className="border border-zinc-800 bg-black p-3 text-sm text-zinc-300"><option value="">Choose dataset</option>{datasets?.map((dataset) => <option key={dataset._id} value={dataset._id}>{dataset.name} ({dataset.items.length} items)</option>)}</select><select value={promptId ?? ""} onChange={(event) => { setPromptId(event.target.value); setPromptVersionId(""); }} className="border border-zinc-800 bg-black p-3 text-sm text-zinc-300"><option value="">Choose prompt</option>{prompts?.map((prompt) => <option key={prompt._id} value={prompt._id}>{prompt.name}</option>)}</select><select value={promptVersionId ?? ""} onChange={(event) => setPromptVersionId(event.target.value)} className="border border-zinc-800 bg-black p-3 text-sm text-zinc-300"><option value="">Choose version</option>{selectedPrompt?.versions.map((version) => <option key={version._id} value={version._id}>Version {version.version} · {version.labels.join(", ")}</option>)}</select><Button onClick={create} disabled={!name.trim() || !datasetId} className="md:col-span-2">Create experiment run</Button></div></section>
    <section className="border border-zinc-800 bg-zinc-950/60 p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Evaluation criteria</p><p className="mt-2 text-xs text-zinc-500">Attach a suite so experiment results use the same evaluators and release thresholds as the Evaluation Engine.</p><div className="mt-3 flex flex-wrap gap-2"><select value={suiteId ?? ""} onChange={(event) => setSuiteId(event.target.value)} className="min-w-64 border border-zinc-800 bg-black p-3 text-sm text-zinc-300"><option value="">No evaluation suite</option>{evaluationOverview?.recentSuites.map((suite) => <option key={suite._id} value={suite._id}>{suite.name} · {suite.minScore ?? "no min score"}</option>)}</select><Button onClick={create} disabled={!name.trim() || !datasetId}>Create with suite</Button></div></section>
    {status ? <p className="border border-zinc-800 p-3 text-xs text-zinc-400">{status}</p> : null}
    <section className="border border-zinc-800 bg-zinc-950/60 p-5"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Saved runs</p><h2 className="mt-2 text-lg text-white">Experiment history</h2></div><span className="font-mono text-xs text-zinc-500">{experiments?.length ?? 0} runs</span></div><div className="mt-4 space-y-2">{experiments?.map((experiment) => <button key={experiment._id} onClick={() => setSelectedExperiment(experiment._id)} className={selectedRun?._id === experiment._id ? "w-full border border-white/40 p-4 text-left" : "w-full border border-zinc-800 p-4 text-left hover:border-zinc-600"}><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="text-sm text-white">{experiment.name}</span><span className="ml-3 font-mono text-[10px] uppercase text-zinc-500">{experiment.status}</span></div><div className="flex gap-2">{experiment.status === "draft" ? <span role="button" onClick={(event) => { event.stopPropagation(); toggle(experiment._id, "running"); }} className="border border-zinc-700 px-2 py-1 font-mono text-[9px] uppercase text-zinc-400">Start</span> : null}{experiment.status === "running" ? <span role="button" onClick={(event) => { event.stopPropagation(); toggle(experiment._id, "completed"); }} className="border border-zinc-700 px-2 py-1 font-mono text-[9px] uppercase text-zinc-400">Complete</span> : null}</div></div><div className="mt-3 grid gap-2 font-mono text-[10px] uppercase text-zinc-500 sm:grid-cols-4"><span>{experiment.resultCount} results</span><span>{experiment.avgScore === null ? "—" : experiment.avgScore.toFixed(2)} avg score</span><span>{experiment.avgLatencyMs === null ? "—" : Math.round(experiment.avgLatencyMs) + "ms"} latency</span><span>{"$"}{experiment.totalCostUsd.toFixed(4)} cost</span></div></button>)}</div>{experiments?.length === 0 ? <p className="mt-4 text-sm text-zinc-500">Create a run to start comparing prompt or model changes.</p> : null}</section>
    {selectedRun ? <section className="grid gap-6 border border-zinc-800 bg-zinc-950/60 p-5 lg:grid-cols-[360px_1fr]"><div><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Record result</p><h2 className="mt-2 text-lg text-white">{selectedRun.name}</h2></div><Button size="sm" onClick={runProvider} disabled={runningProvider || !selectedRun.promptVersionId}>{runningProvider ? "Running..." : "Run with provider"}</Button></div><p className="mt-2 text-xs text-zinc-500">Runs every dataset item through the selected prompt version using the configured provider.</p><div className="mt-4 space-y-3"><select value={itemId ?? ""} onChange={(event) => setItemId(event.target.value)} className="w-full border border-zinc-800 bg-black p-3 text-sm text-zinc-300"><option value="">Dataset item</option>{selectedDataset?.items.map((item) => <option key={item._id} value={item._id}>{item.input.slice(0, 60)}</option>)}</select><textarea value={output} onChange={(event) => setOutput(event.target.value)} placeholder="Task output" className="min-h-24 w-full border border-zinc-800 bg-black p-3 text-xs text-zinc-200" /><Input value={traceId} onChange={(event) => setTraceId(event.target.value)} placeholder="Trace ID (optional)" /><div className="grid grid-cols-3 gap-2"><Input value={score} onChange={(event) => setScore(event.target.value)} placeholder="Score" /><Input value={latency} onChange={(event) => setLatency(event.target.value)} placeholder="ms" /><Input value={cost} onChange={(event) => setCost(event.target.value)} placeholder="USD" /></div><Button onClick={addResult} disabled={!itemId || !output.trim()} className="w-full">Record result</Button></div></div><div><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Result comparison</p><div className="mt-4 space-y-2">{selectedRun.results.map((result) => <div key={result._id} className="border border-zinc-800 p-3"><div className="flex justify-between gap-3"><span className="text-sm text-zinc-200">{result.output.slice(0, 120) || result.error || "Failed item"}</span><span className="font-mono text-xs text-emerald-400">{result.score ?? "—"}</span></div><p className="mt-2 font-mono text-[10px] uppercase text-zinc-500">{result.latencyMs ?? "—"}ms · {"$"}{(result.costUsd ?? 0).toFixed(4)} · {result.traceId || "no trace linked"}</p></div>)}</div>{selectedRun.results.length === 0 ? <p className="mt-4 text-sm text-zinc-500">Record outputs to compare quality, cost, latency, and trace links.</p> : null}</div></section> : null}
  </div>;
}
