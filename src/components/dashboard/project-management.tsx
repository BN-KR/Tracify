"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CircleDollarSign,
  KeyRound,
  Settings2,
  Trash2,
} from "lucide-react";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import posthog from "posthog-js";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export function ProjectManagement({ projectId }: { projectId: string }) {
  const router = useRouter();
  const summary = useQuery(api.projects.getProjectManagementSummary, {
    projectId: projectId as Id<"projects">,
  });
  const deleteProject = useMutation(api.projects.deleteProject);
  const [confirmationName, setConfirmationName] = useState("");
  const [confirmationWord, setConfirmationWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = useMemo(() => {
    if (!summary) return false;
    return (
      confirmationName === summary.project.name &&
      confirmationWord === "DELETE"
    );
  }, [confirmationName, confirmationWord, summary]);

  async function handleDelete() {
    if (!summary || !canDelete) return;

    setIsDeleting(true);
    setError(null);
    try {
      await deleteProject({
        projectId: projectId as Id<"projects">,
        confirmationName,
        confirmationWord,
      });
      if (isPostHogConfigured) {
        posthog.capture("project_deleted");
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
      setIsDeleting(false);
    }
  }

  if (summary === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-none" />
        <Skeleton className="h-64 w-full rounded-none" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="border border-[#2A2A2A] bg-[#111111] p-6 font-mono text-sm text-[#999999]">
        Project not found or access denied.
      </div>
    );
  }

  const project = summary.project;
  const latestActivity = summary.latestActivityAt
    ? new Date(summary.latestActivityAt).toLocaleString()
    : "No runs yet";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card className="rounded-none border-[#2A2A2A] bg-[#111111] p-6 shadow-none">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-[#666666]">
                project.management
              </div>
              <h1 className="truncate font-mono text-2xl text-white">
                {project.name}
              </h1>
              <div className="mt-3 grid gap-2 font-mono text-[11px] text-[#777777] sm:grid-cols-2">
                <span>ID: {project._id}</span>
                <span>Plan: {project.planTier ?? "free"}</span>
                <span>API key: {project.apiKeyLast4 ? `...${project.apiKeyLast4}` : "not issued"}</span>
                <span>Latest activity: {latestActivity}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/${projectId}/settings`}
                className={buttonVariants({
                  variant: "outline",
                  className: "gap-2",
                })}
              >
                  <Settings2 className="size-4" />
                  Settings
              </Link>
              <Link
                href={`/dashboard/${projectId}/api-keys`}
                className={buttonVariants({
                  variant: "outline",
                  className: "gap-2",
                })}
              >
                  <KeyRound className="size-4" />
                  API Keys
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <ManagementStat
            label="Saved Runs"
            value={summary.totals.totalRuns.toLocaleString()}
            sublabel={`${summary.totals.activeRuns} running`}
          />
          <ManagementStat
            label="Saved Spans"
            value={summary.totals.totalSpans.toLocaleString()}
            sublabel={`${summary.totals.failedRuns} failed runs`}
          />
          <ManagementStat
            label="Saved Cost"
            value={formatCurrency(summary.totals.totalCostUsd)}
            sublabel={`${summary.totals.alertCount} alerts`}
          />
        </div>

        <Card className="rounded-none border-[#2A2A2A] bg-[#111111] p-6 shadow-none">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-mono text-[14px] uppercase tracking-widest text-white">
                Recent Saved Runs
              </h2>
              <p className="mt-1 font-mono text-[11px] text-[#666666]">
                Convex-backed activity used when analytics storage is unavailable.
              </p>
            </div>
          </div>
          <div className="divide-y divide-[#222222] border border-[#222222]">
            {summary.recentRuns.length ? (
              summary.recentRuns.map((run) => (
                <Link
                  key={run._id}
                  href={`/dashboard/${projectId}/runs/${run.runId}`}
                  className="grid gap-3 px-4 py-3 font-mono text-[12px] text-[#999999] transition-colors hover:bg-[#161616] sm:grid-cols-[minmax(0,1fr)_120px_100px_24px]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-white">{run.runId}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-[#666666]">
                      {run.primaryModel ?? "no model"}
                    </div>
                  </div>
                  <div>{run.status}</div>
                  <div>{run.spanCount} spans</div>
                  <ArrowRight className="size-4 self-center justify-self-end" />
                </Link>
              ))
            ) : (
              <div className="px-4 py-8 font-mono text-[12px] text-[#666666]">
                No saved runs yet.
              </div>
            )}
          </div>
        </Card>
      </div>

      <aside className="space-y-6">
        <Card className="rounded-none border-[#2A2A2A] bg-[#111111] p-5 shadow-none">
          <div className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-widest text-white">
            <Calendar className="size-4 text-[#777777]" />
            Lifecycle
          </div>
          <InfoRow label="Created" value={formatDate(project.createdAt)} />
          <InfoRow label="Updated" value={formatDate(project.updatedAt)} />
          <InfoRow label="Key last used" value={formatDate(project.apiKeyLastUsedAt)} />
        </Card>

        <Card className="rounded-none border-[#2A2A2A] bg-[#111111] p-5 shadow-none">
          <div className="mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-widest text-white">
            <CircleDollarSign className="size-4 text-[#777777]" />
            Limits
          </div>
          <InfoRow
            label="Cost threshold"
            value={formatCurrency(project.costThresholdUsd ?? 0)}
          />
          <InfoRow
            label="Max duration"
            value={`${project.maxDurationSeconds ?? 0}s`}
          />
          <InfoRow label="Max stall" value={`${project.maxStallMinutes ?? 0}m`} />
        </Card>

        <Card className="rounded-none border-red-900/50 bg-red-950/10 p-5 shadow-none">
          <div className="mb-4 flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
            <div>
              <h2 className="font-mono text-[12px] uppercase tracking-widest text-red-400">
                Delete Project
              </h2>
              <p className="mt-2 font-mono text-[11px] leading-5 text-red-300/60">
                This removes the project plus saved runs, alerts, and comments
                from Convex. Type the exact project name, then type DELETE.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              value={confirmationName}
              onChange={(event) => setConfirmationName(event.target.value)}
              placeholder={project.name}
              className="h-10 border-red-900/50 bg-black text-red-100"
            />
            <Input
              value={confirmationWord}
              onChange={(event) => setConfirmationWord(event.target.value)}
              placeholder="DELETE"
              className="h-10 border-red-900/50 bg-black text-red-100"
            />
            {error ? (
              <div className="font-mono text-[11px] text-red-400">{error}</div>
            ) : null}
            <Button
              type="button"
              variant="destructive"
              disabled={!canDelete || isDeleting}
              onClick={handleDelete}
              className="w-full gap-2"
            >
              <Trash2 className="size-4" />
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function ManagementStat({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <Card className="rounded-none border-[#2A2A2A] bg-[#111111] p-5 shadow-none">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#666666]">
        {label}
      </div>
      <div className="mt-3 font-mono text-2xl text-white">{value}</div>
      <div className="mt-2 font-mono text-[11px] text-[#777777]">{sublabel}</div>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-[#222222] py-3 first:border-t-0 first:pt-0">
      <span className="font-mono text-[11px] uppercase tracking-widest text-[#666666]">
        {label}
      </span>
      <span className="max-w-[170px] truncate text-right font-mono text-[11px] text-[#CCCCCC]">
        {value}
      </span>
    </div>
  );
}

function formatDate(value: number | string | null | undefined) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}
