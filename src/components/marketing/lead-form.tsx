"use client";
import { useState } from "react";

export function LeadForm({ intent = "contact" }: { intent?: string }) {
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">("idle");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("pending");
    const form = event.currentTarget; const data = Object.fromEntries(new FormData(form).entries());
    try { const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, intent, sourcePath: window.location.pathname }) }); if (!response.ok) throw new Error(); form.reset(); setState("success"); } catch { setState("error"); }
  }
  if (state === "success") return <div className="border border-black bg-[#f4d44d] p-6"><p className="font-mono text-[10px] uppercase tracking-widest">Request received</p><p className="mt-3 text-sm leading-6">Thanks—we usually reply within one business day.</p></div>;
  return <form onSubmit={submit} className="grid gap-4 border border-black bg-white p-6 md:grid-cols-2"><div className="md:col-span-2"><p className="font-mono text-[10px] uppercase tracking-widest">Start a conversation</p><p className="mt-2 text-sm text-black/60">Tell us enough to route your request to the right person.</p></div><label className="text-xs">Name<input required name="name" className="mt-2 h-11 w-full border border-black/25 px-3" /></label><label className="text-xs">Work email<input required type="email" name="email" className="mt-2 h-11 w-full border border-black/25 px-3" /></label><label className="text-xs">Company<input name="company" className="mt-2 h-11 w-full border border-black/25 px-3" /></label><label className="text-xs">Framework or stack<input name="stack" className="mt-2 h-11 w-full border border-black/25 px-3" /></label><label className="text-xs md:col-span-2">What can we help with?<textarea required name="message" rows={4} className="mt-2 w-full border border-black/25 p-3" /></label><input name="website" tabIndex={-1} autoComplete="off" className="hidden" /><button disabled={state === "pending"} className="h-12 bg-black px-5 font-mono text-[10px] uppercase text-white disabled:opacity-50 md:col-span-2">{state === "pending" ? "Sending…" : "Send request"}</button>{state === "error" ? <p role="alert" className="text-sm text-red-700 md:col-span-2">We couldn’t send that. Please try again.</p> : null}</form>;
}
