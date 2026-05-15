"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardStartState } from "@/components/dashboard/dashboard-start-state";

const PROJECT_ID_STORAGE_KEY = "5to1r.onboarding.projectId";
const LAST_PROJECT_STORAGE_KEY = "5to1r.lastProjectId";

export function DashboardEntryRouter() {
  const router = useRouter();

  useEffect(() => {
    const projectId =
      window.sessionStorage.getItem(PROJECT_ID_STORAGE_KEY) ??
      window.localStorage.getItem(LAST_PROJECT_STORAGE_KEY) ??
      "";

    router.replace(projectId ? `/dashboard/${projectId}` : "/onboarding/project");
  }, [router]);

  return <DashboardStartState />;
}
