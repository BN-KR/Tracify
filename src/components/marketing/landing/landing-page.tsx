import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { HeroGraph } from "./hero-graph";
import { Reveal, Ticker } from "./reveal";
import { RunReplay } from "./run-replay";
import { PricingSection } from "./pricing-section";

const Eyebrow = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => (
  <p className={`font-mono text-[9px] uppercase tracking-[0.16em] ${dark ? "text-white/60" : "text-black/55"}`}>{children}</p>
);

const h2 = "mt-5 max-w-3xl font-pixel text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.88] tracking-[-0.07em]";

const features = [
  { n: "01", title: "Flow graph", body: "Every run drawn as a graph: which step called which, where loops repeat, where it broke.", href: "/product/trace-viewer" },
  { n: "02", title: "Cost per step", body: "See which model call or retry burned the budget, down to a single run.", href: "/product/cost-dashboard" },
  { n: "03", title: "Tool calls", body: "Inputs, outputs and timing for every tool your agent touched.", href: "/product/tool-calls" },
  { n: "04", title: "LLM calls", body: "Prompts, responses, tokens and latency, side by side across models.", href: "/product/llm-calls" },
  { n: "05", title: "Failures first", body: "Filter to failed runs, find the first step that went wrong, skip the scroll.", href: "/product/failures" },
  { n: "06", title: "Search and share", body: "Filter by status, cost, latency or tokens, then send a link to the exact run.", href: "/docs" },
] as const;

const code = `import { traceAgent, span } from "tracify-sdk";

export const answer = traceAgent(async (question) => {
  const docs = await span("docs.search", () => search(question), {
    type: "tool",
  });
  return span("chat", () => callModel(question, docs), {
    type: "llm",
  });
});`;

const faqs = [
  ["What is a span?", "One recorded step in a run: a model call, a tool call, a retrieval. Plans are sized by spans per month."],
  ["Do I have to rewrite my agent?", "No. Wrap the entry point once, then mark the steps you care about. Inputs and outputs have obvious secrets stripped before they leave your app."],
  ["What can I send traces from?", "The TypeScript and Python SDKs, OpenTelemetry, or plain HTTP, so it fits the stack you already run."],
  ["Can I try it without paying?", "Yes. The Free plan includes the trace viewer and cost visibility, no card needed."],
  ["What if I need more than the plans offer?", "Enterprise covers custom retention, SSO and on-prem. Tell us what you need on the contact page."],
] as const;

