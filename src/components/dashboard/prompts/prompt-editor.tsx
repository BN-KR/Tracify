"use client";

import { useMemo, useState } from "react";
import { estimateTokens, extractVariables } from "@/lib/prompt-utils";

const LABEL_PATTERN = /^[A-Za-z0-9._-]{1,40}$/;
const field = "w-full rounded border border-[#262C35] bg-[#0E1115] px-2.5 text-xs text-[#E6E9EE] placeholder:text-[#6B7380] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#F4D44D]";

export type EditorValues = { name: string; description: string; content: string; model: string; commitMessage: string; labels: string[] };

/** Writes a new prompt (version 1) or a new version of an existing one. Nothing is sent until Save, and errors stay on screen. */
export function PromptEditor({ mode, initial, takenNames, onCancel, onSave }: {
  mode: "prompt" | "version";
  initial: Partial<EditorValues>;
  takenNames: string[];
  onCancel: () => void;
  onSave: (values: EditorValues) => Promise<void>;
}) {
  const [values, setValues] = useState<EditorValues>({ name: "", description: "", content: "", model: "", commitMessage: "", labels: [], ...initial });
  const [labelDraft, setLabelDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const variables = useMemo(() => extractVariables(values.content), [values.content]);
  const set = <K extends keyof EditorValues>(key: K, value: EditorValues[K]) => setValues((current) => ({ ...current, [key]: value }));

  function addLabel() {
    const label = labelDraft.trim();
    if (!label) return;
    if (label === "production") { setError("Production is given out by the evaluation release gate, not typed in here."); return; }
    if (label === "latest") { setError("“latest” is managed for you and always points at the newest version."); return; }
    if (!LABEL_PATTERN.test(label)) { setError("Labels use letters, numbers, dots, dashes and underscores, up to 40 characters."); return; }
    if (values.labels.length >= 9) { setError("A version can have at most 10 labels."); return; }
    setError(null);
    if (!values.labels.includes(label)) set("labels", [...values.labels, label]);
    setLabelDraft("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const name = values.name.trim();
    if (mode === "prompt" && !name) return setError("Give the prompt a name.");
    if (mode === "prompt" && name.length > 100) return setError("A prompt name can be at most 100 characters.");
    if (mode === "prompt" && takenNames.some((taken) => taken.toLowerCase() === name.toLowerCase())) return setError(`You already have a prompt called “${name}”.`);
    if (!values.content.trim()) return setError("The prompt text cannot be empty.");
    setSaving(true); setError(null);
    try { await onSave({ ...values, name }); } catch (reason) {
      // Convex wraps the message in request details; the sentence after "Error:" is the one written for people.
      const raw = reason instanceof Error ? reason.message : "";
      const match = raw.match(/Uncaught Error: ([^\n]+)/);
      setError(match?.[1] ?? (raw && !raw.includes("Server Error") ? raw : "Could not save. Check your connection and try again."));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4" aria-label={mode === "prompt" ? "New prompt" : "New version"}>
      <h2 className="text-sm font-semibold">{mode === "prompt" ? "New prompt" : "New version"}</h2>
      {mode === "prompt" ? (
        <>
          <label className="grid gap-1 text-[11px] text-[#8B93A1]">Name
            <input value={values.name} onChange={(event) => set("name", event.target.value)} maxLength={100} placeholder="customer-support" className={`${field} h-8 font-mono`} autoFocus />
          </label>
          <label className="grid gap-1 text-[11px] text-[#8B93A1]">Description (optional)
            <input value={values.description} onChange={(event) => set("description", event.target.value)} maxLength={500} placeholder="What this prompt is for" className={`${field} h-8`} />
          </label>
        </>
      ) : null}
      <label className="grid gap-1 text-[11px] text-[#8B93A1]">Prompt text
        <textarea value={values.content} onChange={(event) => set("content", event.target.value)} spellCheck={false} placeholder={"You are a helpful assistant.\n\nUser: {{question}}"} className={`${field} min-h-56 resize-y p-3 font-mono leading-5`} autoFocus={mode === "version"} />
      </label>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#8B93A1]" aria-live="polite">
        <span>Variables:</span>
        {variables.length ? variables.map((name) => <span key={name} className="rounded border border-[#3A3420] bg-[#1A170C] px-1.5 py-0.5 font-mono text-[#F4D44D]">{`{{${name}}}`}</span>) : <span className="text-[#6B7380]">none yet. Write {"{{name}}"} to add one.</span>}
        <span className="ml-auto font-mono text-[#6B7380]">{values.content.length.toLocaleString()} characters · about {estimateTokens(values.content).toLocaleString()} tokens</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-[11px] text-[#8B93A1]">Model (optional)
          <input value={values.model} onChange={(event) => set("model", event.target.value)} maxLength={80} placeholder="gpt-4o-mini" className={`${field} h-8 font-mono`} />
        </label>
        {mode === "version" ? (
          <label className="grid gap-1 text-[11px] text-[#8B93A1]">What changed? (optional)
            <input value={values.commitMessage} onChange={(event) => set("commitMessage", event.target.value)} maxLength={200} placeholder="Shorter answers, added tone rule" className={`${field} h-8`} />
          </label>
        ) : null}
      </div>
      <div className="grid gap-1 text-[11px] text-[#8B93A1]">
        <span>Extra labels (optional)</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {["development", "staging"].map((label) => (
            <button key={label} type="button" aria-pressed={values.labels.includes(label)} onClick={() => set("labels", values.labels.includes(label) ? values.labels.filter((item) => item !== label) : [...values.labels, label])} className={`h-7 rounded border px-2 font-mono text-[11px] ${values.labels.includes(label) ? "border-[#F4D44D] text-[#F4D44D]" : "border-[#262C35] text-[#C9CED6] hover:text-white"}`}>{label}</button>
          ))}
          {values.labels.filter((label) => !["development", "staging"].includes(label)).map((label) => (
            <button key={label} type="button" onClick={() => set("labels", values.labels.filter((item) => item !== label))} aria-label={`Remove label ${label}`} className="h-7 rounded border border-[#F4D44D] px-2 font-mono text-[11px] text-[#F4D44D]">{label} ×</button>
          ))}
          <input value={labelDraft} onChange={(event) => setLabelDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLabel(); } }} onBlur={addLabel} placeholder="another label" aria-label="Add another label" className={`${field} h-7 w-32 font-mono`} />
        </div>
        <span className="text-[#6B7380]">A label points at one version. Giving it here moves it from the version that has it now. “latest” is added for you.</span>
      </div>
      {error ? <p role="alert" className="rounded border border-[#5B2B2B] bg-[#1A1010] px-3 py-2 text-xs text-[#FF8A8A]">{error}</p> : null}
      <div className="flex items-center gap-2 pt-1">
        <button type="submit" disabled={saving} className="h-8 rounded bg-[#F4D44D] px-3 text-xs font-medium text-[#090909] hover:bg-[#f7de70] disabled:opacity-50">{saving ? "Saving…" : mode === "prompt" ? "Create prompt" : "Save as new version"}</button>
        <button type="button" onClick={onCancel} disabled={saving} className="h-8 rounded border border-[#262C35] px-3 text-xs text-[#C9CED6] hover:text-white">Cancel</button>
        {mode === "version" ? <span className="text-[11px] text-[#6B7380]">Saved versions never change. Edit to make the next one.</span> : null}
      </div>
    </form>
  );
}
