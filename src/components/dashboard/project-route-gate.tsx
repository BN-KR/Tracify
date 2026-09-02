"use client";

import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "convex/_generated/api";
import { NoProjectState } from "@/components/dashboard/no-project-state";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

const LAST_PROJECT_STORAGE_KEY = "tracify.lastProjectId";
const PROJECT_ID_STORAGE_KEY = "tracify.onboarding.projectId";

export function ProjectRouteGate({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const routeState = useQuery(
    api.projects.getProjectRouteState,
    isAuthenticated ? { projectId } : "skip",
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
      return;
    }

    if (!routeState) return;

    if (routeState.status === "ready" && routeState.projectId) {
      window.localStorage.setItem(LAST_PROJECT_STORAGE_KEY, routeState.projectId);
      window.sessionStorage.setItem(PROJECT_ID_STORAGE_KEY, routeState.projectId);
      return;
    }

    window.localStorage.removeItem(LAST_PROJECT_STORAGE_KEY);
    window.sessionStorage.removeItem(PROJECT_ID_STORAGE_KEY);
    return;
  }, [isAuthenticated, isLoading, routeState, router]);

  if (isLoading || !isAuthenticated || routeState === undefined) {
    return (
      <div className="px-6 py-6 font-mono text-sm text-black/55">
        Loading project...
      </div>
    );
  }

  if (routeState.status === "no_projects") {
    return <NoProjectSurface surface={projectId} />;
  }

  if (routeState.status !== "ready") {
    return <NoProjectState title="Project unavailable." description="This project does not exist or you do not have access to it. Choose another project or return to the dashboard." />;
  }

  return <>{children}</>;
}

function NoProjectSurface({ surface }: { surface: string }) {
  const pages: Record<string, { title: string; description: string; content: React.ReactNode }> = {
  };
  const page = pages[surface];
  if (!page) return <NoProjectState title="No project selected" description="This view is ready for read-only use. Select a project to load its data." />;
  return <div className="flex flex-col gap-6"><DashboardTopbar title={page.title} description={page.description} /><div className="px-6 pb-10">{page.content}</div></div>;
}
