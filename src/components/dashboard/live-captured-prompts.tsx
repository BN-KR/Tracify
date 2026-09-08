"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { sandboxWorkspace } from "@/features/dashboard-workspace/sandbox-data";

export function LiveCapturedPrompts({ projectId }: { projectId: string }) {
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const prompts = useQuery(api.prompts.list, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  if (project === undefined || project === null || prompts === undefined) return <div className="captured-build-loading">Loading Tracify prompts…</div>;
  const records = prompts.map((prompt) => {
    const version = prompt.versions[0];
    return { id: prompt._id, name: prompt.name, status: version?.labels.includes("production") ? "Production" : "Draft", environment: "all", timestamp: new Date(prompt.updatedAt).toLocaleDateString(), model: version?.model ?? "—", input: version?.content ?? "" };
  });
  const workspace = { ...sandboxWorkspace, mode: "live" as const, readOnly: false, dataSource: "tracify-live" as const, project: { id: projectId, name: project.name, organizationName: "Tracify workspace" }, collections: { ...sandboxWorkspace.collections, prompts: { description: "Version, test, and promote prompts used by your agents.", records } } };
  return <CapturedWorkspace workspace={workspace} segments={["prompts"]} />;
}
