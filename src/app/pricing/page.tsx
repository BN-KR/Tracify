"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";

const PLANS = [
  {
    name: "Pro",
    price: "$19",
    note: "/mo",
    cta: "Start building",
    href: "/sign-up?intent=beta&plan=pro",
    popular: true,
    lines: [
      ["spans", "100,000 / mo"],
      ["retention", "30 days"],
      ["projects", "5"],
      ["members", "3"],
      ["alerts", "Slack"],
    ],
  },
  {
    name: "Team",
    price: "$39",
    note: "/mo",
    cta: "Start building",
    href: "/sign-up?intent=beta&plan=team",
    popular: false,
    lines: [
      ["spans", "1,000,000 / mo"],
      ["retention", "90 days"],
      ["projects", "unlimited"],
      ["members", "10"],
      ["alerts", "Slack"],
      ["reports", "PDF-ready"],
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    cta: "Contact us",
    href: "mailto:sales@tracify.tech",
    popular: false,
    lines: [
      ["spans", "unlimited"],
      ["retention", "custom"],
      ["SSO", "SAML / OIDC"],
      ["audit logs", "included"],
      ["deployment", "on-prem"],
    ],
  },
];

const WORKING = [
  "Python SDK (pip install 5to1r)",
  "TypeScript SDK (npm install 5to1r)",
  "Trace viewer with span timeline",
  "Cost dashboard with real spend",
  "Slack threshold alerts",
  "Team member management",
  "API key rotation & access control",
  "Print-friendly project reports",
];

const ROADMAP = [
  "Run replay",
  "Eval engine",
  "Email alerts",
  "Runtime cost ceilings",
  "PDF export",
];

const FAQ = [
  {
    q: "What counts as a span?",
    a: "A single traced operation — an LLM call, tool execution, or logic step. Most production agent runs generate 5–50 spans.",
  },
  {
    q: "What happens during the beta?",
    a: "Full access at no charge. Beta users lock in the published rate for 12 months after billing launches.",
  },
  {
    q: "Can I switch plans?",
    a: "Yes. Upgrades apply immediately. Downgrades take effect at the start of the next billing cycle.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes — 20% off with annual billing.",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

export default function PricingPage() {
  const [mounted] = useState(true);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="pt-[60px]">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-[#1A1A1A] py-28">
          <DotPattern className="fill-[#ffffff]/[0.025]" />
          <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.3em] text-[#666666]">
                <span className="h-px w-6 bg-[#666666]" />
                Pricing
              </div>
              <h1
                className="font-pixel text-white font-bold uppercase leading-[0.9] tracking-tighter"
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: "clamp(44px, 7vw, 90px)",
                }}
              >
                Pricing that doesn&apos;t
                <br />
                <span className="text-[#555555]">waste your time.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#888888]">
                10,000 free spans to try the full product. Paid plans start at $19/mo.
                No credit card required.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Plans ─────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="mx-auto max-w-[1200px] px-6 md:px-8">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {PLANS.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                  className={`flex flex-col border bg-[#0A0A0A] ${
                    plan.popular ? "border-white" : "border-[#2A2A2A]"
                  }`}
                >
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 border-b border-[#1A1A1A] bg-[#080808] px-4 py-2.5 font-mono text-[11px] text-[#555555]">
                    <span className="text-[#10B981]">$</span>
                    <span>./plan</span>
                    <span className="text-[#666666]">--{plan.name.toLowerCase()}</span>
                    {plan.popular && (
                      <>
                        <span className="ml-auto text-[#444444]">#</span>
                        <span className="text-[#666666]">recommended</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6 pt-5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-5xl tracking-tight text-white">
                        {plan.price}
                      </span>
                      {plan.note && (
                        <span className="font-mono text-[13px] text-[#555555]">
                          {plan.note}
                        </span>
                      )}
                    </div>

                    <div className="mt-6 flex-1 space-y-2.5">
                      {plan.lines.map(([key, val]) => (
                        <div key={key} className="flex items-center gap-3 font-mono text-[13px]">
                          <span className="text-[#444444]">&gt;</span>
                          <span className="text-[#666666]">{key}</span>
                          <span className="ml-auto text-[#CCCCCC]">{val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-8">
                      <Link href={plan.href}>
                        <Button
                          variant={plan.popular ? "default" : "secondary"}
                          className={`h-11 w-full rounded-none font-mono text-[12px] uppercase tracking-widest transition-all duration-200 ${
                            plan.popular ? "hover:bg-[#CCCCCC]" : "hover:bg-[#1A1A1A] hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {plan.cta}
                            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                          </span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Free plan */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-6 border border-[#2A2A2A] bg-[#0A0A0A] transition-colors hover:border-[#555555]"
            >
              <div className="flex items-center gap-2 border-b border-[#1A1A1A] bg-[#080808] px-5 py-3 font-mono text-[11px] text-[#555555]">
                <span className="text-[#10B981]">$</span>
                <span>./plan</span>
                <span className="text-[#666666]">--free</span>
              </div>
              <div className="flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-8">
                  <div className="shrink-0">
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#666666]">
                      Experimenting
                    </div>
                    <div className="mt-2 font-mono text-3xl uppercase text-white">Free</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-mono text-4xl tracking-tight text-white">$0</span>
                      <span className="font-mono text-[12px] text-[#555555]">/ mo</span>
                    </div>
                  </div>
                  <div className="hidden h-16 w-px bg-[#1A1A1A] md:block" />
                  <div className="grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-[#555555]">Spans</div>
                      <div className="mt-0.5 font-mono text-[14px] text-white">10,000 / mo</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-[#555555]">Retention</div>
                      <div className="mt-0.5 font-mono text-[14px] text-white">7 days</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-[#555555]">Projects</div>
                      <div className="mt-0.5 font-mono text-[14px] text-white">1</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-[#555555]">Support</div>
                      <div className="mt-0.5 font-mono text-[14px] text-white">Community</div>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <Link href="/sign-up">
                    <Button
                      variant="secondary"
                      className="h-11 rounded-none font-mono text-[11px] uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white"
                    >
                      Start free
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Disclaimer ────────────────────────────────────────────── */}
        <section className="border-y border-[#1A1A1A] bg-black py-12">
          <div className="mx-auto max-w-[1200px] px-6 md:px-8">
            <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-6 text-center">
              <p className="font-mono text-[12px] uppercase tracking-widest text-[#555555]">
                Prompt workflows, evaluations, experiments, runtime controls, and integrations are available now. Contact us for production self-hosting and alerting setup.
              </p>
            </div>
          </div>
        </section>

        {/* ── Working / Roadmap ─────────────────────────────────────── */}
        <Section title="What ships today vs what is next">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-8">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-white">
                Working in beta
              </h2>
              <div className="mt-6 space-y-2">
                {WORKING.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-4 py-1.5 font-mono text-[12px] uppercase tracking-wider"
                  >
                    <span className="text-[#CCCCCC]">{item}</span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-8">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#666666]">
                On the roadmap
              </h2>
              <div className="mt-6 space-y-2">
                {ROADMAP.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-4 py-1.5 font-mono text-[12px] uppercase tracking-wider"
                  >
                    <span className="text-[#444444]">{item}</span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#333333]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── FAQ ────────────────────────────────────────────────────── */}
        <Section title="Frequently asked questions" className="border-y border-[#1A1A1A] bg-black py-20">
          <div className="mx-auto max-w-[700px]">
            <div className="divide-y divide-[#1A1A1A]">
              {FAQ.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between font-mono text-[14px] text-white transition-colors hover:text-[#CCCCCC] [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown className="size-4 shrink-0 text-[#555555] transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-[#777777]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
            <div className="mt-10 border border-[#2A2A2A] bg-[#0A0A0A] p-6 text-center">
              <p className="font-mono text-[12px] text-[#777777]">
                Still have questions?{" "}
                <Link href="mailto:sales@tracify.tech" className="text-white underline underline-offset-2 transition-colors hover:text-[#CCCCCC]">
                  Email us
                </Link>
              </p>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  const [ref, inView] = useInView(0.1);
  return (
    <section ref={ref} className={className}>
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="mb-10 inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.3em] text-[#666666]">
            <span className="h-px w-6 bg-[#666666]" />
            {title}
          </div>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
