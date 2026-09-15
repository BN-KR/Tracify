import Link from "next/link";
import { ArrowRight, CircleDot } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { LandingSampleRun } from "@/components/marketing/landing-sample-run";
import { ThirdPartyLogo } from "@/components/third-party-logo";

const integrationMarks = [
  { name: "OpenAI", className: "font-semibold tracking-[-0.05em]" },
  { name: "Anthropic", className: "font-serif font-semibold tracking-[-0.07em]" },
  { name: "Vercel", className: "font-semibold tracking-[-0.05em]" },
  { name: "LangChain", className: "font-semibold tracking-[-0.06em]" },
  { name: "LlamaIndex", className: "font-semibold tracking-[-0.06em]" },
  { name: "OpenTelemetry", className: "font-semibold tracking-[-0.07em]" },
] as const;

/**
 * Exploration: true AMOLED black (#000000) in place of the cream
 * background, built from the project's real shadcn/ui primitives
 * (Button, Badge, Card, Separator) rather than bespoke decoration.
 * Still strictly the 3-color system — black, white, #f4d44d yellow.
 */
function Header() {
  return (
    <header className="border-b border-white/10 bg-black px-6 py-4 md:px-10">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between">
        <Link href="/" className="text-2xl font-semibold tracking-[-0.05em] text-white no-underline">
          <span className="text-[#f4d44d]">tracify</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/pricing" className="text-sm font-semibold text-white/70 no-underline hover:text-white">
            Pricing
          </Link>
          <Link href="/product/trace-viewer" className="text-sm font-semibold text-white/70 no-underline hover:text-white">
            Product
          </Link>
          <Link href="/docs/quickstart" className="text-sm font-semibold text-white/70 no-underline hover:text-white">
            Docs
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="hidden text-sm font-semibold text-white/70 no-underline hover:text-white sm:block">
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 pt-16 text-white md:px-10">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-10 border-b border-white/10 pb-14 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.05em] text-[#f4d44d]">tracify</p>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              The operating record for the agents your team ships.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
            {(
              [
                ["Product", [["Trace viewer", "/product/trace-viewer"], ["Pricing", "/pricing"]]],
                ["Developers", [["Docs", "/docs/quickstart"], ["API reference", "/docs/api"]]],
                ["Company", [["Blog", "/blog"], ["Contact", "/contact"]]],
              ] as Array<[string, Array<[string, string]>]>
            ).map(([title, links]) => (
              <div key={title} className="space-y-3 text-sm">
                <p className="text-white/40">{title}</p>
                {links.map(([label, href]) => (
                  <Link key={href} href={href} className="block text-white/70 no-underline hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 py-8 text-xs text-white/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Tracify. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/40 no-underline hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/40 no-underline hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
      <div className="select-none pb-2 pl-4 font-pixel text-[clamp(4rem,22vw,14rem)] leading-[0.75] tracking-[-0.05em] text-white/[0.06]">
        tracify
      </div>
    </footer>
  );
}

export function AmoledHomepage() {
  return (
    <div className="bg-black text-white">
      <Header />
      {/* HERO */}
      <section className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <Card className="grid overflow-hidden border-white/15 bg-white text-black shadow-[18px_18px_0_#f4d44d] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex min-h-[470px] flex-col justify-between border-b border-black/15 p-6 md:p-8 lg:border-b-0 lg:border-r">
              <div>
                <Badge className="bg-black text-white">
                  <CircleDot className="size-3 text-[#f4d44d]" /> the run explains the release
                </Badge>
                <h1 className="mt-7 max-w-[740px] font-pixel text-6xl leading-[0.86] tracking-[-0.07em] md:text-7xl">
                  See why it failed. Ship with proof.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-black/70 md:text-lg">
                  Trace every model, tool, retrieval, and fallback decision.
                  Evaluate the fix before it reaches production.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
                  Start tracing <ArrowRight className="size-4" />
                </Link>
                <Link href="/demo" className={buttonVariants({ size: "lg", variant: "outline" })}>
                  Open sample run
                </Link>
              </div>
            </div>
            <LandingSampleRun />
          </Card>
        </div>
      </section>

      <Separator className="bg-white/10" />

      {/* PROOF */}
      <section className="py-20">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <h3 className="max-w-2xl font-pixel text-5xl leading-[0.9] tracking-[-0.06em]">
            Evidence that survives the handoff.
          </h3>
          <div className="mt-10 grid gap-px overflow-hidden bg-white/10 sm:grid-cols-3">
            {[
              ["01", "Full run context", "Model, tool, retrieval, fallback, and evaluation in one trail."],
              ["02", "Release evidence", "Quality, latency, cost, and a decision you can defend."],
              ["03", "Native transport", "SDK, OpenTelemetry, and HTTP for the stack you already run."],
            ].map(([number, title, body], index) => (
              <div
                key={title}
                className={`min-h-44 p-6 ${index === 1 ? "bg-[#f4d44d] text-black" : "bg-black"}`}
              >
                <span className={`font-mono text-[9px] ${index === 1 ? "text-black/60" : "text-white/50"}`}>{number}</span>
                <h4 className="mt-8 font-pixel text-3xl tracking-[-0.06em]">{title}</h4>
                <p className={`mt-3 text-sm leading-6 ${index === 1 ? "text-black/70" : "text-white/60"}`}>{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 font-mono text-[8px] uppercase tracking-[0.13em] text-white/40">
            Supported runtimes / current integration coverage
          </p>
          <div className="mt-4 grid gap-px overflow-hidden bg-white/10 sm:grid-cols-3 lg:grid-cols-6">
            {integrationMarks.map(({ name, className }) => (
              <div
                key={name}
                className="flex min-h-24 items-center justify-center gap-2 bg-black px-4 text-lg text-white hover:bg-[#f4d44d] hover:text-black"
              >
                <ThirdPartyLogo brand={name} className="size-4 shrink-0 object-contain" />
                <span className={className}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-white/10" />

      {/* LIFECYCLE */}
      <section className="py-20">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <Card className="overflow-hidden border-white/15 bg-white text-black">
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
                className={buttonVariants({ size: "sm", variant: "ghost", className: "text-[#f4d44d] hover:bg-transparent hover:text-white" })}
              >
                Explore lifecycle →
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <Separator className="bg-white/10" />

      {/* TRACE REPORT */}
      <section className="py-20">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <Card className="grid overflow-hidden border-white/15 bg-white text-black lg:grid-cols-[0.8fr_1.2fr]">
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
          </Card>
        </div>
      </section>

      <Separator className="bg-white/10" />

      {/* PRICING TEASER */}
      <section className="py-20">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <div className="grid gap-px overflow-hidden bg-white/10 sm:grid-cols-3">
            {[
              ["Free", "$0", "Start tracing solo projects."],
              ["Pro", "$49", "Release gates and candidate comparison."],
              ["Team", "$149", "Shared workspaces and audit trail."],
            ].map(([tier, price, body], index) => (
              <Card
                key={tier}
                className={`rounded-none border-0 p-8 ${index === 1 ? "bg-[#f4d44d] text-black" : "bg-white text-black"}`}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-black/60">{tier}</p>
                <p className="mt-4 font-pixel text-5xl tracking-[-0.05em]">{price}</p>
                <p className="mt-4 text-sm leading-6 text-black/70">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-white/10" />

      {/* FINAL CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <Card className="grid overflow-hidden border-white/15 bg-white text-black shadow-[18px_18px_0_#f4d44d] lg:grid-cols-[1.25fr_0.75fr]">
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
                className={buttonVariants({ size: "lg", className: "mt-10" })}
              >
                Book a trace clinic <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="flex flex-col justify-between bg-[#f4d44d] p-8">
              <div>
                <p className="font-pixel text-5xl tracking-[-0.06em]">30 min</p>
                <p className="mt-4 text-sm leading-6 text-black/70">
                  one real trace · one root-cause map · one release-gate
                  recommendation
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
}
