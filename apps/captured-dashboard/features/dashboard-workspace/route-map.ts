import type { WorkspaceSurface } from "./contracts";

export const SURFACE_LABELS: Record<WorkspaceSurface, string> = {
  home: "Home",
  dashboards: "Dashboards",
  costs: "Costs",
  tracing: "Tracing",
  sessions: "Sessions",
  users: "Users",
  alerts: "Alerts",
  prompts: "Prompts",
  playground: "Playground",
  scores: "Scores",
  evaluators: "Evaluators",
  "annotation-queues": "Annotation Queues",
  datasets: "Datasets",
  experiments: "Experiments",
  settings: "Settings",
};

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

export type PlaygroundNavGroup = { label: string; surfaces: WorkspaceSurface[] };

// The sidebar and the command palette render from this single map, so every
// surface in the route map is reachable without drifting navigation copy.
export const PLAYGROUND_NAV_GROUPS: PlaygroundNavGroup[] = [
  { label: "", surfaces: ["home", "dashboards"] },
  { label: "Observability", surfaces: ["tracing", "sessions", "users", "alerts"] },
  { label: "Prompt Management", surfaces: ["prompts", "playground"] },
  { label: "Evaluation", surfaces: ["scores", "evaluators", "annotation-queues", "datasets", "experiments"] },
  { label: "", surfaces: ["settings"] },
];

export const PLAYGROUND_SUPPORT_LINKS: Array<[label: string, href: string]> = [
  ["Book a call", "mailto:support@tracify.tech?subject=Book%20a%20call"],
  ["Support", "mailto:support@tracify.tech"],
];

// Surfaces that expose an interactive create view (?view=create) backed by the
// sandbox reducer instead of only showing the boundary dialog.
export const CREATE_CAPABLE_SURFACES: WorkspaceSurface[] = ["dashboards", "alerts", "prompts", "evaluators", "datasets"];

export type ResolvedPlaygroundRoute = { surface: WorkspaceSurface; recordId?: string };

export function normalizePlaygroundSegment(segment: string): WorkspaceSurface | null {
  const normalized = segment.toLowerCase();
  if (normalized in PLAYGROUND_SURFACE_ALIASES) return PLAYGROUND_SURFACE_ALIASES[normalized];
  return (PLAYGROUND_SURFACES as string[]).includes(normalized) ? (normalized as WorkspaceSurface) : null;
}

export function isKnownPlaygroundRoute(segment: string) {
  return normalizePlaygroundSegment(segment) !== null;
}

// Canonical route resolution for the renderer: the first segment chooses the
// surface (aliases included), the second optional segment addresses a record.
export function resolvePlaygroundRoute(segments: string[]): ResolvedPlaygroundRoute {
  if (!segments[0]) return { surface: "home" };
  return { surface: normalizePlaygroundSegment(segments[0]) ?? "home", recordId: segments[1] };
}

export function playgroundPath(basePath: string, surface: WorkspaceSurface, recordId?: string) {
  const root = surface === "home" ? basePath : `${basePath}/${surface}`;
  return recordId ? `${root}/${encodeURIComponent(recordId)}` : root;
}

export function createViewPath(basePath: string, surface: WorkspaceSurface) {
  return `${playgroundPath(basePath, surface)}?view=create`;
}

export function isCreateCapableSurface(surface: WorkspaceSurface) {
  return CREATE_CAPABLE_SURFACES.includes(surface);
}

// Singular create-action labels stay stable for live-route handoff and for the
// sandbox boundary dialog copy.
export function createActionLabel(surface: WorkspaceSurface) {
  if (surface === "alerts") return "alert";
  if (surface === "dashboards" || surface === "prompts" || surface === "evaluators" || surface === "datasets") return SURFACE_LABELS[surface];
  return SURFACE_LABELS[surface];
}
