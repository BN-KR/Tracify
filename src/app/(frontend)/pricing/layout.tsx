import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI agent observability pricing plans",
  description: "Explore Tracify pricing for AI agent observability, evaluation, cost monitoring, and reliability workflows.",
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
