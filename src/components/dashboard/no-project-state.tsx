import Link from "next/link";
import { ArrowRight, FolderPlus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export function NoProjectState({
  title = "This view needs a project.",
  description = "Create or select a project to load traces, settings, and project-backed data here.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="border border-black/15 bg-white p-6">
      <div className="flex size-10 items-center justify-center bg-[#f4d44d] text-black">
        <FolderPlus className="size-5" />
      </div>
      <h2 className="mt-5 font-mono text-xl text-black">{title}</h2>
      <p className="mt-2 max-w-xl font-sans text-sm leading-6 text-black/60">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/onboarding/project" className={buttonVariants({ className: "h-9 gap-2 px-4 uppercase" })}>
          Create project <ArrowRight className="size-3.5" />
        </Link>
        <Link href="/dashboard" className={buttonVariants({ variant: "secondary", className: "h-9 px-4 uppercase" })}>
          Back to overview
        </Link>
      </div>
    </section>
  );
}
