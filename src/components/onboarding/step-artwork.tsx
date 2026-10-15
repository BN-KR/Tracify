"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TracePreview } from "@/components/auth/trace-preview";
import type { OnboardingStepId } from "@/components/onboarding/onboarding-progress";

function Window({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-lg border border-white/20 bg-[#090909]/70 font-mono text-[#eceae3] backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-white/15 px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-white/55">
        <span className="size-2 bg-[#f4d44d]" aria-hidden="true" />
        {title}
      </div>
      <div className="p-4 text-[12px] leading-6">{children}</div>
    </div>
  );
}

function Lines({ lines }: { lines: { text: string; tone?: "dim" | "hot" }[] }) {
  const reduce = useReducedMotion();
  return (
    <div>
      {lines.map((l, i) => (
        <motion.p
          key={l.text}
          initial={reduce ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 + i * 0.28, duration: 0.4 }}
          className={`whitespace-pre-wrap ${l.tone === "dim" ? "text-white/40" : l.tone === "hot" ? "text-[#f4d44d]" : "text-white/85"}`}
        >
          {l.text}
        </motion.p>
      ))}
    </div>
  );
}

export function StepArtwork({ step }: { step: OnboardingStepId }) {
  const reduce = useReducedMotion();
  if (step === "success") return <TracePreview only={0} cycle={false} />;
  if (step === "project")
    return (
      <Window title="projects">
        <Lines lines={[
          { text: "# one project per agent or product", tone: "dim" },
          { text: "support-agent-prod    214 runs" },
          { text: "research-agent-dev     38 runs" },
          { text: "> your-project         0 runs  <- you are here", tone: "hot" },
        ]} />
      </Window>
    );
  if (step === "api-key")
    return (
      <Window title=".env">
        <Lines lines={[
          { text: "# never commit this", tone: "dim" },
          { text: "TRACIFY_API_KEY=tracify_sk_live_••••••••••••", tone: "hot" },
          { text: "OPENAI_API_KEY=sk-••••", tone: "dim" },
        ]} />
      </Window>
    );
  if (step === "install")
    return (
      <Window title="agent.py">
        <Lines lines={[
          { text: "from tracify import trace_agent", tone: "dim" },
          { text: "" },
          { text: "@trace_agent()", tone: "hot" },
          { text: "async def research_agent(query):" },
          { text: "    return await run(query)" },
        ]} />
      </Window>
    );
  return (
    <Window title="ingest · listening">
      <div className="flex items-center gap-4">
        <div className="relative size-14 shrink-0" aria-hidden="true">
          {[0, 1, 2].map((n) => (
            <motion.span
              key={n}
              className="absolute inset-0 border border-[#f4d44d]"
              initial={{ scale: 0.3, opacity: 0.9 }}
              animate={reduce ? { scale: 0.3 + n * 0.35, opacity: 0.5 } : { scale: [0.3, 1.2], opacity: [0.9, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: n * 0.8, ease: "easeOut" }}
            />
          ))}
          <span className="absolute inset-[40%] bg-[#f4d44d]" />
        </div>
        <Lines lines={[
          { text: "connected to ingest", tone: "dim" },
          { text: "waiting for first span…", tone: "hot" },
        ]} />
      </div>
    </Window>
  );
}
