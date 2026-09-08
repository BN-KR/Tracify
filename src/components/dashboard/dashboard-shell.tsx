"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

const COLLAPSED_STORAGE_KEY = "tracify.sidebar.collapsed";
const LEGACY_COLLAPSED_STORAGE_KEY = "tracify:dashboard-sidebar";

// Matches the captured dashboard shell's 3rem collapsed rail.
const COLLAPSED_WIDTH = 48;
// Matches the captured dashboard shell's 11.5rem expanded sidebar.
const EXPANDED_WIDTH = 184;
type DashboardTheme = "legacy" | "tracify-v2";

export function DashboardShell({
  children,
  canAccessContent,
  preview = false,
  previewProjectId,
  previewProjectName,
  dashboardTheme,
  synthetic = false,
}: {
  children: React.ReactNode;
  canAccessContent: boolean;
  preview?: boolean;
  previewProjectId?: string;
  previewProjectName?: string;
  dashboardTheme?: DashboardTheme;
  synthetic?: boolean;
}) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const projectId = params?.projectId as string | undefined;
  const isDashboardRoute = synthetic || preview || pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isTracifyOverview = synthetic || preview || Boolean(projectId && pathname === `/dashboard/${projectId}`);
  const [activeTheme] = useState<DashboardTheme>(() => {
    if (dashboardTheme) return dashboardTheme;
    if (typeof window !== "undefined") {
      const requestedTheme = new URLSearchParams(window.location.search).get("ui");
      if (requestedTheme === "legacy" || requestedTheme === "tracify-v2") return requestedTheme;
    }
    return process.env.NEXT_PUBLIC_TRACIFY_DASHBOARD_V2 === "true" ? "tracify-v2" : "legacy";
  });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(COLLAPSED_STORAGE_KEY);
    if (stored === "true" || stored === "false") return stored === "true";
    return (
      window.localStorage.getItem(LEGACY_COLLAPSED_STORAGE_KEY) === "collapsed"
    );
  });
  function updateCollapsed(next: boolean) {
    setIsCollapsed(next);
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.altKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "o" && projectId) {
        event.preventDefault();
        router.push(`/dashboard/${projectId}`);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "\\") {
        event.preventDefault();
        setIsCollapsed((current) => {
          const next = !current;
          window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
          return next;
        });
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [projectId, router]);

  const layoutSidebarWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <div data-dashboard-theme={activeTheme} className={`flex min-h-svh w-full font-mono text-black/70 ${isDashboardRoute ? "tracify-cloud-shell" : "bg-[#eceae3]"} ${isTracifyOverview ? "tracify-shell" : ""}`}>
      <DashboardSidebar
        canAccessContent={canAccessContent}
        isCollapsed={isCollapsed}
        onCollapsedChange={updateCollapsed}
        projectIdOverride={previewProjectId}
        previewProjectName={previewProjectName}
        synthetic={synthetic}
      />
      <div
        className={`flex min-h-svh min-w-0 flex-1 flex-col transition-[padding] duration-150 motion-reduce:transition-none ${isDashboardRoute ? "bg-[#101010]" : "bg-[#eceae3]"}`}
        style={{ paddingLeft: layoutSidebarWidth }}
      >
        <main className={`h-svh pb-0 overflow-y-auto scrollbar-hide ${isTracifyOverview ? "bg-[#101010] p-0" : isDashboardRoute ? "bg-[#101010] p-4 lg:p-6" : "bg-[#eceae3] p-4 lg:p-6"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
