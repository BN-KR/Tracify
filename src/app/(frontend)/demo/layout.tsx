import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive AI agent observability demo",
  description: "Explore a realistic Tracify project with traces, quality scores, cost signals, and release decisions.",
  alternates: { canonical: "/demo" },
};

export default function DemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
