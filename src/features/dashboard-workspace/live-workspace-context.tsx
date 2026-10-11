"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { WorkspaceProject } from "./contracts";

export const LiveWorkspaceIdentityContext = createContext<WorkspaceProject | null>(null);

/**
 * Supplies the authenticated project identity to shared captured surfaces.
 *
 * The value is memoized on the primitive identity fields so route-group
 * siblings do not receive a fresh object on every render, and it always
 * normalizes to the minimal `WorkspaceProject` shape so a Sandbox identity can
 * never be passed through the live context by accident.
 */
export function LiveWorkspaceIdentityProvider({
  project,
  children,
}: {
  project: WorkspaceProject;
  children: ReactNode;
}) {
  const { id, name, organizationName } = project;
  const value = useMemo<WorkspaceProject>(() => ({ id, name, organizationName }), [id, name, organizationName]);
  return <LiveWorkspaceIdentityContext.Provider value={value}>{children}</LiveWorkspaceIdentityContext.Provider>;
}

export function useLiveWorkspaceIdentity() {
  return useContext(LiveWorkspaceIdentityContext);
}
