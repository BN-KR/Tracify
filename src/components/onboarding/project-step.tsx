"use client";

import { FormEvent, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";

import { OnboardingHeader } from "@/components/onboarding/onboarding-shell";
import { setOneTimeApiKey } from "@/lib/onboarding-client-state";

const API_KEY_COPIED_STORAGE_KEY = "5to1r.onboarding.apiKeyCopied";
const PROJECT_ID_STORAGE_KEY = "5to1r.onboarding.projectId";
const PROJECT_NAME_STORAGE_KEY = "5to1r.onboarding.projectName";
const LAST_PROJECT_STORAGE_KEY = "5to1r.lastProjectId";
const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export function ProjectStep() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { isLoading: isConvexLoading, isAuthenticated } = useConvexAuth();
  const createProject = useMutation(api.projects.createProject);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isCreating) return;

    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isConvexLoading) {
      setError("Convex auth is still initializing. Try again in a moment.");
      return;
    }

    if (!isAuthenticated) {
      setError("Authentication is still initializing. Try again in a moment.");
      return;
    }

    setIsCreating(true);
    setError("");
    try {
      const result = await createProject({ name: trimmed });
      if (isPostHogConfigured) {
        posthog.capture("project_created", { creation_flow: "onboarding" });
      }
      setOneTimeApiKey(result.plaintextApiKey);
      window.sessionStorage.removeItem(API_KEY_COPIED_STORAGE_KEY);
      window.sessionStorage.setItem(PROJECT_ID_STORAGE_KEY, result.projectId);
      window.sessionStorage.setItem(PROJECT_NAME_STORAGE_KEY, result.name);
      window.localStorage.setItem(LAST_PROJECT_STORAGE_KEY, result.projectId);
      router.push("/onboarding/api-key");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Project creation failed.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 font-mono text-[13px] text-[#666666]">
        Loading authentication...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 font-mono text-[13px] text-[#666666]">
        Sign in to create a project.
      </div>
    );
  }

  if (isConvexLoading || !isAuthenticated) {
    return (
      <div className="border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 font-mono text-[13px] text-[#666666]">
        Preparing project creation...
        <span className="ml-2 opacity-50">
          (Auth: {isAuthenticated ? "Connected" : "Waiting"} | Sync: {isConvexLoading ? "Loading" : "Ready"})
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <OnboardingHeader
        title="Create your first project."
        description="A project holds your agents, runs, API keys, and traces."
      />
      <label
        htmlFor="project-name"
        className="mb-2 block text-[11px] uppercase tracking-wide text-[#999999]"
      >
        Project name
      </label>
      <input
        id="project-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="research-agent-prod"
        className="h-11 w-full border border-[#2A2A2A] bg-[#1C1C1C] px-3 font-mono text-sm text-white outline-none transition-colors placeholder:text-[#666666] focus:border-[#999999]"
      />
      {error ? <p className="mt-3 text-sm text-[#EF4444]">{error}</p> : null}

      <Button
        type="submit"
        variant="default"
        disabled={!name.trim() || isCreating}
        className="mt-6 h-10 px-4 uppercase"
      >
        {isCreating ? "Creating..." : "Create project"}
      </Button>
    </form>
  );
}
