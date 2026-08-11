"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { LayoutDashboard, ActivitySquare, Settings, BookOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BrandLogo } from "@/components/brand-logo";

const NAV_ITEMS = [
  { title: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Runs", icon: ActivitySquare, href: "/dashboard/runs" },
  { title: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: organization, isPending } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  return (
    <Sidebar className="border-r border-border bg-black">
      <SidebarHeader className="border-b border-border h-16 flex items-center justify-center px-6">
        <div className="flex w-full items-center text-white">
          <BrandLogo className="text-lg" highlighted={false} />
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-black">
        {!isPending && organization && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase py-4">
              Organization
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 py-2 text-sm font-mono text-zinc-400 uppercase tracking-tight">
                {organization.name}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase py-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    render={
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    }
                    isActive={pathname === item.href}
                    className="font-mono uppercase text-xs tracking-tight hover:bg-zinc-900 transition-colors"
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={
                    <Link href="/docs">
                      <BookOpen className="h-4 w-4" />
                      <span>Documentation</span>
                    </Link>
                  } 
                  className="font-mono uppercase text-xs tracking-tight hover:bg-zinc-900"
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-6 bg-black">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void authClient.signOut()} className="size-8 border border-zinc-800 bg-zinc-900 font-mono text-xs uppercase text-white" aria-label="Sign out">
            {session?.user.name?.slice(0, 1) || session?.user.email.slice(0, 1) || "U"}
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Account</span>
            <span className="text-[10px] font-mono text-zinc-600 uppercase">Pro Plan</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
