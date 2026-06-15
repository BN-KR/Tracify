"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Free",
    audience: "Experimenting",
    price: "$0",
    cta: "Start free",
    href: "/sign-up",
    features: [
      "Send real spans",
      "Inspect traces",
      "Cost dashboard",
      "One project",
    ],
  },
  {
    name: "Pro",
    audience: "Production agents",
    price: "Beta",
    cta: "Join beta",
    href: "/sign-up?intent=beta&plan=pro",
    features: [
      "Higher usage limits",
      "Slack alerts",
      "Print-friendly reports",
      "Longer history",
    ],
  },
  {
    name: "Team",
    audience: "Shared agent ops",
    price: "Beta",
    cta: "Join beta",
    href: "/sign-up?intent=beta&plan=team",
    features: [
      "Team members",
      "Project management",
      "Role-aware settings",
      "Operator workflows",
    ],
  },
  {
    name: "Enterprise",
    audience: "Compliance and scale",
    price: "Contact",
    cta: "Contact sales",
    href: "mailto:sales@tracify.tech",
    features: [
      "Custom retention",
      "SSO planning",
      "Security review",
      "Deployment needs",
    ],
  },
];

export function PricingTeaser() {
  return (
    <section className="w-full bg-[#050505] pt-16 pb-[72px]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[760px]">
            <div className="mb-5 font-mono text-[12px] uppercase tracking-[0.3em] text-[#666666]">
              Pricing
            </div>
            <h2
              className="font-pixel text-white font-bold tracking-tighter uppercase leading-tight"
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "clamp(28px, 5vw, 40px)",
              }}
            >
              Start with traces. Scale into operations.
            </h2>
            <p className="mt-4 text-[#999999] text-[15px] leading-relaxed">
              Beta pricing is intentionally honest: use the working observability
              loop now, then upgrade when your agents need shared reporting,
              alerts, and operational controls.
            </p>
          </div>
          <Link
            href="/pricing"
            className="font-mono text-[11px] uppercase tracking-widest text-[#CCCCCC] transition-colors hover:text-white"
          >
            View pricing details
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-4">
          {PLANS.map((plan, index) => (
            <div
              key={plan.name}
              className="flex h-full flex-col border border-[#2A2A2A] bg-[#0A0A0A] p-6 md:-ml-px md:first:ml-0"
              style={{ marginTop: index === 0 ? 0 : undefined }}
            >
              <div className="flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666666]">
                  {plan.name}
                </div>
                <p className="mt-2 h-10 text-[13px] leading-relaxed text-[#999999]">
                  {plan.audience}
                </p>
                <div className="mt-6 font-mono text-3xl text-white">
                  {plan.price}
                </div>
                <div className="mt-6 h-px bg-[#1A1A1A]" />
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center justify-between gap-4 border-b border-[#1A1A1A]/70 pb-2 font-mono text-[11px]"
                    >
                      <span className="uppercase tracking-wider text-[#444444]">
                        {feature}
                      </span>
                      <span className="h-1.5 w-1.5 bg-white" />
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={plan.href} className="mt-8">
                <Button
                  variant={plan.name === "Free" ? "default" : "secondary"}
                  className="h-11 w-full uppercase tracking-widest"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 border border-[#2A2A2A] bg-[#0A0A0A] p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#666666]">
            Runtime controls, evals, self-hosting, email alerts, and PDF export
            are roadmap items, not current beta promises.
          </p>
        </div>
      </div>
    </section>
  );
}
