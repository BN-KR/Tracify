"use client";

import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronDown,
  FileText,
  Database,
  LayoutDashboard,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  MessageSquareText,
  FlaskConical,
  GitCompare,
  FlaskConical as PlaygroundIcon,
  Settings2,
  ShieldCheck,
  Terminal,
  Globe2,
  Zap,
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
import { BrandLogo } from "@/components/brand-logo";
import { getTracifyRegion } from "@/lib/regions";

type GroupId = "observe" | "analyze" | "improve" | "operate" | "manage" | "resources";

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
  const hrefPath = href.split("?")[0];
  if (hrefPath === `/dashboard/${projectId}`) {
    return pathname === "/dashboard" || pathname === hrefPath;
  }
  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

export function DashboardSidebar({
  canAccessContent,
  isCollapsed,
  onCollapsedChange,
}: {
  canAccessContent: boolean;
  isCollapsed: boolean;
  onCollapsedChange: (next: boolean) => void;
}) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = (params?.projectId as string) || "";
  const projectDashboardHref = projectId ? `/dashboard/${projectId}` : "/dashboard";
  const projectSetupHref = projectId ? `/dashboard/${projectId}` : "/onboarding/project";
  const region = getTracifyRegion();
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
      ],
    },
    {
      id: "analyze",
      label: "Analyze",
      items: [
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
      id: "improve",
      label: "Improve",
      items: [
        {
          title: "Prompts",
          icon: MessageSquareText,
          href: projectId ? "/dashboard/" + projectId + "/prompts" : projectSetupHref,
        },
        {
          title: "Evaluation",
          icon: FlaskConical,
          href: projectId ? "/dashboard/" + projectId + "/evaluation" : projectSetupHref,
        },
        {
          title: "Datasets",
          icon: Database,
          href: projectId ? "/dashboard/" + projectId + "/datasets" : projectSetupHref,
        },
        {
          title: "Experiments",
          icon: GitCompare,
          href: projectId ? "/dashboard/" + projectId + "/experiments" : projectSetupHref,
        },
        {
          title: "Playground",
          icon: PlaygroundIcon,
          href: projectId ? "/dashboard/" + projectId + "/playground" : projectSetupHref,
        },
        {
          title: "Resilience",
          icon: Zap,
          href: projectId ? "/dashboard/" + projectId + "/resilience" : projectSetupHref,
        },
      ],
    },
    {
      id: "operate",
      label: "Operate",
      items: [
        {
          title: "Runtime Policy",
          icon: ShieldCheck,
          href: projectId ? `/dashboard/${projectId}/control` : projectSetupHref,
        },
        {
          title: "Alerts",
          icon: Activity,
          href: projectId ? `/dashboard/${projectId}/alerts` : projectSetupHref,
        },
        {
          title: "Integrations",
          icon: Terminal,
          href: "/integrations",
          external: true,
        },
      ],
    },
    {
      id: "manage",
      label: "Manage",
      items: [
        {
          title: "Settings",
          icon: Settings2,
          href: projectId ? `/dashboard/${projectId}/settings` : projectSetupHref,
        },
        {
          title: "Members",
          icon: Activity,
          href: projectId ? `/dashboard/${projectId}/settings?tab=members` : projectSetupHref,
        },
        {
          title: "Manage",
          icon: SlidersHorizontal,
          href: projectId ? `/dashboard/${projectId}/manage` : projectSetupHref,
        },
        {
          title: "API Keys",
          icon: Terminal,
          href: projectId ? `/dashboard/${projectId}/api-keys` : projectSetupHref,
        },
        {
          title: "Billing",
          icon: FileText,
          href: projectId ? `/dashboard/${projectId}/billing` : projectSetupHref,
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
          href: "/docs",
          external: true,
        },
        {
          title: "Roadmap",
          icon: FileText,
          href: "/roadmap",
          external: true,
        },
        ...(canAccessContent
          ? [
              { title: "Admin Library", icon: ShieldCheck, href: "/admin/library" },
            ]
          : []),
      ],
    },
  ], [canAccessContent, projectDashboardHref, projectId, projectSetupHref]);

  const [openGroups, setOpenGroups] = useState<Record<GroupId, boolean>>(() => {
    if (typeof window === "undefined") {
      return { observe: true, analyze: true, improve: true, operate: true, manage: true, resources: true };
    }
    const stored = window.localStorage.getItem(GROUP_STORAGE_KEY);
    const defaults: Record<GroupId, boolean> = {
      observe: true,
      analyze: true,
      improve: true,
      operate: true,
      manage: true,
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
            aria-label="Tracify dashboard"
            className="text-white focus-visible:outline-1 focus-visible:outline-offset-4"
          >
            <BrandLogo className="text-lg" highlighted={false} />
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
            {collapseLabel} · Ctrl+\
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

      <Link
        href="https://www.tracify.tech/cloud?next=/dashboard"
        className={cn("flex min-h-12 items-center border-t border-[#2A2A2A] px-4 text-[#777] hover:bg-[#161616] hover:text-white", showExpandedContent ? "gap-3" : "justify-center")}
        aria-label={`${region.name} cloud region. Open region directory`}
      >
        <Globe2 className="size-4 shrink-0" />
        {showExpandedContent ? <span className="font-mono text-[10px] uppercase tracking-[0.12em]">{region.flag} {region.shortName} cloud · Switch</span> : null}
      </Link>

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
