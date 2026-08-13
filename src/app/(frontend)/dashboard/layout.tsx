import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getLibraryAccess } from "@/lib/library-access";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized: canAccessContent } = await getLibraryAccess();

  return <DashboardShell canAccessContent={canAccessContent}>{children}</DashboardShell>;
}
