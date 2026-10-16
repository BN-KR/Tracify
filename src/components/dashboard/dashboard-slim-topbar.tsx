"use client";

import { ChevronRight, PanelLeft } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

/**
 * Slim bar for dashboard pages that don't render their own header (e.g. Tracing). It gives every page a
 * sidebar toggle and the same "Dashboard › Section" breadcrumb the full topbar uses. Pages that render
 * their own header hide it via CSS (see `.tracify-slim-topbar` in globals.css).
 */
export function DashboardSlimTopbar() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const segments = pathname.split("/").filter(Boolean);
  const dashboardHref = projectId ? `/dashboard/${projectId}` : "/dashboard";
  const section = projectId ? segments[2] : segments[1];
  const sectionHref = projectId && section ? `/dashboard/${projectId}/${section}` : dashboardHref;
  const detail = projectId ? segments[3] : segments[2];

  return (
    <header className="tracify-slim-topbar sticky top-0 z-20 flex h-10 shrink-0 items-center gap-3 border-b border-[#292929] bg-[#0f0f0f] px-3 font-mono">
      <button
        type="button"
        aria-label="Toggle sidebar (Ctrl+\)"
        title="Toggle sidebar · Ctrl+\"
        onClick={() => window.dispatchEvent(new Event("tracify:toggle-sidebar"))}
        className="flex size-7 items-center justify-center !text-[#a0a0a0] outline-none hover:!bg-[#181818] hover:!text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/55"
      >
        <PanelLeft className="size-4" />
      </button>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[11px] uppercase tracking-wider text-[#8d8d8d]">
        <Link href={dashboardHref} className="shrink-0 !text-[#dedede] hover:!text-white">Dashboard</Link>
        {section ? (
          <>
            <ChevronRight className="size-3 shrink-0" />
            {detail ? (
              <Link href={sectionHref} className="truncate !text-[#dedede] hover:!text-white">{section}</Link>
            ) : (
              <span className="truncate text-[#dedede]">{section}</span>
            )}
          </>
        ) : null}
        {detail ? (
          <>
            <ChevronRight className="size-3 shrink-0" />
            <span className="truncate">{detail}</span>
          </>
        ) : null}
      </nav>
    </header>
  );
}
