"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Plus, Save, Trash2, Zap } from "lucide-react";

interface ProjectOrchestrationProps {
  projectId: string;
}

interface RetryPolicyState {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

interface RuntimePolicyState {
  enforcementMode: "observe" | "enforce";
  maxCostPerRun: string;
  maxCostPerDay: string;
  fallbackChain: string[];
  retryPolicy: RetryPolicyState;
  latencyBudgetMs: string;
}

const DEFAULT_POLICY: RuntimePolicyState = {
  enforcementMode: "observe",
  maxCostPerRun: "",
  maxCostPerDay: "",
  fallbackChain: [],
  retryPolicy: {
    maxAttempts: 3,
    backoffMs: 1000,
    backoffMultiplier: 2,
    retryableErrors: ["timeout", "5xx"],
  },
  latencyBudgetMs: "",
};

const RETRYABLE_ERROR_OPTIONS = ["timeout", "5xx", "429", "rate_limit", "overloaded"];

export function ProjectOrchestration({ projectId }: ProjectOrchestrationProps) {
  const project = useQuery(
    api.projects.getProjectById,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  const updateProject = useMutation(api.projects.updateProject);

  const [policy, setPolicy] = useState<RuntimePolicyState>(DEFAULT_POLICY);
  const [newModel, setNewModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project?.runtimePolicy) {
      const rp = project.runtimePolicy;
      setPolicy({
        enforcementMode: rp.enforcementMode,
        maxCostPerRun: rp.maxCostPerRun?.toString() ?? "",
        maxCostPerDay: rp.maxCostPerDay?.toString() ?? "",
        fallbackChain: rp.fallbackChain ?? [],
        retryPolicy: {
          maxAttempts: rp.retryPolicy?.maxAttempts ?? 3,
          backoffMs: rp.retryPolicy?.backoffMs ?? 1000,
          backoffMultiplier: rp.retryPolicy?.backoffMultiplier ?? 2,
          retryableErrors: rp.retryPolicy?.retryableErrors ?? ["timeout", "5xx"],
        },
        latencyBudgetMs: rp.latencyBudgetMs?.toString() ?? "",
      });
    }
  }, [project]);

  function addModelToChain() {
    const model = newModel.trim();
    if (!model) return;
    if (policy.fallbackChain.includes(model)) {
      setError("Model already in fallback chain");
      return;
    }
    setPolicy((prev) => ({
      ...prev,
      fallbackChain: [...prev.fallbackChain, model],
    }));
    setNewModel("");
    setError(null);
  }

  function removeModelFromChain(index: number) {
    setPolicy((prev) => ({
      ...prev,
      fallbackChain: prev.fallbackChain.filter((_, i) => i !== index),
    }));
  }

