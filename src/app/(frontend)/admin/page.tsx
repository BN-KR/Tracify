import { BookOpen, FileText } from "lucide-react";
import Link from "next/link";
import { requireLibraryAccess } from "@/lib/library-access";

const destinations = [
  {
    title: "Admin Library",
    description: "Browse and compare private site sections and concepts.",
    href: "/admin/library",
    icon: BookOpen,
  },
  {
    title: "Payload CMS",
    description: "Create, edit, and publish the site's managed content.",
    href: "/cms",
    icon: FileText,
  },
];

export default async function AdminPage() {
  await requireLibraryAccess("/admin");

  return (
    <main className="min-h-svh bg-[#0A0A0A] p-6 font-mono text-[#CCCCCC] lg:p-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#666666]">
          Private workspace
        </p>
        <h1 className="mt-3 text-3xl tracking-tight text-white">Admin</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#999999]">
          Choose the workspace you need.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {destinations.map((destination) => {
            const Icon = destination.icon;

            return (
              <Link
                key={destination.href}
                href={destination.href}
                className="group border border-[#2A2A2A] bg-[#111111] p-5 transition-colors hover:border-[#666666] hover:bg-[#161616] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <Icon className="size-5 text-white" aria-hidden="true" />
                <h2 className="mt-8 text-base text-white">{destination.title}</h2>
                <p className="mt-2 text-xs leading-5 text-[#999999]">
                  {destination.description}
                </p>
                <span className="mt-6 block text-[11px] uppercase tracking-[0.16em] text-white">
                  Open →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
