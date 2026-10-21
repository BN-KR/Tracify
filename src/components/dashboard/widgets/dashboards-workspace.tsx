"use client";

import { DashboardsBoard } from "./dashboards-board";
import { useConvexBoards } from "./board-store";

export function DashboardsWorkspace({ projectId, initialDashboard }: { projectId: string; initialDashboard?: string }) {
  const store = useConvexBoards(projectId);
  return <DashboardsBoard projectId={projectId} store={store} initialDashboard={initialDashboard} basePath={`/dashboard/${projectId}`} />;
}
