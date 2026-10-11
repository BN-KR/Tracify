import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The dashboard shell is available to authenticated project users. Private
  // library/admin routes enforce their own authorization at the route boundary
  // and must not be exposed through the general dashboard navigation.
  return <DashboardShell canAccessContent={false} scope="root">{children}</DashboardShell>;
}
