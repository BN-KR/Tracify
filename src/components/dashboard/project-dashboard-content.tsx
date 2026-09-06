"use client";

import { useQuery } from "convex/react";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { TracifyEmptyOverview } from "@/components/dashboard/tracify-empty-overview";
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
    <div className="flex flex-col gap-6">
      <DashboardTopbar title="Overview" />
      <div className="px-6 pb-10">
        <DashboardOverview projectId={projectId} />
      </div>
    </div>
  ) : <TracifyEmptyOverview projectId={projectId} liveData />;
}
