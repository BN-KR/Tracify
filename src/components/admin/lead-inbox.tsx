"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
const statuses = ["new", "contacted", "qualified", "converted", "closed"] as const;
type LeadStatus = (typeof statuses)[number];
export function LeadInbox() {
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const leads = useQuery(api.leads.list, filter === "all" ? {} : { status: filter });
  const update = useMutation(api.leads.updateStatus);
  const addNote = useMutation(api.leads.addNote);
  const [open, setOpen] = useState<Id<"leadSubmissions"> | null>(null);
  const [note, setNote] = useState("");
  const [actionError, setActionError] = useState("");
  const notes = useQuery(api.leads.listNotes, open ? { leadId: open } : "skip");
  async function saveLead(leadId: Id<"leadSubmissions">, nextStatus: LeadStatus, assignedTo?: string) {
    setActionError("");
    try { await update({ leadId, status: nextStatus, assignedTo }); }
    catch { setActionError("That lead update could not be saved. Try again."); }
  }
  async function saveNote(leadId: Id<"leadSubmissions">) {
    const body = note.trim();
    if (!body) { setActionError("Notes cannot be empty."); return; }
    setActionError("");
    try { await addNote({ leadId, body }); setNote(""); }
    catch { setActionError("That note could not be saved. Try again."); }
  }
  if (leads === undefined) return <section className="border border-black bg-white p-6 text-sm text-black/55">Loading leads…</section>;
  return <section className="border border-black bg-white"><div className="flex flex-wrap gap-2 border-b border-black p-4">{["all", ...statuses].map(value => <button type="button" key={value} onClick={() => setFilter(value as "all" | LeadStatus)} className={`border border-black px-3 py-2 font-mono text-[9px] uppercase ${filter === value ? "bg-black text-white" : ""}`}>{value}</button>)}</div>{actionError ? <p role="alert" className="border-b border-black bg-[#f4d44d] p-4 text-xs">{actionError}</p> : null}<div>{leads.map(lead => <article key={lead._id} className="border-b border-black/15 p-5 last:border-0"><div className="grid gap-5 md:grid-cols-[1fr_190px]"><div><div className="flex flex-wrap gap-3"><h2 className="font-mono text-sm">{lead.name}</h2><a className="text-sm underline" href={`mailto:${lead.email}`}>{lead.email}</a></div><dl className="mt-4 grid gap-x-5 gap-y-2 text-[10px] text-black/60 sm:grid-cols-2"><div><dt className="font-mono uppercase">Company</dt><dd>{lead.company || "—"}</dd></div><div><dt className="font-mono uppercase">Intent</dt><dd>{lead.intent}</dd></div><div><dt className="font-mono uppercase">Stack</dt><dd>{lead.stack || "—"}</dd></div><div><dt className="font-mono uppercase">Source / campaign</dt><dd>{lead.sourcePath}{lead.campaign ? ` · ${lead.campaign}` : ""}</dd></div><div><dt className="font-mono uppercase">Created</dt><dd>{new Date(lead.createdAt).toLocaleString()}</dd></div><div><dt className="font-mono uppercase">Owner</dt><dd>{lead.assignedTo || "Unassigned"}</dd></div></dl><p className="mt-4 whitespace-pre-wrap text-sm leading-6">{lead.message || "No message provided."}</p></div><div className="flex flex-col gap-2"><select aria-label={`Status for ${lead.name}`} value={lead.status} onChange={event => void saveLead(lead._id, event.target.value as LeadStatus, lead.assignedTo)} className="h-10 border border-black px-2 font-mono text-[9px] uppercase">{statuses.map(status => <option key={status}>{status}</option>)}</select><input defaultValue={lead.assignedTo || ""} placeholder="Assign owner" aria-label={`Owner for ${lead.name}`} onBlur={event => void saveLead(lead._id, lead.status, event.target.value)} className="h-10 border border-black px-2 text-xs"/></div></div><button type="button" onClick={() => setOpen(open === lead._id ? null : lead._id)} className="mt-4 font-mono text-[9px] uppercase underline">{open === lead._id ? "Hide notes" : "Notes"}</button>{open === lead._id ? <div className="mt-3 max-w-xl">{notes?.map(item => <p key={item._id} className="mb-2 whitespace-pre-wrap text-xs"><span className="font-mono text-[9px] uppercase">{item.author}</span><br/>{item.body}</p>)}{notes && notes.length === 0 ? <p className="text-xs text-black/55">No internal notes yet.</p> : null}<div className="mt-3 flex gap-2"><input value={note} onChange={event => setNote(event.target.value)} placeholder="Internal note" className="h-10 min-w-0 flex-1 border border-black/25 px-3 text-sm"/><button type="button" onClick={() => void saveNote(lead._id)} className="h-10 bg-black px-3 font-mono text-[9px] uppercase text-white">Save</button></div></div> : null}</article>)}{leads.length === 0 ? <p className="p-6 text-sm text-black/55">No leads in this view.</p> : null}</div></section>;
}
