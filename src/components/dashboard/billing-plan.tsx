"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Check, BarChart3, Users, Shield } from "lucide-react";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    audience: "Experimenting with agents",
    popular: false,
    note: undefined,
    icon: undefined,
    features: ["50k spans / month", "7-day retention", "1 project", "1 team member"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    note: "/mo — Beta",
    audience: "Production agents",
    popular: true,
    icon: BarChart3,
    features: ["500k spans / month", "90-day retention", "10 projects", "5 team members", "Slack alerts", "Run replay"],
  },
  {
    id: "team",
    name: "Team",
    price: "$99",
    note: "/mo — Beta",
    audience: "Shared agent operations",
    popular: false,
    icon: Users,
    features: ["5M spans / month", "1-year retention", "Unlimited projects", "Eval engine", "SOC 2 reports", "SLA support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    audience: "Compliance, SSO, retention, deployment needs",
    popular: false,
    note: undefined,
    icon: Shield,
    features: ["Unlimited spans", "Custom retention", "SSO / SAML", "On-prem option", "Audit logs", "Dedicated engineer"],
  },
] as const;

export function BillingPlan({ projectId }: { projectId: string }) {
  const summary = useQuery(api.projects.getProjectManagementSummary, {
    projectId: projectId as Id<"projects">,
  });

  if (summary === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-none" />
        <Skeleton className="h-80 w-full rounded-none" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="border border-[#2A2A2A] bg-[#111111] p-6 font-mono text-sm text-[#999999]">
        Project not found or access denied.
      </div>
    );
  }

  const currentPlan = summary.project.planTier ?? "free";

  return (
    <div className="space-y-10">
      <div className="grid gap-4 md:grid-cols-3">
        <UsageCard
          label="Current plan"
          value={currentPlan}
          detail="From project metadata"
        />
        <UsageCard
          label="Saved spend"
          value={formatCurrency(summary.totals.totalCostUsd)}
          detail={`${summary.totals.totalRuns.toLocaleString()} saved runs`}
        />
        <UsageCard
          label="Saved spans"
          value={summary.totals.totalSpans.toLocaleString()}
          detail={`${summary.totals.failedRuns.toLocaleString()} failed runs`}
        />
      </div>

      <div className="border border-[#2A2A2A] bg-[#111111] p-5">
        <div className="font-mono text-[11px] uppercase tracking-widest text-white">
          Beta billing status
        </div>
        <p className="mt-2 max-w-3xl font-mono text-[12px] leading-relaxed text-[#777777]">
          Stripe checkout is not enabled in this build. Usage above is real saved
          project usage; plan changes are handled through the beta access process
          until billing is connected.
        </p>
      </div>

      <div>
        <h3 className="font-mono text-sm uppercase tracking-widest text-white">
          Plans
        </h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              current={plan.id === currentPlan}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function UsageCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="rounded-none border-[#2A2A2A] bg-[#111111] p-5 shadow-none">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#666666]">
        {label}
      </div>
      <div className="mt-3 font-mono text-2xl uppercase text-white">{value}</div>
      <div className="mt-2 font-mono text-[11px] text-[#777777]">{detail}</div>
    </Card>
  );
}

function PlanCard({
  plan,
  current,
}: {
  plan: (typeof PLANS)[number];
  current: boolean;
}) {
  const Icon = plan.icon;

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col rounded-none border p-5 shadow-none transition-all duration-200 hover:-translate-y-0.5",
        plan.popular && !current
          ? "border-white bg-[#161616]"
          : current
            ? "border-white bg-[#161616]"
            : "border-[#2A2A2A] bg-[#111111] hover:border-[#555555]",
      )}
    >
      {plan.popular && !current && (
        <div className="absolute -top-[1px] left-5 -translate-y-full bg-white px-2.5 py-1">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-black">
            Most popular
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex size-8 items-center justify-center border border-[#2A2A2A]">
              <Icon className="size-4 text-white" />
            </div>
          )}
          <div>
            <h4 className="font-mono text-base uppercase text-white">{plan.name}</h4>
            <p className="mt-0.5 font-mono text-[11px] text-[#777777]">
              {plan.audience}
            </p>
          </div>
        </div>
        {current ? (
          <span className="bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-black">
            Current
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl text-white">{plan.price}</span>
        {plan.note && (
          <span className="font-mono text-[10px] text-[#555555]">{plan.note}</span>
        )}
      </div>
      <ul className="mt-5 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-3 font-mono text-[11px] text-[#CCCCCC]"
          >
            <Check className="size-3 shrink-0 text-white" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {current ? (
        <div className="mt-8 border border-[#2A2A2A] px-3 py-2 text-center font-mono text-[10px] uppercase text-[#777777]">
          Active plan
        </div>
      ) : (
        <Link
          href="/sign-up?intent=beta"
          className="mt-8 block border border-[#2A2A2A] px-3 py-2 text-center font-mono text-[10px] uppercase text-[#CCCCCC] transition-colors hover:border-white hover:text-white"
        >
          Start building
        </Link>
      )}
    </Card>
  );
}
