"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function EvaluationLab({ projectId }: { projectId: string }) {
  const datasets = useQuery(api.evaluation.listDatasets, { projectId: projectId as never });
  const scores = useQuery(api.evaluation.listScores, { projectId: projectId as never });
  const metrics = useQuery(api.evaluation.scoreMetrics, { projectId: projectId as never });
  const createDataset = useMutation(api.evaluation.createDataset);
  const setDatasetAccess = useMutation(api.evaluation.setDatasetAccess);
  const addItem = useMutation(api.evaluation.addDatasetItem);
  const importItems = useMutation(api.evaluation.importItems);
  const createScore = useMutation(api.evaluation.createScore);
  const [datasetName, setDatasetName] = useState("");
  const [datasetAccess, setDatasetAccessState] = useState<"project" | "restricted">("project");
  const [datasetId, setDatasetId] = useState<string>();
  const [input, setInput] = useState("");
  const [expected, setExpected] = useState("");
  const [traceId, setTraceId] = useState("");
  const [scoreName, setScoreName] = useState("quality");
  const [scoreValue, setScoreValue] = useState("0.8");
  const [status, setStatus] = useState("");
  const [importJson, setImportJson] = useState("");

  async function makeDataset() {
    try { const id = await createDataset({ projectId: projectId as never, name: datasetName, access: datasetAccess }); setDatasetName(""); setDatasetId(id); setStatus(datasetAccess === "restricted" ? "Restricted dataset created for you." : "Dataset created."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Could not create dataset."); }
  }
  async function makeItem() {
    if (!datasetId) return;
    try { await addItem({ projectId: projectId as never, datasetId: datasetId as never, input, expectedOutput: expected }); setInput(""); setExpected(""); setStatus("Dataset item added."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Could not add item."); }
  }
  async function importDatasetItems() {
    if (!datasetId) return;
    try { const parsed = JSON.parse(importJson) as Array<{ input: string; expectedOutput?: string; metadata?: Record<string, unknown> }>; const result = await importItems({ projectId: projectId as never, datasetId: datasetId as never, items: parsed }); setImportJson(""); setStatus(`Imported ${result.imported} items.`); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Import must be a JSON array of { input, expectedOutput } objects."); }
  }
  async function makeScore() {
    try { await createScore({ projectId: projectId as never, traceId, name: scoreName, value: Number(scoreValue), dataType: "numeric", source: "human" }); setStatus("Score attached to trace."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Could not create score."); }
  }

  return <div className="space-y-6">
    <div className="flex justify-end gap-2"><Link href={`/dashboard/${projectId}/evaluation/review`} className="border border-zinc-700 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300 hover:border-white">Annotation queue</Link><Link href={`/dashboard/${projectId}/evaluation/evaluators`} className="border border-zinc-700 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300 hover:border-white">Evaluators</Link></div>
    <div className="grid gap-6 xl:grid-cols-3">
      <section className="border border-zinc-800 bg-zinc-950/60 p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Datasets</p><h2 className="mt-2 text-lg text-white">Build a test set</h2><div className="mt-4 space-y-3"><Input value={datasetName} onChange={(event) => setDatasetName(event.target.value)} placeholder="support-regression" /><select value={datasetAccess} onChange={(event) => setDatasetAccessState(event.target.value as "project" | "restricted")} className="w-full border border-zinc-800 bg-black p-3 text-sm text-zinc-300"><option value="project">Project access</option><option value="restricted">Restricted to me</option></select><Button onClick={makeDataset} disabled={!datasetName.trim()} className="w-full">Create dataset</Button>{datasets?.map((dataset) => <div key={dataset._id} className="space-y-2"><button onClick={() => setDatasetId(dataset._id)} className={datasetId === dataset._id ? "w-full border border-white/40 p-3 text-left" : "w-full border border-zinc-800 p-3 text-left"}><span className="text-sm text-white">{dataset.name}</span><span className="ml-2 font-mono text-xs text-zinc-500">v{dataset.version ?? 1} · {dataset.access === "restricted" ? "restricted" : "project"} · {dataset.items.length} items</span></button>{datasetId === dataset._id ? <Button size="sm" variant="outline" onClick={async () => { await setDatasetAccess({ projectId: projectId as never, datasetId: dataset._id, access: dataset.access === "restricted" ? "project" : "restricted" }); setStatus(dataset.access === "restricted" ? "Dataset shared with the project." : "Dataset restricted to you."); }}>{dataset.access === "restricted" ? "Share with project" : "Restrict to me"}</Button> : null}</div>)}</div></section>
      <section className="border border-zinc-800 bg-zinc-950/60 p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Dataset item</p><h2 className="mt-2 text-lg text-white">Add or import examples</h2><div className="mt-4 space-y-3"><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Input / scenario" className="min-h-24 w-full border border-zinc-800 bg-black p-3 text-xs text-zinc-200" /><textarea value={expected} onChange={(event) => setExpected(event.target.value)} placeholder="Expected output (optional)" className="min-h-24 w-full border border-zinc-800 bg-black p-3 text-xs text-zinc-200" /><Button onClick={makeItem} disabled={!datasetId || !input.trim()} variant="outline" className="w-full">Add item</Button><textarea value={importJson} onChange={(event) => setImportJson(event.target.value)} placeholder={'[{"input":"...","expectedOutput":"..."}]'} className="min-h-24 w-full border border-zinc-800 bg-black p-3 font-mono text-xs text-zinc-200" /><Button onClick={importDatasetItems} disabled={!datasetId || !importJson.trim()} variant="outline" className="w-full">Import JSON items</Button></div></section>
      <section className="border border-zinc-800 bg-zinc-950/60 p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Scores</p><h2 className="mt-2 text-lg text-white">Review a trace</h2><div className="mt-4 space-y-3"><Input value={traceId} onChange={(event) => setTraceId(event.target.value)} placeholder="Trace ID" /><Input value={scoreName} onChange={(event) => setScoreName(event.target.value)} placeholder="Score name" /><Input value={scoreValue} onChange={(event) => setScoreValue(event.target.value)} placeholder="0.0 – 1.0" /><Button onClick={makeScore} disabled={!traceId.trim()} className="w-full">Attach score</Button></div></section>
    </div>
    {status ? <p className="border border-zinc-800 p-3 text-xs text-zinc-400">{status}</p> : null}
    <section className="border border-zinc-800 bg-zinc-950/60 p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Recent evaluation scores</p><div className="mt-4 grid gap-2 md:grid-cols-2">{scores?.map((score) => <div key={score._id} className="border border-zinc-800 p-3"><div className="flex justify-between"><span className="text-sm text-white">{score.name}</span><span className="font-mono text-xs text-emerald-400">{String(score.value)}</span></div><p className="mt-1 font-mono text-[10px] uppercase text-zinc-500">{score.source} · {score.traceId || score.spanId}</p></div>)}</div>{scores?.length === 0 ? <p className="mt-4 text-sm text-zinc-500">Scores from human review, code evaluators, user feedback, and judges will appear here.</p> : null}</section>
    <section className="border border-zinc-800 bg-zinc-950/60 p-5"><div className="flex items-baseline justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Quality analytics</p><h2 className="mt-2 text-lg text-white">Score trends by evaluator</h2></div><span className="font-mono text-[10px] uppercase text-zinc-600">last 1,000 scores</span></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{metrics?.map((metric) => <div key={metric.name} className="border border-zinc-800 p-4"><div className="flex items-center justify-between gap-2"><span className="text-sm text-white">{metric.name}</span><span className="font-mono text-[10px] text-zinc-500">{metric.count} samples</span></div><div className="mt-3 grid grid-cols-2 gap-3 font-mono"><div><p className="text-[9px] uppercase text-zinc-600">Average</p><p className="mt-1 text-lg text-emerald-400">{metric.average === null ? "—" : metric.average.toFixed(2)}</p></div><div><p className="text-[9px] uppercase text-zinc-600">Pass rate</p><p className="mt-1 text-lg text-cyan-300">{metric.passRate === null ? "—" : `${Math.round(metric.passRate * 100)}%`}</p></div></div><p className="mt-3 font-mono text-[9px] uppercase text-zinc-600">{metric.sources.join(" · ")}</p></div>)}</div>{metrics?.length === 0 ? <p className="mt-4 text-sm text-zinc-500">As evaluators and reviewers score traces, their quality metrics will appear here.</p> : null}</section>
  </div>;
}
