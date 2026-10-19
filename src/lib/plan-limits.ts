import { planById, type PlanId } from "./pricing-plans.ts";

/**
 * Monthly span limits applied when data comes in.
 * Only the free plan is blocked at its limit; paid plans keep recording past theirs (the billing page shows usage and prompts an upgrade).
 * An unknown tier is never blocked, so a backend that has not been redeployed yet cannot lock anyone out.
 */
export function enforcedSpanLimit(tier: string | undefined): number | null {
  if (tier !== "free") return null;
  return planById("free" as PlanId).spanLimit;
}

/** Calendar month in UTC, e.g. "2026-10". Matches the usage meter, which also counts by UTC month. */
export function monthKey(now: Date) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Whole seconds until the next UTC month begins (at least 1). */
export function secondsUntilNextMonth(now: Date) {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

export function planLimitMessage(limit: number) {
  return `This project has used its ${limit.toLocaleString("en-US")} free spans for the month. New data is not saved until the month resets or the project is upgraded.`;
}
