"use client";

import { useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

const COLLAPSED_STORAGE_KEY = "5to1r.sidebar.collapsed";
const LEGACY_COLLAPSED_STORAGE_KEY = "5to1r:dashboard-sidebar";

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 240;

export function DashboardShell({ children }: { children: React.ReactNode }) {
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

  const layoutSidebarWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <div className="flex min-h-svh w-full bg-[#0A0A0A] font-mono text-[#CCCCCC]">
      <DashboardSidebar
        isCollapsed={isCollapsed}
        onCollapsedChange={updateCollapsed}
      />
      <div
        className="flex min-h-svh min-w-0 flex-1 flex-col bg-[#0A0A0A] transition-[padding] duration-150 motion-reduce:transition-none"
        style={{ paddingLeft: layoutSidebarWidth }}
      >
        <DashboardTopbar />
        <main className="h-[calc(100svh-56px)] overflow-y-auto bg-[#0A0A0A] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
