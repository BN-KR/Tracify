"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { compilePrompt, estimateTokens, extractVariables, MAX_PLAYGROUND_MODELS, PLAYGROUND_MODELS } from "@/lib/prompt-utils";
import { readJson } from "@/lib/safe-json";
import type { PlaygroundResult } from "@/app/(frontend)/api/playground/route";

type Providers = { openai: boolean; anthropic: boolean };
type Run = { id: number; at: number; source: string; text: string; models: string[]; temperature: number; results: PlaygroundResult[] };
const STARTER = "You are a helpful assistant.\n\nUser: {{question}}";
const field = "w-full rounded border border-[#262C35] bg-[#0E1115] px-2.5 text-xs text-[#E6E9EE] placeholder:text-[#6B7380] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]";
const providerOf = (model: string) => (/^claude/i.test(model) ? "anthropic" : "openai");

export function PlaygroundWorkspace({ projectId, initialPrompt, initialVersion }: { projectId: string; initialPrompt?: string; initialVersion?: number }) {
  const prompts = useQuery(api.prompts.list, { projectId: projectId as Id<"projects"> });
  const [source, setSource] = useState<string>("");
  const [text, setText] = useState(STARTER);
  const [values, setValues] = useState<Record<string, string>>({});
  const [models, setModels] = useState<string[]>(["gpt-4o-mini"]);
  const [custom, setCustom] = useState("");
  const [temperature, setTemperature] = useState(0.2);
  const [providers, setProviders] = useState<Providers | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [shown, setShown] = useState<number | null>(null);
  const prefilled = useRef(false);
  const counter = useRef(0);

  const variables = useMemo(() => extractVariables(text), [text]);
  const compiled = useMemo(() => compilePrompt(text, values), [text, values]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/playground?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" })
      .then(async (response) => { const body = await readJson<{ providers?: Providers }>(response); if (!cancelled) setProviders(response.ok && body.providers ? body.providers : { openai: false, anthropic: false }); })
      .catch(() => { if (!cancelled) setProviders({ openai: false, anthropic: false }); });
    return () => { cancelled = true; };
  }, [projectId]);

  // ?prompt=name&version=3 opens a saved version once the prompt list has loaded.
  useEffect(() => {
    if (prefilled.current || !prompts || !initialPrompt) return;
    prefilled.current = true;
    const prompt = prompts.find((item) => item.name === initialPrompt);
    const version = prompt?.versions.find((item) => item.version === initialVersion) ?? prompt?.versions[0];
    // One-time prefill from the link, after the saved prompts arrive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (prompt && version) { setSource(`${prompt.name} v${version.version}`); setText(version.content); if (version.model) setModels([version.model]); }
  }, [prompts, initialPrompt, initialVersion]);

  function pick(value: string) {
    const [promptId, versionId] = value.split("|");
    const prompt = prompts?.find((item) => item._id === promptId);
    const version = prompt?.versions.find((item) => item._id === versionId);
    if (!prompt || !version) { setSource(""); return; }
    setSource(`${prompt.name} v${version.version}`);
    setText(version.content);
    if (version.model) setModels([version.model]);
  }
  function toggleModel(model: string) {
    setModels((current) => current.includes(model) ? current.filter((item) => item !== model) : current.length >= MAX_PLAYGROUND_MODELS ? current : [...current, model]);
  }
  function addCustom() {
    const model = custom.trim();
    if (!model) return;
    if (!/^[A-Za-z0-9._:/-]{1,80}$/.test(model)) { setError("Model names use letters, numbers and . _ : / - only."); return; }
    setError(null);
    if (models.length < MAX_PLAYGROUND_MODELS && !models.includes(model)) setModels([...models, model]);
    setCustom("");
  }

  const unavailable = models.filter((model) => providers && !providers[providerOf(model)]);
  const blocker = !text.trim() ? "Write a prompt first."
    : !models.length ? "Pick at least one model."
    : compiled.missing.length ? `Fill in ${compiled.missing.map((name) => `{{${name}}}`).join(", ")}.`
    : unavailable.length ? `${providerOf(unavailable[0]) === "openai" ? "OpenAI" : "Anthropic"} is not connected on this server, so ${unavailable[0]} cannot run.`
    : null;

  async function run() {
    if (blocker || running) return;
    setRunning(true); setError(null);
    try {
      const response = await fetch("/api/playground", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId, prompt: text, variables: values, models, temperature }) });
      const body = await readJson<{ results?: PlaygroundResult[]; providers?: Providers }>(response);
      if (body.providers) setProviders(body.providers);
      if (!response.ok || !body.results) throw new Error(body.error ?? `The playground could not run this (error ${response.status}). Try again in a moment.`);
      const entry: Run = { id: ++counter.current, at: Date.now(), source: source || "Unsaved prompt", text, models: [...models], temperature, results: body.results };
      setRuns((current) => [entry, ...current].slice(0, 10));
      setShown(entry.id);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The playground could not run this."); }
    finally { setRunning(false); }
  }

  const current = runs.find((item) => item.id === shown) ?? null;
  const notConnected = providers && !providers.openai && !providers.anthropic;

  return (
    <div className="flex min-h-svh min-w-0 flex-col bg-[#0B0D10] font-[family-name:var(--font-geist-sans)] text-[13px] text-[#E6E9EE]">
      <header className="flex flex-wrap items-center gap-2 border-b border-[#1F242C] px-4 py-2">
        <h1 className="mr-2 text-base font-semibold tracking-tight">Playground</h1>
        <span className="text-xs text-[#8B93A1]">Try a prompt on real models before you save it.</span>
        <Link href={`/dashboard/${projectId}/prompts`} className="ml-auto h-7 rounded border border-[#262C35] px-2.5 text-xs leading-7 text-[#C9CED6] hover:text-white">Prompts</Link>
      </header>
      {notConnected ? (
        <div role="status" className="border-b border-[#3A3420] bg-[#1A170C] px-4 py-2.5 text-xs text-[#F4D44D]">No model provider is connected on this server yet, so runs are switched off. Everything else on this page works: you can still write the prompt and fill in values to see the final text.</div>
      ) : null}
      <div className="grid min-h-0 flex-1 gap-px bg-[#1F242C] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="flex min-h-0 flex-col gap-3 overflow-auto bg-[#0B0D10] p-4" aria-label="Prompt and settings">
          <label className="grid gap-1 text-[11px] text-[#8B93A1]">Start from a saved prompt
            <select value="" onChange={(event) => pick(event.target.value)} className={`${field} h-8 font-mono`} disabled={!prompts?.length}>
              <option value="">{prompts === undefined ? "Loading prompts…" : prompts.length ? source ? `Using ${source}. Pick another…` : "Pick a prompt version…" : "No saved prompts yet"}</option>
              {prompts?.flatMap((prompt) => prompt.versions.map((version) => <option key={version._id} value={`${prompt._id}|${version._id}`}>{prompt.name} · v{version.version}{version.labels.length ? ` (${version.labels.join(", ")})` : ""}</option>))}
            </select>
          </label>
          <label className="grid gap-1 text-[11px] text-[#8B93A1]">Prompt text
            <textarea value={text} onChange={(event) => { setText(event.target.value); setSource((current) => current && !current.endsWith("(edited)") ? `${current} (edited)` : current); }} spellCheck={false} className={`${field} min-h-48 resize-y p-3 font-mono leading-5`} />
          </label>
          <p className="font-mono text-[10px] text-[#6B7380]">{text.length.toLocaleString()} characters · about {estimateTokens(text).toLocaleString()} tokens (estimate)</p>
          <fieldset className="grid gap-2 border-t border-[#1F242C] pt-3">
            <legend className="mb-1 text-[11px] text-[#8B93A1]">Values for the variables</legend>
            {variables.length ? variables.map((name) => (
              <label key={name} className="grid gap-1 text-[11px] text-[#8B93A1]"><span className="font-mono text-[#F4D44D]">{`{{${name}}}`}</span>
                <textarea value={values[name] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} rows={2} className={`${field} resize-y p-2 leading-5`} />
              </label>
            )) : <p className="text-xs text-[#6B7380]">This prompt has no variables. Write {"{{name}}"} to add one.</p>}
          </fieldset>
          <fieldset className="grid gap-2 border-t border-[#1F242C] pt-3">
            <legend className="mb-1 text-[11px] text-[#8B93A1]">Models (up to {MAX_PLAYGROUND_MODELS}, run side by side)</legend>
            <div className="flex flex-wrap gap-1.5">
              {[...PLAYGROUND_MODELS, ...models.filter((model) => !(PLAYGROUND_MODELS as readonly string[]).includes(model))].map((model) => {
                const on = models.includes(model);
                const off = providers ? !providers[providerOf(model)] : false;
                return <button key={model} type="button" aria-pressed={on} onClick={() => toggleModel(model)} disabled={!on && models.length >= MAX_PLAYGROUND_MODELS} title={off ? "This provider is not connected on the server" : undefined} className={`h-7 rounded border px-2 font-mono text-[11px] disabled:opacity-40 ${on ? "border-[#F4D44D] text-[#F4D44D]" : "border-[#262C35] text-[#C9CED6] hover:text-white"} ${off ? "line-through decoration-[#6B7380]" : ""}`}>{model}</button>;
              })}
            </div>
            <div className="flex gap-1.5">
              <input value={custom} onChange={(event) => setCustom(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustom(); } }} placeholder="Another model name, e.g. claude-sonnet-5-5" aria-label="Add another model" className={`${field} h-7 font-mono`} />
              <button type="button" onClick={addCustom} className="h-7 shrink-0 rounded border border-[#262C35] px-2.5 text-xs text-[#C9CED6] hover:text-white">Add</button>
            </div>
            <label className="grid gap-1 text-[11px] text-[#8B93A1]"><span>Temperature <span className="font-mono text-[#E6E9EE]">{temperature.toFixed(1)}</span> <span className="text-[#6B7380]">(lower = steadier, higher = more varied)</span></span>
              <input type="range" min={0} max={2} step={0.1} value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} className="accent-[#F4D44D]" />
            </label>
          </fieldset>
          {error ? <p role="alert" className="rounded border border-[#5B2B2B] bg-[#1A1010] px-3 py-2 text-xs text-[#FF8A8A]">{error}</p> : null}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={run} disabled={Boolean(blocker) || running} className="h-8 rounded bg-[#F4D44D] px-4 text-xs font-medium text-[#090909] hover:bg-[#f7de70] disabled:cursor-not-allowed disabled:opacity-40">{running ? "Running…" : models.length > 1 ? `Run on ${models.length} models` : "Run"}</button>
            {blocker ? <span className="text-[11px] text-[#8B93A1]">{blocker}</span> : null}
          </div>
        </section>
        <section className="flex min-h-0 flex-col overflow-auto bg-[#0B0D10] p-4" aria-label="Results" aria-live="polite">
          {running ? (
            <div role="status" className="grid gap-2" aria-label="Running"><div className="h-4 w-40 animate-pulse rounded bg-[#11151A]" /><div className="h-40 animate-pulse rounded bg-[#11151A]" /></div>
          ) : current ? (
            <>
              <p className="mb-2 font-mono text-[11px] text-[#6B7380]">{current.source} · temperature {current.temperature.toFixed(1)} · {new Date(current.at).toLocaleTimeString()}</p>
              <div className={`grid gap-3 ${current.results.length > 1 ? "xl:grid-cols-2" : ""} ${current.results.length > 2 ? "2xl:grid-cols-3" : ""}`}>
                {current.results.map((result) => (
                  <article key={result.model} className="min-w-0 rounded border border-[#1F242C] bg-[#0E1115]">
                    <div className="flex flex-wrap items-center gap-2 border-b border-[#1F242C] px-3 py-2"><span className="font-mono text-xs font-semibold">{result.model}</span>
                      <span className="ml-auto font-mono text-[10px] text-[#8B93A1]">{(result.latencyMs / 1000).toFixed(1)}s{result.inputTokens != null ? ` · ${result.inputTokens.toLocaleString()} in · ${(result.outputTokens ?? 0).toLocaleString()} out` : ""}</span></div>
                    {result.error ? <p role="alert" className="p-3 text-xs text-[#FF8A8A]">{result.error}</p> : <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-5 text-[#C9CED6]">{result.output || "The model returned nothing."}</pre>}
                    {!result.error && result.output ? <div className="border-t border-[#1F242C] px-3 py-1.5"><button type="button" onClick={() => void navigator.clipboard?.writeText(result.output)} className="text-[11px] text-[#8AB4FF] underline">Copy answer</button></div> : null}
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="m-auto max-w-sm p-8 text-center">
              <h2 className="text-sm font-semibold">Nothing run yet</h2>
              <p className="mt-2 text-xs leading-5 text-[#8B93A1]">Fill in the variables, pick one to three models and press Run. Answers appear here with how long each took and how many tokens it used.</p>
              {variables.length ? <details className="mt-4 text-left"><summary className="cursor-pointer text-[11px] text-[#8AB4FF]">Preview the final text</summary><pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap rounded border border-[#1F242C] bg-[#0E1115] p-3 font-mono text-[11px] leading-5 text-[#C9CED6]">{compiled.text}</pre></details> : null}
            </div>
          )}
          {runs.length ? (
            <div className="mt-4 border-t border-[#1F242C] pt-3">
              <h2 className="mb-1.5 text-[11px] uppercase tracking-wider text-[#6B7380]">This session</h2>
              <ul className="grid gap-1">
                {runs.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <button type="button" onClick={() => setShown(item.id)} aria-current={item.id === shown} className={`min-w-0 flex-1 truncate rounded border px-2 py-1 text-left font-mono text-[11px] ${item.id === shown ? "border-[#F4D44D] text-white" : "border-[#1F242C] text-[#8B93A1] hover:text-white"}`}>{new Date(item.at).toLocaleTimeString()} · {item.source} · {item.models.join(", ")}</button>
                    <button type="button" onClick={() => { setText(item.text); setModels(item.models); setTemperature(item.temperature); }} className="h-7 shrink-0 rounded border border-[#262C35] px-2 text-[11px] text-[#C9CED6] hover:text-white">Reuse</button>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[10px] text-[#6B7380]">Kept in this tab only. Closing it clears the list.</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
