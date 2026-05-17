"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/ui/button";
import { getOnboardingHref } from "@/lib/onboarding-navigation";

import {
  hasOneTimeApiKey,
  subscribeToOneTimeApiKey,
} from "@/lib/onboarding-client-state";

const PROJECT_ID_STORAGE_KEY = "5to1r.onboarding.projectId";
const API_KEY_COPIED_STORAGE_KEY = "5to1r.onboarding.apiKeyCopied";

function getOnboardingSessionSnapshot() {
  const projectId = window.sessionStorage.getItem(PROJECT_ID_STORAGE_KEY) ?? "";
  const hasAvailableKey = hasOneTimeApiKey();
  const hasCopiedKey =
    window.sessionStorage.getItem(API_KEY_COPIED_STORAGE_KEY) === "true";

  return JSON.stringify({ projectId, hasAvailableKey, hasCopiedKey });
}

function getServerOnboardingSessionSnapshot() {
  return JSON.stringify({
    projectId: "",
    hasAvailableKey: false,
    hasCopiedKey: false,
  });
}

const quickstarts = {
  python: {
    label: "Python",
    code: `from fivetoone import trace_agent

@trace_agent()
async def research_agent(query):
    return await run(query)`,
  },
  typescript: {
    label: "TypeScript",
    code: `import { traceAgent } from "5to1r"

const researchAgent = traceAgent(async (query: string) => {
  return await run(query)
})`,
  },
};

type ChecklistStatus = "completed" | "current" | "pending";

export function DashboardStartState({ projectId }: { projectId?: string }) {
  const [tab, setTab] = useState<keyof typeof quickstarts>("python");
  const onboardingSessionSnapshot = useSyncExternalStore(
    subscribeToOneTimeApiKey,
    getOnboardingSessionSnapshot,
    getServerOnboardingSessionSnapshot,
  );
  const onboardingSession = JSON.parse(onboardingSessionSnapshot) as {
    projectId: string;
    hasAvailableKey: boolean;
    hasCopiedKey: boolean;
  };
  const active = quickstarts[tab];
  const effectiveProjectId = projectId ?? onboardingSession.projectId;
  const quickstartHref = getOnboardingHref(effectiveProjectId);
  const hasProject = Boolean(effectiveProjectId);
  const checklist = [
    { label: "Create project", status: hasProject ? "completed" : "current" },
    { label: "Copy API key", status: hasProject ? "pending" : "pending" },
    { label: "Install SDK", status: "pending" },
    { label: "Run your agent", status: "pending" },
    { label: "Open first trace", status: "pending" },
  ] satisfies Array<{ label: string; status: ChecklistStatus }>;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="border border-[#2A2A2A] bg-[#111111] p-5">
        <div className="mb-3 flex items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
          <div className="min-w-0">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-[#666666]">
              {hasProject ? "overview.empty_state" : "workspace.empty_state"}
            </div>
            <h1 className="font-mono text-2xl normal-case tracking-normal text-white">
              {hasProject ? "No spans received yet." : "Create your first project."}
            </h1>
          </div>
          <div className="hidden border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-[12px] text-[#F59E0B] sm:block">
            {hasProject ? "waiting for first span" : "no project"}
          </div>
        </div>
        <p className="max-w-2xl font-sans text-sm leading-6 text-[#999999]">
          {hasProject
            ? "Install the SDK and run your agent. Your first span will appear here in real time."
            : "Projects hold your API keys, agent runs, alerts, and trace history."}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="border border-[#2A2A2A] bg-[#111111] p-5">
          <div className="mb-5 flex items-center justify-between border-b border-[#2A2A2A] pb-4">
            <h2 className="font-mono text-[15px] text-white">Start here</h2>
            <span className="text-[11px] uppercase tracking-wide text-[#666666]">
              activation
            </span>
          </div>
          <ol className="space-y-3">
            {checklist.map((item, index) => (
              <li
                key={item.label}
                className="grid grid-cols-[24px_1fr_auto] items-center gap-3 border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-3"
              >
                <span className="text-[12px] text-[#666666]">{index + 1}</span>
                <span className="text-[13px] text-[#CCCCCC]">{item.label}</span>
                <StatusDot status={item.status} />
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={quickstartHref}
              className={buttonVariants({
                variant: "default",
                className: "h-9 px-4 uppercase",
              })}
            >
              {hasProject ? "View quickstart" : "Create project"}
            </Link>
            <Link
              href="/demo"
              className={buttonVariants({
                variant: "secondary",
                className: "h-9 px-4 uppercase",
              })}
            >
              Open sample trace
            </Link>
          </div>
        </section>

        <section className="border border-[#2A2A2A] bg-[#111111] p-5">
          <div className="mb-5 flex items-center justify-between border-b border-[#2A2A2A] pb-4">
            <h2 className="font-mono text-[15px] text-white">
              Send your first span
            </h2>
            <span className="text-[11px] uppercase tracking-wide text-[#666666]">
              sdk
            </span>
          </div>
          <div className="mb-4 flex border border-[#2A2A2A]">
            {Object.entries(quickstarts).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key as keyof typeof quickstarts)}
                className={
                  key === tab
                    ? "h-9 flex-1 bg-white text-[13px] text-black"
                    : "h-9 flex-1 bg-[#0A0A0A] text-[13px] text-[#666666] transition-colors hover:bg-[#161616] hover:text-[#CCCCCC]"
                }
              >
                {value.label}
              </button>
            ))}
          </div>
          <pre className="min-h-48 overflow-x-auto border border-[#2A2A2A] bg-[#1C1C1C] p-4 text-sm leading-6 text-[#CCCCCC]">
            <code>{active.code}</code>
          </pre>
        </section>
      </div>

      <section className="grid gap-6 border border-[#2A2A2A] bg-[#111111] p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-wide text-[#666666]">
            sample trace
          </div>
          <h2 className="font-mono text-[15px] text-white">
            Inspect a completed run while your first span is pending.
          </h2>
          <p className="mt-2 max-w-2xl font-sans text-sm leading-6 text-[#999999]">
            The sample entry point is temporary until the trace viewer milestone
            creates the real run inspection UI.
          </p>
        </div>
        <Link
          href="/demo"
          className={buttonVariants({
            variant: "secondary",
            className: "h-9 px-4 uppercase",
          })}
        >
          Open sample trace
        </Link>
      </section>
    </div>
  );
}

function StatusDot({ status }: { status: ChecklistStatus }) {
  if (status === "completed") {
    return (
      <span className="flex items-center gap-2 text-[11px] text-[#10B981]">
        <span className="size-2 bg-[#10B981]" />
        completed
      </span>
    );
  }

  if (status === "current") {
    return (
      <span className="flex items-center gap-2 text-[11px] text-[#F59E0B]">
        <span className="size-2 bg-[#F59E0B]" />
        current
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 text-[11px] text-[#666666]">
      <span className="size-2 bg-[#666666]" />
      pending
    </span>
  );
}
