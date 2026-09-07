"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { DashboardStartState } from "@/components/dashboard/dashboard-start-state";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { api } from "convex/_generated/api";
import { ConvexAuthState } from "@/components/auth/convex-auth-state";
import { useConvexAuthReadiness } from "@/hooks/use-convex-auth-readiness";

const LAST_PROJECT_STORAGE_KEY = "tracify.lastProjectId";

export function DashboardHomeRouter() {
  const router = useRouter();
  const auth = useConvexAuthReadiness();
  const isAuthenticated = auth.isAuthenticated;
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

  if (auth.status === "error") {
    return <ConvexAuthState mode="error" redirectPath="/dashboard" />;
  }

  if (auth.status === "loading" || (isAuthenticated && projects === undefined)) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardTopbar
          title="Dashboard"
          description="Checking workspace state."
        />
        <div className="px-6 pb-10 font-mono text-sm text-black/55">
          {auth.status === "loading" ? "Preparing workspace access..." : "Loading projects..."}
        </div>
      </div>
    );
  }

  if (projects?.length) {
    return (
      <div className="px-6 py-6 font-mono text-sm text-black/55">
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
