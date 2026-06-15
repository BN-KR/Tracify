"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Ban } from "lucide-react";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CancelRunButton({
  projectId,
  runId,
  compact = false,
}: {
  projectId: string;
  runId: string;
  compact?: boolean;
}) {
  const cancelRun = useMutation(api.agentRuns.cancelRun);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!confirming) {
      setConfirming(true);
      window.setTimeout(() => setConfirming(false), 4000);
      return;
    }

    setPending(true);
    try {
      await cancelRun({
        projectId: projectId as Id<"projects">,
        runId,
      });
      setConfirming(false);
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size={compact ? "icon-xs" : "sm"}
      onClick={handleClick}
      disabled={pending}
      title={
        confirming
          ? "Confirm stop run"
          : "Mark this running trace as cancelled"
      }
      className={cn(
        "uppercase",
        compact && "opacity-0 group-hover:opacity-100",
        confirming && "bg-[#EF4444] text-black hover:bg-[#EF4444]",
      )}
    >
      {compact ? (
        <Ban className="size-3" />
      ) : pending ? (
        "Stopping..."
      ) : confirming ? (
        "Confirm stop"
      ) : (
        "Stop run"
      )}
    </Button>
  );
}
