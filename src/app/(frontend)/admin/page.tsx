import type { Metadata } from "next";
import { requireLibraryAccess } from "@/lib/library-access";
import { AdminOverview } from "@/components/admin/admin-overview";

export const metadata: Metadata = { title: "Admin — Tracify", robots: { index: false, follow: false } };

export default async function AdminPage() {
  await requireLibraryAccess("/admin");
  return <AdminOverview />;
}
