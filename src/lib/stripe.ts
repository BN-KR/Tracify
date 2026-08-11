import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

export const stripePriceIds = {
  pro: { monthly: process.env.STRIPE_PRICE_PRO_MONTHLY, annual: process.env.STRIPE_PRICE_PRO_ANNUAL },
  team: { monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY, annual: process.env.STRIPE_PRICE_TEAM_ANNUAL },
} as const;

export function planForPrice(priceId: string | null | undefined) {
  if (!priceId) return undefined;
  if ([stripePriceIds.pro.monthly, stripePriceIds.pro.annual].includes(priceId)) return "pro" as const;
  if ([stripePriceIds.team.monthly, stripePriceIds.team.annual].includes(priceId)) return "team" as const;
  return undefined;
}
