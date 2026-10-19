"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { PromptDetail, TABS, type PromptVersion, type Tab } from "./prompt-detail";
import { PromptEditor, type EditorValues } from "./prompt-editor";

type Query = Record<string, string>;
type Sort = "updated" | "name";
const control = "h-7 rounded border border-[#262C35] bg-[#0E1115] px-2.5 text-xs text-[#C9CED6] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]";

function ago(timestamp: number, now: number) {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function readUrl(initial: Query): Query {
  if (typeof window === "undefined") return initial;
  const query: Query = {};
  for (const [key, value] of new URLSearchParams(window.location.search)) if (value) query[key] = value.slice(0, 200);
  return query;
}

export function PromptsWorkspace({ projectId, initialQuery }: { projectId: string; initialQuery: Query }) {
  const typedProjectId = projectId as Id<"projects">;
  const prompts = useQuery(api.prompts.list, { projectId: typedProjectId });
  const createPrompt = useMutation(api.prompts.create);
  const createVersion = useMutation(api.prompts.createVersion);
  const updatePrompt = useMutation(api.prompts.update);
  const updateLabels = useMutation(api.prompts.updateLabels);
  const [query, setQuery] = useState<Query>(() => readUrl(initialQuery));
  const [sort, setSort] = useState<Sort>("updated");
  const [draft, setDraft] = useState(query.q ?? "");
  const [editor, setEditor] = useState<{ mode: "prompt" | "version"; initial: Partial<EditorValues> } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = prompts?.find((prompt) => prompt._id === query.prompt) ?? null;
  const tab: Tab = (TABS as readonly string[]).includes(query.tab) ? (query.tab as Tab) : "versions";
  const usage = useQuery(api.prompts.versionUsage, selected && tab === "usage" ? { projectId: typedProjectId, promptId: selected._id } : "skip");
  const links = useQuery(api.prompts.listTraceLinks, selected && tab === "usage" ? { projectId: typedProjectId } : "skip");

  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(timer); }, []);
  const update = useCallback((patch: Query) => setQuery((current) => {
    const next = { ...current, ...patch };
    for (const key of Object.keys(next)) if (next[key] === "") delete next[key];
    return next;
  }), []);
  useEffect(() => {
    const params = new URLSearchParams(query);
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
  }, [query]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
      if (event.key === "/" && !typing) { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === "Escape" && !typing) { if (editor) setEditor(null); else if (query.prompt) update({ prompt: "", tab: "" }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor, query.prompt, update]);

  const rows = useMemo(() => {
    const needle = (query.q ?? "").toLowerCase();
    const filtered = (prompts ?? []).filter((prompt) => !needle || prompt.name.toLowerCase().includes(needle) || (prompt.description ?? "").toLowerCase().includes(needle) || prompt.versions.some((version) => version.labels.some((label) => label.toLowerCase() === needle)));
    return [...filtered].sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : b.updatedAt - a.updatedAt));
  }, [prompts, query.q, sort]);

  const stats = useMemo(() => {
    const all = prompts ?? [];
    return {
      prompts: all.length,
      versions: all.reduce((sum, prompt) => sum + (prompt.versions[0]?.version ?? 0), 0),
      production: all.filter((prompt) => prompt.versions.some((version) => version.labels.includes("production"))).length,
    };
  }, [prompts]);

  async function save(values: EditorValues) {
    if (editor?.mode === "prompt") {
      const id = await createPrompt({ projectId: typedProjectId, name: values.name, description: values.description || undefined, type: "text", content: values.content, model: values.model || undefined, labels: values.labels });
      update({ prompt: id, tab: "" });
    } else if (selected) {
      await createVersion({ projectId: typedProjectId, promptId: selected._id, content: values.content, model: values.model || undefined, labels: values.labels, commitMessage: values.commitMessage || undefined });
    }
    setEditor(null);
  }

  const takenNames = (prompts ?? []).map((prompt) => prompt.name);
  const panelOpen = Boolean(editor || selected);

  return (
    <div className="flex min-h-svh min-w-0 flex-col bg-[#0B0D10] font-[family-name:var(--font-geist-sans)] text-[13px] text-[#E6E9EE]">
      <header className="flex flex-wrap items-center gap-2 border-b border-[#1F242C] px-4 py-2">
        <h1 className="mr-2 text-base font-semibold tracking-tight">Prompts</h1>
        <form className="min-w-[180px] flex-1" onSubmit={(event) => { event.preventDefault(); update({ q: draft.trim() }); }}>
          <label htmlFor="prompt-search" className="sr-only">Search prompts</label>
          <input id="prompt-search" ref={searchRef} value={draft} onChange={(event) => { setDraft(event.target.value); if (!event.target.value) update({ q: "" }); }} placeholder="Search by name, description or label ( / )" className="h-8 w-full rounded border border-[#262C35] bg-[#0E1115] px-3 font-mono text-xs placeholder:text-[#6B7380] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]" />
        </form>
        <label className="sr-only" htmlFor="prompt-sort">Sort</label>
        <select id="prompt-sort" value={sort} onChange={(event) => setSort(event.target.value as Sort)} className={control}><option value="updated">Recently changed</option><option value="name">Name A to Z</option></select>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#8B93A1]"><span className="size-1.5 animate-pulse rounded-full bg-[#5BE3A0]" />Live</span>
        <Link href={`/dashboard/${projectId}/playground`} className={`${control} inline-flex items-center`}>Playground</Link>
        <button type="button" onClick={() => setEditor({ mode: "prompt", initial: {} })} className="h-7 rounded bg-[#F4D44D] px-3 text-xs font-medium text-[#090909] hover:bg-[#f7de70]">New prompt</button>
      </header>
      {query.q ? (
        <div className="flex items-center gap-1.5 border-b border-[#1F242C] px-4 py-1.5" aria-label="Active filters">
          <button type="button" onClick={() => { setDraft(""); update({ q: "" }); }} aria-label={`Remove filter ${query.q}`} className="flex items-center gap-1 rounded border border-[#3A3420] bg-[#1A170C] px-2 py-0.5 font-mono text-[11px] text-[#F4D44D]">“{query.q}” ×</button>
        </div>
      ) : null}
      <section aria-label="Summary" className="grid grid-cols-3 gap-px border-b border-[#1F242C] bg-[#1F242C]">
        {[["Prompts", stats.prompts], ["Versions saved", stats.versions], ["In production", stats.production]].map(([label, value]) => (
          <div key={label} className="bg-[#0B0D10] px-4 py-2.5"><div className="font-mono text-[10px] uppercase tracking-wider text-[#6B7380]">{label}</div><div className="mt-0.5 font-mono text-base">{prompts === undefined ? "–" : value}</div></div>
        ))}
      </section>
      <div className={`grid min-h-0 flex-1 ${panelOpen ? "lg:grid-cols-[minmax(0,1fr)_minmax(420px,48%)]" : "grid-cols-1"}`}>
        <main className={`min-w-0 overflow-auto ${panelOpen ? "hidden lg:block" : ""}`}>
          {prompts === undefined ? (
            <div className="grid gap-px p-4" role="status" aria-label="Loading prompts">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-10 animate-pulse rounded bg-[#11151A]" />)}</div>
          ) : !prompts.length ? (
            <div className="mx-auto max-w-md p-10 text-center">
              <h2 className="text-sm font-semibold">Keep your prompts out of your code</h2>
              <p className="mt-2 text-xs leading-5 text-[#8B93A1]">Save a prompt here, give each version a label like “staging”, and fetch it by name from your app. Change the text without a deploy, compare versions, and see which traces used which version.</p>
              <button type="button" onClick={() => setEditor({ mode: "prompt", initial: {} })} className="mt-4 h-8 rounded bg-[#F4D44D] px-3 text-xs font-medium text-[#090909]">Create your first prompt</button>
            </div>
          ) : !rows.length ? (
            <div className="p-10 text-center text-xs text-[#8B93A1]">No prompts match “{query.q}”. <button type="button" onClick={() => { setDraft(""); update({ q: "" }); }} className="text-[#8AB4FF] underline">Clear search</button></div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-[#0B0D10] text-[10px] uppercase tracking-wider text-[#6B7380]"><tr><th className="px-4 py-2 font-medium">Name</th><th className="px-2 py-2 font-medium">Version</th><th className="px-2 py-2 font-medium">Labels</th><th className="hidden px-2 py-2 font-medium md:table-cell">Model</th><th className="px-4 py-2 text-right font-medium">Changed</th></tr></thead>
              <tbody>
                {rows.map((prompt) => {
                  const newest = prompt.versions[0];
                  // Each label belongs to one version, so show where it points: "production v2".
                  const labels = prompt.versions.flatMap((version) => version.labels.filter((label) => label !== "latest").map((label) => ({ label, version: version.version })));
                  const active = prompt._id === query.prompt;
                  return (
                    <tr key={prompt._id} onClick={() => update({ prompt: prompt._id })} className={`cursor-pointer border-t border-[#161B21] hover:bg-[#11151A] ${active ? "bg-[#11151A] shadow-[inset_2px_0_0_#F4D44D]" : ""}`}>
                      <td className="max-w-[16rem] px-4 py-2"><button type="button" onClick={(event) => { event.stopPropagation(); update({ prompt: prompt._id }); }} className="block max-w-full truncate text-left font-mono text-xs font-medium hover:underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]" aria-current={active}>{prompt.name}</button>{prompt.description ? <div className="truncate text-[11px] text-[#6B7380]">{prompt.description}</div> : null}</td>
                      <td className="px-2 py-2 font-mono text-xs">v{newest?.version ?? 0}</td>
                      <td className="px-2 py-2"><div className="flex flex-wrap gap-1">{labels.length ? labels.map(({ label, version }) => <span key={label} className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${label === "production" ? "border-[#1F4D38] bg-[#0E1A14] text-[#5BE3A0]" : "border-[#262C35] text-[#C9CED6]"}`}>{label} <span className="text-[#6B7380]">v{version}</span></span>) : <span className="text-[11px] text-[#6B7380]">draft</span>}</div></td>
                      <td className="hidden px-2 py-2 font-mono text-[11px] text-[#8B93A1] md:table-cell">{newest?.model ?? "–"}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-right font-mono text-[11px] text-[#8B93A1]" title={new Date(prompt.updatedAt).toLocaleString()}>{ago(prompt.updatedAt, now)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </main>
        {editor ? (
          <aside className="flex min-h-0 flex-col border-l border-[#1F242C] bg-[#0B0D10]">
            <PromptEditor key={`${editor.mode}-${editor.initial.content?.length ?? 0}-${selected?._id ?? ""}`} mode={editor.mode} initial={editor.initial} takenNames={takenNames} onCancel={() => setEditor(null)} onSave={save} />
          </aside>
        ) : selected ? (
          <PromptDetail
            key={selected._id}
            projectId={projectId}
            prompt={selected}
            tab={tab}
            onTab={(next) => update({ tab: next === "versions" ? "" : next })}
            usage={usage}
            links={links}
            onNewVersion={(from: PromptVersion) => setEditor({ mode: "version", initial: { content: from.content, model: from.model ?? "" } })}
            onClose={() => update({ prompt: "", tab: "" })}
            onSetLabels={async (version, labels) => { await updateLabels({ projectId: typedProjectId, versionId: version._id, labels }); }}
            onSaveDetails={async (name, description) => { await updatePrompt({ projectId: typedProjectId, promptId: selected._id, name, description }); }}
          />
        ) : null}
      </div>
      {query.prompt && prompts && !selected && !editor ? (
        <p role="alert" className="border-t border-[#5B2B2B] bg-[#1A1010] px-4 py-2 text-xs text-[#FF8A8A]">That prompt was not found. It may have been removed. <button type="button" onClick={() => update({ prompt: "", tab: "" })} className="underline">Back to all prompts</button></p>
      ) : null}
    </div>
  );
}
