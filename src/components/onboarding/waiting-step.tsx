"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { OnboardingHeader } from "@/components/onboarding/onboarding-shell";
import { getOneTimeApiKey } from "@/lib/onboarding-client-state";

const PROJECT_ID_STORAGE_KEY = "5to1r.onboarding.projectId";
const PROJECT_NAME_STORAGE_KEY = "5to1r.onboarding.projectName";
const FALLBACK_PROJECT_NAME = "research-agent-prod";

export function WaitingStep() {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [projectId] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(PROJECT_ID_STORAGE_KEY) ?? "";
  });
  const [fallbackProjectName] = useState(() => {
    if (typeof window === "undefined") return FALLBACK_PROJECT_NAME;
    return (
      window.sessionStorage.getItem(PROJECT_NAME_STORAGE_KEY) ??
      FALLBACK_PROJECT_NAME
    );
  });
  const [apiKeyDisplay] = useState(() => {
    if (typeof window === "undefined") return "5t1r_sk_live_...";
    const apiKey = getOneTimeApiKey();
    return apiKey ? `5t1r_sk_live_...${apiKey.slice(-4)}` : "5t1r_sk_live_...";
  });
  const onboardingState = useQuery(
    api.agentRuns.getProjectOnboardingState,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!onboardingState?.hasReceivedFirstSpan || !onboardingState.firstRunId) {
      return;
    }
    router.push(
      `/onboarding/success?projectId=${onboardingState.projectId}&runId=${onboardingState.firstRunId}`,
    );
  }, [onboardingState, router]);

  const projectName = onboardingState?.projectName ?? fallbackProjectName;
  const keyDisplay =
    onboardingState?.apiKeyPrefix && onboardingState.apiKeyLast4
      ? `${onboardingState.apiKeyPrefix}...${onboardingState.apiKeyLast4}`
      : apiKeyDisplay;

  return (
    <div>
      <OnboardingHeader
        title="Waiting for your first span"
        description="Run your agent. Tracify is listening on your project."
      />
      <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-4">
        <div className="mb-4 flex items-center gap-2 text-[#F59E0B]">
          <span className="size-2 animate-mono-pulse bg-[#F59E0B]" />
          <span className="text-[13px]">listening</span>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-[#666666]">
              Project
            </dt>
            <dd className="mt-1 text-[#CCCCCC]">{projectName}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-[#666666]">
              API key
            </dt>
            <dd className="mt-1 text-[#CCCCCC]">{keyDisplay}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-[#666666]">
              Status
            </dt>
            <dd className="mt-1 text-[#F59E0B]">listening</dd>
          </div>
        </dl>
      </div>

      {!projectId ? (
        <div className="mt-5 border border-[#2A2A2A] bg-[#0A0A0A] p-4 font-sans text-sm leading-6 text-[#999999]">
          Project context is no longer available in this browser session. Create
          a project again to listen for first-span activation.
        </div>
      ) : null}

      {elapsed >= 30 ? (
        <Link
          href="/demo"
          className="mt-5 block text-sm text-[#999999] underline underline-offset-4 transition-colors hover:text-white"
        >
          Explore sample trace
        </Link>
      ) : null}
      {elapsed >= 60 ? (
        <details className="mt-5 border border-[#2A2A2A] bg-[#0A0A0A] p-4">
          <summary className="cursor-pointer text-sm text-[#CCCCCC]">
            Common issues
          </summary>
          <ul className="mt-4 space-y-2 font-sans text-sm text-[#999999]">
            <li>TRACIFY_API_KEY is not set</li>
            <li>API key copied incorrectly</li>
            <li>agent is not running</li>
            <li>outbound HTTPS blocked</li>
            <li>SDK version outdated</li>
          </ul>
        </details>
      ) : null}
      {elapsed >= 120 ? (
        <a
          href="mailto:support@tracify.tech"
          className="mt-5 inline-block text-sm text-[#999999] underline underline-offset-4 transition-colors hover:text-white"
        >
          Still stuck? Email support
        </a>
      ) : null}
    </div>
  );
}
