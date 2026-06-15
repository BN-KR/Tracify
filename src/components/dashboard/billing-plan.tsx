"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Check } from "lucide-react";

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
    features: ["50k spans / month", "7-day retention", "1 project", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "Beta",
    audience: "Production agents",
    features: ["Higher span volume", "Cost and reliability reporting", "Slack alerts", "Longer retention"],
  },
  {
    id: "team",
    name: "Team",
    price: "Beta",
    audience: "Shared agent operations",
    features: ["Team members", "RBAC controls", "Project management", "Operator workflows"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Contact",
    audience: "Compliance, SSO, retention, deployment needs",
    features: ["Custom retention", "Security review", "SSO roadmap", "Dedicated deployment planning"],
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
  return (
    <Card
      className={cn(
        "flex h-full flex-col rounded-none border p-5 shadow-none",
        current ? "border-white bg-[#161616]" : "border-[#2A2A2A] bg-[#111111]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-mono text-base uppercase text-white">{plan.name}</h4>
          <p className="mt-1 font-mono text-[11px] text-[#777777]">
            {plan.audience}
          </p>
        </div>
        {current ? (
          <span className="bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-black">
            Current
          </span>
        ) : null}
      </div>
      <div className="mt-5 font-mono text-2xl text-white">{plan.price}</div>
      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-3 font-mono text-[11px] text-[#CCCCCC]"
          >
            <Check className="size-3 text-white" />
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
          className="mt-8 border border-[#2A2A2A] px-3 py-2 text-center font-mono text-[10px] uppercase text-[#CCCCCC] transition-colors hover:border-white hover:text-white"
        >
          Join beta
        </Link>
      )}
    </Card>
  );
}
