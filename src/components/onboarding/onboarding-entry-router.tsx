"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PROJECT_ID_STORAGE_KEY = "5to1r.onboarding.projectId";
const LAST_PROJECT_STORAGE_KEY = "5to1r.lastProjectId";

export function OnboardingEntryRouter() {
  const router = useRouter();

  useEffect(() => {
    const projectId =
      window.sessionStorage.getItem(PROJECT_ID_STORAGE_KEY) ??
      window.localStorage.getItem(LAST_PROJECT_STORAGE_KEY) ??
      "";

    router.replace(projectId ? `/dashboard/${projectId}` : "/onboarding/project");
  }, [router]);

  return (
    <main className="min-h-svh bg-[#0A0A0A] px-4 py-8 font-mono text-[#CCCCCC]">
      <div className="mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-[720px] flex-col justify-center">
        <div className="mb-4 font-pixel text-lg text-white">5to1r</div>
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
