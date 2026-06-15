import Link from "next/link";
import { Check, Minus } from "lucide-react";

import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Free",
    for: "Experimenting",
    price: "$0",
    action: "Start free",
    href: "/sign-up",
    description: "For builders proving an agent workflow before production.",
    included: [
      "SDK ingest",
      "Trace viewer",
      "Run summaries",
      "Cost dashboard",
      "One project",
    ],
    unavailable: ["Team operations", "Custom retention"],
  },
  {
    name: "Pro",
    for: "Production agents",
    price: "Beta",
    action: "Join beta",
    href: "/sign-up?intent=beta&plan=pro",
    description: "For teams shipping agents that need cost and failure visibility.",
    included: [
      "Higher beta usage",
      "Slack alerts",
      "Reports",
      "Longer history",
      "Priority beta feedback",
    ],
    unavailable: ["Enterprise SSO", "Custom deployment"],
  },
  {
    name: "Team",
    for: "Shared agent operations",
    price: "Beta",
    action: "Join beta",
    href: "/sign-up?intent=beta&plan=team",
    description: "For product and engineering teams operating multiple agents.",
    included: [
      "Team members",
      "Role-aware settings",
      "Project management",
      "Client/workspace labels",
      "Operator reporting",
    ],
    unavailable: ["SOC 2 package", "Dedicated deployment"],
  },
  {
    name: "Enterprise",
    for: "Compliance, SSO, retention",
    price: "Contact",
    action: "Contact sales",
    href: "mailto:sales@tracify.tech",
    description: "For organizations with procurement, security, and retention needs.",
    included: [
      "Security review",
      "SSO planning",
      "Custom retention",
      "Deployment requirements",
      "Roadmap alignment",
    ],
    unavailable: [],
  },
];

const CURRENTLY_WORKING = [
  "Python and TypeScript SDK ingest",
  "Valid and invalid API key handling",
  "Runs table and trace viewer",
  "Cost dashboard with cached fallback",
  "Slack alert test and threshold alerts",
  "Team member view and guarded settings",
  "Print-friendly project reports",
];

const ROADMAP = [
  "Runtime cost ceilings",
  "Retry and tool-call limits",
  "Saved trace-to-test conversion",
  "Full eval layer",
  "Email alerts",
  "PDF export",
  "Enterprise SSO package",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="pt-[60px]">
        <section className="border-b border-[#1A1A1A] py-20">
          <div className="mx-auto max-w-[1200px] px-6 md:px-8">
            <div className="max-w-3xl">
              <div className="mb-6 font-mono text-[12px] uppercase tracking-[0.3em] text-[#666666]">
                Pricing
              </div>
              <h1
                className="font-pixel text-white font-bold uppercase leading-none tracking-tighter"
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: "clamp(44px, 7vw, 82px)",
                }}
              >
                Agent observability for every stage.
              </h1>
              <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#999999]">
                Free is for testing. Pro is for production agents. Team is for
                shared operations. Enterprise is for security, SSO, retention,
                and deployment requirements. Checkout is disabled during beta.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-0 px-6 md:grid-cols-4 md:px-8">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className="flex min-h-[560px] flex-col border border-[#2A2A2A] bg-[#0A0A0A] p-6 md:-ml-px md:first:ml-0"
              >
                <div className="flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#666666]">
                    {plan.for}
                  </div>
                  <h2 className="mt-3 font-mono text-xl uppercase text-white">
                    {plan.name}
                  </h2>
                  <p className="mt-3 min-h-16 text-[13px] leading-relaxed text-[#999999]">
                    {plan.description}
                  </p>
                  <div className="mt-6 font-mono text-3xl text-white">
                    {plan.price}
                  </div>
                  <div className="mt-6 h-px bg-[#1A1A1A]" />
                  <ul className="mt-6 space-y-3">
                    {plan.included.map((item) => (
                      <li key={item} className="flex gap-3 text-[12px] text-[#CCCCCC]">
                        <Check className="mt-0.5 size-3 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                    {plan.unavailable.map((item) => (
                      <li key={item} className="flex gap-3 text-[12px] text-[#555555]">
                        <Minus className="mt-0.5 size-3 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={plan.href} className="mt-8">
                  <Button
                    variant={plan.name === "Free" ? "default" : "secondary"}
                    className="h-11 w-full rounded-none font-mono text-[11px] uppercase tracking-widest"
                  >
                    {plan.action}
                  </Button>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#1A1A1A] bg-black py-16">
          <div className="mx-auto grid max-w-[1200px] gap-8 px-6 md:grid-cols-2 md:px-8">
            <CapabilityList title="Working in beta" rows={CURRENTLY_WORKING} />
            <CapabilityList title="Roadmap, not a promise yet" rows={ROADMAP} muted />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CapabilityList({
  title,
  rows,
  muted = false,
}: {
  title: string;
  rows: string[];
  muted?: boolean;
}) {
  return (
    <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-6">
      <h2 className="font-mono text-[12px] uppercase tracking-[0.25em] text-white">
        {title}
      </h2>
      <div className="mt-6 divide-y divide-[#1A1A1A]">
        {rows.map((row) => (
          <div
            key={row}
            className="flex items-center justify-between gap-4 py-3 font-mono text-[11px] uppercase tracking-wider"
          >
            <span className={muted ? "text-[#555555]" : "text-[#CCCCCC]"}>
              {row}
            </span>
            <span className={muted ? "h-1.5 w-1.5 bg-[#333333]" : "h-1.5 w-1.5 bg-white"} />
          </div>
        ))}
      </div>
    </div>
  );
}
