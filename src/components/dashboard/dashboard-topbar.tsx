"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import {
  Bell,
  ChevronDown,
  PanelLeft,
  UserPen,
  LogOut,
  Settings,
  MessageSquare,
  Book,
} from "lucide-react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { hasDismissedOnboarding, setReturnPath } from "@/lib/onboarding-client-state";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

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
  /** Replaces the default time-range select (pages with their own range picker). */
  controls?: React.ReactNode;
  /** Pass only on pages that update by themselves; renders the Live toggle. */
  live?: { on: boolean; onToggle: () => void; disabled?: boolean; title?: string };
}

export function DashboardTopbar({ title, description, controls, live }: DashboardTopbarProps) {
  const onboardingHref = getOnboardingHref();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  const projectSettingsHref = projectId ? `/dashboard/${projectId}/settings` : "/dashboard/account";
  const projectManageHref = projectId ? `/dashboard/${projectId}/manage` : "/dashboard";
  const projectDocsHref = projectId ? `/dashboard/${projectId}/docs` : "/docs";

  const usesRunsWindow = pathname.includes("/runs") || pathname.includes("/search");
  const requestedRange = usesRunsWindow ? searchParams.get("days") : searchParams.get("range");
  const rangeContext = ["1", "7", "30", "90"].includes(requestedRange ?? "")
    ? `${requestedRange}d`
    : usesRunsWindow
      ? "30d"
      : "7d";
  const rangeValue = rangeContext.replace("d", "");

  const { data: session } = authClient.useSession();
  const { data: organization } = authClient.useActiveOrganization();
  const user = session?.user;

  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const alerts = useQuery(
    api.alerts.listByProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const markAllAlertsRead = useMutation(api.alerts.markAllRead);
  const markAlertRead = useMutation(api.alerts.markRead);
  const [isMarkingAlertsRead, setIsMarkingAlertsRead] = useState(false);
  const unreadAlertCount = alerts?.filter((alert) => !alert.readAt).length ?? 0;

  const initials = user?.name?.charAt(0) || user?.email?.charAt(0) || "U";
  const router = useRouter();

  function updateDashboardQuery(key: "range" | "days" | "environment", value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

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

  const segments = pathname.split("/").filter(Boolean);

  const barButton =
    "inline-flex h-[30px] items-center gap-1.5 border border-[#262C35] bg-[#0B0D10] px-2.5 text-xs text-[#C9CED6] transition-colors hover:border-[#4A5260] hover:text-white";
  const pageTitle = title || (segments[2] ? segments[2].replace(/-/g, " ") : "Overview");

  return (
    <header className="tracify-dashboard-topbar flex h-11 shrink-0 items-center justify-between gap-3 border-b border-[#1F242C] bg-[#0B0D10] px-3 font-mono text-xs text-[#E6E9EE] lg:px-3.5">
      <span className="sr-only">{description ? `${pageTitle}: ${description}` : pageTitle}</span>

      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={() => window.dispatchEvent(new Event("tracify:toggle-sidebar"))}
          className={cn(barButton, "w-[30px] justify-center px-0")}
        >
          <PanelLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("tracify:open-project-switcher"))}
          className="hidden max-w-[160px] items-center gap-1 truncate px-2 py-1 text-[#8B93A1] hover:text-white md:inline-flex"
        >
          <span className="truncate">{organization?.name || "Workspace"}</span>
          <ChevronDown className="size-3 shrink-0" />
        </button>
        <span className="hidden text-[#6B7380] md:inline">/</span>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("tracify:open-project-switcher"))}
          className="hidden max-w-[200px] items-center gap-1 truncate px-2 py-1 text-[#8B93A1] hover:text-white md:inline-flex"
        >
          <span className="truncate">{project?.name || "Project"}</span>
          <ChevronDown className="size-3 shrink-0" />
        </button>
        <span className="hidden text-[#6B7380] md:inline">/</span>
        <h1 className="truncate border-b-2 border-[#F4D44D] px-1 py-1 text-xs font-semibold capitalize leading-none text-[#E6E9EE]">
          {pageTitle}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {controls ?? (
          <label className={cn(barButton, "relative")}>
            <span className="sr-only">Dashboard time range</span>
            <select
              aria-label="Dashboard time range"
              value={rangeValue}
              onChange={(event) => updateDashboardQuery(usesRunsWindow ? "days" : "range", event.target.value)}
              className="cursor-pointer appearance-none bg-transparent pr-1 outline-none"
            >
              <option value="1">1d</option>
              <option value="7">7d</option>
              <option value="30">30d</option>
              <option value="90">90d</option>
            </select>
            <ChevronDown className="size-3" />
          </label>
        )}
        {live ? (
          <button
            type="button"
            aria-pressed={live.on}
            disabled={live.disabled}
            title={live.title}
            onClick={live.onToggle}
            className={cn(barButton, "hidden sm:inline-flex disabled:opacity-50")}
          >
            <span aria-hidden="true" className={cn("size-2", live.on ? "animate-pulse bg-[#5BE3A0]" : "bg-[#6B7380]")} />
            {live.on ? "Live" : "Paused"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("tracify:open-command"))}
          className={cn(barButton, "hidden md:inline-flex")}
        >
          Assistant
          <kbd className="border border-[#262C35] px-1 text-[10px] text-[#6B7380]">Ctrl I</kbd>
        </button>
        <DashboardCommandMenu projectId={projectId} />
        <OrganizationSwitcher />

        {!hasDismissedOnboarding() ? (
          <button onClick={handleOnboardingClick} className={cn(barButton, "hidden sm:inline-flex")}>
            Setup
          </button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open account menu"
              title="Account menu"
              className="flex h-[30px] w-[30px] items-center justify-center overflow-hidden border border-[#262C35] bg-[#0B0D10] text-[#F4D44D] outline-none transition-colors hover:border-[#4A5260] focus-visible:ring-2 focus-visible:ring-[#F4D44D]"
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
              <div className="size-8 shrink-0 bg-[#f3f2ed] border border-black/15 flex items-center justify-center font-mono text-xs text-black uppercase overflow-hidden">
                {user?.image ? (
                  <Image src={user.image} alt={user.name || "User"} width={32} height={32} unoptimized className="size-full object-cover grayscale" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[11px] font-mono text-black">{user?.name || "User"}</span>
                <span className="truncate text-[10px] font-mono text-black/55">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account">
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
              <DropdownMenuItem asChild>
                <a href="https://www.tracify.tech/contact">
                  <MessageSquare size={14} className="opacity-60" />
                  <span>Send Feedback</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
            >
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
                  "relative flex h-[30px] items-center border px-2 outline-none transition-colors hover:border-[#4A5260] hover:text-white focus-visible:ring-2 focus-visible:ring-[#F4D44D]",
                  unreadAlertCount > 0
                    ? "border-[#F4D44D] bg-[#0B0D10] text-white"
                    : "border-[#262C35] bg-[#0B0D10] text-[#C9CED6]",
                )}
              >
                <Bell className="size-4" />
                {unreadAlertCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center bg-[#F4D44D] px-1 text-[9px] font-bold leading-4 text-black">
                    {unreadAlertCount > 9 ? "9+" : unreadAlertCount}
                  </span>
                ) : null}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[360px] p-0" align="end" sideOffset={8}>
              <div className="flex items-start justify-between gap-3 border-b border-black/15 p-3">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-widest text-black">Alerts</div>
                  <div className="mt-1 font-mono text-[10px] text-black/55">Cost, failure, and duration triggers</div>
                </div>
                <button
                  type="button"
                  onClick={handleReadAllAlerts}
                  disabled={unreadAlertCount === 0 || isMarkingAlertsRead}
                  className="shrink-0 border border-black/25 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-black/70 transition-colors hover:border-black hover:text-black disabled:cursor-not-allowed disabled:border-black/15 disabled:text-black/55"
                >
                  Read all
                </button>
              </div>
              <div className="max-h-[420px] overflow-y-auto p-2">
                {alerts === undefined ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-16 border border-black/15 bg-[#f3f2ed]" />
                    ))}
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="border border-dashed border-black/15 p-6 text-center font-mono text-[11px] uppercase tracking-widest text-black/55">
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
                            "relative block border p-3 transition-colors hover:border-black/30",
                            isUnread
                              ? "border-black/30 bg-[#f3f2ed] hover:bg-[#e4e1d8]"
                              : "border-black/15 bg-[#f3f2ed] hover:bg-white",
                          )}
                        >
                          {isUnread ? <span className="absolute left-0 top-0 h-full w-1 bg-black" /> : null}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              {isUnread ? (
                                <span className="shrink-0 bg-black px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-white">
                                  New
                                </span>
                              ) : null}
                              <span
                                className={cn(
                                  "truncate font-mono text-[10px] uppercase tracking-widest",
                                  alert.type === "cost_exceeded" ? "text-[#7d5e00]" : "text-red-600",
                                )}
                              >
                                {alert.type.replace("_", " ")}
                              </span>
                            </div>
                            <span className="shrink-0 font-mono text-[9px] text-black/55">
                              {formatRelativeTime(alert.triggeredAt)}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "mt-2 line-clamp-2 font-sans text-xs leading-relaxed",
                              isUnread ? "text-black" : "text-black/70",
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

      </div>
    </header>
  );
}
