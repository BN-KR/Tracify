"use client";

import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { DashboardStartState } from "@/components/dashboard/dashboard-start-state";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { api } from "convex/_generated/api";

const LAST_PROJECT_STORAGE_KEY = "tracify.lastProjectId";

export function DashboardHomeRouter() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const projects = useQuery(
    api.projects.getProjectsByUserOrOrg,
    isAuthenticated ? {} : "skip",
  );

  useEffect(() => {
    if (!projects?.length) return;

    const storedProjectId = window.localStorage.getItem(LAST_PROJECT_STORAGE_KEY);
    const project =
      projects.find((candidate) => candidate._id === storedProjectId) ??
      projects[0];

    window.localStorage.setItem(LAST_PROJECT_STORAGE_KEY, project._id);
    router.replace(`/dashboard/${project._id}`);
  }, [projects, router]);

  if (isLoading || (isAuthenticated && projects === undefined)) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardTopbar
          title="Dashboard"
          description="Checking workspace state."
        />
        <div className="px-6 pb-10 font-mono text-sm text-[#666666]">
          Loading projects...
        </div>
      </div>
    );
  }

  if (projects?.length) {
    return (
      <div className="px-6 py-6 font-mono text-sm text-[#666666]">
        Opening project...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardTopbar
        title="Dashboard"
        description="Create a project to start capturing agent traces."
      />
      <div className="px-6 pb-10">
        <DashboardStartState />
      </div>
    </div>
  );
}
