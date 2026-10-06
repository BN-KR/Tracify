"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedLoadState } from "./live-captured-home";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export function LiveCapturedDashboards({ projectId, dashboardId }: { projectId: string; dashboardId?: string }) {
  const createDashboard = useMutation(api.dashboards.create);
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const dashboards = useQuery(api.dashboards.list, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  if (project === null) return <CapturedLoadState missing />;
  if (project === undefined || dashboards === undefined) return <CapturedLoadState label="Loading dashboards…" />;
  const records = dashboards.map((dashboard) => ({ id: dashboard._id, name: dashboard.name, status: dashboard.isDefault ? "Default" : "Saved", environment: "all", timestamp: new Date(dashboard.updatedAt).toLocaleDateString(), model: `${dashboard.widgets.length} widgets` }));
  const workspace = createLiveWorkspace({ id: projectId, name: project.name, organizationName: "Workspace" }, { collections: { dashboards: { description: "Saved views for cost, quality, latency, and trace volume.", records } } });
  async function saveDashboard(input: { name: string }) {
    await createDashboard({ projectId: projectId as Id<"projects">, name: input.name });
  }
  return <CapturedWorkspace workspace={workspace} segments={dashboardId ? ["dashboards", dashboardId] : ["dashboards"]} onDashboardCreate={saveDashboard} />;
}
