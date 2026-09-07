"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "convex/_generated/api";
import { ConvexAuthState } from "@/components/auth/convex-auth-state";
import { useConvexAuthReadiness } from "@/hooks/use-convex-auth-readiness";

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
  const auth = useConvexAuthReadiness();
  const isAuthenticated = auth.isAuthenticated;
  const routeState = useQuery(
    api.projects.getProjectRouteState,
    isAuthenticated ? { projectId } : "skip",
  );

  useEffect(() => {
    if (auth.status === "unauthenticated") {
      const returnPath = `${window.location.pathname}${window.location.search}`;
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`);
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
  }, [auth.status, isAuthenticated, routeState, router]);

  if (auth.status === "error") {
    return <ConvexAuthState mode="error" redirectPath={`/dashboard/${projectId}`} />;
  }

  if (auth.status === "loading" || !isAuthenticated || routeState === undefined) {
    return (
      <div className="px-6 py-6 font-mono text-sm text-black/55">
        Loading project...
      </div>
    );
  }

  if (routeState.status === "no_projects") {
    // A missing project is a valid read-only dashboard context. The route
    // components keep their normal page shell and render their own empty
    // states; only their write actions should be disabled.
    return <>{children}</>;
  }

  if (routeState.status !== "ready") {
    return <>{children}</>;
  }

  return <>{children}</>;
}
