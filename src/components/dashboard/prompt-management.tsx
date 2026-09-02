"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PromptManagement({ projectId }: { projectId: string }) {
  const prompts = useQuery(api.prompts.list, projectId ? { projectId: projectId as never } : "skip");
  const traceLinks = useQuery(api.prompts.listTraceLinks, projectId ? { projectId: projectId as never } : "skip");
  const createPrompt = useMutation(api.prompts.create);
  const createVersion = useMutation(api.prompts.createVersion);
  const updateLabels = useMutation(api.prompts.updateLabels);
  const updatePrompt = useMutation(api.prompts.update);
  const [name, setName] = useState("");
  const [content, setContent] = useState("You are a helpful assistant.\n\nUser: {{question}}");
  const [selected, setSelected] = useState<string>();
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const selectedPrompt = prompts?.find((prompt) => prompt._id === selected) ?? prompts?.[0];

  async function create() {
    if (!projectId) return;
    try {
      await createPrompt({ projectId: projectId as never, name, content, type: "text" });
      setName("");
      setStatus("Prompt created as version 1.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create prompt.");
    }
  }

  async function saveVersion() {
    if (!projectId) return;
    if (!selectedPrompt) return;
    try {
      await createVersion({ projectId: projectId as never, promptId: selectedPrompt._id, content: draft, labels: ["latest"] });
      setDraft("");
      setStatus("New immutable version saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save version.");
    }
  }

  async function promote(versionId: string, labels: string[], environment = "production") {
    if (!projectId) return;
    await updateLabels({ projectId: projectId as never, versionId: versionId as never, labels: [...labels.filter((label) => !["development", "staging", "production"].includes(label)), environment] });
    setStatus("Version promoted to " + environment + ".");
  }
  async function saveDetails() {
    if (!projectId) return;
    if (!selectedPrompt) return;
    try {
      await updatePrompt({ projectId: projectId as never, promptId: selectedPrompt._id, name: editName || selectedPrompt.name, description: editDescription });
      setStatus("Prompt details updated.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Could not update prompt."); }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="border border-black/15 bg-white p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/55">Prompt registry</p>
        <h2 className="mt-2 text-xl text-black">Versioned prompts</h2>
        <p className="mt-1 text-sm text-black/55">Keep prompt changes separate from application deploys.</p>
        <div className="mt-5 space-y-2">
          {prompts?.map((prompt) => (
            <button key={prompt._id} onClick={() => setSelected(prompt._id)} className={selectedPrompt?._id === prompt._id ? "w-full border border-black/50 bg-white/[0.06] p-4 text-left" : "w-full border border-black/15 p-4 text-left hover:border-black/30"}>
              <div className="flex justify-between"><span className="font-mono text-sm text-black">{prompt.name}</span><span className="font-mono text-xs text-black/55">v{prompt.versions[0]?.version ?? 0}</span></div>
              <div className="mt-2 flex gap-2">{(prompt.versions[0]?.labels ?? []).map((label) => <span key={label} className="font-mono text-[9px] uppercase text-black/55">{label}</span>)}</div>
            </button>
          ))}
          {prompts?.length === 0 ? <p className="border border-dashed border-black/15 p-8 text-center text-sm text-black/55">Create your first prompt to start the improvement loop.</p> : null}
        </div>
        {selectedPrompt ? <div className="mt-6 border-t border-black/15 pt-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-lg text-black">{selectedPrompt.name} history</h3><p className="mt-1 text-xs text-black/55">{selectedPrompt.description || "No description yet."}</p></div><div className="flex gap-2"><Input value={editName} onChange={(event) => setEditName(event.target.value)} placeholder={selectedPrompt.name} /><Input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} placeholder="Description" /><Button size="sm" variant="outline" onClick={saveDetails}>Save details</Button></div></div><div className="mt-3 space-y-2">{selectedPrompt.versions.map((version) => { const links = traceLinks?.filter((link) => link.promptVersionId === version._id) ?? []; return <div key={version._id} className="border border-black/15 p-3"><div className="flex items-center justify-between gap-3"><span className="font-mono text-xs text-black/70">Version {version.version} · {version.variables.join(", ") || "no variables"}</span><div className="flex flex-wrap items-center gap-2">{["development", "staging"].map((environment) => <Button key={environment} size="sm" variant={version.labels.includes(environment) ? "default" : "outline"} onClick={() => promote(version._id, version.labels, environment)}>{environment}</Button>)}{version.labels.includes("production") ? <span className="border border-emerald-500/40 px-2 py-1 font-mono text-[10px] uppercase text-emerald-300">production · gated</span> : <span className="font-mono text-[10px] uppercase text-black/55">Production promotion requires a passing evaluation gate</span>}</div></div><div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px] uppercase text-black/55"><span>{links.length} linked trace{links.length === 1 ? "" : "s"}</span>{links.slice(0, 4).map((link) => <a key={link._id} href={"/dashboard/" + projectId + "/runs/" + link.traceId} className="text-black/70 underline decoration-black/30 underline-offset-4 hover:decoration-black">{link.traceId}</a>)}</div></div>; })}</div></div> : null}
      </section>
      <aside className="space-y-6">
        <div className="border border-black/15 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/55">New prompt</p><h2 className="mt-2 text-lg text-black">Create version 1</h2><div className="mt-4 space-y-3"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="customer-support" /><textarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-40 w-full border border-black/15 bg-white p-3 font-mono text-xs text-black/80" /><Button onClick={create} disabled={!name.trim() || !content.trim()} className="w-full">Create prompt</Button></div></div>
        {selectedPrompt ? <div className="border border-black/15 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/55">Playground draft</p><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write the next prompt version..." className="mt-4 min-h-32 w-full border border-black/15 bg-white p-3 font-mono text-xs text-black/80" /><Button onClick={saveVersion} disabled={!draft.trim()} variant="outline" className="mt-3 w-full">Save version</Button></div> : null}
        {status ? <p className="border border-black/15 p-3 text-xs text-black/60">{status}</p> : null}
      </aside>
    </div>
  );
}
