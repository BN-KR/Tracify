import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell canAccessContent={false}>{children}</DashboardShell>;
}
