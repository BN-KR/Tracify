"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { AddScore, Sheet } from "./score-drawer";

/** "Score this run": opens the shared score box with the run already filled in, so nobody pastes a trace id. */
export function ScoreRunButton({ projectId, traceId, className }: { projectId: string; traceId: string; className: string }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const createScore = useMutation(api.evaluation.createScore);
  return (
    <>
      <button type="button" onClick={() => { setSaved(false); setOpen(true); }} className={className}>{saved ? "Scored ✓" : "Score this run"}</button>
      {open ? (
        <Sheet label="Score this run" onClose={() => setOpen(false)}>
          <AddScore
            projectId={projectId}
            presetTraceId={traceId}
            onClose={() => setOpen(false)}
            onSave={async (input) => { await createScore({ projectId: projectId as Id<"projects">, ...input }); setSaved(true); setOpen(false); }}
          />
        </Sheet>
      ) : null}
    </>
  );
}
