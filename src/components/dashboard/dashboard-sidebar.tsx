"use client";

import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronDown,
  FileText,
  LayoutDashboard,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";
import { usePathname, useParams } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type GroupId = "observe" | "control" | "configure" | "resources";

type NavItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  external?: boolean;
};

type NavGroup = {
  id: GroupId;
  label: string;
  items: NavItem[];
};

const GROUP_STORAGE_KEY = "5to1r:dashboard-sidebar-groups";
const COLLAPSED_STORAGE_KEY = "5to1r.sidebar.collapsed";
const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 240;

function isActivePath(pathname: string, href: string, projectId: string) {
  if (href.startsWith("http")) return false;
  if (href === `/dashboard/${projectId}`) {
    return pathname === "/dashboard" || pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({
  isCollapsed,
  onCollapsedChange,
}: {
  isCollapsed: boolean;
  onCollapsedChange: (next: boolean) => void;
}) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = (params?.projectId as string) || "";
  const projectDashboardHref = projectId ? `/dashboard/${projectId}` : "/dashboard";
  const projectSetupHref = projectId ? `/dashboard/${projectId}` : "/onboarding/project";

  const dynamicGroups = useMemo<NavGroup[]>(() => [
    {
      id: "observe",
      label: "Observe",
      items: [
        {
          title: "Overview",
          icon: LayoutDashboard,
          href: projectDashboardHref,
        },
        {
          title: "Runs",
          icon: Activity,
          href: projectId ? `/dashboard/${projectId}/runs` : projectSetupHref,
        },
        {
          title: "Sessions",
          icon: Activity,
          href: projectId ? `/dashboard/${projectId}/sessions` : projectSetupHref,
        },
        {
          title: "Search",
          icon: Search,
          href: projectId ? `/dashboard/${projectId}/search` : projectSetupHref,
        },
        {
          title: "Costs",
          icon: BarChart3,
          href: projectId ? `/dashboard/${projectId}/costs` : projectSetupHref,
        },
        {
          title: "Reports",
          icon: FileText,
          href: projectId ? `/dashboard/${projectId}/reports` : projectSetupHref,
        },
      ],
    },
    {
      id: "control",
      label: "Control",
      items: [
        {
          title: "Runtime Policy",
          icon: ShieldCheck,
          href: projectId ? `/dashboard/${projectId}/control` : projectSetupHref,
        },
      ],
    },
    {
      id: "configure",
      label: "Configure",
      items: [
        {
          title: "Settings",
          icon: Settings2,
          href: projectId ? `/dashboard/${projectId}/settings` : projectSetupHref,
        },
        {
          title: "Manage",
          icon: SlidersHorizontal,
          href: projectId ? `/dashboard/${projectId}/manage` : projectSetupHref,
        },
      ],
    },
    {
      id: "resources",
      label: "Resources",
      items: [
        {
          title: "Quickstart",
          icon: Terminal,
          href: projectId ? `/dashboard/${projectId}/quickstart` : "/onboarding/project",
        },
        {
          title: "Docs",
          icon: BookOpen,
          href: "https://docs.tracify.tech",
          external: true,
        },
        {
          title: "Roadmap",
          icon: FileText,
          href: "/roadmap",
          external: true,
        },
      ],
    },
  ], [projectDashboardHref, projectId, projectSetupHref]);

  const [openGroups, setOpenGroups] = useState<Record<GroupId, boolean>>(() => {
    if (typeof window === "undefined") {
      return { observe: true, control: true, configure: true, resources: true };
    }
    const stored = window.localStorage.getItem(GROUP_STORAGE_KEY);
    const defaults: Record<GroupId, boolean> = {
      observe: true,
      control: true,
      configure: true,
      resources: true,
    };
    if (!stored) return defaults;
    try {
      return { ...defaults, ...(JSON.parse(stored) as Partial<Record<GroupId, boolean>>) };
    } catch {
      return defaults;
    }
  });

  const showExpandedContent = !isCollapsed;
  const visualWidth = showExpandedContent ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  function toggleCollapsed() {
    onCollapsedChange(!isCollapsed);
  }

  function expandSidebar(groupId?: GroupId) {
    if (groupId) {
      setOpenGroups((current) => {
        if (current[groupId]) return current;
        const next = { ...current, [groupId]: true };
        window.localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
    if (isCollapsed) {
      onCollapsedChange(false);
      window.localStorage.setItem(COLLAPSED_STORAGE_KEY, "false");
    }
  }

  function toggleGroup(id: GroupId) {
    setOpenGroups((current) => {
      const next = { ...current, [id]: !current[id] };
      window.localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const collapseLabel = isCollapsed ? "Expand sidebar" : "Collapse sidebar";
  const CollapseIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-[#2A2A2A] bg-[#111111] transition-[width] duration-150 ease-out motion-reduce:transition-none",
      )}
      style={{ width: visualWidth }}
    >
      <div
        className={cn(
          "flex h-[60px] items-center border-b border-[#2A2A2A]",
          showExpandedContent ? "justify-between px-4" : "justify-center px-0",
        )}
      >
        {showExpandedContent ? (
          <Link
            href={projectDashboardHref}
            className="font-pixel text-lg leading-none text-white"
          >
            tracify
          </Link>
        ) : null}

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                aria-label={collapseLabel}
                onClick={toggleCollapsed}
                className="size-7"
              >
                <CollapseIcon className="size-4" />
              </Button>
            }
          />
          <TooltipContent
            side="right"
            className="rounded-none border border-[#2A2A2A] bg-[#111111] font-mono text-xs text-[#CCCCCC] shadow-none"
          >
            {collapseLabel}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="border-b border-[#2A2A2A] p-3">
        <ProjectSwitcher isCollapsed={!showExpandedContent} />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        {dynamicGroups.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            showExpandedContent={showExpandedContent}
            isOpen={openGroups[group.id]}
            pathname={pathname}
            projectId={projectId}
            onToggle={() => toggleGroup(group.id)}
            onNavClick={(href) => {
              const navGroup = dynamicGroups.find((group) => group.items.some((item) => item.href === href));
              expandSidebar(navGroup?.id);
            }}
          />
        ))}
      </nav>

    </aside>
  );
}

function SidebarGroup({
  group,
  showExpandedContent,
  isOpen,
  pathname,
  projectId,
  onToggle,
  onNavClick,
}: {
  group: NavGroup;
  showExpandedContent: boolean;
  isOpen: boolean;
  pathname: string;
  projectId: string;
  onToggle: () => void;
  onNavClick: (href: string) => void;
}) {
  const hasActiveItem = group.items.some((item) =>
    isActivePath(pathname, item.href, projectId),
  );
  const isVisuallyOpen = isOpen || hasActiveItem;
  const visibleItems = useMemo(
    () => (!showExpandedContent || isVisuallyOpen ? group.items : []),
    [group.items, showExpandedContent, isVisuallyOpen],
  );

  return (
    <div className="mb-5">
      {showExpandedContent ? (
        <button
          type="button"
          onClick={onToggle}
          className="mb-2 flex h-7 w-full items-center justify-between px-2 text-left font-mono text-[11px] uppercase tracking-wide text-[#666666] outline-none transition-colors hover:text-[#999999] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#666666]"
        >
          <span>{group.label}</span>
          <ChevronDown
            className={cn(
              "size-3 transition-transform duration-150 motion-reduce:transition-none",
              !isVisuallyOpen && "-rotate-90",
            )}
          />
        </button>
      ) : null}
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-150 motion-reduce:transition-none",
          visibleItems.length ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.title}
              item={item}
              showExpandedContent={showExpandedContent}
              isActive={isActivePath(pathname, item.href, projectId)}
              onNavClick={() => onNavClick(item.href)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavLink({
  item,
  showExpandedContent,
  isActive,
  onNavClick,
}: {
  item: NavItem;
  showExpandedContent: boolean;
  isActive: boolean;
  onNavClick: () => void;
}) {
  const Icon = item.icon;
  const className = cn(
    "flex h-9 items-center border-l-2 border-transparent px-2 font-mono text-[13px] font-normal text-[#666666] outline-none transition-colors hover:bg-[#161616] hover:text-[#CCCCCC] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#666666]",
    showExpandedContent ? "gap-2" : "justify-center",
    isActive && "border-l-white text-white hover:bg-[#161616]",
  );
  const link = (
    <Link
      href={item.href}
      className={className}
      aria-label={item.title}
      onClick={onNavClick}
    >
      <Icon className="size-4 shrink-0" />
      {showExpandedContent ? (
        <span className="truncate">{item.title}</span>
      ) : null}
    </Link>
  );

  if (showExpandedContent) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent
        side="right"
        className="rounded-none border border-[#2A2A2A] bg-[#111111] font-mono text-xs text-[#CCCCCC] shadow-none"
      >
        {item.title}
      </TooltipContent>
    </Tooltip>
  );
}
