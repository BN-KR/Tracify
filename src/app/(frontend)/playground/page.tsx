import type { Metadata } from "next";

import { SandboxWorkspace } from "@/features/dashboard-workspace/components/sandbox-workspace";

export const metadata: Metadata = {
  title: "Explore the Sandbox",
  description: "A populated, read-only agent observability workspace.",
  robots: { index: false, follow: false },
};

export default function PlaygroundPage() {
  return <SandboxWorkspace />;
}
