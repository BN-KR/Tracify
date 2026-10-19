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
const stamp = () => Date.now();
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
      const entry: Run = { id: ++counter.current, at: stamp(), source: source || "Unsaved prompt", text, models: [...models], temperature, results: body.results };
      setRuns((current) => [entry, ...current].slice(0, 10));
      setShown(entry.id);
      setEditing(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The playground could not run this."); }
    finally { setRunning(false); }
  }

  const current = runs.find((item) => item.id === shown) ?? null;
  const notConnected = providers && !providers.openai && !providers.anthropic;

  const [editing, setEditing] = useState(true);
  const lanes = running ? models.map((model) => ({ model, pending: true as const })) : current ? current.results : [];
  return (
    <div className="flex h-svh min-w-0 flex-col bg-[#0B0D10] font-[family-name:var(--font-geist-sans)] text-[13px] text-[#E6E9EE]">
      <header className="flex flex-wrap items-center gap-2 border-b border-[#1F242C] px-4 py-2">
        <h1 className="mr-1 text-base font-semibold tracking-tight">Playground</h1>
        <label className="sr-only" htmlFor="pg-source">Start from a saved prompt</label>
        <select id="pg-source" value="" onChange={(event) => pick(event.target.value)} className={`${field} h-8 max-w-64 font-mono`} disabled={!prompts?.length}>
          <option value="">{prompts === undefined ? "Loading prompts…" : prompts.length ? source ? `${source}` : "Start from a saved prompt…" : "No saved prompts yet"}</option>
          {prompts?.flatMap((prompt) => prompt.versions.map((version) => <option key={version._id} value={`${prompt._id}|${version._id}`}>{prompt.name} · v{version.version}{version.labels.length ? ` (${version.labels.join(", ")})` : ""}</option>))}
        </select>
        <label className="flex items-center gap-2 text-[11px] text-[#8B93A1]">Temp <span className="w-6 font-mono text-[#E6E9EE]">{temperature.toFixed(1)}</span>
          <input aria-label="Temperature" type="range" min={0} max={2} step={0.1} value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} className="w-24 accent-[#F4D44D]" />
        </label>
        <Link href={`/dashboard/${projectId}/prompts`} className="ml-auto h-7 rounded border border-[#262C35] px-2.5 text-xs leading-7 text-[#C9CED6] hover:text-white">Prompts</Link>
        <button type="button" onClick={run} disabled={Boolean(blocker) || running} className="h-8 rounded bg-[#F4D44D] px-5 text-xs font-medium text-[#090909] hover:bg-[#f7de70] disabled:cursor-not-allowed disabled:opacity-40">{running ? "Running…" : models.length > 1 ? `Run on ${models.length} models` : "Run"}</button>
      </header>
      {notConnected ? (
        <div role="status" className="border-b border-[#3A3420] bg-[#1A170C] px-4 py-2 text-xs text-[#F4D44D]">No model provider is connected on this server yet, so runs are switched off. You can still write the prompt and fill in values to see the final text.</div>
      ) : null}
      <section aria-label="Models" className="flex flex-wrap items-center gap-1.5 border-b border-[#1F242C] px-4 py-2">
        <span className="mr-1 text-[11px] text-[#6B7380]">Models (up to {MAX_PLAYGROUND_MODELS})</span>
        {[...PLAYGROUND_MODELS, ...models.filter((model) => !(PLAYGROUND_MODELS as readonly string[]).includes(model))].map((model) => {
          const on = models.includes(model);
          const off = providers ? !providers[providerOf(model)] : false;
          return <button key={model} type="button" aria-pressed={on} onClick={() => toggleModel(model)} disabled={!on && models.length >= MAX_PLAYGROUND_MODELS} title={off ? "This provider is not connected on the server" : undefined} className={`h-7 rounded border px-2 font-mono text-[11px] disabled:opacity-40 ${on ? "border-[#F4D44D] text-[#F4D44D]" : "border-[#262C35] text-[#C9CED6] hover:text-white"} ${off ? "line-through decoration-[#6B7380]" : ""}`}>{model}</button>;
        })}
        <input value={custom} onChange={(event) => setCustom(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustom(); } }} placeholder="Add model, e.g. claude-sonnet-5-5" aria-label="Add another model" className="h-7 w-64 rounded border border-[#262C35] bg-[#0E1115] px-2.5 font-mono text-xs text-[#E6E9EE] placeholder:text-[#6B7380] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]" />
        <button type="button" onClick={addCustom} className="h-7 rounded border border-[#262C35] px-2.5 text-xs text-[#C9CED6] hover:text-white">Add</button>
      </section>
      <section aria-label="Prompt" className="border-b border-[#1F242C] bg-[#0D1014] px-4 py-2">
        <div className="flex items-center gap-2 text-[11px] text-[#8B93A1]">
          <button type="button" aria-expanded={editing} onClick={() => setEditing(!editing)} className="font-medium text-[#C9CED6] hover:text-white">{editing ? "▾" : "▸"} Prompt text</button>
          <span className="font-mono text-[10px] text-[#6B7380]">{text.length.toLocaleString()} characters · about {estimateTokens(text).toLocaleString()} tokens</span>
        </div>
        {editing ? <textarea aria-label="Prompt text" value={text} onChange={(event) => { setText(event.target.value); setSource((current) => current && !current.endsWith("(edited)") ? `${current} (edited)` : current); }} spellCheck={false} rows={4} className={`${field} mt-1.5 resize-y p-3 font-mono leading-5`} /> : null}
        <div className="mt-2 flex flex-wrap items-start gap-2" aria-label="Values for the variables">
          {variables.length ? variables.map((name) => (
            <label key={name} className="grid min-w-[180px] flex-1 gap-1 text-[11px] text-[#8B93A1]"><span className="font-mono text-[#F4D44D]">{`{{${name}}}`}</span>
              <textarea value={values[name] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} rows={1} className={`${field} resize-y p-2 leading-5`} />
            </label>
          )) : <p className="text-xs text-[#6B7380]">No variables. Write {"{{name}}"} in the prompt to add one.</p>}
        </div>
        {error ? <p role="alert" className="mt-2 rounded border border-[#5B2B2B] bg-[#1A1010] px-3 py-2 text-xs text-[#FF8A8A]">{error}</p> : null}
        {blocker ? <p className="mt-2 text-[11px] text-[#8B93A1]">{blocker}</p> : null}
      </section>
      <section className="min-h-0 flex-1 overflow-auto bg-[#0B0D10] p-3" aria-label="Results" aria-live="polite">
        {lanes.length ? (
          <div className={`grid h-full min-h-[260px] gap-3 ${lanes.length === 2 ? "lg:grid-cols-2" : lanes.length >= 3 ? "lg:grid-cols-3" : ""}`}>
            {lanes.map((lane) => (
              <article key={lane.model} className="flex min-h-0 min-w-0 flex-col rounded border border-[#1F242C] bg-[#0E1115]">
                <div className="flex flex-wrap items-center gap-2 border-b border-[#1F242C] px-3 py-2"><span className="font-mono text-xs font-semibold">{lane.model}</span>
                  {"pending" in lane ? <span className="ml-auto text-[11px] text-[#8B93A1]">Running…</span> : <span className="ml-auto font-mono text-[10px] text-[#8B93A1]">{(lane.latencyMs / 1000).toFixed(1)}s{lane.inputTokens != null ? ` · ${lane.inputTokens.toLocaleString()} in · ${(lane.outputTokens ?? 0).toLocaleString()} out` : ""}</span>}</div>
                {"pending" in lane ? <div role="status" aria-label="Running" className="grid gap-2 p-3"><div className="h-3 w-2/3 animate-pulse rounded bg-[#11151A]" /><div className="h-3 w-full animate-pulse rounded bg-[#11151A]" /><div className="h-3 w-5/6 animate-pulse rounded bg-[#11151A]" /></div>
                  : lane.error ? <p role="alert" className="p-3 text-xs text-[#FF8A8A]">{lane.error}</p>
                  : <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-4 font-mono text-[13px] leading-6 text-[#E6E9EE]">{lane.output || "The model returned nothing."}</pre>}
                {"pending" in lane || lane.error || !lane.output ? null : <div className="border-t border-[#1F242C] px-3 py-1.5"><button type="button" onClick={() => void navigator.clipboard?.writeText(lane.output)} className="text-[11px] text-[#8AB4FF] underline">Copy answer</button></div>}
              </article>
            ))}
          </div>
        ) : (
          <div className="m-auto max-w-sm p-8 text-center">
            <h2 className="text-sm font-semibold">Nothing run yet</h2>
            <p className="mt-2 text-xs leading-5 text-[#8B93A1]">Pick one to three models, fill in the variables and press Run. Each model gets its own big lane, with its time and token use.</p>
            {variables.length ? <details className="mt-4 text-left"><summary className="cursor-pointer text-[11px] text-[#8AB4FF]">Preview the final text</summary><pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap rounded border border-[#1F242C] bg-[#0E1115] p-3 font-mono text-[11px] leading-5 text-[#C9CED6]">{compiled.text}</pre></details> : null}
          </div>
        )}
      </section>
      {runs.length ? (
        <footer aria-label="Run history" className="border-t border-[#1F242C] bg-[#0D1014] px-3 py-2">
          <ul className="flex gap-2 overflow-x-auto">
            {runs.map((item) => (
              <li key={item.id} className="shrink-0">
                <div className={`w-56 rounded border px-2.5 py-1.5 ${item.id === shown ? "border-[#F4D44D]" : "border-[#1F242C]"}`}>
                  <button type="button" onClick={() => setShown(item.id)} aria-current={item.id === shown} className="block w-full truncate text-left font-mono text-[11px] text-[#C9CED6] hover:text-white">{new Date(item.at).toLocaleTimeString()} · {item.models.join(", ")}</button>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[#6B7380]"><span className="min-w-0 flex-1 truncate">{item.source}</span><button type="button" onClick={() => { setText(item.text); setModels(item.models); setTemperature(item.temperature); }} className="text-[#8AB4FF] underline">Reuse</button></div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[10px] text-[#6B7380]">Kept in this tab only. Closing it clears the list.</p>
        </footer>
      ) : null}
    </div>
  );
}
