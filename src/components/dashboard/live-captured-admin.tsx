"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedLoadState } from "./live-captured-home";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

export function LiveCapturedAdmin({ projectId, section }: { projectId: string; section: "alerts" | "settings" }) {
  const createAlert = useMutation(api.alerts.create);
  const updateProject = useMutation(api.projects.updateProject);
  const updateAlertState = useMutation(api.alerts.updateState);
  const project = useQuery(api.projects.getProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const alerts = useQuery(api.alerts.listByProject, section === "alerts" && projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  if (project === null) return <CapturedLoadState missing />;
  if (project === undefined || (section === "alerts" && alerts === undefined)) return <CapturedLoadState label="Loading {section}…" />;
  const alertRecords = (alerts ?? []).map((alert) => ({ id: alert._id, name: alert.message, status: alert.state ?? "active", environment: "all", timestamp: new Date(alert.triggeredAt).toLocaleString(), model: alert.type }));
  const workspace = createLiveWorkspace({ id: projectId, name: project.name, organizationName: "Workspace" }, { collections: { alerts: { description: "Review active failures and operational signals.", records: alertRecords } } });
  async function saveAlert(input: { name: string; metric: string; threshold: string }) {
    await createAlert({ projectId: projectId as Id<"projects">, runId: `manual:${input.name.trim()}`, type: input.metric, message: `${input.name.trim()} threshold: ${input.threshold}`, triggeredAt: new Date().toISOString(), state: "active" });
  }
  async function saveSettings(input: { name: string }) {
    await updateProject({ projectId: projectId as Id<"projects">, name: input.name });
  }
  async function changeAlertState(input: { alertId: string; state: "active" | "resolved" | "muted" }) {
    await updateAlertState({ alertId: input.alertId as Id<"alerts">, state: input.state });
  }
  return <CapturedWorkspace workspace={workspace} segments={[section]} onAlertCreate={section === "alerts" ? saveAlert : undefined} onAlertStateChange={section === "alerts" ? changeAlertState : undefined} onProjectSettingsSave={section === "settings" ? saveSettings : undefined} />;
}
