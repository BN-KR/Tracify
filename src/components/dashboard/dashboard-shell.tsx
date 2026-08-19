"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

const COLLAPSED_STORAGE_KEY = "tracify.sidebar.collapsed";
const LEGACY_COLLAPSED_STORAGE_KEY = "tracify:dashboard-sidebar";

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 240;

export function DashboardShell({
  children,
  canAccessContent,
}: {
  children: React.ReactNode;
  canAccessContent: boolean;
}) {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
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
    <div className="flex min-h-svh w-full bg-[#0A0A0A] font-mono text-[#CCCCCC]">
      <DashboardSidebar
        canAccessContent={canAccessContent}
        isCollapsed={isCollapsed}
        onCollapsedChange={updateCollapsed}
      />
      <div
        className="flex min-h-svh min-w-0 flex-1 flex-col bg-[#0A0A0A] transition-[padding] duration-150 motion-reduce:transition-none"
        style={{ paddingLeft: layoutSidebarWidth }}
      >
        <main className="h-svh pb-0 overflow-y-auto bg-[#0A0A0A] p-4 lg:p-6 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
