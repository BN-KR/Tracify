"use client";

import { useState, useSyncExternalStore, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { OnboardingStepId } from "@/components/onboarding/onboarding-progress";
import {
  hasOneTimeApiKey,
  subscribeToOneTimeApiKey,
  setReturnPath,
  getReturnPath,
  clearReturnPath,
  dismissOnboarding,
} from "@/lib/onboarding-client-state";

const PROJECT_ID_STORAGE_KEY = "tracify.onboarding.projectId";
const API_KEY_COPIED_STORAGE_KEY = "tracify.onboarding.apiKeyCopied";

function getSessionSnapshot() {
  const projectId = window.sessionStorage.getItem(PROJECT_ID_STORAGE_KEY) ?? "";
  const returnPath = getReturnPath();
  const hasApiKey = hasOneTimeApiKey();
  const hasCopiedApiKey =
    window.sessionStorage.getItem(API_KEY_COPIED_STORAGE_KEY) === "true";

  return JSON.stringify({ projectId, returnPath, hasApiKey, hasCopiedApiKey });
}

function getServerSessionSnapshot() {
  return JSON.stringify({
    projectId: "",
    returnPath: "",
    hasApiKey: false,
    hasCopiedApiKey: false,
  });
}

export function OnboardingEscapeLink({
  currentStep,
}: {
  currentStep: OnboardingStepId;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
  const sessionSnapshot = useSyncExternalStore(
    subscribeToOneTimeApiKey,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const { projectId, returnPath, hasApiKey, hasCopiedApiKey } = JSON.parse(
    sessionSnapshot,
  ) as {
    projectId: string;
    returnPath: string;
    hasApiKey: boolean;
    hasCopiedApiKey: boolean;
  };

  useEffect(() => {
    const from = searchParams.get("from");
    if (from) {
      setReturnPath(from);
    }
  }, [searchParams]);

  const label = returnPath ? "Back" : "Dashboard";
  const destination =
    returnPath || (projectId ? `/dashboard/${projectId}` : "/dashboard");

  function leaveOnboarding() {
    dismissOnboarding();
    if (returnPath) {
      clearReturnPath();
    }
    router.push(destination);
  }

  function onNavigate() {
    const shouldWarn =
      currentStep === "api-key" &&
      hasApiKey &&
      window.sessionStorage.getItem(API_KEY_COPIED_STORAGE_KEY) !== "true" &&
      !hasCopiedApiKey;

    if (shouldWarn) {
      setIsConfirmingLeave(true);
      return;
    }
    leaveOnboarding();
  }

  return (
    <>
      <button
        type="button"
        onClick={onNavigate}
        className="absolute left-4 top-4 font-mono text-[13px] text-[#666666] outline-none transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#666666]"
      >
        {label}
      </button>

      {isConfirmingLeave ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="api-key-leave-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
        >
          <div className="w-full max-w-md border border-[#2A2A2A] bg-[#111111] p-5 text-[#CCCCCC]">
            <h2
              id="api-key-leave-title"
              className="font-mono text-lg text-white"
            >
              API key not copied.
            </h2>
            <p className="mt-3 font-sans text-sm leading-6 text-[#999999]">
              This key is shown once. If you leave now, you will need to rotate
              the key later.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmingLeave(false)}
                className="h-9 border border-[#2A2A2A] bg-[#0A0A0A] px-4 font-mono text-[13px] text-[#CCCCCC] transition-colors hover:bg-[#161616] hover:text-white"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={leaveOnboarding}
                className="h-9 border border-[#2A2A2A] bg-[#111111] px-4 font-mono text-[13px] text-[#EF4444] transition-colors hover:bg-[#161616] hover:text-white"
              >
                Leave anyway
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
