"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export type FeedbackState = {
  /** true = thumbs up, false = thumbs down, undefined = not rated. */
  value: (runId: string) => boolean | undefined;
  /** Tapping the active thumb again removes the score. */
  rate: (runId: string, next: boolean) => void;
  failed: string | null;
};

/** Reads the signed-in person's thumbs for the runs on the page and saves a tap at once, undoing it if saving fails. */
export function useFeedback(projectId: string, runIds: string[], enabled: boolean): FeedbackState {
  const saved = useQuery(api.evaluation.myFeedback, enabled && runIds.length ? { projectId: projectId as Id<"projects">, traceIds: runIds } : "skip");
  const save = useMutation(api.evaluation.setFeedback);
  const [pending, setPending] = useState<Record<string, boolean | null>>({});
  const [failed, setFailed] = useState<string | null>(null);

  const value = useCallback((runId: string) => {
    if (runId in pending) return pending[runId] ?? undefined;
    return saved?.[runId];
  }, [pending, saved]);

  const rate = useCallback((runId: string, next: boolean) => {
    const target = value(runId) === next ? null : next;
    setFailed(null);
    setPending((current) => ({ ...current, [runId]: target }));
    save({ projectId: projectId as Id<"projects">, traceId: runId, value: target })
      .catch(() => setFailed("Could not save that rating. Try again."))
      .finally(() => setPending((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== runId))));
  }, [projectId, save, value]);

  return useMemo(() => ({ value, rate, failed }), [value, rate, failed]);
}

const Thumb = ({ down }: { down?: boolean }) => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" className={down ? "rotate-180" : ""}>
    <path d="M5 7.2 8 1.8c1 0 1.8.8 1.8 1.8v2.6h3.4c.8 0 1.4.7 1.2 1.5l-.9 4.6c-.1.6-.6 1-1.2 1H5M5 7.2v6.4M5 7.2H2.6v6.4H5" />
  </svg>
);

export function FeedbackCell({ runId, feedback }: { runId: string; feedback: FeedbackState }) {
  const current = feedback.value(runId);
  const button = (next: boolean, label: string, active: string) => {
    const on = current === next;
    return (
      <button type="button" aria-pressed={on} aria-label={on ? `${label} (saved). Press again to undo` : label} title={on ? "Saved. Press again to undo" : label}
        onClick={(event) => { event.stopPropagation(); feedback.rate(runId, next); }}
        className={`flex size-6 items-center justify-center border transition-colors ${on ? active : "border-[#262C35] text-[#6B7380] hover:border-[#4A5260] hover:text-white"}`}>
        <Thumb down={!next} />
      </button>
    );
  };
  return (
    <span className="flex items-center gap-1" role="group" aria-label="Rate this run">
      {button(true, "Good run", "border-[#F4D44D] bg-[#F4D44D] text-[#0B0D10]")}
      {button(false, "Bad run", "border-[#E6E9EE] bg-[#E6E9EE] text-[#0B0D10]")}
    </span>
  );
}
