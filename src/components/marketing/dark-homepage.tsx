"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Menu,
  X,
  Activity,
  GitBranch,
  Gauge,
  ShieldCheck,
  Wrench,
  Radar,
  FlaskConical,
  Rocket,
} from "lucide-react";
import { ScrollRevealInit, LineReveal } from "@/components/marketing/scroll-reveal";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs/quickstart" },
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

function Placeholder({ className = "", label }: { className?: string; label?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-white/[0.04] text-[10px] uppercase tracking-[0.14em] text-white/25 ${className}`}
    >
      {label}
    </div>
  );
}

function Header() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-[4.5rem] w-full transition-colors duration-300 ${
        scrolled ? "bg-[#091b20]/95 backdrop-blur" : "bg-transparent"
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
        <div className="border-t border-white/10 bg-[#091b20] px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-white no-underline"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/sign-up"
              className="inline-flex w-fit items-center gap-2 rounded-[5rem] bg-white px-6 py-3 text-sm font-semibold text-[#0d2e37] no-underline"
            >
              Start tracing
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[47.7vw] items-center justify-center overflow-hidden bg-[#0d2e37] pb-24 pt-[4.5rem] text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(251,152,38,0.16),transparent_70%)]" />
      <div className="relative mx-auto flex max-w-[52rem] flex-col items-center gap-7 px-6">
        <p
          data-anim="fade-down"
          className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50"
        >
          AI agent observability
        </p>
        <h1
          data-anim="fade-up"
          data-anim-delay="0.1"
          className="font-sans text-[3.75rem] font-semibold normal-case leading-[1.1] tracking-[-0.06em] text-white md:text-[4.5rem]"
        >
          See why the run failed. Ship with proof.
        </h1>
        <p
          data-anim="fade-up"
          data-anim-delay="0.2"
          className="max-w-[34rem] text-lg font-medium leading-[1.3] tracking-[-0.01em] text-white/60"
        >
          Trace every model call, tool response, and fallback decision — then
          evaluate the fix before it reaches production.
        </p>
        <div data-anim="fade-up" data-anim-delay="0.3" className="flex flex-wrap justify-center gap-4">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-[5rem] bg-white px-8 py-5 text-sm font-semibold text-[#0d2e37] no-underline transition-colors hover:bg-[#fb9826]"
          >
            Start tracing <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-[5rem] bg-white/10 px-8 py-5 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/20"
          >
            Open sample run
          </Link>
        </div>
      </div>
    </section>
  );
}

const STATS = [
  { value: "4", label: "Decision types traced", detail: "Model, tool, retry, and eval events in one timeline." },
  { value: "3", label: "Ingestion transports", detail: "SDK, OpenTelemetry, and plain HTTP." },
  { value: "1", label: "Wrapper to install", detail: "No agent rewrite required." },
];

function StatisticBand() {
  return (
    <section className="relative border-y border-white/10 bg-[#091b20] py-20">
      <LineReveal axis="width" className="absolute inset-x-0 top-0 block h-px bg-white/20" />
      <LineReveal axis="width" delay={0.1} className="absolute inset-x-0 bottom-0 block h-px bg-white/20" />
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 sm:grid-cols-3">
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            data-anim="fade-up"
            data-anim-delay={String(index * 0.15)}
            className={`border-white/10 p-10 sm:border-r last:border-r-0 ${index < STATS.length - 1 ? "border-b sm:border-b-0" : ""}`}
          >
            <p className="text-6xl font-semibold tracking-[-0.06em] text-[#fb9826]">{stat.value}</p>
            <p className="mt-6 text-lg font-semibold tracking-[-0.02em] text-white">{stat.label}</p>
            <p className="mt-2 text-sm font-medium leading-[1.3] text-white/50">{stat.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="bg-[#091b20] px-6 py-20 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-2">
        <Placeholder
          label="Trace preview"
          className="aspect-[4/3] w-full overflow-hidden rounded-none"
        />
        <div data-anim="fade-left" className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/50">
              What the record contains
            </p>
            <h2 className="text-5xl font-semibold leading-[1.1] tracking-[-0.05em] text-white">
              Evidence that survives the handoff.
            </h2>
            <p className="max-w-lg text-lg font-medium leading-[1.3] text-white/60">
              Every run keeps the full decision trail — not just a log line —
              so the next engineer can see exactly what happened.
            </p>
          </div>
          <div data-anim="fade-up" data-anim-stagger="0.12" className="grid grid-cols-2 gap-8">
            {[
              { icon: GitBranch, title: "Full context", body: "Model, tool, and retrieval in one trail." },
              { icon: Gauge, title: "Release evidence", body: "Quality, latency, and cost together." },
              { icon: Radar, title: "Native transport", body: "SDK, OTel, or HTTP." },
              { icon: ShieldCheck, title: "Production trust", body: "Access control and audit built in." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-5 border-b border-white/10 pb-7">
                <Icon className="size-6 text-[#fb9826]" />
                <div>
                  <h3 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-white">{title}</h3>
                  <p className="mt-2 text-sm font-medium text-white/50">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  {
    title: "Trace viewer",
    cost: "Included",
    props: ["Full run timeline", "Model + tool decisions", "Shareable links"],
  },
  {
    title: "Release gates",
    cost: "Pro",
    props: ["Candidate comparison", "Quality thresholds", "Promote / hold decisions"],
  },
];

function FeaturedSection() {
  return (
    <section id="product" className="bg-[#0d2e37] px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <h2 data-anim="fade-up" className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-white">
            Apply the record to the agent you ship.
          </h2>
          <p data-anim="fade-up" data-anim-delay="0.1" className="max-w-sm text-sm font-medium text-white/50">
            Start with the failure mode that costs your team the most time.
          </p>
        </div>
        <div
          data-anim="fade-up"
          data-anim-stagger="0.12"
          className="mt-14 grid gap-px overflow-hidden bg-white/10 sm:grid-cols-2"
        >
          {PLANS.map((plan) => (
            <div key={plan.title} className="grid gap-10 bg-[#0d2e37] p-10 sm:grid-cols-2">
              <div className="flex flex-col justify-between gap-8">
                <div>
                  <h3 className="text-3xl font-semibold tracking-[-0.04em] text-white">{plan.title}</h3>
                  <p className="mt-4 text-2xl font-semibold text-[#fb9826]">{plan.cost}</p>
                </div>
                <ul className="flex flex-col gap-3">
                  {plan.props.map((prop) => (
                    <li key={prop} className="text-sm font-medium text-white/60">
                      {prop}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className="inline-flex w-fit items-center gap-2 rounded-[5rem] bg-white/10 px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#fb9826]"
                >
                  Learn more
                </Link>
              </div>
              <Placeholder label="Preview" className="hidden aspect-square sm:flex" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const COMBINE_STEPS = [
  { title: "Instrument", body: "Wrap the agent call and capture the full run." },
  { title: "Observe", body: "Find the decision that changed the outcome." },
  { title: "Evaluate", body: "Prove the candidate fix actually improves it." },
  { title: "Release", body: "Promote with evidence, not a guess." },
];

function CombineSection() {
  return (
    <section className="relative bg-[#091b20] px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <h2 data-anim="fade-up" className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-white">
          One continuous production feedback loop.
        </h2>
        <div
          data-anim="fade-up"
          data-anim-stagger="0.1"
          className="mt-14 grid gap-px overflow-hidden bg-white/10 md:grid-cols-4"
        >
          {COMBINE_STEPS.map((step, index) => (
            <div key={step.title} className="relative flex flex-col gap-6 bg-[#091b20] p-8">
              <LineReveal
                axis="height"
                delay={index * 0.1}
                className="absolute left-0 top-0 block w-px bg-white/20"
              />
              <span className="text-xs font-semibold text-white/40">0{index + 1}</span>
              <h3 className="mt-16 text-3xl font-semibold tracking-[-0.04em] text-white">{step.title}</h3>
              <p className="text-sm font-medium leading-[1.3] text-white/50">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const HOW_WORKS = [
  { icon: Wrench, title: "Install the wrapper", body: "One import. No agent rewrite." },
  { icon: FlaskConical, title: "Compare candidates", body: "Run the same eval set against each version." },
  { icon: Rocket, title: "Promote with proof", body: "Ship the one with the evidence behind it." },
];

function HowWorksSection() {
  return (
    <section className="bg-[#0d2e37] px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-5 lg:max-w-xl">
          <h2 data-anim="fade-up" className="text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-white">
            One wrapper. A complete record.
          </h2>
          <p data-anim="fade-up" data-anim-delay="0.1" className="text-lg font-medium leading-[1.3] text-white/60">
            Install, trace, and inspect without rebuilding your agent stack.
          </p>
        </div>
        <div data-anim="fade-up" data-anim-stagger="0.15" className="mt-14 grid gap-10 md:grid-cols-3">
          {HOW_WORKS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-5 border-t border-white/10 pt-7">
              <Icon className="size-6 text-[#fb9826]" />
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{title}</h3>
              <p className="text-sm font-medium text-white/50">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TEAM = [
  { name: "Support agent", role: "Escalations, retrieval, handoffs" },
  { name: "Research agent", role: "Sources, browsing, synthesis" },
  { name: "Automation agent", role: "Workflows, retries, stalls" },
  { name: "Tool-calling agent", role: "APIs, loops, hidden spend" },
];

function PractitionersSection() {
  return (
    <section className="bg-[#091b20] px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <h2 data-anim="fade-up" className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-white">
          Built for the agent you actually ship.
        </h2>
        <div data-anim="fade-up" data-anim-stagger="0.12" className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((item) => (
            <div key={item.name} className="flex flex-col gap-5">
              <Placeholder label="" className="aspect-square w-full" />
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">{item.name}</h3>
                <p className="mt-1 text-sm font-medium text-white/50">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="bg-[#0d2e37] px-6 py-20 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-2">
        <Placeholder label="Sample run" className="aspect-[4/3] w-full" />
        <div data-anim="fade-up" className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-white">
              Bring us a run you do not trust.
            </h2>
            <p className="max-w-md text-lg font-medium leading-[1.3] text-white/60">
              We will map the failure, the missing signals, and the first
              useful quality gate together.
            </p>
          </div>
          <form action="/api/leads" method="post" className="flex flex-col gap-4">
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
              className="rounded-none border border-white/20 bg-transparent px-5 py-4 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-white"
            />
            <button
              type="submit"
              className="inline-flex w-fit items-center gap-2 rounded-[5rem] bg-white px-8 py-4 text-sm font-semibold text-[#0d2e37] transition-colors hover:bg-[#fb9826]"
            >
              Book a trace clinic <ArrowRight className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#091b20] px-6 pt-20 text-white lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 border-b border-white/10 pb-14 md:grid-cols-[1fr_auto]">
          <div data-anim="fade-up" className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-[#fb9826]" />
              <span className="text-2xl font-semibold tracking-[-0.05em]">tracify</span>
            </div>
            <p className="max-w-sm text-sm font-medium leading-[1.3] text-white/50">
              The operating record for the agents your team ships.
            </p>
          </div>
          <div
            data-anim="fade-up"
            data-anim-delay="0.1"
            data-anim-stagger="0.08"
            className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3"
          >
            {(
              [
                ["Product", [["Trace viewer", "/product/trace-viewer"], ["Pricing", "/pricing"]]],
                ["Developers", [["Docs", "/docs/quickstart"], ["API reference", "/docs/api"]]],
                ["Company", [["Blog", "/blog"], ["Contact", "/contact"]]],
              ] as Array<[string, Array<[string, string]>]>
            ).map(([title, links]) => (
              <div key={title} className="flex flex-col gap-3 text-sm font-medium">
                <p className="text-white/40">{title}</p>
                {links.map(([label, href]) => (
                  <Link key={href} href={href} className="text-white/70 no-underline hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 py-8 text-xs text-white/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Tracify</p>
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
    </footer>
  );
}

export function DarkHomepage() {
  return (
    <div className="bg-[#091b20] font-sans">
      <ScrollRevealInit />
      <Header />
      <Hero />
      <StatisticBand />
      <AboutSection />
      <FeaturedSection />
      <CombineSection />
      <HowWorksSection />
      <PractitionersSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
