"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import {
  BookOpen,
  Bell,
  ChevronRight,
  UserPen,
  LogOut,
  Settings,
  MessageSquare,
  Book
} from "lucide-react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { hasDismissedOnboarding, setReturnPath } from "@/lib/onboarding-client-state";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { buttonVariants } from "@/components/ui/button";
import { getOnboardingHref } from "@/lib/onboarding-navigation";

import { authClient } from "@/lib/auth-client";
import { OrganizationSwitcher } from "@/components/auth/organization-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DashboardCommandMenu } from "./dashboard-command-menu";
import { cn, formatRelativeTime } from "@/lib/utils";

interface DashboardTopbarProps {
  title?: string;
  description?: string;
}

export function DashboardTopbar({ title, description }: DashboardTopbarProps) {
  const onboardingHref = getOnboardingHref();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const projectSettingsHref = projectId
    ? `/dashboard/${projectId}/settings`
    : "/onboarding/project";
  const projectManageHref = projectId
    ? `/dashboard/${projectId}/manage`
    : "/onboarding/project";
  const projectDocsHref = projectId
    ? `/dashboard/${projectId}/docs`
    : "/onboarding/project";
  const dashboardHref = projectId ? `/dashboard/${projectId}` : "/dashboard";
  const environmentContext = searchParams.get("environment")?.trim() || "all environments";
  const usesRunsWindow = pathname.includes("/runs") || pathname.includes("/search");
  const requestedRange = usesRunsWindow ? searchParams.get("days") : searchParams.get("range");
  const rangeContext = ["1", "7", "30", "90"].includes(requestedRange ?? "")
    ? `${requestedRange}d`
    : usesRunsWindow
      ? "30d"
      : "7d";
  const { data: session } = authClient.useSession();
  const { data: organization } = authClient.useActiveOrganization();
  const user = session?.user;
  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const alerts = useQuery(
    api.alerts.listByProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  const markAllAlertsRead = useMutation(api.alerts.markAllRead);
  const markAlertRead = useMutation(api.alerts.markRead);
  const [isMarkingAlertsRead, setIsMarkingAlertsRead] = useState(false);
  const unreadAlertCount = alerts?.filter((alert) => !alert.readAt).length ?? 0;

  const initials = user?.name?.charAt(0) || user?.email?.charAt(0) || "U";

  const router = useRouter();

  const handleOnboardingClick = () => {
    setReturnPath(pathname);
    router.push(onboardingHref);
  };

  const handleReadAllAlerts = async () => {
    if (!projectId || unreadAlertCount === 0 || isMarkingAlertsRead) return;

    setIsMarkingAlertsRead(true);
    try {
      await markAllAlertsRead({ projectId: projectId as Id<"projects"> });
    } finally {
      setIsMarkingAlertsRead(false);
    }
  };

  // Breadcrumb logic
  const segments = pathname.split("/").filter(Boolean);
  const sectionHref =
    projectId && segments.length > 2
      ? `/dashboard/${projectId}/${segments[2]}`
      : dashboardHref;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#2A2A2A] bg-[#0A0A0A] px-4 font-mono lg:px-6">
      <span className="sr-only">{title || "Dashboard"}{description ? `: ${description}` : ""}</span>
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#666666]">
          <div className="flex items-center gap-2 overflow-hidden">
            <Link
              href={dashboardHref}
              className="shrink-0 text-white transition-colors hover:text-[#CCCCCC]"
            >
              Dashboard
            </Link>
            {segments.length > 2 && (
              <>
                <ChevronRight className="size-3 shrink-0" />
                {segments.length > 3 ? (
                  <Link
                    href={sectionHref}
                    className="truncate text-white transition-colors hover:text-[#CCCCCC]"
                  >
                    {segments[2]}
                  </Link>
                ) : (
                  <span className="truncate text-white">{segments[2]}</span>
                )}
              </>
            )}
            {segments.length > 3 && (
              <>
                <ChevronRight className="size-3 shrink-0" />
                <span className="truncate text-[#999999]">{segments[3]}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[12px] text-[#999999]">
        <DashboardCommandMenu projectId={projectId} />
        <OrganizationSwitcher />
        {!hasDismissedOnboarding() ? (
          <button
            onClick={handleOnboardingClick}
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "h-8 px-3 text-[12px]",
            })}
          >
            Setup
          </button>
        ) : null}
        <div className="hidden max-w-[360px] items-center gap-2 border border-[#2A2A2A] bg-[#111111] px-2 sm:flex">
          <span className="size-1.5 bg-emerald-300" aria-hidden="true" />
          <span className="truncate text-[10px] uppercase tracking-widest text-[#CCCCCC]">
            {organization?.name || "Personal workspace"}
          </span>
          <span className="text-[#555555]">/</span>
          <span className="truncate text-[10px] text-[#777777]">{project?.name || "Loading project…"}</span>
          <span className="text-[#555555]">/</span>
          <span className="truncate text-[10px] uppercase text-[#777777]" title="Environment context">{environmentContext}</span>
          <span className="text-[#555555]">/</span>
          <span className="shrink-0 text-[10px] uppercase text-[#777777]" title="Dashboard time range">{rangeContext}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open account menu"
              title="Account menu"
              className="flex h-8 w-8 items-center justify-center border border-[#2A2A2A] bg-[#111111] text-[#CCCCCC] transition-colors hover:border-white hover:text-white outline-none overflow-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  unoptimized
                  className="size-full object-cover grayscale opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                initials
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
            <DropdownMenuLabel className="flex items-start gap-3 p-3">
              <div className="size-8 shrink-0 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs text-white uppercase overflow-hidden">
                {user?.image ? (
                  <Image src={user.image} alt={user.name || "User"} width={32} height={32} unoptimized className="size-full object-cover grayscale" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[11px] font-mono text-white">
                  {user?.name || "User"}
                </span>
                <span className="truncate text-[10px] font-mono text-[#666666]">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={projectSettingsHref}>
                <UserPen size={14} className="opacity-60" />
                <span>Manage Account</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={projectSettingsHref}>
                  <Settings size={14} className="opacity-60" />
                  <span>Project Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={projectManageHref}>
                  <Settings size={14} className="opacity-60" />
                  <span>Project Management</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={projectDocsHref}>
                  <Book size={14} className="opacity-60" />
                  <span>Documentation</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare size={14} className="opacity-60" />
                <span>Send Feedback</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}>
              <LogOut size={14} className="opacity-60" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {projectId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={unreadAlertCount > 0 ? `Open alerts, ${unreadAlertCount} unread` : "Open alerts"}
                title="Alerts"
                className={cn(
                  "relative flex h-8 items-center border px-2 outline-none transition-colors hover:bg-[#161616] hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
                  unreadAlertCount > 0
                    ? "border-white bg-[#181818] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)]"
                    : "border-[#2A2A2A] bg-[#111111] text-[#999999]",
                )}
              >
                <Bell className="size-4" />
                {unreadAlertCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center bg-white px-1 text-[9px] font-bold leading-4 text-black shadow-[0_0_0_2px_#0A0A0A]">
                    {unreadAlertCount > 9 ? "9+" : unreadAlertCount}
                  </span>
                ) : null}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[360px] p-0" align="end" sideOffset={8}>
              <div className="flex items-start justify-between gap-3 border-b border-[#2A2A2A] p-3">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-widest text-white">
                    Alerts
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-[#666666]">
                    Cost, failure, and duration triggers
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReadAllAlerts}
                  disabled={unreadAlertCount === 0 || isMarkingAlertsRead}
                  className="shrink-0 border border-[#333333] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#CCCCCC] transition-colors hover:border-white hover:text-white disabled:cursor-not-allowed disabled:border-[#222222] disabled:text-[#555555]"
                >
                  Read all
                </button>
              </div>
              <div className="max-h-[420px] overflow-y-auto p-2">
                {alerts === undefined ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-16 border border-[#222222] bg-[#0A0A0A]"
                      />
                    ))}
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="border border-dashed border-[#2A2A2A] p-6 text-center font-mono text-[11px] uppercase tracking-widest text-[#666666]">
                    No alerts triggered
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alerts.slice(0, 8).map((alert) => {
                      const isUnread = !alert.readAt;

                      return (
                        <Link
                          key={alert._id}
                          href={`/dashboard/${projectId}/runs/${alert.runId}`}
                          onClick={() => {
                            if (isUnread) {
                              void markAlertRead({ alertId: alert._id });
                            }
                          }}
                          className={cn(
                            "relative block border p-3 transition-colors hover:border-[#555555]",
                            isUnread
                              ? "border-[#555555] bg-[#171717] hover:bg-[#1C1C1C]"
                              : "border-[#222222] bg-[#0A0A0A] hover:bg-[#111111]",
                          )}
                        >
                          {isUnread ? (
                            <span className="absolute left-0 top-0 h-full w-1 bg-white" />
                          ) : null}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              {isUnread ? (
                                <span className="shrink-0 bg-white px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-black">
                                  New
                                </span>
                              ) : null}
                              <span
                                className={cn(
                                  "truncate font-mono text-[10px] uppercase tracking-widest",
                                  alert.type === "cost_exceeded"
                                    ? "text-[#F59E0B]"
                                    : "text-red-400",
                                )}
                              >
                                {alert.type.replace("_", " ")}
                              </span>
                            </div>
                            <span className="shrink-0 font-mono text-[9px] text-[#666666]">
                              {formatRelativeTime(alert.triggeredAt)}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "mt-2 line-clamp-2 font-sans text-xs leading-relaxed",
                              isUnread ? "text-white" : "text-[#CCCCCC]",
                            )}
                          >
                            {alert.message}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Link
          href="/docs"
          className="flex h-8 items-center gap-2 border border-[#2A2A2A] bg-[#111111] px-2 text-[#999999] transition-colors hover:bg-[#161616] hover:text-white"
        >
          <BookOpen className="size-4" />
          <span className="hidden sm:inline">Docs</span>
        </Link>
      </div>
    </header>
  );
}
