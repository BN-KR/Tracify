"use client";

import { createContext, useContext } from "react";
import type { DashboardWorkspace } from "./contracts";

export const LiveWorkspaceIdentityContext = createContext<DashboardWorkspace["project"] | null>(null);

export function useLiveWorkspaceIdentity() {
  return useContext(LiveWorkspaceIdentityContext);
}
