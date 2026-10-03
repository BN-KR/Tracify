"use client";

import Link from "next/link";
import { Component, type ReactNode } from "react";

type Tone = "loading" | "empty" | "error" | "permission";

const labels: Record<Tone, string> = { loading: "Loading", empty: "Nothing here yet", error: "Something went wrong", permission: "Access required" };

/** Turns thrown Convex/auth errors into a message and flags permission failures. */
export function explainError(error: unknown, fallback: string): { message: string; permission: boolean } {
  const raw = error instanceof Error ? error.message : "";
  const permission = /unauthori[sz]ed|forbidden|not authenticated|permission|access denied|not a member|requires .*role/i.test(raw);
  if (permission) return { message: "You don't have permission to do this in this project. Ask a project owner or admin for access.", permission };
  // Convex wraps server errors in "[Request ID: …] Server Error"; hide that noise.
  const cleaned = raw.replace(/\[CONVEX [^\]]*\]\s*/g, "").replace(/\[Request ID: [^\]]*\]\s*/g, "").replace(/^Server Error\s*/i, "").replace(/Called by client\s*$/i, "").trim();
  return { message: cleaned && cleaned !== "Uncaught Error:" ? cleaned : fallback, permission };
}

export function EvalStatePanel({ tone, title, children, action }: { tone: Tone; title?: string; children?: ReactNode; action?: { href: string; label: string } }) {
  return <div role={tone === "error" || tone === "permission" ? "alert" : "status"} aria-live="polite" className="border border-black/15 bg-white p-5">
    <p className="font-mono text-[10px] uppercase tracking-widest text-black/55">{labels[tone]}</p>
    {title ? <h2 className="mt-2 text-lg text-black">{title}</h2> : null}
    {children ? <div className="mt-2 text-sm leading-6 text-black/60">{children}</div> : null}
    {tone === "loading" ? <div aria-hidden className="mt-4 space-y-2"><div className="h-3 w-2/3 animate-pulse bg-black/10" /><div className="h-3 w-1/2 animate-pulse bg-black/10" /></div> : null}
    {action ? <Link href={action.href} className="mt-4 inline-block border border-black/25 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-black/70 hover:border-black">{action.label}</Link> : null}
  </div>;
}

export function NoProjectState() {
  return <EvalStatePanel tone="empty" title="Choose a project first" action={{ href: "/dashboard", label: "Open projects" }}>Evaluation data belongs to a project. Pick one to see its evaluators, datasets, runs, and reviews.</EvalStatePanel>;
}

/** Catches errors thrown by Convex queries (e.g. no access to the project) during render. */
export class EvalErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    const { message, permission } = explainError(this.state.error, "This page could not load its data.");
    return <EvalStatePanel tone={permission ? "permission" : "error"} title={permission ? "You can't view this project's evaluation data" : "Evaluation data could not load"} action={{ href: "/dashboard", label: "Back to projects" }}>
      {message}
      <button type="button" onClick={() => this.setState({ error: null })} className="ml-3 underline underline-offset-4">Try again</button>
    </EvalStatePanel>;
  }
}
