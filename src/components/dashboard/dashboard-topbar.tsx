"use client";

import Link from "next/link";

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
import { useParams, usePathname, useRouter } from "next/navigation";
import { setReturnPath } from "@/lib/onboarding-client-state";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { buttonVariants } from "@/components/ui/button";
import { getOnboardingHref } from "@/lib/onboarding-navigation";

import { useUser, useClerk } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ProjectSwitcher } from "./project-switcher";

interface DashboardTopbarProps {
  title?: string;
  description?: string;
}

export function DashboardTopbar({ title, description }: DashboardTopbarProps) {
  const onboardingHref = getOnboardingHref();
  const pathname = usePathname();
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
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const alerts = useQuery(
    api.alerts.listByProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  const alertCount = alerts?.length;

  const initials = user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U";

  const router = useRouter();

  const handleOnboardingClick = () => {
    setReturnPath(pathname);
    router.push(onboardingHref);
  };

  // Breadcrumb logic
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#2A2A2A] bg-[#0A0A0A] px-4 font-mono lg:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#666666]">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="shrink-0 text-white">Dashboard</span>
            {segments.length > 2 && (
              <>
                <ChevronRight className="size-3 shrink-0" />
                <span className="truncate text-white">{segments[2]}</span>
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
        <button
          onClick={handleOnboardingClick}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "h-8 px-3 text-[12px]",
          })}
        >
          Onboarding
        </button>
        <div className="hidden h-8 items-center border border-[#2A2A2A] bg-[#111111] px-2 text-[#F59E0B] sm:flex">
          running
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center border border-[#2A2A2A] bg-[#111111] text-[#CCCCCC] transition-colors hover:border-white hover:text-white outline-none overflow-hidden">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.fullName || "User"} 
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
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={user.fullName || "User"} className="size-full object-cover grayscale" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[11px] font-mono text-white">
                  {user?.fullName || user?.username || "User"}
                </span>
                <span className="truncate text-[10px] font-mono text-[#666666]">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openUserProfile()}>
                <UserPen size={14} className="opacity-60" />
                <span>Manage Account</span>
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
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut size={14} className="opacity-60" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {projectId && (
          <Link
            href={`/dashboard/${projectId}/alerts`}
            className="relative flex h-8 items-center border border-[#2A2A2A] bg-[#111111] px-2 text-[#999999] transition-colors hover:bg-[#161616] hover:text-white"
          >
            <Bell className="size-4" />
            {alertCount && alertCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex size-3 items-center justify-center bg-white text-[8px] font-bold text-black animate-pulse">
                {alertCount}
              </span>
            ) : null}
          </Link>
        )}
        <Link
          href="https://docs.5to1r.com"
          className="flex h-8 items-center gap-2 border border-[#2A2A2A] bg-[#111111] px-2 text-[#999999] transition-colors hover:bg-[#161616] hover:text-white"
        >
          <BookOpen className="size-4" />
          <span className="hidden sm:inline">Docs</span>
        </Link>
      </div>
    </header>
  );
}
