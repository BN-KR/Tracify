export type PaidPlan = "pro" | "team";
export type BillingInterval = "monthly" | "annual";

export function pricingCheckoutHref(plan: PaidPlan, interval: BillingInterval) {
  return `/pricing/checkout?plan=${plan}&interval=${interval}`;
}

