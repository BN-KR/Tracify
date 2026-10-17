"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useConvexAuthReadiness } from "@/hooks/use-convex-auth-readiness";
import { pricingCheckoutHref } from "@/lib/billing-links";
import { planById } from "@/lib/pricing-plans";

const WARN_AT = 0.8;

/** Shows a calm heads-up near the plan's monthly span limit, and a clear upgrade prompt once it is passed. */
export function UpgradeBanner({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuthReadiness();
  const usage = useQuery(
    api.billing.getMonthlyUsage,
    isAuthenticated ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  if (!usage || usage.planTier === "enterprise" || pathname.endsWith("/billing")) return null;
  const plan = planById(usage.planTier);
  const ratio = usage.spans / plan.spanLimit;
  if (ratio < WARN_AT) return null;

  const next = usage.planTier === "free" ? "pro" : usage.planTier === "pro" ? "team" : null;
  const over = ratio >= 1;
  const percent = Math.min(999, Math.round(ratio * 100));
  const message = `You've used ${percent}% of this month's ${plan.spans} spans on the ${plan.name} plan.`;

  return (
    <div
      role="status"
      className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 font-mono text-[11px] ${
        over ? "border-black bg-[#f4d44d] text-black" : "border-black/15 bg-[#fff4b5] text-black"
      }`}
    >
      <span>
        {message}{" "}
        {over ? "Upgrade to keep every run visible." : "Upgrade before you run out."}
      </span>
      <Link
        href={next ? pricingCheckoutHref(next, "monthly") : "/contact"}
        className="inline-flex items-center gap-2 bg-black px-3 py-2 uppercase tracking-[0.12em] text-white hover:bg-black/85"
      >
        {next ? `Upgrade to ${planById(next).name}` : "Talk to us"} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
