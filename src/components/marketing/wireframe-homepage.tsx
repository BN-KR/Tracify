import Link from "next/link";
import { ArrowRight, ArrowUpRight, CircleDot, Sparkles } from "lucide-react";
import { LandingSampleRun } from "@/components/marketing/landing-sample-run";
import { ThirdPartyLogo } from "@/components/third-party-logo";
import { GridOverlay, BlueprintFrame, GridTick } from "@/components/marketing/wireframe-grid";

const integrationMarks = [
  { name: "OpenAI", className: "font-semibold tracking-[-0.05em]" },
  { name: "Anthropic", className: "font-serif font-semibold tracking-[-0.07em]" },
  { name: "Vercel", className: "font-semibold tracking-[-0.05em]" },
  { name: "LangChain", className: "font-semibold tracking-[-0.06em]" },
  { name: "LlamaIndex", className: "font-semibold tracking-[-0.06em]" },
  { name: "OpenTelemetry", className: "font-semibold tracking-[-0.07em]" },
] as const;

/**
 * Exploration: same production copy/content as the live homepage, laid out
 * against a visible column-guide + ruler grid, with dashed "blueprint"
 * frames and FIG. labels around major panels. Strictly white/black/yellow
 * — no new colors introduced.
 */
export function WireframeHomepage() {
  return (
    <div className="relative bg-[#eceae3] text-black">
      <GridOverlay />

      {/* SEC.01 — HERO */}
      <section className="relative px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex items-center justify-between border-b border-black/15 pb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-black/50">
            <span>SEC.01 / HERO</span>
            <GridTick n="LIVE PREVIEW" />
          </div>
          <BlueprintFrame label="FIG.01 RUN.SPLIT" className="mt-8 grid bg-white shadow-[18px_18px_0_#111] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex min-h-[470px] flex-col justify-between border-b border-black/15 p-6 md:p-8 lg:border-b-0 lg:border-r">
              <div>
                <span className="inline-flex items-center gap-2 bg-black px-3 py-2 font-mono text-[8px] uppercase tracking-[0.13em] text-white">
                  <CircleDot className="size-3 text-[#f4d44d]" /> the run explains the release
                </span>
                <h1 className="mt-7 max-w-[740px] font-pixel text-6xl leading-[0.86] tracking-[-0.07em] md:text-7xl">
                  See why it failed. Ship with proof.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-black/70 md:text-lg">
                  Trace every model, tool, retrieval, and fallback decision.
                  Evaluate the fix before it reaches production.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className="inline-flex h-12 items-center gap-3 bg-black px-6 font-mono text-[9px] uppercase tracking-[0.13em] text-white hover:bg-[#f4d44d] hover:text-black"
                >
                  Start tracing <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex h-12 items-center border border-black/25 px-6 font-mono text-[9px] uppercase tracking-[0.13em] hover:bg-[#f4d44d]"
                >
                  Open sample run
                </Link>
              </div>
            </div>
            <LandingSampleRun />
          </BlueprintFrame>
        </div>
      </section>

      {/* SEC.02 — PROOF */}
      <section className="relative border-t border-black/10 py-20">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <div className="flex items-center justify-between border-b border-black/15 pb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-black/50">
            <span>SEC.02 / VERIFIED PROOF STRIP</span>
            <GridTick n="03 ITEMS" />
          </div>
          <h3 className="mt-8 max-w-2xl font-pixel text-5xl leading-[0.9] tracking-[-0.06em]">
            Evidence that survives the handoff.
          </h3>
          <BlueprintFrame label="FIG.02 PROOF.GRID" className="mt-10 grid sm:grid-cols-3">
            {[
              ["01", "Full run context", "Model, tool, retrieval, fallback, and evaluation in one trail."],
              ["02", "Release evidence", "Quality, latency, cost, and a decision you can defend."],
              ["03", "Native transport", "SDK, OpenTelemetry, and HTTP for the stack you already run."],
            ].map(([number, title, body], index) => (
              <div
                key={title}
                className={`min-h-44 border-b border-black/15 p-6 sm:border-b-0 sm:border-r last:border-r-0 ${index === 1 ? "bg-[#f4d44d]" : "bg-white"}`}
              >
                <span className="font-mono text-[9px] text-black/60">{number}</span>
                <h4 className="mt-8 font-pixel text-3xl tracking-[-0.06em]">{title}</h4>
                <p className="mt-3 text-sm leading-6 text-black/70">{body}</p>
              </div>
            ))}
          </BlueprintFrame>
          <p className="mt-10 font-mono text-[8px] uppercase tracking-[0.13em] text-black/50">
            Supported runtimes / current integration coverage
          </p>
          <div className="mt-4 grid border-y border-black/15 sm:grid-cols-3 lg:grid-cols-6">
            {integrationMarks.map(({ name, className }) => (
              <div
                key={name}
                className="flex min-h-24 items-center justify-center gap-2 border-r border-black/15 bg-white px-4 text-lg last:border-r-0 hover:bg-[#f4d44d]"
              >
                <ThirdPartyLogo brand={name} className="size-4 shrink-0 object-contain" />
                <span className={className}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEC.03 — LIFECYCLE */}
      <section className="relative border-t border-black/10 py-20">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <div className="flex items-center justify-between border-b border-black/15 pb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-black/50">
            <span>SEC.03 / OBSERVE — EVALUATE — RELEASE</span>
            <GridTick n="04 STEPS" />
          </div>
          <BlueprintFrame label="FIG.03 LIFECYCLE.MAP" className="mt-8 bg-white">
            <div className="grid md:grid-cols-4">
              {[
                ["01", "Instrument", "Capture the complete run."],
                ["02", "Observe", "Find the decision that changed it."],
                ["03", "Evaluate", "Prove the candidate improves."],
                ["04", "Release", "Promote with evidence."],
              ].map(([number, title, body], index) => (
                <div
                  key={title as string}
                  className={`min-h-64 border-b border-r border-black/15 p-6 md:border-b-0 ${index === 2 ? "bg-[#f4d44d]" : ""}`}
                >
                  <span className="font-mono text-[9px] text-black/60">{number}</span>
                  <h3 className="mt-16 font-pixel text-3xl tracking-[-0.06em]">{title}</h3>
                  <p className="mt-4 text-sm leading-6 text-black/70">{body}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-black/15 bg-black p-5 text-white">
              <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-white/60">
                A continuous production feedback loop
              </span>
              <Link
                href="/product/lifecycle"
                className="inline-flex items-center gap-2 border-b border-[#f4d44d] pb-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#f4d44d] hover:text-white"
              >
                Explore lifecycle <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </BlueprintFrame>
        </div>
      </section>

      {/* SEC.04 — TRACE REPORT */}
      <section className="relative border-t border-black/10 py-20">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <div className="flex items-center justify-between border-b border-black/15 pb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-black/50">
            <span>SEC.04 / DECISION TRAIL</span>
            <GridTick n="LIVE SAMPLE" />
          </div>
          <BlueprintFrame label="FIG.04 TRACE.REPORT" className="mt-8 grid bg-white lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border-b border-black/15 p-7 lg:border-b-0 lg:border-r md:p-10">
              <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-black/60">
                Incident / sample run_018204
              </p>
              <h3 className="mt-8 font-pixel text-5xl leading-[0.9] tracking-[-0.06em]">
                The failure is a decision trail.
              </h3>
              <p className="mt-6 text-sm leading-7 text-black/70">
                Follow the model, tool response, fallback, and evaluation
                without stitching logs together.
              </p>
            </div>
            <div className="bg-black p-6 text-white md:p-8">
              <div className="border-l-2 border-[#f4d44d] pl-5">
                <p className="font-mono text-[8px] uppercase text-[#f4d44d]">Root cause</p>
                <h4 className="mt-3 text-xl tracking-[-0.03em]">
                  Fallback ignored an empty retrieval result.
                </h4>
              </div>
              <div className="mt-8 space-y-px bg-white/15">
                {[
                  ["12:41:08.120", "model", "response drafted"],
                  ["12:41:08.604", "tool", "knowledge.search → 0 results"],
                  ["12:41:09.011", "retry", "fallback model invoked"],
                  ["12:41:09.842", "eval", "groundedness → 0.42"],
                ].map(([time, type, event], index) => (
                  <div
                    key={time}
                    className={`grid grid-cols-[100px_60px_1fr] gap-3 p-3 font-mono text-[9px] ${index === 2 ? "bg-[#f4d44d] text-black" : "bg-black text-white/70"}`}
                  >
                    <span>{time}</span>
                    <span className="uppercase opacity-60">{type}</span>
                    <span>{event}</span>
                  </div>
                ))}
              </div>
            </div>
          </BlueprintFrame>
        </div>
      </section>

      {/* SEC.05 — PRICING TEASER */}
      <section className="relative border-t border-black/10 py-20">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <div className="flex items-center justify-between border-b border-black/15 pb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-black/50">
            <span>SEC.05 / PRICING</span>
            <GridTick n="03 TIERS" />
          </div>
          <BlueprintFrame label="FIG.05 PRICING.TIERS" className="mt-8 grid gap-px bg-black/15 sm:grid-cols-3">
            {[
              ["Free", "$0", "Start tracing solo projects."],
              ["Pro", "$49", "Release gates and candidate comparison."],
              ["Team", "$149", "Shared workspaces and audit trail."],
            ].map(([tier, price, body], index) => (
              <div key={tier} className={`p-8 ${index === 1 ? "bg-[#f4d44d]" : "bg-white"}`}>
                <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-black/60">{tier}</p>
                <p className="mt-4 font-pixel text-5xl tracking-[-0.05em]">{price}</p>
                <p className="mt-4 text-sm leading-6 text-black/70">{body}</p>
              </div>
            ))}
          </BlueprintFrame>
        </div>
      </section>

      {/* SEC.06 — FINAL CTA */}
      <section className="relative border-t border-black/10 py-20">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <div className="flex items-center justify-between border-b border-black/15 pb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-black/50">
            <span>SEC.06 / CONVERSION</span>
            <GridTick n="30 MIN" />
          </div>
          <BlueprintFrame label="FIG.06 TRACE.CLINIC" className="mt-10 grid bg-white shadow-[18px_18px_0_#111] lg:grid-cols-[1.25fr_0.75fr]">
            <div className="p-8 md:p-12">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/60">
                The next useful conversation
              </p>
              <h3 className="mt-8 max-w-[760px] font-pixel text-6xl leading-[0.86] tracking-[-0.07em] md:text-7xl">
                Bring us a run you do not trust.
              </h3>
              <p className="mt-7 max-w-xl text-lg leading-8 text-black/70">
                We will map the failure, missing signals, and first useful
                quality gate together.
              </p>
              <Link
                href="/contact?intent=trace-clinic"
                className="mt-10 inline-flex h-12 items-center gap-3 bg-black px-6 font-mono text-[9px] uppercase tracking-[0.13em] text-white hover:bg-[#f4d44d] hover:text-black"
              >
                Book a trace clinic <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="flex flex-col justify-between bg-[#f4d44d] p-8">
              <Sparkles className="size-6" />
              <div>
                <p className="font-pixel text-5xl tracking-[-0.06em]">30 min</p>
                <p className="mt-4 text-sm leading-6 text-black/70">
                  one real trace · one root-cause map · one release-gate
                  recommendation
                </p>
              </div>
            </div>
          </BlueprintFrame>
        </div>
      </section>
    </div>
  );
}