  function moveModel(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= policy.fallbackChain.length) return;
    setPolicy((prev) => {
      const chain = [...prev.fallbackChain];
      [chain[index], chain[newIndex]] = [chain[newIndex], chain[index]];
      return { ...prev, fallbackChain: chain };
    });
  }

  function toggleRetryableError(error: string) {
    setPolicy((prev) => {
      const exists = prev.retryPolicy.retryableErrors.includes(error);
      return {
        ...prev,
        retryPolicy: {
          ...prev.retryPolicy,
          retryableErrors: exists
            ? prev.retryPolicy.retryableErrors.filter((e) => e !== error)
            : [...prev.retryPolicy.retryableErrors, error],
        },
      };
    });
  }

  async function handleSave() {
    const parsed = validatePolicy(policy);
    if (!parsed.ok) {
      setNotice(null);
      setError(parsed.error);
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await updateProject({
        projectId: projectId as Id<"projects">,
        runtimePolicy: parsed.value,
      });
      setNotice("Orchestration policy saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save policy");
    } finally {
      setSaving(false);
    }
  }

  if (project === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-none" />
        <Skeleton className="h-60 w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Enforcement Mode */}
      <Card className="p-6 rounded-none border-border bg-[#111111] shadow-none space-y-6">
        <div>
          <h3 className="font-mono text-[14px] text-white uppercase tracking-widest flex items-center gap-2">
            <Zap className="size-4" />
            Runtime Orchestration
          </h3>
          <p className="text-[11px] text-[#666666] mt-1">
            Enforce retries, fallbacks, and cost ceilings at the SDK level.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Enforcement Mode
            </label>
            <div className="flex gap-4">
              {(["observe", "enforce"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    setPolicy((prev) => ({ ...prev, enforcementMode: mode }))
                  }
                  className={`px-4 py-2 font-mono text-[11px] uppercase tracking-widest rounded-none border transition-colors ${
                    policy.enforcementMode === mode
                      ? "border-white bg-white text-black"
                      : "border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-zinc-600 font-mono uppercase">
              {policy.enforcementMode === "observe"
                ? "Logs what would happen without changing behavior. Safe for production."
                : "Actively retries, falls back, and blocks calls that breach ceilings."}
            </p>
          </div>
        </div>
      </Card>

      {/* Cost Ceilings */}
      <Card className="p-6 rounded-none border-border bg-[#111111] shadow-none space-y-6">
        <div>
          <h3 className="font-mono text-[14px] text-white uppercase tracking-widest">
            Cost Ceilings
          </h3>
          <p className="text-[11px] text-[#666666] mt-1">
            Hard limits on spend per run and per day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Max Cost Per Run (USD)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={policy.maxCostPerRun}
              onChange={(e) =>
                setPolicy((prev) => ({ ...prev, maxCostPerRun: e.target.value }))
              }
              placeholder="0.50"
              className="rounded-none border-zinc-800 bg-black text-white font-mono h-10"
            />
            <p className="text-[9px] text-zinc-600 font-mono uppercase">
              Calls exceeding this trigger fallback or block.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Max Cost Per Day (USD)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={policy.maxCostPerDay}
              onChange={(e) =>
                setPolicy((prev) => ({ ...prev, maxCostPerDay: e.target.value }))
              }
              placeholder="10.00"
              className="rounded-none border-zinc-800 bg-black text-white font-mono h-10"
            />
            <p className="text-[9px] text-zinc-600 font-mono uppercase">
              Daily budget cap across all runs.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#2A2A2A]">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
            Latency Budget (ms)
          </label>
          <Input
            type="number"
            step="100"
            min="0"
            value={policy.latencyBudgetMs}
            onChange={(e) =>
              setPolicy((prev) => ({ ...prev, latencyBudgetMs: e.target.value }))
            }
            placeholder="5000"
            className="rounded-none border-zinc-800 bg-black text-white font-mono h-10 max-w-xs"
          />
          <p className="text-[9px] text-zinc-600 font-mono uppercase">
            Triggers fallback when response time exceeds this threshold.
          </p>
        </div>
      </Card>

      {/* Fallback Chain */}
      <Card className="p-6 rounded-none border-border bg-[#111111] shadow-none space-y-6">
        <div>
          <h3 className="font-mono text-[14px] text-white uppercase tracking-widest">
            Fallback Chain
          </h3>
          <p className="text-[11px] text-[#666666] mt-1">
            Ordered list of models. On failure or ceiling breach, the next model is tried.
          </p>
        </div>

        {policy.fallbackChain.length > 0 ? (
          <div className="space-y-2">
            {policy.fallbackChain.map((model, i) => (
              <div
                key={`${model}-${i}`}
                className="flex items-center gap-3 py-2 px-3 bg-black border border-zinc-800 rounded-none"
              >
                <span className="text-[10px] font-mono text-zinc-500 w-6 shrink-0">
                  {i + 1}.
                </span>
                <span className="font-mono text-[13px] text-white flex-1">{model}</span>
                <button
                  type="button"
                  onClick={() => moveModel(i, -1)}
                  disabled={i === 0}
                  className="text-[10px] font-mono text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  UP
                </button>
                <button
                  type="button"
                  onClick={() => moveModel(i, 1)}
                  disabled={i === policy.fallbackChain.length - 1}
                  className="text-[10px] font-mono text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  DN
                </button>
                <button
                  type="button"
                  onClick={() => removeModelFromChain(i)}
                  className="text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-600 font-mono">
            No models in chain. Add models below.
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Input
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addModelToChain();
              }
            }}
            placeholder="gpt-4o, claude-3-sonnet, etc."
            className="rounded-none border-zinc-800 bg-black text-white font-mono h-10 flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addModelToChain}
            disabled={!newModel.trim()}
            className="h-10 rounded-none border-zinc-800 font-mono text-[10px] uppercase px-4"
          >
            <Plus className="size-3" />
            Add
          </Button>
        </div>
      </Card>

      {/* Retry Policy */}
      <Card className="p-6 rounded-none border-border bg-[#111111] shadow-none space-y-6">
        <div>
          <h3 className="font-mono text-[14px] text-white uppercase tracking-widest">
            Retry Policy
          </h3>
          <p className="text-[11px] text-[#666666] mt-1">
            Configure retry behavior for failed LLM calls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Max Attempts
            </label>
            <Input
              type="number"
              min="0"
              max="10"
              value={policy.retryPolicy.maxAttempts}
              onChange={(e) =>
                setPolicy((prev) => ({
                  ...prev,
                  retryPolicy: {
                    ...prev.retryPolicy,
                    maxAttempts: Number(e.target.value),
                  },
                }))
              }
              className="rounded-none border-zinc-800 bg-black text-white font-mono h-10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Backoff (ms)
            </label>
            <Input
              type="number"
              step="100"
              min="0"
              value={policy.retryPolicy.backoffMs}
              onChange={(e) =>
                setPolicy((prev) => ({
                  ...prev,
                  retryPolicy: {
                    ...prev.retryPolicy,
                    backoffMs: Number(e.target.value),
                  },
                }))
              }
              className="rounded-none border-zinc-800 bg-black text-white font-mono h-10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Backoff Multiplier
            </label>
            <Input
              type="number"
              step="0.5"
              min="1"
              value={policy.retryPolicy.backoffMultiplier}
              onChange={(e) =>
                setPolicy((prev) => ({
                  ...prev,
                  retryPolicy: {
                    ...prev.retryPolicy,
                    backoffMultiplier: Number(e.target.value),
                  },
                }))
              }
              className="rounded-none border-zinc-800 bg-black text-white font-mono h-10"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#2A2A2A]">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
            Retryable Error Types
          </label>
          <div className="flex flex-wrap gap-2">
            {RETRYABLE_ERROR_OPTIONS.map((errorType) => {
              const active = policy.retryPolicy.retryableErrors.includes(errorType);
              return (
                <button
                  key={errorType}
                  type="button"
                  onClick={() => toggleRetryableError(errorType)}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest rounded-none border transition-colors ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-zinc-800 bg-transparent text-zinc-500 hover:border-zinc-600"
                  }`}
                >
                  {errorType}
                </button>
              );
            })}
          </div>
          <p className="text-[9px] text-zinc-600 font-mono uppercase">
            Only these error classes trigger a retry. Auth errors (401/403) are never retried.
          </p>
        </div>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4">
        {error ? (
          <div className="flex items-center gap-2 text-red-500 text-[11px] font-mono">
            <AlertCircle className="size-3" />
            {error}
          </div>
        ) : notice ? (
          <div className="text-[11px] font-mono text-zinc-400">{notice}</div>
        ) : null}
        <div />
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-none h-10 px-8 font-mono uppercase text-xs"
        >
          {saving ? (
            "Saving..."
          ) : (
            <span className="flex items-center gap-2">
              <Save className="size-4" /> Save Policy
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

function validatePolicy(policy: RuntimePolicyState):
  | {
      ok: true;
      value: {
        enforcementMode: "observe" | "enforce";
        maxCostPerRun?: number;
        maxCostPerDay?: number;
        fallbackChain: string[];
        retryPolicy: {
          maxAttempts: number;
          backoffMs: number;
          backoffMultiplier: number;
          retryableErrors: string[];
        };
        latencyBudgetMs?: number;
      };
    }
  | { ok: false; error: string } {
  const maxCostPerRun = policy.maxCostPerRun
    ? Number(policy.maxCostPerRun)
    : undefined;
  const maxCostPerDay = policy.maxCostPerDay
    ? Number(policy.maxCostPerDay)
    : undefined;
  const latencyBudgetMs = policy.latencyBudgetMs
    ? Number(policy.latencyBudgetMs)
    : undefined;

  if (maxCostPerRun !== undefined && (!Number.isFinite(maxCostPerRun) || maxCostPerRun <= 0)) {
    return { ok: false, error: "Max cost per run must be a positive number" };
  }
  if (maxCostPerDay !== undefined && (!Number.isFinite(maxCostPerDay) || maxCostPerDay <= 0)) {
    return { ok: false, error: "Max cost per day must be a positive number" };
  }
  if (latencyBudgetMs !== undefined && (!Number.isInteger(latencyBudgetMs) || latencyBudgetMs <= 0)) {
    return { ok: false, error: "Latency budget must be a positive integer (ms)" };
  }
  if (!Number.isInteger(policy.retryPolicy.maxAttempts) || policy.retryPolicy.maxAttempts < 0 || policy.retryPolicy.maxAttempts > 10) {
    return { ok: false, error: "Max attempts must be between 0 and 10" };
  }
  if (!Number.isFinite(policy.retryPolicy.backoffMs) || policy.retryPolicy.backoffMs < 0) {
    return { ok: false, error: "Backoff must be non-negative" };
  }
  if (!Number.isFinite(policy.retryPolicy.backoffMultiplier) || policy.retryPolicy.backoffMultiplier < 1) {
    return { ok: false, error: "Backoff multiplier must be >= 1" };
  }

  return {
    ok: true,
    value: {
      enforcementMode: policy.enforcementMode,
      maxCostPerRun,
      maxCostPerDay,
      fallbackChain: policy.fallbackChain,
      retryPolicy: policy.retryPolicy,
      latencyBudgetMs,
    },
  };
}
