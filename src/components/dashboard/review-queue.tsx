"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function ReviewQueue({ projectId }: { projectId: string }) {
  const annotations = useQuery(api.annotations.list, { projectId: projectId as never });
  const reviews = useQuery(api.annotations.listReviewsForProject, { projectId: projectId as never });
  const agreement = useQuery(api.annotations.agreement, { projectId: projectId as never });
  const create = useMutation(api.annotations.create);
  const update = useMutation(api.annotations.update);
  const assignNext = useMutation(api.annotations.assignNext);
  const claim = useMutation(api.annotations.claim);
  const submitReview = useMutation(api.annotations.submitReview);
  const { memberships } = useOrganization({ memberships: { pageSize: 50, keepPreviousData: true } });
  const [traceId, setTraceId] = useState("");
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewLabel, setReviewLabel] = useState("");
  const [reviewScore, setReviewScore] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  const count = (status: "queued" | "in_review" | "completed") => annotations?.filter((annotation) => annotation.status === status).length ?? 0;
  async function add() {
    try { await create({ projectId: projectId as never, traceId, label, notes }); setTraceId(""); setNotes(""); setMessage("Trace queued for review."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not queue trace."); }
  }
  async function assign(strategy: "round_robin" | "least_loaded") {
    const reviewerIds = memberships?.data?.map((membership) => membership.publicUserData?.userId).filter((id): id is string => Boolean(id)) ?? [];
    try { const result = await assignNext({ projectId: projectId as never, reviewerIds, strategy }); setMessage(result ? `Assigned ${result.annotationId} to ${result.assignee}.` : "No queued traces to assign."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not assign review work."); }
  }
  async function submit(annotationId: string) {
    try { await submitReview({ projectId: projectId as never, annotationId: annotationId as never, label: reviewLabel, score: reviewScore ? Number(reviewScore) : undefined, notes: reviewNotes }); setReviewing(null); setReviewLabel(""); setReviewScore(""); setReviewNotes(""); setMessage("Independent review submitted."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit review."); }
  }

  return <div className="space-y-6">
    <section className="border border-zinc-800 bg-zinc-950/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Annotation queue</p><h2 className="mt-2 text-xl text-white">Review production traces</h2><p className="mt-2 text-xs text-zinc-500">Assign work by rotation, claim an item, and capture independent labels for agreement analysis.</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => void assign("round_robin")} disabled={!memberships?.data?.length}>Round-robin</Button><Button size="sm" variant="outline" onClick={() => void assign("least_loaded")} disabled={!memberships?.data?.length}>Least-loaded</Button></div></div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_2fr_auto]"><Input value={traceId} onChange={(event) => setTraceId(event.target.value)} placeholder="Trace ID" /><Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Label" /><Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Review notes" /><Button onClick={add} disabled={!traceId.trim()}>Queue</Button></div>
    </section>
    {message ? <p className="border border-zinc-800 p-3 text-xs text-zinc-400">{message}</p> : null}
    <section className="grid gap-3 md:grid-cols-4">{[["Queued", count("queued")], ["In review", count("in_review")], ["Completed", count("completed")], ["Agreement", agreement?.agreement === null || agreement?.agreement === undefined ? "—" : `${Math.round(agreement.agreement * 100)}%`]].map(([labelValue, value]) => <div key={String(labelValue)} className="border border-zinc-800 p-3"><p className="font-mono text-[10px] uppercase text-zinc-500">{labelValue}</p><p className="mt-2 font-mono text-lg text-white">{value}</p></div>)}</section>
    <section className="space-y-2">{annotations?.map((annotation) => { const annotationReviews = reviews?.filter((review) => review.annotationId === annotation._id) ?? []; return <div key={annotation._id} className="border border-zinc-800 bg-zinc-950/60 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><Link href={`/dashboard/${projectId}/runs/${annotation.traceId}`} className="font-mono text-sm text-white underline decoration-zinc-700 underline-offset-4 hover:decoration-white">{annotation.traceId}</Link><span className="ml-3 font-mono text-[10px] uppercase text-zinc-500">{annotation.status}</span>{annotation.assignee ? <span className="ml-3 font-mono text-[10px] uppercase text-zinc-600">assigned:{annotation.assignee}</span> : null}</div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={async () => { await claim({ projectId: projectId as never, annotationId: annotation._id }); setReviewing(annotation._id); setMessage("Review claimed. Add an independent label or score."); }}>Claim</Button>{annotation.status === "queued" ? <Button size="sm" variant="outline" onClick={() => void update({ projectId: projectId as never, annotationId: annotation._id, status: "in_review" })}>Start</Button> : null}</div></div><p className="mt-2 text-sm text-zinc-400">{annotation.notes || "No notes yet."}</p>{annotationReviews.length ? <div className="mt-3 space-y-1 border-t border-zinc-800 pt-3">{annotationReviews.map((review) => <p key={review._id} className="font-mono text-[10px] text-zinc-500">{review.reviewerName} · {review.status}{review.label ? ` · ${review.label}` : ""}{review.score === undefined ? "" : ` · ${review.score.toFixed(2)}`}</p>)}</div> : null}{reviewing === annotation._id ? <div className="mt-4 grid gap-2 border-t border-zinc-800 pt-3 md:grid-cols-[1fr_120px_2fr_auto]"><Input value={reviewLabel} onChange={(event) => setReviewLabel(event.target.value)} placeholder="Your label" /><Input value={reviewScore} onChange={(event) => setReviewScore(event.target.value)} placeholder="Score 0–1" type="number" min="0" max="1" step="0.01" /><Input value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} placeholder="Independent notes" /><Button onClick={() => void submit(annotation._id)}>Submit</Button></div> : null}</div>; })}</section>
  </div>;
}
