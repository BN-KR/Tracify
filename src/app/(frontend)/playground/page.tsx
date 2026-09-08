import type { Metadata } from "next";

import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { sandboxWorkspace } from "@/features/dashboard-workspace/sandbox-data";

export const metadata: Metadata = {
  title: "Explore the Sandbox",
  description: "A populated, read-only agent observability workspace.",
  robots: { index: false, follow: false },
};

export default function PlaygroundPage() {
  return <CapturedWorkspace workspace={sandboxWorkspace} />;
}
