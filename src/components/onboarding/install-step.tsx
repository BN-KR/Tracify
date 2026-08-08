"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

import { CodeCopyBlock } from "@/components/onboarding/code-copy-block";
import { OnboardingHeader } from "@/components/onboarding/onboarding-shell";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

const snippets = {
  python: {
    label: "Python",
    install: "pip install tracify",
    code: `from tracify import trace_agent

@trace_agent()
async def research_agent(query):
    return await run(query)`,
  },
  typescript: {
    label: "TypeScript",
    install: "npm install tracify",
    code: `import { traceAgent } from "tracify"

const researchAgent = traceAgent(async (query: string) => {
  return await run(query)
})`,
  },
  prompt: {
    label: "AI setup prompt",
    install: "",
    code: `You are integrating Tracify into this agent project.

Goal:
Instrument the main agent run function so every run sends spans to Tracify.

Rules:
- Do not rewrite the agent.
- Preserve existing behavior.
- Add the smallest possible instrumentation change.
- Use environment variable TRACIFY_API_KEY.
- Do not hardcode secrets.

Steps:
1. Detect whether this project is Python or TypeScript.
2. Install the Tracify SDK with the correct command:
   - Python: pip install tracify
   - TypeScript / Node.js: npm install tracify
3. Add TRACIFY_API_KEY to .env.example.
4. Find the main agent function.
5. If Python, import trace_agent from tracify and add @trace_agent().
6. If TypeScript, import traceAgent from tracify and wrap the async agent function.
7. Run the agent once.
8. Confirm that a span was sent to Tracify.

Use this environment variable locally:
TRACIFY_API_KEY=your_key_here`,
  },
};

export function InstallStep() {
  const router = useRouter();
  const [tab, setTab] = useState<keyof typeof snippets>("python");
  const active = snippets[tab];

  return (
    <div>
      <OnboardingHeader
        title="Install the SDK."
        description="Choose your runtime and add Tracify to your agent."
      />
      <div className="mb-4 grid border border-[#2A2A2A] sm:grid-cols-3">
        {Object.entries(snippets).map(([key, snippet]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as keyof typeof snippets)}
            className={
              key === tab
                ? "h-10 flex-1 bg-white text-[13px] text-black"
                : "h-10 flex-1 bg-[#0A0A0A] text-[13px] text-[#666666] transition-colors hover:bg-[#161616] hover:text-[#CCCCCC]"
            }
          >
            {snippet.label}
          </button>
        ))}
      </div>
      {tab === "prompt" ? (
        <>
          <div className="mb-4 border border-[#2A2A2A] bg-[#0A0A0A] p-4 font-sans text-sm leading-6 text-[#F59E0B]">
            Do not paste live API keys into AI coding tools unless you trust the
            environment. Prefer adding the key locally to .env.
          </div>
          <CodeCopyBlock
            label="AI setup prompt"
            value={active.code}
            multiline
            copyLabel="Copy setup prompt"
          />
        </>
      ) : (
        <>
          <CodeCopyBlock label="Install command" value={active.install} />
          <div className="mt-4">
            <CodeCopyBlock label="Example" value={active.code} multiline />
          </div>
        </>
      )}
      <button
        type="button"
        onClick={() => {
          if (isPostHogConfigured) {
            posthog.capture("onboarding_install_ready", { runtime: tab });
          }
          router.push("/onboarding/waiting");
        }}
        className="mt-6 h-10 border border-white bg-white px-4 text-[13px] text-black transition-colors hover:bg-[#CCCCCC]"
      >
        I&apos;m ready
      </button>
    </div>
  );
}
