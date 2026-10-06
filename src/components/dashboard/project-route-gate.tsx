"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { ConvexAuthState } from "@/components/auth/convex-auth-state";
import { useConvexAuthReadiness } from "@/hooks/use-convex-auth-readiness";
import { LiveWorkspaceIdentityContext } from "@/features/dashboard-workspace/live-workspace-context";
import { authClient } from "@/lib/auth-client";

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
  const { data: betterAuthSession, isPending: betterAuthPending } = authClient.useSession();
  const isAuthenticated = auth.isAuthenticated;
  const routeState = useQuery(
    api.projects.getProjectRouteState,
    isAuthenticated ? { projectId } : "skip",
  );
  const project = useQuery(
    api.projects.getProject,
    isAuthenticated ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  useEffect(() => {
    if (betterAuthPending) return;
    if (!betterAuthSession?.user) {
      const returnPath = `${window.location.pathname}${window.location.search}`;
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`);
      return;
    }
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
  }, [auth.status, betterAuthPending, betterAuthSession?.user, isAuthenticated, routeState, router]);

  if (auth.status === "error") {
    const returnPath =
      typeof window === "undefined"
        ? `/dashboard/${projectId}`
        : `${window.location.pathname}${window.location.search}`;
    return <ConvexAuthState mode="error" redirectPath={returnPath} />;
  }

  // Convex can briefly report an unauthenticated route state while Better Auth
  // has already established the browser session. Keep the route in the
  // readiness state until the Convex exchange catches up instead of rendering
  // protected children or starting a second sign-in redirect.
  if (betterAuthPending || !betterAuthSession?.user || auth.status === "loading" || !isAuthenticated || routeState === undefined || routeState.status === "unauthenticated") {
    return (
      <div className="px-6 py-6 font-mono text-sm text-black/55">
        Loading project...
      </div>
    );
  }

  if (routeState.status === "no_projects") {
    return (
      <RouteStatePanel
        title="No project selected"
        description="Create a project before opening project-specific settings, traces, or reports."
        actionLabel="Open dashboard home"
        actionHref="/dashboard"
      />
    );
  }

  if (routeState.status === "not_found") {
    return (
      <RouteStatePanel
        title="Project not found"
        description="This project may have been removed or you may not have access to it."
        actionLabel="Return to dashboard"
        actionHref="/dashboard"
      />
    );
  }

  return project ? (
    <LiveWorkspaceIdentityContext.Provider value={{ id: projectId, name: project.name, organizationName: "Workspace" }}>
      {children}
    </LiveWorkspaceIdentityContext.Provider>
  ) : <>{children}</>;
}

function RouteStatePanel({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="px-6 py-6">
      <div className="max-w-xl border border-black/15 bg-white p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/45">
          Dashboard state
        </p>
        <h1 className="mt-3 font-mono text-xl uppercase tracking-tight text-black">
          {title}
        </h1>
        <p className="mt-3 font-sans text-sm leading-6 text-black/60">
          {description}
        </p>
        <a
          href={actionHref}
          className="mt-6 inline-flex border border-black bg-black px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
}