export function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-[#eceae3] text-black">
      {/* HERO */}
      <section className="border-b border-black bg-[#090909] text-white">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <Eyebrow dark>Observability for AI agents</Eyebrow>
            <h1 className="mt-6 font-pixel text-[clamp(2.75rem,6.4vw,5.5rem)] leading-[1.02] tracking-[-0.08em]">
              See every step your <span className="bg-[#f4d44d] px-2 text-black">agent</span> takes.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">
              Tracify records each model call, tool call and retry, then draws the whole run as a graph. Find what broke, what it cost, and why, in seconds.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/sign-up" className="inline-flex min-h-12 items-center gap-3 bg-[#f4d44d] px-6 font-mono text-[10px] uppercase tracking-[0.13em] text-black hover:bg-white">
                Start tracing free <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/demo" className="inline-flex min-h-12 items-center gap-3 border border-white/40 px-6 font-mono text-[10px] uppercase tracking-[0.13em] hover:bg-white hover:text-black">
                See a live trace <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/50">Free plan · No credit card · TypeScript + Python SDKs</p>
          </div>
          <div className="border border-white/25 bg-[#101010] p-3 shadow-[10px_10px_0_#f4d44d]">
            <div className="flex items-center justify-between border-b border-white/15 px-2 pb-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white/60">
              <span>support-agent · flow graph</span>
              <span className="text-[#f4d44d]">● replaying · illustrative</span>
            </div>
            <HeroGraph />
          </div>
        </div>
      </section>

      {/* TICKER */}
      <section className="border-b border-black bg-[#f4d44d] py-5" aria-label="Works with">
        <Ticker items={["OpenAI", "Anthropic", "Vercel AI SDK", "LangChain", "LlamaIndex", "OpenTelemetry", "TypeScript", "Python"]} />
      </section>

      {/* PROBLEM */}
      <section className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <Eyebrow>The problem</Eyebrow>
            <h2 className={h2}>Agents don&apos;t crash. They quietly get it wrong.</h2>
          </Reveal>
          <div className="mt-12 grid border border-black bg-white md:grid-cols-3">
            {[
              ["Logs can't see the loop", "A retry here, a fallback model there. Plain logs scatter the story across a hundred lines."],
              ["Costs hide in the retries", "One bad search can quietly trigger a pricier model call. You find out on the invoice."],
              ["Nobody can replay it", "Without the exact inputs and outputs, \"it worked yesterday\" is the end of the investigation."],
            ].map(([t, b], i) => (
              <Reveal key={t} delay={i * 0.1} className={`border-b border-black p-7 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 ${i === 1 ? "bg-[#f4d44d]" : ""}`}>
                <span className="font-mono text-[9px] text-black/55">0{i + 1}</span>
                <h3 className="mt-10 font-pixel text-3xl leading-none tracking-[-0.06em]">{t}</h3>
                <p className="mt-4 text-sm leading-6 text-black/70">{b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* REPLAY */}
      <section className="border-y border-black bg-[#fff4b5]/60 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <Eyebrow>Replay a run</Eyebrow>
            <h2 className={h2}>Press play. Watch it go wrong.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-black/70">
              Step through a refund agent that failed. Click any step to see exactly what went in and what came out.
            </p>
          </Reveal>
          <Reveal className="mt-12" delay={0.1}>
            <RunReplay />
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
            <h2 className={h2}>Three steps. About ten lines.</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <ol className="grid min-w-0 gap-px border border-black bg-black">
              {[
                ["Wrap your agent", "Add the SDK and wrap the entry point. Mark tool and model steps."],
                ["Run it as usual", "Spans stream to Tracify in the background. Secrets are stripped first."],
                ["Open the graph", "Every run appears as a flow graph with cost, latency and errors on each step."],
              ].map(([t, b], i) => (
                <Reveal key={t} delay={i * 0.1} className="bg-white p-6">
                  <div className="flex items-start gap-5">
                    <span className="flex size-9 shrink-0 items-center justify-center bg-black font-pixel text-lg text-[#f4d44d]">{i + 1}</span>
                    <div>
                      <h3 className="font-pixel text-2xl leading-none tracking-[-0.05em]">{t}</h3>
                      <p className="mt-2 text-sm leading-6 text-black/70">{b}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Reveal delay={0.15} className="min-w-0">
              <div className="border border-black bg-[#090909] shadow-[10px_10px_0_#f4d44d]">
                <div className="flex items-center justify-between border-b border-white/15 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white/60">
                  <span>agent.ts</span>
                  <span className="text-[#f4d44d]">tracify-sdk</span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-6 text-white/90"><code>{code}</code></pre>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-black bg-[#090909] px-6 py-20 text-white md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <Eyebrow dark>What you get</Eyebrow>
            <h2 className={h2}>Everything the run did, in one place.</h2>
          </Reveal>
          <div className="mt-12 grid gap-px border border-white/25 bg-white/25 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.n} delay={(i % 3) * 0.08} className="bg-[#090909]">
                <Link href={f.href} className="group flex h-full min-h-56 flex-col justify-between p-7 transition-colors hover:bg-[#f4d44d] hover:text-black">
                  <div className="flex justify-between font-mono text-[9px] text-white/50 group-hover:text-black/60">
                    <span>{f.n}</span>
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-pixel text-3xl leading-none tracking-[-0.06em]">{f.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/65 group-hover:text-black/75">{f.body}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Pricing</Eyebrow>
              <h2 className={h2}>Start free. Pay when it grows.</h2>
            </div>
          </Reveal>
          <PricingSection />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-black px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <Eyebrow>Questions</Eyebrow>
            <h2 className={h2}>Quick answers.</h2>
          </Reveal>
          <div className="border-t border-black">
            {faqs.map(([q, a]) => (
              <details key={q} className="group border-b border-black py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-pixel text-2xl tracking-[-0.05em] [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="font-mono text-xl transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 max-w-xl text-sm leading-6 text-black/70">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-black bg-[#f4d44d] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <h2 className="max-w-4xl font-pixel text-[clamp(3rem,9vw,7.5rem)] leading-[0.82] tracking-[-0.08em]">
              Your next bug is already in a trace.
            </h2>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/sign-up" className="inline-flex min-h-14 items-center gap-3 bg-black px-8 font-mono text-[10px] uppercase tracking-[0.13em] text-white hover:bg-white hover:text-black">
                Start tracing free <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/docs" className="inline-flex min-h-14 items-center border border-black px-8 font-mono text-[10px] uppercase tracking-[0.13em] hover:bg-black hover:text-white">
                Read the docs
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
