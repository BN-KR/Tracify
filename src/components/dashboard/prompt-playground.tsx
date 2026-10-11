"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type PlaygroundResult = { model: string; output: string; latencyMs: number; error?: string };
type PlaygroundResponse = { output?: string; latencyMs?: number; error?: string; results?: PlaygroundResult[] };

const DEFAULT_PROMPT = "You are a helpful assistant.\n\nUser: {{question}}";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_VARIABLES: Record<string, string> = { question: "How do I reduce a slow tool call?" };

function extractVariables(prompt: string) {
  return [...new Set(Array.from(prompt.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g), (match) => match[1]))];
}

export function PromptPlayground({
  projectId,
  initialModel,
  initialComparisonModel,
}: {
  projectId: string;
  initialModel?: string;
  initialComparisonModel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [variables, setVariables] = useState<Record<string, string>>(DEFAULT_VARIABLES);
  const [model, setModel] = useState(initialModel || DEFAULT_MODEL);
  const [comparisonModel, setComparisonModel] = useState(initialComparisonModel || "");
  const [results, setResults] = useState<PlaygroundResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const variableNames = extractVariables(prompt);
  const comparing = comparisonModel.trim() !== "";

  function syncModelsToUrl(nextModel: string, nextComparison: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (nextModel.trim() && nextModel.trim() !== DEFAULT_MODEL) next.set("model", nextModel.trim());
    else next.delete("model");
    if (nextComparison.trim()) next.set("compare", nextComparison.trim());
    else next.delete("compare");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  async function run() {
    const models = [...new Set([model, comparisonModel].map((value) => value.trim()).filter(Boolean))];
    if (!models.length) {
      setError("Enter a model name to run the prompt.");
      return;
    }
    setRunning(true);
    setError(null);
    setResults([]);
    try {
      const response = await fetch("/api/playground", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId, prompt, models, variables }),
      });
      const data = (await response.json().catch(() => ({}))) as PlaygroundResponse;
      if (!response.ok) throw new Error(data.error || "Playground request failed");
      setResults(data.results?.length ? data.results : [{ model: models[0], output: data.output ?? "", latencyMs: data.latencyMs ?? 0 }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Playground request failed");
    } finally {
      setRunning(false);
    }
  }

  const single = results.length === 1 ? results[0] : undefined;

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
      <section className="min-w-0 border border-black/15 bg-white p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/55">Prompt playground</p>
        <h2 className="mt-2 text-xl text-black">Test a prompt with live variables</h2>
        <p className="mt-1 text-sm text-black/55">Use {"{{variable}}"} placeholders and optionally compare two models side by side.</p>

        <label className="mt-5 block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-black/55">Prompt</span>
          <textarea
            aria-label="Prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="mt-2 min-h-52 w-full border border-black/15 bg-white p-3 font-mono text-xs text-black/80"
          />
        </label>

        {variableNames.length ? (
          <div className="mt-4 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/55">Variables</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {variableNames.map((variable) => (
                <label key={variable} className="block min-w-0">
                  <span className="font-mono text-[10px] text-black/55">{variable}</span>
                  <textarea
                    aria-label={`Variable ${variable}`}
                    value={variables[variable] ?? ""}
                    onChange={(event) => setVariables((current) => ({ ...current, [variable]: event.target.value }))}
                    className="mt-1 min-h-20 w-full border border-black/15 bg-white p-3 text-sm text-black/80"
                  />
                </label>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs text-black/55">Add a {"{{variable}}"} placeholder to inject values at run time.</p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            aria-label="Primary model"
            value={model}
            onChange={(event) => {
              setModel(event.target.value);
              syncModelsToUrl(event.target.value, comparisonModel);
            }}
            placeholder="Primary model"
            className="min-w-0 border border-black/15 bg-white p-3 font-mono text-xs text-black/70"
          />
          <input
            aria-label="Comparison model"
            value={comparisonModel}
            onChange={(event) => {
              setComparisonModel(event.target.value);
              syncModelsToUrl(model, event.target.value);
            }}
            placeholder="Comparison model (optional)"
            className="min-w-0 border border-black/15 bg-white p-3 font-mono text-xs text-black/70"
          />
        </div>
        <Button onClick={() => void run()} disabled={running || !prompt.trim() || !model.trim()} className="mt-4 w-full">
          {running ? "Running..." : comparing ? "Compare models" : "Run prompt"}
        </Button>
      </section>

      <section className="min-w-0 border border-black/15 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/55">{results.length > 1 ? "Model comparison" : "Result"}</p>
          <span className="font-mono text-[10px] text-black/55">{single ? `${single.latencyMs}ms` : ""}</span>
        </div>
        {error ? <p role="alert" className="mt-5 border border-black/40 p-3 font-mono text-xs text-black">{error}</p> : null}
        {results.length > 1 ? (
          <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-2">
            {results.map((result) => (
              <div key={result.model} className="min-w-0 border border-black/15 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-mono text-xs text-black">{result.model}</span>
                  <span className="shrink-0 font-mono text-[10px] text-black/55">{result.latencyMs}ms</span>
                </div>
                <pre className="mt-3 min-h-56 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-black/70">{result.error || result.output || "No output"}</pre>
              </div>
            ))}
          </div>
        ) : (
          <pre className="mt-5 min-h-72 overflow-x-auto whitespace-pre-wrap break-words border border-black/15 bg-white p-4 font-mono text-xs leading-6 text-black/70">
            {single ? single.error || single.output || "No output" : running ? "Running..." : "Run the prompt to inspect the model response."}
          </pre>
        )}
      </section>
    </div>
  );
}
