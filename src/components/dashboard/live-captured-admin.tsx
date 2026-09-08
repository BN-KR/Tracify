"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { sandboxWorkspace } from "@/features/dashboard-workspace/sandbox-data";

export function LiveCapturedAdmin({ projectId, section }: { projectId: string; section: "alerts" | "settings" }) {
  const createAlert = useMutation(api.alerts.create);
  const updateProject = useMutation(api.projects.updateProject);
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const alerts = useQuery(api.alerts.listByProject, section === "alerts" && projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  if (project === undefined || project === null || (section === "alerts" && alerts === undefined)) return <div className="captured-build-loading">Loading {section}…</div>;
  const alertRecords = (alerts ?? []).map((alert) => ({ id: alert._id, name: alert.message, status: alert.state ?? "active", environment: "all", timestamp: new Date(alert.triggeredAt).toLocaleString(), model: alert.type }));
  const workspace = { ...sandboxWorkspace, mode: "live" as const, readOnly: false, dataSource: "tracify-live" as const, project: { id: projectId, name: project.name, organizationName: "Workspace" }, collections: { ...sandboxWorkspace.collections, alerts: { description: "Review active failures and operational signals.", records: alertRecords } } };
  async function saveAlert(input: { name: string; metric: string; threshold: string }) {
    await createAlert({ projectId: projectId as Id<"projects">, runId: `manual:${input.name.trim()}`, type: input.metric, message: `${input.name.trim()} threshold: ${input.threshold}`, triggeredAt: new Date().toISOString(), state: "active" });
  }
  async function saveSettings(input: { name: string }) {
    await updateProject({ projectId: projectId as Id<"projects">, name: input.name });
  }
  return <CapturedWorkspace workspace={workspace} segments={[section]} onAlertCreate={section === "alerts" ? saveAlert : undefined} onProjectSettingsSave={section === "settings" ? saveSettings : undefined} />;
}
