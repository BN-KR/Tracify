"use client";

import { useQuery } from "convex/react";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardStartState } from "@/components/dashboard/dashboard-start-state";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export function ProjectDashboardContent({ projectId }: { projectId: string }) {
  const firstRun = useQuery(api.agentRuns.getFirstRunForProject, {
    projectId: projectId as Id<"projects">,
  });

  if (firstRun === undefined) {
    return (
      <div className="font-mono text-sm text-black/55">
        Loading project activity...
      </div>
    );
  }

  return firstRun ? (
    <DashboardOverview projectId={projectId} />
  ) : (
    <DashboardStartState projectId={projectId} />
  );
}
