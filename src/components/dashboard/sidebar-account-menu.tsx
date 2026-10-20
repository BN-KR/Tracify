"use client";

import { ChevronUp, CreditCard, Globe2, LogOut, ShieldCheck, Sparkles, UserPen } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { getTracifyRegion } from "@/lib/regions";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MARKETING_ORIGIN = "https://www.tracify.tech";

export function SidebarAccountMenu({
  isCollapsed = false,
  synthetic = false,
}: {
  isCollapsed?: boolean;
  synthetic?: boolean;
}) {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const { data: session } = authClient.useSession();
  const projects = useQuery(api.projects.getProjectsByUserOrOrg, synthetic ? "skip" : undefined) || [];
  const currentProject = projects.find((project) => project._id === projectId) ?? projects[0] ?? null;
  const adminAccess = useQuery(api.admin.access, synthetic ? "skip" : undefined);
  const isFree = !synthetic && (currentProject?.planTier ?? "free") === "free";
  const region = getTracifyRegion();

  const user = session?.user;
  const name = synthetic ? "Demo viewer" : user?.name || "Account";
  const email = synthetic ? "Sign in to use your own data" : user?.email || "";
  const initials = (user?.name || user?.email || "T").slice(0, 1).toUpperCase();
  const billingHref = projectId ? `/dashboard/${projectId}/billing` : "/dashboard/billing";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${name}`}
          className={cn(
            "flex items-center font-mono outline-none transition-colors hover:!bg-[#181818] focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/55",
            isCollapsed ? "size-10 justify-center border border-white/15 text-[13px] font-semibold !text-[#dedede]" : "h-14 w-full gap-3 px-4 text-left !text-[#dedede]",
          )}
        >
          <span className="flex size-7 shrink-0 items-center justify-center bg-[#f4d44d] text-[12px] font-semibold !text-[#090909]">{initials}</span>
          {isCollapsed ? null : (
            <>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[12px]">{name}</span>
                <span className="truncate text-[10px] !text-[#8d8d8d]">{email}</span>
              </span>
              <ChevronUp className="ml-auto size-4 shrink-0 opacity-60" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isCollapsed ? "end" : "start"} side={isCollapsed ? "right" : "top"} collisionPadding={8} sideOffset={8} className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-2 normal-case !text-[#dedede]">
          <span className="truncate text-[12px]">{name}</span>
          <span className="truncate text-[10px] opacity-55">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isFree ? (
          <DropdownMenuItem asChild>
            <Link href={billingHref} className="!text-[#f4d44d]">
              <Sparkles className="size-4" />
              <span>Upgrade plan</span>
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/dashboard/account">
            <UserPen className="size-4" />
            <span>Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={billingHref}>
            <CreditCard className="size-4" />
            <span>Billing</span>
          </Link>
        </DropdownMenuItem>
        {adminAccess?.allowed ? (
          <DropdownMenuItem asChild>
            <Link href="/admin" prefetch>
              <ShieldCheck className="size-4" />
              <span>Admin</span>
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <a href={`${MARKETING_ORIGIN}/cloud`}>
            <Globe2 className="size-4" />
            <span>{region.shortName} cloud · switch region</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {synthetic ? (
          <DropdownMenuItem asChild>
            <Link href="/sign-in">
              <LogOut className="size-4" />
              <span>Sign in</span>
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => void authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
          >
            <LogOut className="size-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
