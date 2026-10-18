import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { PricingPage } from "@/components/marketing/pricing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing: free AI agent observability plan",
  description: "Start free, then pay by spans per month. Tracify pricing for AI agent tracing, cost tracking and evaluation: Free, Pro, Team and Enterprise plans.",
  alternates: { canonical: "/pricing", languages: languageAlternates("/pricing") },
};

export default function Page() {
  return <PricingPage />;
}
