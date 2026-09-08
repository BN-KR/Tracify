import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell canAccessContent={false} synthetic preview previewProjectName="Demo Project (view only)">{children}</DashboardShell>;
}
