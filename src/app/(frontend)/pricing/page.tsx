import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n";
import { PricingPage } from "@/components/marketing/pricing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free to start, fair as you grow. Tracify plans are sized by spans per month, with Free, Pro, Team and Enterprise options.",
  alternates: { canonical: "/pricing", languages: languageAlternates("/pricing") },
};

export default function Page() {
  return <PricingPage />;
}
