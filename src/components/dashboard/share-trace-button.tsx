"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Copy, Link2Off, Share2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const buttonClass = "flex h-8 items-center gap-2 border border-black/15 bg-white px-3 font-mono text-[11px] uppercase text-black/60 hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:opacity-50";

export function ShareTraceButton({ projectId, runId }: { projectId: string; runId: string }) {
  const args = { projectId: projectId as Id<"projects">, runId };
  const link = useQuery(api.sharedTraces.getForRun, args);
  const create = useMutation(api.sharedTraces.create);
  const revoke = useMutation(api.sharedTraces.revoke);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<"public" | "team" | null>(null);
  const [error, setError] = useState("");

  const publicUrl = link ? `${window.location.origin}/share/${link.token}` : "";

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try { await action(); } catch (err) { setError(err instanceof Error && err.message.includes("Developer") ? "Viewers can't share traces." : "Something went wrong. Try again."); }
    setBusy(false);
  }

  async function copy(text: string, kind: "public" | "team") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch { setError("Copy failed. Select the link and copy it by hand."); }
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className={buttonClass}>
        <Share2 className="size-3" />Share trace
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] space-y-4 border border-black/20 bg-white p-4 shadow-lg">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/55">Share with anyone</p>
            <p className="mt-1 text-[12px] leading-relaxed text-black/60">Anyone with the link can read this trace without an account. They can&apos;t see your other data or write anything. Turn it off any time.</p>
          </div>
          {link === undefined ? <p className="font-mono text-[11px] text-black/45">Loading…</p> : link ? (
            <div className="space-y-2">
              <input readOnly value={publicUrl} onFocus={(event) => event.currentTarget.select()} aria-label="Public link" className="h-9 w-full border border-black/15 bg-[#f7f6f1] px-2 font-mono text-[10px] text-black/70" />
              <div className="flex gap-2">
                <button type="button" onClick={() => void copy(publicUrl, "public")} className={buttonClass}>{copied === "public" ? <Check className="size-3" /> : <Copy className="size-3" />}{copied === "public" ? "Copied" : "Copy link"}</button>
                <button type="button" disabled={busy} onClick={() => void run(() => revoke(args))} className={buttonClass}><Link2Off className="size-3" />Turn off</button>
              </div>
            </div>
          ) : (
            <button type="button" disabled={busy} onClick={() => void run(() => create(args))} className="h-9 w-full bg-black font-mono text-[11px] uppercase text-white hover:bg-[#f4d44d] hover:text-black disabled:opacity-50">{busy ? "Creating…" : "Create public link"}</button>
          )}
          <div className="border-t border-black/10 pt-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/55">Share with your team</p>
            <p className="mt-1 text-[12px] text-black/60">Teammates need to be signed in to open this one.</p>
            <button type="button" onClick={() => void copy(window.location.href, "team")} className={`${buttonClass} mt-2`}>{copied === "team" ? <Check className="size-3" /> : <Copy className="size-3" />}{copied === "team" ? "Copied" : "Copy team link"}</button>
          </div>
          {error ? <p role="alert" className="font-mono text-[11px] text-red-700">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
