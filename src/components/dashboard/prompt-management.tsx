"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PromptRecord = FunctionReturnType<typeof api.prompts.list>[number];
type PromptVersion = PromptRecord["versions"][number];
type TraceLink = FunctionReturnType<typeof api.prompts.listTraceLinks>[number];
type Status = { tone: "ok" | "error"; text: string } | null;

const DEFAULT_CONTENT = "You are a helpful assistant.\n\nUser: {{question}}";
const PROMOTABLE_ENVIRONMENTS = ["development", "staging"];
const ENVIRONMENT_LABELS = ["development", "staging", "production"];

function extractVariables(content: string) {
  return [...new Set(Array.from(content.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g), (match) => match[1]))];
}

function errorText(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function PromptManagement({ projectId, initialPromptId }: { projectId: string; initialPromptId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prompts = useQuery(api.prompts.list, projectId ? { projectId: projectId as never } : "skip");
  const traceLinks = useQuery(api.prompts.listTraceLinks, projectId ? { projectId: projectId as never } : "skip");
  const createPrompt = useMutation(api.prompts.create);
  const [name, setName] = useState("");
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [status, setStatus] = useState<Status>(null);
  const requestedId = searchParams.get("prompt") ?? initialPromptId;
  const selectedPrompt = prompts?.find((prompt) => prompt._id === requestedId) ?? prompts?.[0];

  function selectPrompt(promptId: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("prompt", promptId);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  async function create() {
    setStatus(null);
    try {
      const promptId = await createPrompt({ projectId: projectId as never, name: name.trim(), content: content.trim(), type: "text" });
      setName("");
      setStatus({ tone: "ok", text: "Prompt created as version 1." });
      selectPrompt(promptId);
    } catch (error) {
      setStatus({ tone: "error", text: errorText(error, "Could not create prompt.") });
    }
  }

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {status ? (
        <p role="status" className={`col-span-full border p-3 text-xs ${status.tone === "error" ? "border-red-500/60 text-red-600" : "border-black/15 text-black/70"}`}>
          {status.text}
        </p>
      ) : null}
      <section className="min-w-0 border border-black/15 bg-white p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/55">Prompt registry</p>
        <h2 className="mt-2 text-xl text-black">Versioned prompts</h2>
        <p className="mt-1 text-sm text-black/55">Keep prompt changes separate from application deploys.</p>
        {prompts === undefined ? <p className="mt-5 text-sm text-black/55">Loading prompts…</p> : null}
        <div className="mt-5 space-y-2">
          {prompts?.map((prompt) => {
            const selected = selectedPrompt?._id === prompt._id;
            return (
              <button
                key={prompt._id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectPrompt(prompt._id)}
                className={selected ? "w-full min-w-0 border border-black/50 bg-white/[0.06] p-4 text-left" : "w-full min-w-0 border border-black/15 p-4 text-left hover:border-black/30"}
              >
                <div className="flex min-w-0 justify-between gap-3">
                  <span className="truncate font-mono text-sm text-black">{prompt.name}</span>
                  <span className="shrink-0 font-mono text-xs text-black/55">v{prompt.versions[0]?.version ?? 0}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(prompt.versions[0]?.labels ?? []).map((label) => (
                    <span key={label} className="font-mono text-[9px] uppercase text-black/55">{label}</span>
                  ))}
                </div>
              </button>
            );
          })}
          {prompts?.length === 0 ? (
            <p className="border border-dashed border-black/15 p-8 text-center text-sm text-black/55">Create your first prompt to start the improvement loop.</p>
          ) : null}
        </div>
        {selectedPrompt ? (
          <PromptEditor
            key={selectedPrompt._id}
            projectId={projectId}
            prompt={selectedPrompt}
            traceLinks={traceLinks ?? []}
            onStatus={setStatus}
          />
        ) : null}
      </section>
      <aside className="min-w-0 space-y-6">
        <div className="border border-black/15 bg-white p-4 sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/55">New prompt</p>
          <h2 className="mt-2 text-lg text-black">Create version 1</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void create();
            }}
          >
            <Input aria-label="Prompt name" value={name} onChange={(event) => setName(event.target.value)} placeholder="customer-support" />
            <textarea
              aria-label="Prompt content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-40 w-full border border-black/15 bg-white p-3 font-mono text-xs text-black/80"
            />
            <Button type="submit" disabled={!name.trim() || !content.trim() || !projectId} className="w-full">Create prompt</Button>
          </form>
        </div>
      </aside>
    </div>
  );
}

