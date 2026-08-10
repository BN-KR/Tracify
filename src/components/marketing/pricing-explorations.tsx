"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    monthly: "$0",
    annual: "$0",
    allowance: "10,000 spans / month",
    note: "For your first production signal",
    href: "/sign-up",
    action: "Start free",
    benefits: ["1 project", "7-day retention", "Community support"],
  },
  {
    name: "Pro",
    monthly: "$19",
    annual: "$15.20",
    allowance: "100,000 spans / month",
    note: "For shipping one production agent",
    href: "/sign-up?intent=beta&plan=pro",
    action: "Start building",
    benefits: ["5 projects", "30-day retention", "3 members + Slack alerts"],
  },
  {
    name: "Team",
    monthly: "$39",
    annual: "$31.20",
    allowance: "1,000,000 spans / month",
    note: "For shared production workflows",
    href: "/sign-up?intent=beta&plan=team",
    action: "Start building",
    benefits: [
      "Unlimited projects",
      "90-day retention",
      "10 members + PDF-ready reports",
    ],
  },
] as const;

function BillingToggle({
  annual,
  onChange,
  light = false,
}: {
  annual: boolean;
  onChange: (annual: boolean) => void;
  light?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-3">
      <div
        className={`inline-flex items-center border p-1 font-mono text-[9px] uppercase tracking-[0.12em] ${light ? "border-black/20" : "border-white/20"}`}
        role="group"
        aria-label="Billing period"
      >
        <button
          type="button"
          onClick={() => onChange(false)}
          aria-pressed={!annual}
          className={`px-3 py-2 transition-colors ${!annual ? (light ? "bg-black text-white" : "bg-white text-black") : "text-zinc-500"}`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          aria-pressed={annual}
          className={`px-3 py-2 transition-colors ${annual ? (light ? "bg-black text-white" : "bg-white text-black") : "text-zinc-500"}`}
        >
          Annual <span className="ml-1 text-[8px]">save 20%</span>
        </button>
      </div>
      <span
        className={`min-w-[112px] font-mono text-[9px] uppercase tracking-[0.12em] ${light ? "text-zinc-600" : "text-zinc-400"}`}
        aria-live="polite"
      >
        {annual ? "Billed annually" : "Billed monthly"}
      </span>
    </div>
  );
}

function PriceDisplay({
  plan,
  annual,
  compact = false,
  light = false,
}: {
  plan: (typeof plans)[number];
  annual: boolean;
  compact?: boolean;
  light?: boolean;
}) {
  const price = annual ? plan.annual : plan.monthly;
  return (
    <span
      className={
        compact
          ? "font-pixel text-4xl tracking-[-0.07em]"
          : "font-pixel text-6xl tracking-[-0.08em]"
      }
    >
      {price}
      <span
        className={`ml-2 align-baseline font-sans text-base font-medium leading-none tracking-normal ${light ? "text-zinc-600" : "text-zinc-400"}`}
      >
        /mo
      </span>
    </span>
  );
}

function PriceLabel({
  number,
  name,
  light = false,
}: {
  number: string;
  name: string;
  light?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between border-b pb-4 font-mono text-[9px] uppercase tracking-[0.17em] ${light ? "border-black/15 text-zinc-500" : "border-white/15 text-zinc-600"}`}
    >
      <span>
        Pricing {number} / {name}
      </span>
      <span>Clear price + benefits</span>
    </div>
  );
}

function Benefits({
  items,
  light = false,
}: {
  items: readonly string[];
  light?: boolean;
}) {
  return (
    <ul className="mt-7 space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className={`flex gap-3 font-mono text-[10px] uppercase leading-5 tracking-[0.08em] ${light ? "text-zinc-700" : "text-zinc-400"}`}
        >
          <Check
            className={`mt-0.5 size-3 shrink-0 ${light ? "text-black" : "text-white"}`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function PlanCard({
  plan,
  annual,
  featured = false,
  light = false,
}: {
  plan: (typeof plans)[number];
  annual: boolean;
  featured?: boolean;
  light?: boolean;
}) {
  const background = light
    ? featured
      ? "bg-black text-white"
      : "bg-[#f0eee8] text-black"
    : featured
      ? "bg-white text-black"
      : "bg-[#080808] text-white";
  const muted = light
    ? featured
      ? "text-zinc-400"
      : "text-zinc-500"
    : featured
      ? "text-zinc-600"
      : "text-zinc-500";
  const action = light
    ? featured
      ? "bg-white text-black"
      : "border border-black/20"
    : featured
      ? "bg-black text-white"
      : "border border-white/20";
  return (
    <article
      className={`flex flex-col border ${light ? "border-black/15" : "border-white/15"} ${background} p-7`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-pixel text-4xl tracking-[-0.06em]">
            {plan.name}
          </h3>
          <p
            className={`mt-2 font-mono text-[9px] uppercase tracking-[0.12em] ${muted}`}
          >
            {plan.note}
          </p>
        </div>
        {featured && (
          <span
            className={`border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${light ? "border-white/20" : "border-black/15"}`}
          >
            Most chosen
          </span>
        )}
      </div>
      <div className="mt-9 border-b border-current/10 pb-6">
        <p>
          <PriceDisplay plan={plan} annual={annual} light={light} />
        </p>
        <p
          className={`mt-3 font-mono text-[9px] uppercase tracking-[0.12em] ${muted}`}
        >
          {plan.allowance}
        </p>
      </div>
      <Benefits items={plan.benefits} light={light ? !featured : featured} />
      <Link
        href={plan.href}
        className={`mt-10 flex h-11 items-center justify-between px-4 font-mono text-[9px] uppercase tracking-[0.14em] ${action}`}
      >
        {plan.action}
        <ArrowRight className="size-3" />
      </Link>
    </article>
  );
}

export function PricingExplorations() {
  const [annual, setAnnual] = useState(false);
  return (
    <section
      aria-label="Pricing design explorations"
      className="border-t-4 border-double border-white/30 bg-black"
    >
      <div className="border-b border-white/15 px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
            Pricing exploration gallery
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <BillingToggle annual={annual} onChange={setAnnual} />
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">
              Five directions
            </p>
          </div>
        </div>
      </div>

      <section
        id="pricing-editorial"
        className="border-b border-white/15 px-6 py-20 md:px-10 md:py-24"
      >
        <div className="mx-auto max-w-[1240px]">
          <PriceLabel number="01" name="editorial cards" />
          <div className="flex flex-col justify-between gap-8 py-12 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Monthly pricing, plainly stated
              </p>
              <h2 className="mt-5 max-w-[730px] font-pixel text-6xl font-normal leading-[0.84] tracking-[-0.07em] md:text-8xl">
                Choose the room your agent needs to operate.
              </h2>
            </div>
            <p className="max-w-[350px] text-sm leading-7 text-zinc-400">
              Every card tells you the price, volume, retention, team access,
              and included operations before you commit.
            </p>
          </div>
          <div className="grid gap-px border border-white/15 bg-white/15 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                annual={annual}
                featured={index === 1}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-600">
            <span>Beta access is currently free.</span>
            <Link
              href="/pricing"
              className="flex items-center gap-2 hover:text-white"
            >
              Full pricing details <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="pricing-plan-trio"
        className="border-b border-black/15 bg-[#f0eee8] px-6 py-20 text-black md:px-10 md:py-24"
      >
        <div className="mx-auto max-w-[1240px]">
          <PriceLabel number="02" name="price-first trio" light />
          <div className="grid gap-12 py-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Start free. Upgrade on evidence.
              </p>
              <h2 className="mt-6 max-w-[480px] font-pixel text-6xl font-normal leading-[0.84] tracking-[-0.07em] md:text-8xl">
                No surprises between you and production.
              </h2>
              <p className="mt-6 max-w-[410px] text-lg leading-8 text-zinc-600">
                Free gives you a real working baseline. Pro and Team unlock the
                capacity and collaboration to ship reliably.
              </p>
              <Link
                href="/pricing"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em]"
              >
                Compare every feature <ArrowUpRight className="size-3" />
              </Link>
            </div>
            <div className="grid gap-px border border-black/15 bg-black/15 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan.name}
                  plan={plan}
                  annual={annual}
                  featured={index === 1}
                  light
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing-usage-ledger"
        className="border-b border-white/15 bg-[#060606] px-6 py-20 md:px-10 md:py-24"
      >
        <div className="mx-auto max-w-[1240px]">
          <PriceLabel number="03" name="decision table" />
          <div className="py-12">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Compare the operational facts
                </p>
                <h2 className="mt-5 max-w-[770px] font-pixel text-6xl font-normal leading-[0.84] tracking-[-0.07em] md:text-8xl">
                  Everything you need to choose a plan.
                </h2>
              </div>
              <p className="max-w-[340px] text-sm leading-7 text-zinc-400">
                Price, span capacity, retention, people, and the benefits that
                change as your operating surface grows.
              </p>
            </div>
            <div className="mt-12 overflow-x-auto border border-white/15">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[1.12fr_0.96fr_0.96fr_0.96fr] border-b border-white/15 bg-[#0b0b0b] font-mono text-[9px] uppercase tracking-[0.14em]">
                  <span className="p-5 text-zinc-600">Plan</span>
                  {plans.map((plan) => (
                    <span
                      key={plan.name}
                      className="border-l border-white/15 p-5"
                    >
                      {plan.name}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-[1.12fr_0.96fr_0.96fr_0.96fr] border-b border-white/15 font-pixel text-5xl tracking-[-0.07em]">
                  <span className="p-5 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600">
                    {annual ? "Annual price / mo" : "Monthly price"}
                  </span>
                  {plans.map((plan) => (
                    <span
                      key={plan.name}
                      className="border-l border-white/15 p-5"
                    >
                      <PriceDisplay plan={plan} annual={annual} compact />
                    </span>
                  ))}
                </div>
                {[
                  [
                    "Included volume",
                    "10,000 spans",
                    "100,000 spans",
                    "1,000,000 spans",
                  ],
                  ["Retention", "7 days", "30 days", "90 days"],
                  ["Projects", "1", "5", "Unlimited"],
                  ["Members", "1", "3", "10"],
                  [
                    "Key benefits",
                    "Trace viewer + cost",
                    "Slack alerts + 5 projects",
                    "Reports + shared workflow",
                  ],
                ].map(([label, free, pro, team]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[1.12fr_0.96fr_0.96fr_0.96fr] border-b border-white/10 font-mono text-[10px]"
                  >
                    <span className="p-5 text-zinc-500">{label}</span>
                    <span className="border-l border-white/10 p-5 text-zinc-400">
                      {free}
                    </span>
                    <span className="border-l border-white/10 p-5">{pro}</span>
                    <span className="border-l border-white/10 p-5">{team}</span>
                  </div>
                ))}
                <div className="grid grid-cols-[1.12fr_0.96fr_0.96fr_0.96fr] bg-[#0b0b0b] p-5">
                  <span />
                  {plans.map((plan) => (
                    <Link
                      key={plan.name}
                      href={plan.href}
                      className="border-l border-white/15 pl-5 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-500 hover:text-white"
                    >
                      {plan.action} →
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing-ledger-light"
        className="border-b border-black/15 bg-white px-6 py-20 text-black md:px-10 md:py-24"
      >
        <div className="mx-auto max-w-[1240px]">
          <PriceLabel number="04" name="stacked plan ledger" light />
          <div className="grid gap-12 py-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                A plan at a glance
              </p>
              <h2 className="mt-5 max-w-[510px] font-pixel text-6xl font-normal leading-[0.84] tracking-[-0.07em] md:text-8xl">
                The price and the payoff, side by side.
              </h2>
              <p className="mt-6 max-w-[430px] text-lg leading-8 text-zinc-600">
                Designed for a buyer scanning quickly: each row exposes the
                monthly price and the exact benefits included.
              </p>
              <Link
                href="/sign-up"
                className="mt-8 inline-flex h-12 items-center gap-3 bg-black px-6 font-mono text-[10px] uppercase tracking-[0.14em] text-white"
              >
                Start free <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="border-t border-l border-black/15">
              {plans.map((plan, index) => (
                <article
                  key={plan.name}
                  className={`grid gap-5 border-b border-r border-black/15 p-6 md:grid-cols-[1fr_auto_1.15fr_auto] md:items-center ${index === 1 ? "bg-[#f4f2eb]" : ""}`}
                >
                  <div>
                    <h3 className="font-pixel text-4xl tracking-[-0.06em]">
                      {plan.name}
                    </h3>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.11em] text-zinc-500">
                      {plan.allowance}
                    </p>
                  </div>
                  <p>
                    <PriceDisplay plan={plan} annual={annual} compact light />
                  </p>
                  <ul className="space-y-2 font-mono text-[9px] uppercase leading-5 tracking-[0.08em] text-zinc-600">
                    {plan.benefits.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 size-3 text-black" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className="inline-flex h-10 items-center gap-2 border border-black/20 px-4 font-mono text-[9px] uppercase tracking-[0.12em]"
                  >
                    Choose <ArrowRight className="size-3" />
                  </Link>
                </article>
              ))}
              <article className="grid gap-5 border-b border-r border-black/15 p-6 md:grid-cols-[1fr_auto_1.15fr_auto] md:items-center">
                <div>
                  <h3 className="font-pixel text-4xl tracking-[-0.06em]">
                    Enterprise
                  </h3>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.11em] text-zinc-500">
                    Unlimited capacity
                  </p>
                </div>
                <p className="font-pixel text-4xl tracking-[-0.06em]">Custom</p>
                <ul className="space-y-2 font-mono text-[9px] uppercase leading-5 tracking-[0.08em] text-zinc-600">
                  <li>SSO + audit logs</li>
                  <li>Custom retention</li>
                  <li>On-prem deployment</li>
                </ul>
                <Link
                  href="/contact"
                  className="inline-flex h-10 items-center gap-2 border border-black/20 px-4 font-mono text-[9px] uppercase tracking-[0.12em]"
                >
                  Talk to us <ArrowUpRight className="size-3" />
                </Link>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing-enterprise"
        className="bg-[#090909] px-6 py-20 md:px-10 md:py-24"
      >
        <div className="mx-auto max-w-[1240px]">
          <PriceLabel number="05" name="enterprise path" />
          <div className="grid gap-12 py-12 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Need more than a monthly plan?
              </p>
              <h2 className="mt-5 max-w-[720px] font-pixel text-6xl font-normal leading-[0.84] tracking-[-0.07em] md:text-8xl">
                Enterprise is priced around your operating requirements.
              </h2>
              <p className="mt-7 max-w-[580px] text-lg leading-8 text-zinc-400">
                Custom pricing is for teams that need unlimited volume, security
                controls, deployment choice, and a support path built for
                critical workloads.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center gap-3 bg-white px-6 font-mono text-[10px] uppercase tracking-[0.14em] text-black"
                >
                  Design your plan <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/security"
                  className="inline-flex h-12 items-center gap-3 border border-white/20 px-6 font-mono text-[10px] uppercase tracking-[0.14em]"
                >
                  Security overview <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </div>
            <div className="border border-white/15 bg-black">
              <div className="border-b border-white/15 p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                  Enterprise includes
                </p>
                <p className="mt-4 font-pixel text-5xl tracking-[-0.06em]">
                  Custom pricing
                </p>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                  For unlimited spans and tailored controls
                </p>
              </div>
              <div className="divide-y divide-white/10">
                {[
                  ["Unlimited spans", "No monthly capacity ceiling"],
                  ["Custom retention", "Match your policy and reporting needs"],
                  ["SSO + audit logs", "SAML / OIDC and access visibility"],
                  ["Deployment options", "Managed or on-prem"],
                  ["Dedicated support", "A direct path for critical issues"],
                ].map(([title, body]) => (
                  <div key={title} className="p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em]">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/15 p-5">
                <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-500">
                  <Sparkles className="size-3" /> Prefer self-serve? Pro starts
                  at {annual ? "$15.20" : "$19"} / mo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-white/15 bg-black px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
            End of pricing explorations 01–05
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600">
            Existing pricing page remains unchanged
          </p>
        </div>
      </div>
    </section>
  );
}
