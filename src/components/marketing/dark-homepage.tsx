"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Menu, X, Activity } from "lucide-react";
import { ScrollRevealInit, LineReveal } from "@/components/marketing/scroll-reveal";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Integrations", href: "#integrations" },
  { label: "Team", href: "#team" },
];

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/** Hand-built abstract visual: a gradient mesh over a faint trace/network grid. No stock photography is used anywhere on this page. */
function AbstractVisual({ variant = "mesh", className = "" }: { variant?: "mesh" | "grid" | "nodes"; className?: string }) {
  const gradientId = `grad-${variant}-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 800 600" className={`h-full w-full ${className}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={gradientId} cx="30%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#fb9826" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#0d2e37" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#091b20" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#${gradientId})`} />
      {variant === "grid" ? (
        <g stroke="#ffffff" strokeOpacity="0.06">
          {Array.from({ length: 17 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" />
          ))}
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} />
          ))}
        </g>
      ) : null}
      {variant === "nodes" ? (
        <g>
          {[
            [120, 140], [340, 90], [560, 180], [220, 320], [480, 360], [660, 300], [140, 460], [420, 480],
          ].map(([x, y], i, arr) => (
            <g key={`${x}-${y}`}>
              {arr[i + 1] ? (
                <line
                  x1={x}
                  y1={y}
                  x2={arr[i + 1][0]}
                  y2={arr[i + 1][1]}
                  stroke="#fb9826"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                />
              ) : null}
              <circle cx={x} cy={y} r={5} fill="#fb9826" fillOpacity="0.7" />
            </g>
          ))}
        </g>
      ) : null}
      {variant === "mesh" ? (
        <g>
          <circle cx="600" cy="120" r="220" fill="#fb9826" fillOpacity="0.08" />
          <circle cx="180" cy="440" r="260" fill="#ffffff" fillOpacity="0.04" />
        </g>
      ) : null}
    </svg>
  );
}

function Header() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-[4.5rem] w-full border-b transition-colors duration-300 ${
        scrolled ? "border-white/10 bg-[#091b20]/95 backdrop-blur" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-white no-underline">
          <Activity className="size-5 text-[#fb9826]" />
          <span className="text-2xl font-semibold tracking-[-0.05em]">tracify</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold tracking-[-0.02em] text-white no-underline hover:text-white/70"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-[5rem] bg-white px-6 py-3 text-sm font-semibold text-[#0d2e37] no-underline transition-colors hover:bg-[#fb9826]"
          >
            Start tracing
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="text-white lg:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-white/10 bg-[#091b20] px-6 py-8 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 py-3 text-4xl font-semibold tracking-[-0.04em] text-white no-underline"
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-white/30">+</span>
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[5rem] bg-white px-6 py-4 text-sm font-semibold text-[#0d2e37] no-underline"
          >
            Start tracing
          </Link>
        </div>
      ) : null}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[130vw] flex-col justify-end overflow-hidden pt-[4.5rem] text-center sm:min-h-[62vw]">
      <div className="absolute inset-0">
        <AbstractVisual variant="mesh" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#091b20] via-[#091b20]/10 to-transparent" />
      </div>
      <div className="relative mx-auto flex w-full max-w-[70rem] flex-col items-center px-6 pb-16">
        <h1
          data-anim="fade-up"
          className="select-none font-sans text-[5.5rem] font-semibold normal-case leading-[0.85] tracking-[-0.04em] text-white sm:text-[9rem]"
        >
          Tracify
        </h1>
        <p
          data-anim="fade-up"
          data-anim-delay="0.1"
          className="mt-4 max-w-2xl text-lg font-medium leading-[1.3] text-white sm:text-2xl"
        >
          With proof. Trace every model call, tool response, and fallback
          decision in one place.
        </p>
        <Link
          data-anim="fade-up"
          data-anim-delay="0.2"
          href="/sign-up"
          className="mt-8 inline-flex items-center gap-3 rounded-[5rem] bg-white px-8 py-5 text-sm font-semibold text-[#0d2e37] no-underline transition-colors hover:bg-[#fb9826]"
        >
          Start tracing <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

