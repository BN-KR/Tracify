"use client";

import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CapturedLoadState } from "@/components/dashboard/live-captured-home";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

function ProjectDashboardSurface({ projectId }: { projectId: string }) {
  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  if (project === null) return <CapturedLoadState missing />;
  if (project === undefined) return <CapturedLoadState label="Loading dashboard…" />;

  return <DashboardOverview projectId={projectId} />;
}

export function ProjectDashboardContent({ projectId }: { projectId: string }) {
  return (
    <section
      aria-label="Project overview"
      data-product-surface="project-overview"
      className="glass-grid-surface min-h-full w-full overflow-x-hidden"
    >
      <Suspense fallback={<CapturedLoadState label="Loading dashboard…" />}>
        <ProjectDashboardSurface projectId={projectId} />
      </Suspense>
    </section>
  );
}
