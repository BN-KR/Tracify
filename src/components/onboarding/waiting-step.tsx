"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import Link from "next/link";
import { AlertTriangle, Check, Loader2, Send } from "lucide-react";
import posthog from "posthog-js";

import { OnboardingHeader } from "@/components/onboarding/onboarding-shell";
import { clearOneTimeApiKey, getOneTimeApiKey } from "@/lib/onboarding-client-state";
import { getDeploymentRegion, getTracifyRegion, getWrongRegion } from "@/lib/regions";

const PROJECT_ID_STORAGE_KEY = "tracify.onboarding.projectId";
const PROJECT_NAME_STORAGE_KEY = "tracify.onboarding.projectName";
const FALLBACK_PROJECT_NAME = "research-agent-prod";

export function WaitingStep() {
  const [elapsed, setElapsed] = useState(0);
  const [health, setHealth] = useState<"checking" | "healthy" | "unavailable">("checking");
  const [probeState, setProbeState] = useState<"idle" | "sending" | "accepted" | "failed">("idle");
  const [probeMessage, setProbeMessage] = useState("");
  const capturedFirstTrace = useRef(false);
  const [projectId, setProjectId] = useState("");
  const [fallbackProjectName, setFallbackProjectName] = useState(FALLBACK_PROJECT_NAME);
  const [apiKeyDisplay, setApiKeyDisplay] = useState("tracify_sk_live_...");
  const [apiKey, setApiKey] = useState("");
  const region = getTracifyRegion(getDeploymentRegion());
  const wrongRegion = useMemo(() => getWrongRegion(apiKey, region.id), [apiKey, region.id]);
  const onboardingState = useQuery(
    api.agentRuns.getProjectOnboardingState,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      const storedProjectId = window.sessionStorage.getItem(PROJECT_ID_STORAGE_KEY) ?? "";
      const storedProjectName = window.sessionStorage.getItem(PROJECT_NAME_STORAGE_KEY) ?? FALLBACK_PROJECT_NAME;
      const storedApiKey = getOneTimeApiKey();
      setProjectId(storedProjectId);
      setFallbackProjectName(storedProjectName);
      setApiKey(storedApiKey);
      if (storedApiKey) setApiKeyDisplay(`tracify_sk_live_...${storedApiKey.slice(-4)}`);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!onboardingState?.hasReceivedFirstSpan || !onboardingState.firstRunId) {
      return;
    }
    window.location.assign(
      `/onboarding/success?projectId=${onboardingState.projectId}&runId=${onboardingState.firstRunId}`,
    );
  }, [onboardingState]);

  useEffect(() => {
    if (!onboardingState?.hasReceivedFirstSpan || capturedFirstTrace.current) return;
    capturedFirstTrace.current = true;
    posthog.capture("first_trace_received", {
      elapsed_seconds: elapsed,
      source: probeState === "accepted" ? "onboarding_probe" : "agent",
      region: region.id,
    });
  }, [elapsed, onboardingState, probeState, region.id]);

  useEffect(() => () => clearOneTimeApiKey(), []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health/region", { cache: "no-store" })
      .then((response) => {
        if (cancelled) return;
        setHealth(response.ok ? "healthy" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setHealth("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendProbe() {
    if (!apiKey) {
      setProbeState("failed");
      setProbeMessage("The API key is no longer available in this browser session. Return to the API key step and copy it again.");
      return;
    }
    setProbeState("sending");
    setProbeMessage("");
    const runId = `onboarding-${crypto.randomUUID()}`;
    try {
      const response = await fetch(`${window.location.origin}/api/ingest`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          spanId: `${runId}-span`,
          runId,
          spanType: "run_end",
          createdAt: new Date().toISOString(),
          latencyMs: 1,
          input: "Tracify onboarding connection check",
          output: "Connection accepted",
          traceName: "tracify-onboarding-check",
          environment: "onboarding",
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error || `Ingest returned HTTP ${response.status}`);
      }
      setProbeState("accepted");
      setProbeMessage("The ingest endpoint accepted a test span. Keep this page open while it reaches the trace viewer.");
      posthog.capture("onboarding_probe_accepted", { region: region.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : "The test span could not be sent.";
      setProbeState("failed");
      setProbeMessage(message);
      posthog.capture("onboarding_probe_failed", { region: region.id, error: message.slice(0, 120) });
    }
  }

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
      <div className="border border-black/15 bg-[#f3f2ed] p-4">
        <div className="mb-4 flex items-center gap-2 text-[#92400E]">
          <span className="size-2 animate-mono-pulse bg-[#B45309]" />
          <span className="text-[13px]">listening</span>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-black/55">
              Project
            </dt>
            <dd className="mt-1 text-black/70">{projectName}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-black/55">
              API key
            </dt>
            <dd className="mt-1 text-black/70">{keyDisplay}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-black/55">
              Status
            </dt>
            <dd className="mt-1 text-[#92400E]">listening</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 border border-black/15 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/55">Connection diagnostics</p>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/45">{elapsed}s</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <DiagnosticRow label="Project access" state={!projectId || onboardingState === null ? "fail" : onboardingState === undefined ? "checking" : "pass"} detail={!projectId ? "Project context missing" : onboardingState === null ? "Project is not available" : onboardingState === undefined ? "Checking project access" : "Project is ready"} />
          <DiagnosticRow label="Cloud reachability" state={health === "checking" ? "checking" : health === "healthy" ? "pass" : "fail"} detail={health === "healthy" ? `${region.shortName} health endpoint responded` : health === "checking" ? "Checking dependencies" : "Cloud health check failed"} />
          <DiagnosticRow label="API key region" state={wrongRegion ? "fail" : apiKey ? "pass" : "fail"} detail={wrongRegion ? `Key belongs to ${wrongRegion.shortName}, not ${region.shortName}` : apiKey ? `${region.shortName} key is present` : "Key unavailable in this session"} />
          <DiagnosticRow label="Last request" state={probeState === "accepted" ? "pass" : probeState === "failed" ? "fail" : "checking"} detail={probeState === "accepted" ? "Test span accepted" : probeState === "failed" ? "Test span failed" : "No test span sent yet"} />
        </div>
        <button type="button" onClick={sendProbe} disabled={probeState === "sending" || Boolean(wrongRegion)} className="mt-5 inline-flex min-h-10 items-center gap-2 border border-black bg-black px-4 font-mono text-[10px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#f4d44d] hover:text-black disabled:cursor-not-allowed disabled:opacity-45">
          {probeState === "sending" ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
          {probeState === "sending" ? "Sending test span" : "Send test span"}
        </button>
        {probeMessage ? <p className={`mt-3 text-sm leading-6 ${probeState === "failed" ? "text-[#92400E]" : "text-black/60"}`}>{probeMessage}</p> : null}
      </div>

      {!projectId ? (
        <div className="mt-5 border border-black/15 bg-[#f3f2ed] p-4 font-sans text-sm leading-6 text-black/60">
          Project context is no longer available in this browser session. Create
          a project again to listen for first-span activation.
        </div>
      ) : null}

      {elapsed >= 30 ? (
        <Link
          href="/demo"
          className="mt-5 block text-sm text-black/60 underline underline-offset-4 transition-colors hover:text-black"
        >
          Explore sample trace
        </Link>
      ) : null}
      {elapsed >= 30 && probeState === "idle" ? (
        <div className="mt-5 border border-black/15 bg-[#f3f2ed] p-4 font-sans text-sm leading-6 text-black/60">
          Use the test span above to separate a Tracify connection problem from an agent setup problem. If it is accepted, your SDK or agent is the next place to inspect.
        </div>
      ) : null}
      {elapsed >= 120 ? (
        <a
          href="mailto:support@tracify.tech"
          className="mt-5 inline-block text-sm text-black/60 underline underline-offset-4 transition-colors hover:text-black"
        >
          Still stuck? Email support
        </a>
      ) : null}
    </div>
  );
}

function DiagnosticRow({ label, state, detail }: { label: string; state: "checking" | "pass" | "fail"; detail: string }) {
  const Icon = state === "checking" ? Loader2 : state === "pass" ? Check : AlertTriangle;
  return (
    <div className="flex items-start gap-3 border-t border-black/10 pt-3">
      <Icon className={`mt-0.5 size-3.5 shrink-0 ${state === "checking" ? "animate-spin text-black/45" : state === "pass" ? "text-[#166534]" : "text-[#92400E]"}`} aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-black/70">{label}</p>
        <p className="mt-1 text-sm leading-5 text-black/55">{detail}</p>
      </div>
    </div>
  );
}
