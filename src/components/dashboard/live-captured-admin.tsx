"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { sandboxWorkspace } from "@/features/dashboard-workspace/sandbox-data";

export function LiveCapturedAdmin({ projectId, section }: { projectId: string; section: "alerts" | "settings" }) {
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const alerts = useQuery(api.alerts.listByProject, section === "alerts" && projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  if (project === undefined || project === null || (section === "alerts" && alerts === undefined)) return <div className="captured-build-loading">Loading {section}…</div>;
  const alertRecords = (alerts ?? []).map((alert) => ({ id: alert._id, name: alert.message, status: alert.state ?? "active", environment: "all", timestamp: new Date(alert.triggeredAt).toLocaleString(), model: alert.type }));
  const workspace = { ...sandboxWorkspace, mode: "live" as const, readOnly: false, dataSource: "tracify-live" as const, project: { id: projectId, name: project.name, organizationName: "Workspace" }, collections: { ...sandboxWorkspace.collections, alerts: { description: "Review active failures and operational signals.", records: alertRecords } } };
  return <CapturedWorkspace workspace={workspace} segments={[section]} />;
}
