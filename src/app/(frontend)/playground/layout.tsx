import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = noIndex;

export default async function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell canAccessContent={false} synthetic preview previewProjectName="Demo Project (view only)">{children}</DashboardShell>;
}
