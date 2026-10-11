"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedLoadState } from "./live-captured-home";
import { PromptManagement } from "./prompt-management";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export function LiveCapturedPrompts({ projectId, initialPromptId }: { projectId: string; initialPromptId?: string }) {
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  if (project === null) return <CapturedLoadState missing />;
  if (project === undefined) return <CapturedLoadState label="Loading prompts…" />;
  const workspace = createLiveWorkspace({ id: projectId, name: project.name, organizationName: "Workspace" });
  return (
    <CapturedWorkspace workspace={workspace} segments={["prompts"]} childrenOnly>
      <PromptManagement projectId={projectId} initialPromptId={initialPromptId} />
    </CapturedWorkspace>
  );
}
