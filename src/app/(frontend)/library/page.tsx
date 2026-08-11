import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireLibraryAccess } from "@/lib/library-access";

export const metadata: Metadata = {
  title: "Private section library — Tracify",
  description:
    "Private Tracify landing-page section library and site structure planner.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function LibraryPage() {
  await requireLibraryAccess("/admin/library");
  redirect("/admin/library");
}
