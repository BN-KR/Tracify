"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatRelativeTime } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

export function RunNotes({ projectId, runId }: { projectId: string; runId: string }) {
  const args = { projectId: projectId as Id<"projects">, runId };
  const notes = useQuery(api.comments.listRunNotes, args);
  const add = useMutation(api.comments.createRunNote);
  const remove = useMutation(api.comments.remove);
  const { data: session } = authClient.useSession();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      await add({ ...args, content: text });
      setText("");
    } catch (err) {
      setError(err instanceof Error && err.message.includes("Developer") ? "Viewers can read notes but not add them." : "Could not save the note. Try again.");
    }
    setBusy(false);
  }

  return (
    <section className="border border-border bg-muted/10 p-4" aria-label="Notes on this run">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-black/55"><MessageSquare className="size-3" />Notes on this run</div>
      <p className="mt-1 font-mono text-[11px] text-black/60">Leave context for your team: what went wrong, what you tried, what to do next.</p>
      {notes && notes.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {notes.map((note) => (
            <li key={note._id} className="space-y-1 border border-border/20 bg-black/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-tighter text-black/60">{note.userName}</span>
                <span className="flex items-center gap-3 font-mono text-[9px] text-black/55">
                  {formatRelativeTime(String(note.createdAt))}
                  {session?.user.id && note.userId === session.user.id ? (
                    <button type="button" aria-label="Delete note" title="Delete note" onClick={() => void remove({ commentId: note._id })} className="text-black/45 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"><Trash2 className="size-3" /></button>
                  ) : null}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words font-mono text-[11px] text-black/75">{note.content}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex gap-2">
        <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={4000} rows={2} aria-label="Write a note"
          onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void submit(); }}
          placeholder="Write a note for your team…" className="min-h-9 flex-1 resize-y border border-black/15 bg-black/5 p-2 font-mono text-[11px] outline-none focus:border-black/40" />
        <button type="button" aria-label="Add note" title="Add note (Ctrl+Enter)" onClick={() => void submit()} disabled={busy || !text.trim()} className="size-9 shrink-0 self-end bg-black/10 hover:bg-black hover:text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"><Send className="mx-auto size-4" /></button>
      </div>
      {error ? <p role="alert" className="mt-2 font-mono text-[11px] text-red-700">{error}</p> : null}
    </section>
  );
}
