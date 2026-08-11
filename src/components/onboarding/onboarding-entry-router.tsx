"use client";

import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "convex/_generated/api";
import { BrandLogo } from "@/components/brand-logo";

const PROJECT_ID_STORAGE_KEY = "5to1r.onboarding.projectId";
const LAST_PROJECT_STORAGE_KEY = "5to1r.lastProjectId";

export function OnboardingEntryRouter() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const projects = useQuery(
    api.projects.getProjectsByUserOrOrg,
    isAuthenticated ? {} : "skip",
  );

  useEffect(() => {
    if (isLoading || (isAuthenticated && projects === undefined)) return;

    if (!isAuthenticated) {
      router.replace("/onboarding/project");
      return;
    }

    if (!projects) return;

    if (!projects.length) {
      window.sessionStorage.removeItem(PROJECT_ID_STORAGE_KEY);
      window.localStorage.removeItem(LAST_PROJECT_STORAGE_KEY);
      router.replace("/onboarding/project");
      return;
    }

    const storedProjectId =
      window.sessionStorage.getItem(PROJECT_ID_STORAGE_KEY) ??
      window.localStorage.getItem(LAST_PROJECT_STORAGE_KEY) ??
      "";
    const project =
      projects.find((candidate) => candidate._id === storedProjectId) ??
      projects[0];

    window.sessionStorage.setItem(PROJECT_ID_STORAGE_KEY, project._id);
    window.localStorage.setItem(LAST_PROJECT_STORAGE_KEY, project._id);
    router.replace(`/dashboard/${project._id}`);
  }, [isAuthenticated, isLoading, projects, router]);

  return (
    <main className="min-h-svh bg-[#0A0A0A] px-4 py-8 font-mono text-[#CCCCCC]">
      <div className="mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-[720px] flex-col justify-center">
        <div className="mb-4 text-white"><BrandLogo className="text-lg" highlighted={false} /></div>
        <section className="border border-[#2A2A2A] bg-[#111111] p-6 md:p-8">
          <div className="text-[11px] uppercase tracking-wide text-[#666666]">
            onboarding.route
          </div>
          <h1 className="mt-3 font-mono text-2xl normal-case tracking-normal text-white">
            Checking workspace state.
          </h1>
          <p className="mt-3 max-w-xl font-sans text-sm leading-6 text-[#999999]">
            You will only enter onboarding when a project still needs to be
            created.
          </p>
        </section>
      </div>
    </main>
  );
}
