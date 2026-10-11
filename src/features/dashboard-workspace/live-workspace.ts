import { getDeploymentRegion } from "@/lib/regions";
import type { DashboardWorkspace, WorkspaceCollection, WorkspaceProject } from "./contracts";
import { sandboxWorkspace } from "./sandbox-data";

type LiveWorkspaceOverrides = Omit<Partial<DashboardWorkspace>, "project" | "mode" | "dataSource" | "metrics" | "collections"> & {
  project?: Partial<WorkspaceProject>;
  metrics?: Partial<DashboardWorkspace["metrics"]>;
  collections?: Partial<DashboardWorkspace["collections"]>;
};

/**
 * Live surfaces share the captured presentation contract but never the
 * Sandbox fixtures. Collections start empty with their captured descriptions
 * so a live project only shows data its adapter actually loaded.
 */
const EMPTY_LIVE_COLLECTIONS = Object.fromEntries(
  Object.entries(sandboxWorkspace.collections).map(
    ([surface, collection]): [string, WorkspaceCollection] => [
      surface,
      { description: collection.description, records: [] },
    ],
  ),
) as DashboardWorkspace["collections"];

const EMPTY_LIVE_METRICS: DashboardWorkspace["metrics"] = {
  traces: 0,
  observations: 0,
  totalCost: 0,
  scores: 0,
};

/**
 * Builds the presentation contract for an authenticated project without
 * allowing Sandbox mode, the Sandbox project identity, or Sandbox fixtures to
 * leak into it. Surface adapters provide the collections and metrics they
 * actually loaded; every other field is an honest live default (empty data,
 * the deployment region, and the `tracify-live` data source).
 */
export function createLiveWorkspace(
  project: WorkspaceProject,
  overrides: LiveWorkspaceOverrides = {},
): DashboardWorkspace {
  return {
    mode: "live",
    readOnly: false,
    region: overrides.region ?? getDeploymentRegion(),
    dataSource: "tracify-live",
    project: { ...project, ...overrides.project },
    metrics: { ...EMPTY_LIVE_METRICS, ...overrides.metrics },
    environments: overrides.environments ?? ["all"],
    models: overrides.models ?? [],
    collections: { ...EMPTY_LIVE_COLLECTIONS, ...overrides.collections },
  };
}
