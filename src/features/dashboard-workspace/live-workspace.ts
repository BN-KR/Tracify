import type { DashboardWorkspace } from "./contracts";
import { sandboxWorkspace } from "./sandbox-data";

type LiveWorkspaceOverrides = Omit<Partial<DashboardWorkspace>, "project" | "mode" | "dataSource" | "metrics" | "collections"> & {
  project?: Partial<DashboardWorkspace["project"]>;
  metrics?: Partial<DashboardWorkspace["metrics"]>;
  collections?: Partial<DashboardWorkspace["collections"]>;
};

/**
 * Builds the presentation contract for an authenticated project without
 * allowing Sandbox mode or the Sandbox project identity to leak into it.
 * Surface adapters can provide the collections and metrics they actually
 * loaded; the remaining structural fields are safe presentation defaults.
 */
export function createLiveWorkspace(
  project: DashboardWorkspace["project"],
  overrides: LiveWorkspaceOverrides = {},
): DashboardWorkspace {
  return {
    ...sandboxWorkspace,
    ...overrides,
    metrics: { ...sandboxWorkspace.metrics, ...overrides.metrics },
    collections: { ...sandboxWorkspace.collections, ...overrides.collections },
    mode: "live",
    readOnly: false,
    dataSource: "tracify-live",
    project: {
      ...project,
      ...overrides.project,
    },
  };
}
