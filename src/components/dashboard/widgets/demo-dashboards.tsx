"use client";

import { DashboardsBoard } from "./dashboards-board";
import { useDemoBoards } from "./board-store";

/** The sample project's dashboards: the real board page over local state, so visitors can rearrange it freely. */
export function DemoDashboards({ projectId, basePath }: { projectId: string; basePath: string }) {
  const store = useDemoBoards();
  return <DashboardsBoard projectId={projectId} store={store} basePath={basePath} demo />;
}
