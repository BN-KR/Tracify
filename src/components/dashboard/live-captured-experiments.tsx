"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedLoadState } from "./live-captured-home";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export function LiveCapturedExperiments({ projectId }: { projectId: string }) {
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const experiments = useQuery(api.experiments.list, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  if (project === null) return <CapturedLoadState missing />;
  if (project === undefined || experiments === undefined) return <CapturedLoadState label="Loading experiments…" />;
  const records = experiments.map((experiment) => ({ id: experiment._id, name: experiment.name, status: experiment.status, environment: "all", timestamp: new Date(experiment.createdAt).toLocaleDateString(), latency: experiment.avgLatencyMs === null ? undefined : `${experiment.avgLatencyMs.toFixed(0)}ms`, cost: `$${experiment.totalCostUsd.toFixed(5)}`, model: experiment.model ?? "default", score: experiment.avgScore === null ? undefined : experiment.avgScore.toFixed(2) }));
  const workspace = createLiveWorkspace({ id: projectId, name: project.name, organizationName: "Workspace" }, { collections: { experiments: { description: "Compare prompts, models, quality, cost, and latency across controlled runs.", records } } });
  return <CapturedWorkspace workspace={workspace} segments={["experiments"]} />;
}