const PROOF_ITEMS = [
  { title: "Full run context", detail: "Model, tool, retrieval, and eval events in one timeline." },
  { title: "Native transport", detail: "SDK, OpenTelemetry, or plain HTTP — your call." },
  { title: "One wrapper", detail: "No agent rewrite required to get started." },
];

function ProofSection() {
  return (
    <section className="border-t border-white/10 bg-[#091b20] px-6 py-16 lg:px-10">
      <h2 data-anim="fade-up" className="max-w-2xl text-4xl font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-5xl">
        We&apos;ve traced production runs across 40+ integrations. See for yourself.
      </h2>
      <div data-anim="fade-up" data-anim-stagger="0.1" className="mt-12 grid gap-px overflow-hidden bg-white/10 sm:grid-cols-3">
        {PROOF_ITEMS.map((item) => (
          <div key={item.title} className="flex flex-col gap-4 bg-[#091b20] p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
              / {item.title}
            </span>
            <div className="aspect-[4/3] w-full overflow-hidden">
              <AbstractVisual variant="grid" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#091b20]">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/7]">
        <AbstractVisual variant="nodes" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#091b20] to-transparent" />
      </div>
      <div className="relative px-6 pb-16 pt-8 lg:px-10">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-white/40">
          <Activity className="size-4 text-[#fb9826]" /> About
        </div>
        <h2 data-anim="fade-up" className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-5xl">
          Not just logs — evidence you can act on.
        </h2>
        <p data-anim="fade-up" data-anim-delay="0.1" className="mt-6 max-w-xl text-lg leading-[1.4] text-white/60">
          Tracify is an operating record for the agents your team ships. It
          blends full run capture with the clarity of a decision trail —
          find the failure, prove the fix, ship with confidence.
        </p>
        <div data-anim="fade-up" data-anim-delay="0.2" className="mt-12 grid max-w-lg grid-cols-2 gap-8">
          <div>
            <p className="text-5xl font-semibold tracking-[-0.03em] text-white">40+</p>
            <p className="mt-2 text-sm font-medium text-white/50">Integrations supported</p>
          </div>
          <div>
            <p className="text-5xl font-semibold tracking-[-0.03em] text-white">1.2M+</p>
            <p className="mt-2 text-sm font-medium text-white/50">Runs traced to date</p>
          </div>
        </div>
        <p data-anim="fade-up" data-anim-delay="0.3" className="mt-12 max-w-sm text-sm font-medium leading-[1.4] text-white/40">
          Trusted by engineering teams shipping agents that can&apos;t afford
          to fail quietly.
        </p>
      </div>
    </section>
  );
}

const FEATURED = [
  {
    title: "Trace Viewer",
    tag: "Included on every plan",
    visual: "grid" as const,
    meta: [
      ["Full decision trail", "Model, tool, retry, eval"],
      ["Any transport", "SDK · OTel · HTTP"],
      ["Retention", "30 days minimum"],
    ],
  },
  {
    title: "Release Gates",
    tag: "Pro",
    visual: "nodes" as const,
    meta: [
      ["Candidate comparison", "Quality · latency · cost"],
      ["Rollout window", "Configurable per project"],
      ["Decision", "Promote or hold, with evidence"],
    ],
  },
];

function FeaturedSection() {
  return (
    <section id="product" className="border-t border-white/10 bg-[#091b20] px-6 py-16 lg:px-10">
      <h2 data-anim="fade-up" className="text-4xl font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-5xl">
        Featured capabilities
      </h2>
      <p data-anim="fade-up" data-anim-delay="0.1" className="mt-4 max-w-xl text-lg leading-[1.35] text-white/60">
        Start with the failure mode that costs your team the most time.
      </p>

      <div className="mt-14 flex flex-col gap-16">
        {FEATURED.map((item) => (
          <article key={item.title} data-anim="fade-up" className="border-t border-white/10 pt-10">
            <h3 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">{item.title}</h3>
            <p className="mt-2 text-sm font-medium text-white/50">
              from <span className="font-semibold text-white">{item.tag}</span>
            </p>
            <div className="mt-8 aspect-video w-full overflow-hidden">
              <AbstractVisual variant={item.visual} />
            </div>
            <dl className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-between">
              {item.meta.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">{label}</dt>
                  <dd className="mt-2 text-sm font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function CombineSection() {
  const steps = [
    { title: "Instrument", body: "Wrap the agent call." },
    { title: "Observe", body: "Find the decision." },
    { title: "Evaluate", body: "Prove the fix." },
    { title: "Release", body: "Promote with proof." },
  ];
  const accordionItems = ["Model calls", "Tool responses", "Eval results"];

  return (
    <section className="relative overflow-hidden border-t border-white/10">
      <div className="relative aspect-[3/4] w-full sm:aspect-[16/9]">
        <AbstractVisual variant="mesh" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#091b20]/40 to-[#091b20]" />
        <div className="absolute inset-x-0 top-0 flex flex-col gap-4 px-6 pt-16 lg:px-10">
          <h2 data-anim="fade-up" className="text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl">
            Combine every signal
          </h2>
          <div data-anim="fade-up" data-anim-delay="0.1" className="mt-4 flex flex-col gap-1">
            {accordionItems.map((label) => (
              <div key={label} className="flex items-center gap-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                <span className="text-white/30">+</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative -mt-2 bg-[#091b20] px-6 pb-16 pt-8 lg:px-10">
        <p data-anim="fade-up" className="max-w-lg text-lg leading-[1.4] text-white/60">
          Combine every trace into one continuous production feedback loop —
          instrument once, evaluate continuously.
        </p>
        <div data-anim="fade-up" data-anim-stagger="0.1" className="mt-10 grid gap-px overflow-hidden bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative bg-[#091b20] p-8">
              <span className="text-xs font-semibold text-white/40">0{index + 1}</span>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/30">Step</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-white">{step.title}</h3>
              <p className="mt-2 text-sm font-medium text-white/50">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const INTEGRATIONS = [
  { name: "SDK", count: "TypeScript & Python", visual: "grid" as const },
  { name: "OpenTelemetry", count: "Native OTLP export", visual: "nodes" as const },
  { name: "HTTP", count: "Any language, any stack", visual: "mesh" as const },
];

function IntegrationsSection() {
  return (
    <section id="integrations" className="border-t border-white/10 bg-[#091b20] px-6 py-16 lg:px-10">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-white/40">
        <Activity className="size-4 text-[#fb9826]" /> Transport
      </div>
      <h2 data-anim="fade-up" className="mt-5 text-4xl font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-5xl">
        Ingest from anywhere
      </h2>
      <p data-anim="fade-up" data-anim-delay="0.1" className="mt-4 max-w-lg text-lg leading-[1.35] text-white/60">
        Choose the transport that fits your stack — swap it later without
        losing history.
      </p>

      <div className="mt-12 flex flex-col gap-12">
        {INTEGRATIONS.map((item) => (
          <div key={item.name} data-anim="fade-up" className="border-t border-white/10 pt-8">
            <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white">{item.name}</h3>
            <p className="mt-1 text-sm font-medium text-white/40">/ {item.count}</p>
            <div className="mt-6 aspect-[16/8] w-full overflow-hidden">
              <AbstractVisual variant={item.visual} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const HOW_WORKS = [
  { title: "Wrap your agent", body: "Add the wrapper, no rewrite required." },
  { title: "Capture the run", body: "Model, tool, and eval events flow in automatically." },
  { title: "Compare candidates", body: "Run the same eval set against each version." },
  { title: "Promote with proof", body: "Ship the one with evidence behind it." },
];

function HowWorksSection() {
  return (
    <section className="border-t border-white/10 bg-[#091b20] px-6 py-16 lg:px-10">
      <h2 data-anim="fade-up" className="text-4xl font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-5xl">
        How Tracify works
      </h2>
      <p data-anim="fade-up" data-anim-delay="0.1" className="mt-4 max-w-lg text-lg leading-[1.35] text-white/60">
        Four steps between an unproven change and a release you can defend.
      </p>
      <div data-anim="fade-up" data-anim-stagger="0.12" className="mt-12 grid gap-10 sm:grid-cols-2">
        {HOW_WORKS.map((step, index) => (
          <div key={step.title} className="flex flex-col gap-3 border-t border-white/10 pt-6">
            <span className="text-xs font-semibold text-white/40">0{index + 1}</span>
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">{step.title}</h3>
            <p className="text-sm font-medium leading-[1.35] text-white/50">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const TEAM_PRINCIPLES = [
  { title: "On-call built the alerts", body: "Every threshold exists because someone got paged for it once." },
  { title: "No black boxes", body: "If Tracify can't explain a number, it doesn't ship the number." },
];

function TeamSection() {
  return (
    <section id="team" className="border-t border-white/10 bg-[#091b20] px-6 py-16 lg:px-10">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-white/40">
        <Activity className="size-4 text-[#fb9826]" /> How we build
      </div>
      <h2 data-anim="fade-up" className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-5xl">
        Built by engineers who&apos;ve been paged at 3am.
      </h2>
      <div data-anim="fade-up" data-anim-stagger="0.15" className="mt-12 grid gap-px overflow-hidden bg-white/10 sm:grid-cols-2">
        {TEAM_PRINCIPLES.map((item) => (
          <div key={item.title} className="flex flex-col gap-4 bg-[#091b20] p-8">
            <div className="aspect-square w-full max-w-[10rem] overflow-hidden">
              <AbstractVisual variant="mesh" />
            </div>
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">{item.title}</h3>
            <p className="text-sm font-medium leading-[1.35] text-white/50">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="border-t border-white/10 bg-[#091b20] px-6 py-16 lg:px-10">
      <h2 data-anim="fade-up" className="max-w-xl text-4xl font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-5xl">
        Bring us a run you do not trust.
      </h2>
      <p data-anim="fade-up" data-anim-delay="0.1" className="mt-4 max-w-md text-lg leading-[1.35] text-white/60">
        We will map the failure, the missing signals, and the first useful
        quality gate together.
      </p>
      <form
        data-anim="fade-up"
        data-anim-delay="0.2"
        action="/api/leads"
        method="post"
        className="mt-8 flex max-w-md flex-col gap-4"
      >
        <input type="hidden" name="intent" value="trace-clinic" />
        <label htmlFor="dark-home-email" className="sr-only">
          Work email
        </label>
        <input
          id="dark-home-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="border border-white/20 bg-transparent px-5 py-4 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-white"
        />
        <button
          type="submit"
          className="inline-flex w-fit items-center gap-2 rounded-[5rem] bg-white px-8 py-4 text-sm font-semibold text-[#0d2e37] transition-colors hover:bg-[#fb9826]"
        >
          Book a trace clinic <ArrowRight className="size-4" />
        </button>
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#091b20] pt-16 text-white">
      <div className="px-6 lg:px-10">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-[#fb9826]" />
          <span className="text-2xl font-semibold tracking-[-0.05em]">tracify</span>
        </div>

        <div data-anim="fade-up" className="mt-10 flex flex-col gap-1">
          {[
            ["Product", "#product"],
            ["Integrations", "#integrations"],
            ["Contact", "/contact"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2 py-2 text-4xl font-semibold tracking-[-0.03em] text-white no-underline sm:text-5xl"
            >
              <span className="text-white/30">+</span>
              {label}
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 text-sm font-medium text-white/60">
          <p>hello@tracify.tech</p>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; All Rights Reserved. Tracify, {new Date().getFullYear()}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/40 no-underline hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/40 no-underline hover:text-white">
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
      <div
        data-anim="fade-up"
        className="select-none pb-2 pl-4 text-[clamp(4rem,22vw,14rem)] font-semibold leading-[0.75] tracking-[-0.05em] text-white/[0.05]"
      >
        tracify
      </div>
      <LineReveal axis="width" className="block h-px bg-white/10" />
    </footer>
  );
}

export function DarkHomepage() {
  return (
    <div className="bg-[#091b20] font-sans">
      <ScrollRevealInit />
      <Header />
      <Hero />
      <ProofSection />
      <AboutSection />
      <FeaturedSection />
      <CombineSection />
      <IntegrationsSection />
      <HowWorksSection />
      <TeamSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
