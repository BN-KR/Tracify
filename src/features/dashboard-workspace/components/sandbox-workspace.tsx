"use client";

import { useState } from "react";
import { CapturedWorkspace } from "./captured-workspace";
import { sandboxWorkspace } from "../sandbox-data";
import type { DashboardWorkspace, WorkspaceRecord } from "../contracts";

function freshWorkspace(): DashboardWorkspace {
  return structuredClone(sandboxWorkspace);
}

let currentSandboxWorkspace = freshWorkspace();

export function SandboxWorkspace({ segments = [] }: { segments?: string[] }) {
  const [workspace, setWorkspace] = useState<DashboardWorkspace>(() => currentSandboxWorkspace);

  function updateCollection(collection: keyof DashboardWorkspace["collections"], update: (records: WorkspaceRecord[]) => WorkspaceRecord[]) {
    setWorkspace((current) => {
      const next = { ...current, collections: { ...current.collections, [collection]: { ...current.collections[collection], records: update(current.collections[collection].records) } } };
      currentSandboxWorkspace = next;
      return next;
    });
  }

  async function prepend(collection: keyof DashboardWorkspace["collections"], record: WorkspaceRecord) {
    updateCollection(collection, (records) => [record, ...records]);
  }

  return <CapturedWorkspace
    workspace={workspace}
    segments={segments}
    onDashboardCreate={async ({ name }) => prepend("dashboards", { id: `dashboard-${Date.now()}`, name, status: "active", environment: "default", timestamp: "just now" })}
    onPromptSave={async ({ promptId, name, type, content }) => updateCollection("prompts", (records) => { const id = promptId ?? `prompt-${Date.now()}`; const next = { id, name, status: "draft", environment: type, timestamp: "just now", input: content }; return records.some((record) => record.id === id) ? records.map((record) => record.id === id ? { ...record, ...next } : record) : [next, ...records]; })}
    onEvaluatorCreate={async ({ name, type }) => prepend("evaluators", { id: `evaluator-${Date.now()}`, name, status: "active", environment: type, timestamp: "just now" })}
    onEvaluatorToggle={async ({ evaluatorId, active }) => updateCollection("evaluators", (records) => records.map((record) => record.id === evaluatorId ? { ...record, status: active ? "active" : "inactive" } : record))}
    onDatasetCreate={async ({ name, description }) => prepend("datasets", { id: `dataset-${Date.now()}`, name, status: "ready", environment: "default", timestamp: "just now", input: description })}
    onAlertCreate={async ({ name, metric, threshold }) => prepend("alerts", { id: `alert-${Date.now()}`, name, status: "active", environment: metric, timestamp: `threshold ${threshold}` })}
    onAlertStateChange={async ({ alertId, state }) => updateCollection("alerts", (records) => records.map((record) => record.id === alertId ? { ...record, status: state } : record))}
    onProjectSettingsSave={async ({ name }) => setWorkspace((current) => { const next = { ...current, project: { ...current.project, name } }; currentSandboxWorkspace = next; return next; })}
    onSessionAnnotate={async ({ sessionId }) => prepend("annotation-queues", { id: `annotation-${Date.now()}`, name: sessionId, status: "needs-review", environment: "default", timestamp: "just now", sessionId })}
    onSessionAddToDataset={async () => undefined}
    onAnnotationClaim={async () => { const next = workspace.collections["annotation-queues"].records[0]; if (next) updateCollection("annotation-queues", (records) => records.map((record) => record.id === next.id ? { ...record, status: "claimed" } : record)); return next?.id ?? null; }}
    onAnnotationReview={async ({ annotationId, label, score, notes }) => updateCollection("annotation-queues", (records) => records.map((record) => record.id === annotationId ? { ...record, status: label, score: score == null ? record.score : String(score), output: notes } : record))}
  />;
}
