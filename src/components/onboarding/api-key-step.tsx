"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

import { OnboardingHeader } from "@/components/onboarding/onboarding-shell";
import {
  clearOneTimeApiKey,
  getOneTimeApiKey,
} from "@/lib/onboarding-client-state";
import { getDeploymentRegion, getTracifyRegion } from "@/lib/regions";

const API_KEY_COPIED_STORAGE_KEY = "5to1r.onboarding.apiKeyCopied";
const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export function ApiKeyStep() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [apiKey] = useState(getOneTimeApiKey);
  const region = getTracifyRegion(getDeploymentRegion());
  const envContent = useMemo(
    () => (apiKey ? `TRACIFY_API_KEY=${apiKey}\nTRACIFY_REGION=${region.id}\n` : ""),
    [apiKey, region.id],
  );

  async function copyKey() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    if (isPostHogConfigured) {
      posthog.capture("api_key_copied", { issuance_flow: "onboarding" });
    }
    window.sessionStorage.setItem(API_KEY_COPIED_STORAGE_KEY, "true");
    clearOneTimeApiKey();
    setCopied(true);
  }

  function downloadEnv() {
    if (!apiKey) return;
    const blob = new Blob([envContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = ".env";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <OnboardingHeader
        title="Your API key."
        description={`This key is shown once and belongs to Tracify ${region.shortName}. Copy it now and store it securely.`}
      />
      {apiKey ? (
        <>
          <div className="border border-[#2A2A2A] bg-[#1C1C1C] p-4 font-mono text-sm text-white">
            <code className="break-all">{apiKey}</code>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={copyKey}
              className="h-10 border border-white bg-white px-4 text-[13px] text-black transition-colors hover:bg-[#CCCCCC]"
            >
              {copied ? "Copied" : "Copy key"}
            </button>
            <button
              type="button"
              onClick={downloadEnv}
              className="h-10 border border-[#2A2A2A] bg-[#0A0A0A] px-4 text-[13px] text-[#CCCCCC] transition-colors hover:bg-[#161616] hover:text-white"
            >
              Download .env
            </button>
            <button
              type="button"
              disabled={!copied}
              onClick={() => router.push("/onboarding/install")}
              className="h-10 border border-[#2A2A2A] bg-[#111111] px-4 text-[13px] text-[#CCCCCC] transition-colors hover:bg-[#161616] hover:text-white disabled:cursor-not-allowed disabled:text-[#666666]"
            >
              Continue
            </button>
          </div>
        </>
      ) : (
        <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-4">
          <div className="text-sm text-[#F59E0B]">
            API key is no longer available.
          </div>
          <p className="mt-3 font-sans text-sm leading-6 text-[#999999]">
            API keys are shown once. Rotate key from settings or create a new
            project.
          </p>
          <button
            type="button"
            onClick={() => router.push("/onboarding/project")}
            className="mt-5 h-10 border border-white bg-white px-4 text-[13px] text-black transition-colors hover:bg-[#CCCCCC]"
          >
            Back to project creation
          </button>
        </div>
      )}
    </div>
  );
}
