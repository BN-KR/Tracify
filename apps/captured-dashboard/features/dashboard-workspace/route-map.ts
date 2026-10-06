import type { WorkspaceSurface } from "./contracts";

export const PLAYGROUND_SURFACE_ALIASES: Record<string, WorkspaceSurface> = {
  dashboard: "home", overview: "home", "custom-dashboards": "dashboards", "custom-dashboard": "dashboards",
  traces: "tracing", runs: "tracing", journey: "tracing", investigate: "tracing", evals: "evaluators", evaluation: "evaluators",
  "evaluation-runs": "experiments", "evaluation-settings": "settings", "human-annotation": "annotation-queues",
  annotation: "annotation-queues", "annotation-queue": "annotation-queues", "annotation-queues": "annotation-queues",
  "prompt-management": "prompts", "prompt-playground": "playground", compare: "tracing", comparison: "tracing", search: "tracing",
  billing: "costs", cost: "costs", reports: "dashboards", quickstart: "dashboards", docs: "dashboards", manage: "settings",
  control: "settings", resilience: "settings", widgets: "dashboards", automations: "settings", integrations: "settings",
  "api-keys": "settings", members: "settings", notifications: "settings", exports: "settings", "audit-logs": "settings",
  "llm-connections": "settings", "model-definitions": "settings", "score-configuration": "settings", "mcp-cli": "settings",
  "prompt-versions": "prompts", versions: "prompts", score: "scores", evaluator: "evaluators", dataset: "datasets", experiment: "experiments",
};

export const PLAYGROUND_SURFACES: WorkspaceSurface[] = [
  "home", "dashboards", "costs", "tracing", "sessions", "users", "alerts", "prompts", "playground", "scores", "evaluators",
  "annotation-queues", "datasets", "experiments", "settings",
];

export function isKnownPlaygroundRoute(segment: string) {
  const normalized = segment.toLowerCase();
  return normalized in PLAYGROUND_SURFACE_ALIASES || PLAYGROUND_SURFACES.includes(normalized as WorkspaceSurface);
}
