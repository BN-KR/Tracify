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
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
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

const GROUP_STORAGE_KEY = "tracify:dashboard-sidebar-groups";
const COLLAPSED_STORAGE_KEY = "tracify.sidebar.collapsed";
// Matches the captured dashboard shell's 3rem collapsed rail.
const COLLAPSED_WIDTH = 48;
// Matches the captured dashboard shell's 11.5rem expanded sidebar.
const EXPANDED_WIDTH = 184;

function isActivePath(pathname: string, href: string, projectId: string, isPreview = false) {
  if (href.startsWith("http")) return false;
  const hrefPath = href.split("?")[0];
  if (hrefPath === `/dashboard/${projectId}`) {
    return pathname === "/dashboard" || pathname === hrefPath || (isPreview && pathname.startsWith("/tracify-preview"));
  }
  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

export function DashboardSidebar({
  canAccessContent,
  isCollapsed,
  onCollapsedChange,
  projectIdOverride,
  previewProjectName,
}: {
  canAccessContent: boolean;
  isCollapsed: boolean;
  onCollapsedChange: (next: boolean) => void;
  projectIdOverride?: string;
  previewProjectName?: string;
}) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = projectIdOverride || (params?.projectId as string) || "";
  const projectDashboardHref = projectId ? `/dashboard/${projectId}` : "/dashboard";
  const region = getTracifyRegion();
  const dynamicGroups = useMemo<NavGroup[]>(() => [
    {
      id: "observe",
      label: "Observe",
      items: [
        {
          title: "Home",
          icon: LayoutDashboard,
          href: projectDashboardHref,
        },
        {
          title: "Dashboards",
          icon: LayoutDashboard,
          href: projectId ? `/dashboard/${projectId}/dashboards` : "/dashboard/dashboards",
        },
        {
          title: "Tracing",
          icon: Activity,
          href: projectId ? `/dashboard/${projectId}/tracing` : "/dashboard/runs",
        },
        {
          title: "Sessions",
          icon: Activity,
          href: projectId ? `/dashboard/${projectId}/sessions` : "/dashboard/sessions",
        },
        {
          title: "Users",
          icon: Users,
          href: projectId ? `/dashboard/${projectId}/users` : "/dashboard/users",
        },
        {
          title: "Search",
          icon: Search,
          href: projectId ? `/dashboard/${projectId}/search` : "/dashboard/search",
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
          href: projectId ? `/dashboard/${projectId}/costs` : "/dashboard/costs",
        },
        {
          title: "Reports",
          icon: FileText,
          href: projectId ? `/dashboard/${projectId}/reports` : "/dashboard/reports",
        },
        {
          title: "Trace Compare",
          icon: GitCompare,
          href: projectId ? `/dashboard/${projectId}/compare` : "/dashboard/compare",
        },
        {
          title: "Investigation",
          icon: Search,
          href: projectId ? `/dashboard/${projectId}/investigate` : "/dashboard/investigate",
        },
      ],
    },
    {
      id: "improve",
      label: "Improve",
      items: [
        {
          title: "Prompt Management",
          icon: MessageSquareText,
          href: projectId ? "/dashboard/" + projectId + "/prompt-management" : "/dashboard/prompts",
        },
        {
          title: "Evaluation",
          icon: FlaskConical,
          href: projectId ? "/dashboard/" + projectId + "/evaluation" : "/dashboard/evaluation",
        },
        {
          title: "Scores",
          icon: BarChart3,
          href: projectId ? `/dashboard/${projectId}/scores` : "/dashboard/evaluation",
        },
        {
          title: "Evaluators",
          icon: FlaskConical,
          href: projectId ? `/dashboard/${projectId}/evaluators` : "/dashboard/evaluation",
        },
        {
          title: "Human Annotation",
          icon: MessageSquareText,
          href: projectId ? `/dashboard/${projectId}/human-annotation` : "/dashboard/evaluation",
        },
        {
          title: "Datasets",
          icon: Database,
          href: projectId ? "/dashboard/" + projectId + "/datasets" : "/dashboard/datasets",
        },
        {
          title: "Experiments",
          icon: GitCompare,
          href: projectId ? "/dashboard/" + projectId + "/experiments" : "/dashboard/experiments",
        },
        {
          title: "Playground",
          icon: PlaygroundIcon,
          href: projectId ? "/dashboard/" + projectId + "/playground" : "/dashboard/playground",
        },
        {
          title: "Resilience",
          icon: Zap,
          href: projectId ? "/dashboard/" + projectId + "/resilience" : "/dashboard/resilience",
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
          href: projectId ? `/dashboard/${projectId}/control` : "/dashboard/control",
        },
        {
          title: "Alerts",
          icon: Activity,
          href: projectId ? `/dashboard/${projectId}/alerts` : "/dashboard/alerts",
        },
        {
          title: "Automations",
          icon: Zap,
          href: projectId ? `/dashboard/${projectId}/automations` : "/dashboard/automations",
        },
        {
          title: "Operations",
          icon: Globe2,
          href: projectId ? `/dashboard/${projectId}/operations` : "/dashboard/operations",
        },
        {
          title: "Integrations",
          icon: Terminal,
          href: projectId ? `/dashboard/${projectId}/settings/integrations` : "/integrations",
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
          href: projectId ? `/dashboard/${projectId}/settings` : "/dashboard/settings",
        },
        {
          title: "Members",
          icon: Activity,
          href: projectId ? `/dashboard/${projectId}/settings?tab=members` : "/dashboard/members",
        },
        {
          title: "Manage",
          icon: SlidersHorizontal,
          href: projectId ? `/dashboard/${projectId}/manage` : "/dashboard/manage",
        },
        {
          title: "API Keys",
          icon: Terminal,
          href: projectId ? `/dashboard/${projectId}/api-keys` : "/dashboard/api-keys",
        },
        {
          title: "Billing",
          icon: FileText,
          href: projectId ? `/dashboard/${projectId}/billing` : "/dashboard/billing",
        },
        {
          title: "Widget library",
          icon: Settings2,
          href: projectId ? `/dashboard/${projectId}/widgets` : "/dashboard/widgets",
        },
        {
          title: "Upgrade Plan",
          icon: Zap,
          href: projectId ? `/dashboard/${projectId}/billing` : "/dashboard/billing",
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
          href: projectId ? `/dashboard/${projectId}/quickstart` : "/dashboard/quickstart",
        },
        {
          title: "Docs",
          icon: BookOpen,
          href: "/docs",
          external: true,
        },
        {
          title: "Support",
          icon: MessageSquareText,
          href: "/contact",
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
  ], [canAccessContent, projectDashboardHref, projectId]);

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

  useEffect(() => {
    function onShellToggle() { onCollapsedChange(!isCollapsed); }
    window.addEventListener("tracify:toggle-sidebar", onShellToggle);
    return () => window.removeEventListener("tracify:toggle-sidebar", onShellToggle);
  }, [isCollapsed, onCollapsedChange]);

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
        "tracify-shell-sidebar fixed inset-y-0 left-0 z-30 flex flex-col border-r border-black/15 bg-white transition-[width] duration-150 ease-out motion-reduce:transition-none",
      )}
      style={{ width: visualWidth }}
    >
      <div
        className={cn(
          "flex h-11 items-center border-b border-black/15",
          showExpandedContent ? "justify-between px-4" : "justify-center px-0",
        )}
      >
        {showExpandedContent ? (
          <Link
            href={projectDashboardHref}
            aria-label="Tracify dashboard"
            className="text-black focus-visible:outline-1 focus-visible:outline-offset-4"
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
            className="rounded-none border border-black/15 bg-white font-mono text-xs text-black/70 shadow-none"
          >
            {collapseLabel} · Ctrl+\
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="border-b border-black/15 p-3">
        <ProjectSwitcher isCollapsed={!showExpandedContent} previewProjectName={previewProjectName} />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        <button
          type="button"
          aria-label="Go to"
          onClick={() => window.dispatchEvent(new Event("tracify:open-command"))}
          className={cn(
            "mb-4 flex h-8 w-full items-center gap-2 border border-transparent px-2 text-left font-mono text-[12px] text-black/70 transition-colors hover:border-black/15 hover:bg-[#f3f2ed] hover:text-black",
            !showExpandedContent && "justify-center px-0",
          )}
        >
          <Search className="size-4 shrink-0" />
          {showExpandedContent ? <><span className="truncate">Go to...</span><kbd className="ml-auto border border-black/15 px-1.5 py-0.5 text-[9px] leading-none text-black/50">Ctrl K</kbd></> : null}
        </button>
        {dynamicGroups.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            showExpandedContent={showExpandedContent}
            isOpen={openGroups[group.id]}
            pathname={pathname}
            projectId={projectId}
            isPreview={Boolean(projectIdOverride)}
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
        className={cn("flex min-h-12 items-center border-t border-black/15 px-4 text-black/55 hover:bg-[#f3f2ed] hover:text-black", showExpandedContent ? "gap-3" : "justify-center")}
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
  isPreview,
  onToggle,
  onNavClick,
}: {
  group: NavGroup;
  showExpandedContent: boolean;
  isOpen: boolean;
  pathname: string;
  projectId: string;
  isPreview: boolean;
  onToggle: () => void;
  onNavClick: (href: string) => void;
}) {
  const hasActiveItem = group.items.some((item) =>
    isActivePath(pathname, item.href, projectId, isPreview),
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
          className="mb-2 flex h-7 w-full items-center justify-between px-2 text-left font-mono text-[11px] uppercase tracking-wide text-black/55 outline-none transition-colors hover:text-black/60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-black/55"
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
              isActive={isActivePath(pathname, item.href, projectId, isPreview)}
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
    "flex h-9 items-center border-l-2 border-transparent px-2 font-mono text-[13px] font-normal text-black/55 outline-none transition-colors hover:bg-[#f3f2ed] hover:text-black/70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-black/55",
    showExpandedContent ? "gap-2" : "justify-center",
    isActive && "border-l-white text-black hover:bg-[#f3f2ed]",
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
        className="rounded-none border border-black/15 bg-white font-mono text-xs text-black/70 shadow-none"
      >
        {item.title}
      </TooltipContent>
    </Tooltip>
  );
}