function PromptEditor({
  projectId,
  prompt,
  traceLinks,
  onStatus,
}: {
  projectId: string;
  prompt: PromptRecord;
  traceLinks: TraceLink[];
  onStatus: (status: Status) => void;
}) {
  const updatePrompt = useMutation(api.prompts.update);
  const createVersion = useMutation(api.prompts.createVersion);
  const updateLabels = useMutation(api.prompts.updateLabels);
  const [editName, setEditName] = useState(prompt.name);
  const [editDescription, setEditDescription] = useState(prompt.description ?? "");
  const [draft, setDraft] = useState(prompt.versions[0]?.content ?? "");
  const [saving, setSaving] = useState(false);
  const draftVariables = extractVariables(draft);

  async function saveDetails() {
    const nextName = editName.trim();
    if (!nextName) {
      onStatus({ tone: "error", text: "Prompt name is required." });
      return;
    }
    try {
      await updatePrompt({ projectId: projectId as never, promptId: prompt._id, name: nextName, description: editDescription.trim() });
      onStatus({ tone: "ok", text: "Prompt details updated." });
    } catch (error) {
      onStatus({ tone: "error", text: errorText(error, "Could not update prompt.") });
    }
  }

  async function saveVersion() {
    const content = draft.trim();
    if (!content) return;
    setSaving(true);
    try {
      const version = await createVersion({ projectId: projectId as never, promptId: prompt._id, content, labels: ["latest"] });
      onStatus({ tone: "ok", text: `Saved version ${version} as an immutable latest version.` });
    } catch (error) {
      onStatus({ tone: "error", text: errorText(error, "Could not save version.") });
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnvironment(version: PromptVersion, environment: string) {
    const active = version.labels.includes(environment);
    const labels = active
      ? version.labels.filter((label) => label !== environment)
      : [...version.labels.filter((label) => !ENVIRONMENT_LABELS.includes(label)), environment];
    try {
      await updateLabels({ projectId: projectId as never, versionId: version._id, labels });
      onStatus({ tone: "ok", text: `Version ${version.version} ${active ? "removed from" : "promoted to"} ${environment}.` });
    } catch (error) {
      onStatus({ tone: "error", text: errorText(error, "Could not update version labels.") });
    }
  }

  return (
    <div className="mt-6 min-w-0 border-t border-black/15 pt-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h3 className="break-words text-lg text-black">{prompt.name} history</h3>
          <p className="mt-1 text-xs text-black/55">{prompt.description || "No description yet."}</p>
        </div>
        <form
          className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:max-w-2xl"
          onSubmit={(event) => {
            event.preventDefault();
            void saveDetails();
          }}
        >
          <Input aria-label="Prompt name" value={editName} onChange={(event) => setEditName(event.target.value)} />
          <Input aria-label="Prompt description" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} placeholder="Description" />
          <Button type="submit" size="sm" variant="outline">Save details</Button>
        </form>
      </div>

      <div className="mt-5 border border-black/15 p-3">
        <label htmlFor={`draft-${prompt._id}`} className="font-mono text-[10px] uppercase tracking-widest text-black/55">Next version draft</label>
        <textarea
          id={`draft-${prompt._id}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="mt-2 min-h-40 w-full border border-black/15 bg-white p-3 font-mono text-xs text-black/80"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase text-black/55">
            {draftVariables.length ? `Variables: ${draftVariables.join(", ")}` : "No variables"}
          </span>
          <Button size="sm" variant="outline" disabled={saving || !draft.trim()} onClick={() => void saveVersion()}>
            {saving ? "Saving…" : "Save as new version"}
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/55">Version history</p>
        {prompt.versions.length === 0 ? <p className="text-sm text-black/55">No versions yet.</p> : null}
        {prompt.versions.map((version) => {
          const links = traceLinks.filter((link) => link.promptVersionId === version._id);
          return (
            <div key={version._id} className="min-w-0 border border-black/15 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="break-all font-mono text-xs text-black/70">
                  Version {version.version} · {version.variables.join(", ") || "no variables"}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {PROMOTABLE_ENVIRONMENTS.map((environment) => {
                    const active = version.labels.includes(environment);
                    return (
                      <Button
                        key={environment}
                        size="sm"
                        variant={active ? "default" : "outline"}
                        aria-pressed={active}
                        onClick={() => void toggleEnvironment(version, environment)}
                      >
                        {environment}
                      </Button>
                    );
                  })}
                  {version.labels.includes("production") ? (
                    <span className="border border-emerald-500/40 px-2 py-1 font-mono text-[10px] uppercase text-emerald-300">production · gated</span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase text-black/55">Production promotion requires a passing evaluation gate</span>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px] uppercase text-black/55">
                <span>{version.labels.join(", ") || "no labels"}</span>
                <span>{links.length} linked trace{links.length === 1 ? "" : "s"}</span>
                {links.slice(0, 4).map((link) => (
                  <a
                    key={link._id}
                    href={`/dashboard/${projectId}/runs/${encodeURIComponent(link.traceId)}`}
                    className="break-all text-black/70 underline decoration-black/30 underline-offset-4 hover:decoration-black"
                  >
                    {link.traceId}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
