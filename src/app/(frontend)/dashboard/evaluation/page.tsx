"use client";

import Link from "next/link";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "convex/_generated/api";
import { ConvexAuthState } from "@/components/auth/convex-auth-state";
import { DashboardStartState } from "@/components/dashboard/dashboard-start-state";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { EvaluationEngineDashboard } from "@/components/dashboard/evaluation-engine-dashboard";
import { useConvexAuthReadiness } from "@/hooks/use-convex-auth-readiness";
import { authClient } from "@/lib/auth-client";
import { getTracifyRegion } from "@/lib/regions";

/** Shared with the dashboard home router so the organization evaluation view opens the same project. */
const LAST_PROJECT_STORAGE_KEY = "tracify.lastProjectId";
const LAST_PROJECT_EVENT = "tracify:last-project-changed";

function subscribeLastProject(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LAST_PROJECT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LAST_PROJECT_EVENT, callback);
  };
}

function readLastProject() {
  try {
    return window.localStorage.getItem(LAST_PROJECT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readLastProjectOnServer() {
  return null;
}

/**
 * Organization-scoped evaluation workspace.
 *
 * The evaluation engine is project-scoped in Convex, so this route resolves the
 * organization's projects for the authenticated user and renders the live
 * evaluation dashboard for the selected project instead of an empty project id.
 */
export default function OrganizationEvaluationPage() {
  const router = useRouter();
  const auth = useConvexAuthReadiness();
  const { data: organization } = authClient.useActiveOrganization();
  const region = getTracifyRegion();
  const projects = useQuery(
    api.projects.getProjectsByUserOrOrg,
    auth.isAuthenticated ? {} : "skip",
  );
  const storedProjectId = useSyncExternalStore(
    subscribeLastProject,
    readLastProject,
    readLastProjectOnServer,
  );

  useEffect(() => {
    if (auth.status === "unauthenticated") {
      router.replace(`/sign-in?redirect_url=${encodeURIComponent("/dashboard/evaluation")}`);
    }
  }, [auth.status, router]);

  const selectProject = useCallback((projectId: string) => {
    try {
      window.localStorage.setItem(LAST_PROJECT_STORAGE_KEY, projectId);
    } catch {
      // Storage can be unavailable in private browsing; selection still applies for this render.
    }
    window.dispatchEvent(new Event(LAST_PROJECT_EVENT));
  }, []);

  const selectedProject =
    projects?.find((project) => project._id === storedProjectId) ?? projects?.[0];

  const topbar = (
    <DashboardTopbar
      title="Evaluation Engine"
      description="Organization evaluation workspace for evaluators, regression suites, and quality monitors."
    />
  );

  if (auth.status === "error") {
    return <ConvexAuthState mode="error" redirectPath="/dashboard/evaluation" />;
  }

  if (auth.status === "unauthenticated") {
    return <ConvexAuthState mode="loading" />;
  }

  if (auth.status === "loading" || projects === undefined) {
    return (
      <div className="flex flex-col gap-6" data-glass-grid-page="evaluation" aria-busy="true">
        {topbar}
        <div className="px-4 pb-10 font-mono text-sm text-black/55 lg:px-6">
          {auth.status === "loading" ? "Preparing workspace access…" : "Loading organization projects…"}
        </div>
      </div>
    );
  }

  if (!projects.length || !selectedProject) {
    return (
      <div className="flex flex-col gap-6" data-glass-grid-page="evaluation">
        {topbar}
        <div className="px-4 pb-10 lg:px-6">
          <p className="mb-4 font-sans text-sm text-black/55">
            Evaluation runs against a project&apos;s traces and datasets. Create a project to start the quality loop.
          </p>
          <DashboardStartState />
        </div>
      </div>
    );
  }

  const projectId = selectedProject._id as string;

  return (
    <div className="flex flex-col gap-6" data-glass-grid-page="evaluation">
      {topbar}
      <div className="flex flex-col gap-6 px-4 pb-10 lg:px-6">
        <section
          aria-labelledby="org-evaluation-heading"
          className="grid gap-px border border-black/15 bg-black/10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
        >
          <div className="bg-white p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/55">
              {organization?.name || "Personal workspace"} · {region.flag} {region.shortName} cloud
            </p>
            <h1 id="org-evaluation-heading" className="mt-2 font-mono text-xl text-black">
              Evaluation
            </h1>
            <p className="mt-2 max-w-2xl font-sans text-sm leading-6 text-black/55">
              Scores, suites, and monitors are stored per project. Choose which project&apos;s live evaluation
              data to work with; the choice is remembered across the dashboard.
            </p>
          </div>
          <div className="flex flex-col justify-between gap-3 bg-[#f3f2ed] p-5">
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/55">Project</span>
              <select
                aria-label="Evaluation project"
                value={projectId}
                onChange={(event) => selectProject(event.target.value)}
                className="h-10 w-full border border-black/15 bg-white px-3 font-mono text-xs text-black outline-none focus-visible:border-black"
              >
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/${projectId}/evaluators`}
                onClick={() => selectProject(projectId)}
                className="inline-flex h-9 items-center border border-black bg-black px-3 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-black/80"
              >
                Open evaluators
              </Link>
              <Link
                href={`/dashboard/${projectId}`}
                onClick={() => selectProject(projectId)}
                className="inline-flex h-9 items-center border border-black/25 bg-white px-3 font-mono text-[10px] uppercase tracking-widest text-black/70 hover:border-black hover:text-black"
              >
                Project overview
              </Link>
            </div>
          </div>
        </section>
        {/* Keyed by project so form state resets when switching projects. */}
        <EvaluationEngineDashboard key={projectId} projectId={projectId} />
      </div>
    </div>
  );
}
