"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

import { OnboardingHeader } from "@/components/onboarding/onboarding-shell";
import { getOneTimeApiKey } from "@/lib/onboarding-client-state";
import { getDeploymentRegion, getTracifyRegion } from "@/lib/regions";

const API_KEY_COPIED_STORAGE_KEY = "tracify.onboarding.apiKeyCopied";
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
          <div className="border border-black/15 bg-[#e4e1d8] p-4 font-mono text-sm text-black">
            <code className="break-all">{apiKey}</code>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={copyKey}
              className="h-10 border border-black bg-black px-4 text-[13px] text-white transition-colors hover:bg-[#CCCCCC]"
            >
              {copied ? "Copied" : "Copy key"}
            </button>
            <button
              type="button"
              onClick={downloadEnv}
              className="h-10 border border-black/15 bg-[#f3f2ed] px-4 text-[13px] text-black/70 transition-colors hover:bg-[#f3f2ed] hover:text-black"
            >
              Download .env
            </button>
            <button
              type="button"
              disabled={!copied}
              onClick={() => router.push("/onboarding/install")}
              className="h-10 border border-black/15 bg-white px-4 text-[13px] text-black/70 transition-colors hover:bg-[#f3f2ed] hover:text-black disabled:cursor-not-allowed disabled:text-black/55"
            >
              Continue
            </button>
          </div>
        </>
      ) : (
        <div className="border border-black/15 bg-[#f3f2ed] p-4">
          <div className="text-sm text-[#92400E]">
            API key is no longer available.
          </div>
          <p className="mt-3 font-sans text-sm leading-6 text-black/60">
            API keys are shown once. Rotate key from settings or create a new
            project.
          </p>
          <button
            type="button"
            onClick={() => router.push("/onboarding/project")}
            className="mt-5 h-10 border border-black bg-black px-4 text-[13px] text-white transition-colors hover:bg-[#CCCCCC]"
          >
            Back to project creation
          </button>
        </div>
      )}
    </div>
  );
}
