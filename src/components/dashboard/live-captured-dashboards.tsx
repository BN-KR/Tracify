"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { sandboxWorkspace } from "@/features/dashboard-workspace/sandbox-data";

export function LiveCapturedDashboards({ projectId }: { projectId: string }) {
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const dashboards = useQuery(api.dashboards.list, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  if (project === undefined || project === null || dashboards === undefined) return <div className="captured-build-loading">Loading Tracify dashboards…</div>;
  const records = dashboards.map((dashboard) => ({ id: dashboard._id, name: dashboard.name, status: dashboard.isDefault ? "Default" : "Saved", environment: "all", timestamp: new Date(dashboard.updatedAt).toLocaleDateString(), model: `${dashboard.widgets.length} widgets` }));
  const workspace = { ...sandboxWorkspace, mode: "live" as const, readOnly: false, dataSource: "tracify-live" as const, project: { id: projectId, name: project.name, organizationName: "Tracify workspace" }, collections: { ...sandboxWorkspace.collections, dashboards: { description: "Saved captured-style views for cost, quality, latency, and trace volume.", records } } };
  return <CapturedWorkspace workspace={workspace} segments={["dashboards"]} />;
}
