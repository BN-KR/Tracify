"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PromptPlayground({ projectId }: { projectId: string }) {
  const [prompt, setPrompt] = useState("You are a helpful assistant.\n\nUser: {{question}}");
  const [question, setQuestion] = useState("How do I reduce a slow tool call?");
  const [model, setModel] = useState("gpt-4o-mini");
  const [comparisonModel, setComparisonModel] = useState("");
  const [results, setResults] = useState<Array<{ model: string; output: string; latencyMs: number; error?: string }>>([]);
  const [output, setOutput] = useState("");
  const [meta, setMeta] = useState("");
  const [running, setRunning] = useState(false);
  async function run() {
    if (!projectId) return;
    setRunning(true); setOutput("");
    try {
      const models = [model, comparisonModel].filter(Boolean);
      const response = await fetch("/api/playground", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId, prompt, models, variables: { question } }) });
      const data = await response.json() as { output?: string; latencyMs?: number; error?: string; results?: Array<{ model: string; output: string; latencyMs: number; error?: string }> };
      if (!response.ok) throw new Error(data.error || "Playground request failed");
      const nextResults = data.results?.length ? data.results : [{ model, output: data.output || "", latencyMs: data.latencyMs ?? 0 }];
      setResults(nextResults); setOutput(nextResults[0]?.output || ""); setMeta(String(nextResults[0]?.latencyMs ?? 0) + "ms");
    } catch (error) { setOutput(error instanceof Error ? error.message : "Playground request failed"); setMeta("error"); }
    finally { setRunning(false); }
  }
  return <div className="grid gap-6 xl:grid-cols-2"><section className="border border-black/15 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-black/55">Prompt playground</p><h2 className="mt-2 text-xl text-black">Test a prompt with live variables</h2><p className="mt-1 text-sm text-black/55">Use {"{{variable}}"} placeholders and optionally compare two models side by side.</p><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mt-5 min-h-52 w-full border border-black/15 bg-white p-3 font-mono text-xs text-black/80" /><textarea value={question} onChange={(event) => setQuestion(event.target.value)} className="mt-3 min-h-24 w-full border border-black/15 bg-white p-3 text-sm text-black/80" placeholder="question" /><div className="mt-3 grid gap-3 sm:grid-cols-2"><input value={model} onChange={(event) => setModel(event.target.value)} placeholder="Primary model" className="border border-black/15 bg-white p-3 font-mono text-xs text-black/70" /><input value={comparisonModel} onChange={(event) => setComparisonModel(event.target.value)} placeholder="Comparison model (optional)" className="border border-black/15 bg-white p-3 font-mono text-xs text-black/70" /></div><Button onClick={run} disabled={running || !prompt.trim() || !question.trim()} className="mt-3 w-full">{running ? "Running..." : comparisonModel ? "Compare models" : "Run prompt"}</Button></section><section className="border border-black/15 bg-white p-5"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-widest text-black/55">{results.length > 1 ? "Model comparison" : "Result"}</p><span className="font-mono text-[10px] text-black/55">{meta}</span></div>{results.length > 1 ? <div className="mt-5 grid gap-3 md:grid-cols-2">{results.map((result) => <div key={result.model} className="border border-black/15 p-3"><div className="flex items-center justify-between"><span className="font-mono text-xs text-black">{result.model}</span><span className="font-mono text-[10px] text-black/55">{result.latencyMs}ms</span></div><pre className="mt-3 min-h-56 whitespace-pre-wrap font-mono text-xs leading-6 text-black/70">{result.error || result.output || "No output"}</pre></div>)}</div> : <pre className="mt-5 min-h-72 whitespace-pre-wrap border border-black/15 bg-white p-4 font-mono text-xs leading-6 text-black/70">{output || "Run the prompt to inspect the model response."}</pre>}</section></div>;
}
