import type { Metadata } from "next";
import { DemoExploreClient } from "@/components/dashboard/explore/demo-explore-client";

export const metadata: Metadata = {
  title: "Explore demo — Tracify",
  description: "Click around Tracify's trace explorer with seeded demo data. No account or backend required.",
};

// Deliberately outside `[projectId]` (a literal `demo` segment wins over the
// dynamic route) so this page never goes through ProjectRouteGate / Convex
// auth. It is pure static/generated data end to end.
export default function DemoExplorePage() {
  return <DemoExploreClient />;
}
