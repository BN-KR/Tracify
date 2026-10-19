"use client";

import {
  Activity,
  BarChart3,
  BookOpen,
  CircleHelp,
  Eye,
  Plus,
  FileText,
  Database,
  LayoutDashboard,
  SlidersHorizontal,
  Search,
  MessageSquareText,
  PhoneCall,
  FlaskConical,
  GitCompare,
  Settings2,
  ShieldCheck,
  Terminal,
  Globe2,
  Zap,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";
import { SidebarAccountMenu } from "@/components/dashboard/sidebar-account-menu";
import { usePathname, useParams, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DEMO_BASE_PATH } from "@/lib/demo/demo-config";
import { FinishSetupCard, PinButton, PinnedSection, SavedViewsSection, usePins, useSavedViews } from "@/components/dashboard/sidebar-extras";

type RailId = "observe" | "analyze" | "improve" | "operate" | "manage" | "help";

const RAIL_ORDER: RailId[] = ["observe", "analyze", "improve", "operate", "manage", "help"];
const RAIL_META: Record<RailId, { label: string; blurb: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  observe: { label: "Observe", blurb: "every run, step and user", icon: Eye },
  analyze: { label: "Analyze", blurb: "costs, reports, comparisons", icon: BarChart3 },
  improve: { label: "Improve", blurb: "prompts, tests, scoring", icon: FlaskConical },
  operate: { label: "Operate", blurb: "alerts, rules, automation", icon: Zap },
  manage: { label: "Manage", blurb: "project, team, billing", icon: Settings2 },
  help: { label: "Help", blurb: "guides and support", icon: CircleHelp },
};

type GroupId = "primary" | "observe" | "analyze" | "improve" | "operate" | "manage" | "resources";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
};

type NavGroup = {
  id: GroupId;
  label: string;
  items: NavItem[];
};

const COLLAPSED_STORAGE_KEY = "tracify.sidebar.collapsed";
const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 296;
const RAIL_WIDTH = 72;
const MARKETING_ORIGIN = "https://www.tracify.tech";

function isActivePath(pathname: string, href: string, projectId: string, isPreview = false, currentSearch = "") {
  if (href.startsWith("http")) return false;
  const hrefPath = href.split("?")[0];
  if (hrefPath === "/playground") {
    const requestedView = new URLSearchParams(href.split("?")[1] ?? "").get("view") ?? "home";
    const activeView = new URLSearchParams(currentSearch).get("view") ?? "home";
    return pathname === "/playground" && requestedView === activeView;
  }
  if (hrefPath === DEMO_BASE_PATH) return pathname === hrefPath;
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
  synthetic = false,
  demo = false,
  isMobileOpen = false,
  onMobileClose,
  onMobileToggle,
}: {
  canAccessContent: boolean;
  isCollapsed: boolean;
  onCollapsedChange: (next: boolean) => void;
  projectIdOverride?: string;
  previewProjectName?: string;
  synthetic?: boolean;
  /** The public demo project: same navigation, pointed at the read-only sample pages. */
  demo?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onMobileToggle?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const projectId = projectIdOverride || (params?.projectId as string) || "";
  const isSynthetic = synthetic && pathname.startsWith("/playground");
  const syntheticHref = (view: string) => (view === "home" ? "/playground" : `/playground/${view}`);
  const projectDashboardHref = isSynthetic ? "/dashboard" : demo ? DEMO_BASE_PATH : projectId ? `/dashboard/${projectId}` : "/dashboard";
  const workspaceHref = useCallback(
    (view: string, liveView = view) =>
      isSynthetic
        ? view === "home"
          ? "/playground"
          : `/playground/${view}`
        : liveView === "home"
          ? projectDashboardHref
          : `${projectDashboardHref}/${liveView}`,
    [isSynthetic, projectDashboardHref],
  );

  const dynamicGroups = useMemo<NavGroup[]>(() => {
    if (isSynthetic || projectId) {
      return [
        {
          id: "primary",
          label: "",
          items: [
            { title: "Home", icon: LayoutDashboard, href: workspaceHref("home") },
            { title: "Dashboards", icon: LayoutDashboard, href: workspaceHref("dashboards") },
          ],
        },
        {
          id: "observe",
          label: "Observability",
          items: [
            { title: "Tracing", icon: Activity, href: workspaceHref("tracing") },
            ...(!isSynthetic && !demo ? [{ title: "Actions", icon: Activity, href: workspaceHref("steps") }] : []),
            ...(demo ? [{ title: "Costs", icon: BarChart3, href: workspaceHref("costs") }] : []),
            { title: "Explore", icon: Zap, href: workspaceHref("explore") },
            { title: "Sessions", icon: Activity, href: workspaceHref("sessions") },
            { title: "Users", icon: Users, href: workspaceHref("users") },
            { title: "Alerts", icon: Activity, href: workspaceHref("alerts") },
          ],
        },
        {
          id: "improve",
          label: "Prompt Management",
          items: [
            { title: "Prompts", icon: MessageSquareText, href: workspaceHref("prompts") },
            { title: "Playground", icon: FlaskConical, href: workspaceHref("playground") },
          ],
        },
        {
          id: "analyze",
          label: "Evaluation",
          items: [
            { title: "Scores", icon: BarChart3, href: workspaceHref("scores") },
            { title: "Evaluators", icon: FlaskConical, href: workspaceHref("evaluators") },
            { title: "Human Annotation", icon: MessageSquareText, href: workspaceHref("annotation-queues", "human-annotation") },
            { title: "Datasets", icon: Database, href: workspaceHref("datasets") },
            { title: "Experiments", icon: FlaskConical, href: workspaceHref("experiments") },
          ],
        },
        {
          id: "manage",
          label: "",
          items: [{ title: "Settings", icon: Settings2, href: workspaceHref("settings") }],
        },
        {
          id: "resources",
          label: "",
          items: [
            { title: "Book a call", icon: PhoneCall, href: `${MARKETING_ORIGIN}/contact`, external: true },
            { title: "Support", icon: MessageSquareText, href: `${MARKETING_ORIGIN}/contact`, external: true },
          ],
        },
      ];
    }
    return [
      {
        id: "observe",
        label: "Observe",
        items: [
          { title: "Home", icon: LayoutDashboard, href: isSynthetic ? syntheticHref("home") : projectDashboardHref },
          { title: "Dashboards", icon: LayoutDashboard, href: isSynthetic ? syntheticHref("dashboards") : projectId ? `/dashboard/${projectId}/dashboards` : "/dashboard/dashboards" },
          { title: "Tracing", icon: Activity, href: isSynthetic ? syntheticHref("tracing") : projectId ? `/dashboard/${projectId}/tracing` : "/dashboard/runs" },
          ...(!isSynthetic && projectId ? [{ title: "Actions", icon: Activity, href: `/dashboard/${projectId}/steps` }] : []),
          { title: "Sessions", icon: Activity, href: isSynthetic ? syntheticHref("sessions") : projectId ? `/dashboard/${projectId}/sessions` : "/dashboard/sessions" },
          { title: "Users", icon: Users, href: isSynthetic ? syntheticHref("users") : projectId ? `/dashboard/${projectId}/users` : "/dashboard/users" },
          { title: "Search", icon: Search, href: isSynthetic ? syntheticHref("search") : projectId ? `/dashboard/${projectId}/search` : "/dashboard/search" },
        ],
      },
      {
        id: "analyze",
        label: "Analyze",
        items: [
          { title: "Costs", icon: BarChart3, href: isSynthetic ? syntheticHref("costs") : projectId ? `/dashboard/${projectId}/costs` : "/dashboard/costs" },
          { title: "Comparisons", icon: GitCompare, href: isSynthetic ? syntheticHref("compare") : projectId ? `/dashboard/${projectId}/comparisons` : "/dashboard/comparisons" },
          { title: "Reports", icon: FileText, href: isSynthetic ? syntheticHref("reports") : projectId ? `/dashboard/${projectId}/reports` : "/dashboard/reports" },
          { title: "Compare runs", icon: GitCompare, href: isSynthetic ? syntheticHref("compare") : projectId ? `/dashboard/${projectId}/compare` : "/dashboard/compare" },
          { title: "Investigation", icon: Search, href: isSynthetic ? syntheticHref("investigate") : projectId ? `/dashboard/${projectId}/investigate` : "/dashboard/investigate" },
        ],
      },
      {
        id: "improve",
        label: "Improve",
        items: [
          { title: "Prompt Management", icon: MessageSquareText, href: isSynthetic ? syntheticHref("prompts") : projectId ? `/dashboard/${projectId}/prompt-management` : "/dashboard/prompts" },
          { title: "Evaluation", icon: FlaskConical, href: isSynthetic ? syntheticHref("evaluation") : projectId ? `/dashboard/${projectId}/evaluation` : "/dashboard/evaluation" },
          { title: "Scores", icon: BarChart3, href: isSynthetic ? syntheticHref("scores") : projectId ? `/dashboard/${projectId}/scores` : "/dashboard/evaluation" },
          { title: "Evaluators", icon: FlaskConical, href: isSynthetic ? syntheticHref("evaluators") : projectId ? `/dashboard/${projectId}/evaluators` : "/dashboard/evaluation" },
          { title: "Human Annotation", icon: MessageSquareText, href: isSynthetic ? syntheticHref("annotation") : projectId ? `/dashboard/${projectId}/human-annotation` : "/dashboard/evaluation" },
          { title: "Datasets", icon: Database, href: isSynthetic ? syntheticHref("datasets") : projectId ? `/dashboard/${projectId}/datasets` : "/dashboard/datasets" },
          { title: "Experiments", icon: GitCompare, href: isSynthetic ? syntheticHref("experiments") : projectId ? `/dashboard/${projectId}/experiments` : "/dashboard/experiments" },
          { title: "Playground", icon: FlaskConical, href: isSynthetic ? syntheticHref("playground") : projectId ? `/dashboard/${projectId}/playground` : "/dashboard/playground" },
          { title: "Resilience", icon: Zap, href: isSynthetic ? syntheticHref("resilience") : projectId ? `/dashboard/${projectId}/resilience` : "/dashboard/resilience" },
        ],
      },
      {
        id: "operate",
        label: "Operate",
        items: [
          { title: "Runtime Policy", icon: ShieldCheck, href: isSynthetic ? syntheticHref("control") : projectId ? `/dashboard/${projectId}/control` : "/dashboard/control" },
          { title: "Alerts", icon: Activity, href: isSynthetic ? syntheticHref("alerts") : projectId ? `/dashboard/${projectId}/alerts` : "/dashboard/alerts" },
          { title: "Automations", icon: Zap, href: isSynthetic ? syntheticHref("automations") : projectId ? `/dashboard/${projectId}/automations` : "/dashboard/automations" },
          { title: "Operations", icon: Globe2, href: isSynthetic ? syntheticHref("operations") : projectId ? `/dashboard/${projectId}/operations` : "/dashboard/operations" },
          { title: "Integrations", icon: Terminal, href: isSynthetic ? syntheticHref("integrations") : projectId ? `/dashboard/${projectId}/settings/integrations` : "/integrations" },
        ],
      },
      {
        id: "manage",
        label: "Manage",
        items: [
          { title: "Settings", icon: Settings2, href: isSynthetic ? syntheticHref("settings") : projectId ? `/dashboard/${projectId}/settings` : "/dashboard/settings" },
          { title: "Members", icon: Activity, href: isSynthetic ? syntheticHref("members") : projectId ? `/dashboard/${projectId}/settings?tab=members` : "/dashboard/members" },
          { title: "Manage", icon: SlidersHorizontal, href: isSynthetic ? syntheticHref("manage") : projectId ? `/dashboard/${projectId}/manage` : "/dashboard/manage" },
          { title: "API Keys", icon: Terminal, href: isSynthetic ? syntheticHref("api-keys") : projectId ? `/dashboard/${projectId}/api-keys` : "/dashboard/api-keys" },
          { title: "Billing", icon: FileText, href: isSynthetic ? syntheticHref("billing") : projectId ? `/dashboard/${projectId}/billing` : "/dashboard/billing" },
          { title: "Widget library", icon: Settings2, href: isSynthetic ? syntheticHref("widgets") : projectId ? `/dashboard/${projectId}/widgets` : "/dashboard/widgets" },
          { title: "Upgrade Plan", icon: Zap, href: isSynthetic ? syntheticHref("upgrade") : projectId ? `/dashboard/${projectId}/billing` : "/dashboard/billing" },
        ],
      },
      {
        id: "resources",
        label: "Resources",
        items: [
          { title: "Quickstart", icon: Terminal, href: isSynthetic ? syntheticHref("quickstart") : projectId ? `/dashboard/${projectId}/quickstart` : "/dashboard/quickstart" },
          { title: "Docs", icon: BookOpen, href: `${MARKETING_ORIGIN}/docs`, external: true },
          { title: "Support", icon: MessageSquareText, href: `${MARKETING_ORIGIN}/contact`, external: true },
          { title: "Roadmap", icon: FileText, href: `${MARKETING_ORIGIN}/roadmap`, external: true },
          ...(canAccessContent
            ? [{ title: "Admin Library", icon: ShieldCheck, href: "/admin/library" }]
            : []),
        ],
      },
    ];
  }, [canAccessContent, demo, isSynthetic, projectDashboardHref, projectId, workspaceHref]);

  const railGroups = useMemo(() => {
    const byRail = new Map<RailId, NavItem[]>();
    for (const group of dynamicGroups) {
      const railId = group.id === "primary" ? "observe" : group.id === "resources" ? "help" : group.id;
      byRail.set(railId, [...(byRail.get(railId) ?? []), ...group.items]);
    }
    return RAIL_ORDER.filter((id) => byRail.has(id)).map((id) => ({ id, ...RAIL_META[id], items: byRail.get(id) ?? [] }));
  }, [dynamicGroups]);

  const currentSearch = searchParams.toString();
  const activeRailId = railGroups.find(
    (group) => group.id !== "help" && group.items.some((item) => isActivePath(pathname, item.href, projectId, Boolean(projectIdOverride), currentSearch)),
  )?.id;
  // Picks and the help popup are tied to the page they were made on, so navigating resets them.
  const [picked, setPicked] = useState<{ id: RailId | "help-open"; path: string } | null>(null);
  const pickedGroup = picked && picked.path === pathname && picked.id !== "help-open" ? picked.id : null;
  const helpOpen = picked?.path === pathname && picked.id === "help-open";
  const panelGroupId: RailId = pickedGroup ?? activeRailId ?? "observe";
  const panelGroup = railGroups.find((group) => group.id === panelGroupId && group.id !== "help") ?? railGroups[0];

  const showPanel = !isCollapsed || isMobileOpen;
  const visualWidth = showPanel ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
  const helpGroup = railGroups.find((group) => group.id === "help");
  const alertsHref = workspaceHref("alerts");
  const liveProject = !isSynthetic && !demo && !projectIdOverride && Boolean(projectId);
  const { pins, toggle: togglePin, isPinned } = usePins(projectId);
  const savedViews = useSavedViews(projectId, liveProject && showPanel);

  useEffect(() => {
    function onShellToggle() {
      if (window.matchMedia("(max-width: 700px)").matches) {
        onMobileToggle?.();
        return;
      }
      onCollapsedChange(!isCollapsed);
    }
    window.addEventListener("tracify:toggle-sidebar", onShellToggle);
    return () => window.removeEventListener("tracify:toggle-sidebar", onShellToggle);
  }, [isCollapsed, onCollapsedChange, onMobileToggle]);

  function pickGroup(id: RailId) {
    if (id === "help") {
      setPicked(helpOpen ? null : { id: "help-open", path: pathname });
      return;
    }
    setPicked({ id, path: pathname });
    if (isCollapsed) {
      onCollapsedChange(false);
      window.localStorage.setItem(COLLAPSED_STORAGE_KEY, "false");
    }
  }

  return (
    <aside
      className={cn(
        "tracify-shell-sidebar fixed inset-y-0 left-0 z-30 flex border-r border-white/10 bg-[#0b0b0b] text-white transition-[width,transform] duration-150 ease-out motion-reduce:transition-none",
        isMobileOpen && "is-mobile-open",
      )}
      style={{ width: visualWidth }}
    >
      <div className="relative flex shrink-0 flex-col items-center border-r border-white/10 bg-[#050505] py-3" style={{ width: RAIL_WIDTH }}>
        <Link href={projectDashboardHref} aria-label="Tracify dashboard" className="mb-3 block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/dissolve/tracify-icon.svg" alt="" width={44} height={44} className="block size-11" />
        </Link>
        <div className="flex w-full flex-1 flex-col items-center gap-1 px-1.5">
          {railGroups.map((group) => {
            const Icon = group.icon;
            const isActive = group.id === "help" ? helpOpen : showPanel ? group.id === panelGroup?.id : group.id === activeRailId;
            return (
              <button
                key={group.id}
                type="button"
                aria-label={group.label}
                aria-pressed={isActive}
                onClick={() => pickGroup(group.id)}
                className={cn(
                  "flex w-full flex-col items-center gap-1 py-2 font-mono text-[10px] outline-none transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/55",
                  group.id === "help" && "mt-auto",
                  isActive ? "!bg-[#f4d44d] !text-[#090909]" : "!text-[#8d8d8d] hover:!text-white",
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.7} />
                {group.label}
              </button>
            );
          })}
        </div>
        {isCollapsed ? (
          <div className="mt-3 flex flex-col items-center gap-2">
            <ProjectSwitcher isCollapsed previewProjectName={previewProjectName} synthetic={isSynthetic || demo} />
            <SidebarAccountMenu isCollapsed synthetic={isSynthetic || demo} />
          </div>
        ) : null}
        {helpOpen && helpGroup ? (
          <div className="absolute bottom-3 left-[calc(100%+6px)] z-40 w-52 border-2 border-[#f4d44d] bg-[#090909] py-1 shadow-none">
            {helpGroup.items.map((item) => (
              <PanelLink key={item.title} item={item} isActive={false} onNavClick={() => { setPicked(null); onMobileClose?.(); }} />
            ))}
          </div>
        ) : null}
      </div>

      {showPanel && panelGroup ? (
        <div className="flex min-w-0 flex-1 flex-col bg-[#0f0f0f]">
          <div className="flex h-12 items-center border-b border-white/10 px-4">
            <Link href={projectDashboardHref} aria-label="Tracify dashboard">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/dissolve/tracify-name-on-dark.svg" alt="tracify" height={22} className="block h-[22px] w-auto" />
            </Link>
          </div>

          {isSynthetic ? (
            <div className="captured-sidebar-context border-y border-white/10">
              <Link href={DEMO_BASE_PATH} className="captured-sidebar-context-link is-demo">↗ <span>Use Demo App</span></Link>
              <a href={`${MARKETING_ORIGIN}/cloud`} className="captured-sidebar-context-link">⊞ <span>Your Orgs</span></a>
            </div>
          ) : null}

          <div className="px-4 pb-2 pt-3">
            <div className="font-mono text-[17px] font-semibold text-white">{panelGroup.label}</div>
            <div className="mt-0.5 font-mono text-[11px] text-white/40">{panelGroup.blurb}</div>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto py-1 scrollbar-hide" aria-label={panelGroup.label}>
            {liveProject ? <PinnedSection pins={pins} pathname={pathname} onToggle={togglePin} onNavClick={() => onMobileClose?.()} /> : null}
            {panelGroup.items.map((item) => (
              <PanelLink
                key={item.title}
                item={item}
                isActive={isActivePath(pathname, item.href, projectId, Boolean(projectIdOverride), currentSearch)}
                onNavClick={() => onMobileClose?.()}
                pin={liveProject && !item.external ? { pinned: isPinned(item.href), onToggle: () => togglePin({ href: item.href, title: item.title }) } : undefined}
              />
            ))}
            {liveProject && savedViews ? <SavedViewsSection views={savedViews} projectId={projectId} onNavClick={() => onMobileClose?.()} /> : null}
          </nav>

          {liveProject ? (
            <FinishSetupCard
              projectId={projectId}
              hasSavedView={Boolean(savedViews?.length)}
              tracingHref={workspaceHref("tracing")}
              keysHref={`${projectDashboardHref}/api-keys`}
              onNavClick={() => onMobileClose?.()}
            />
          ) : null}

          <div className="border-t border-white/10">
            <div className={cn("p-3", isSynthetic && "captured-sidebar-project")}>
              <ProjectSwitcher isCollapsed={false} previewProjectName={previewProjectName} synthetic={isSynthetic || demo} />
            </div>
            {!isSynthetic ? (
              <Link
                href={alertsHref}
                onClick={() => onMobileClose?.()}
                className="flex h-10 items-center gap-3 px-4 font-mono text-[12px] !text-[#bdbdbd] outline-none hover:bg-[#181818] hover:!text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/55"
              >
                <Plus className="size-4" />
                New alert
              </Link>
            ) : null}
            <div className="border-t border-white/10">
              <SidebarAccountMenu synthetic={isSynthetic || demo} />
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function PanelLink({ item, isActive, onNavClick, pin }: { item: NavItem; isActive: boolean; onNavClick: () => void; pin?: { pinned: boolean; onToggle: () => void } }) {
  const className = cn(
    "relative flex h-9 items-center gap-3 px-4 font-mono text-[13px] outline-none transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/55",
    isActive
      ? "!bg-[#1c1c1c] font-semibold !text-white before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[#f4d44d]"
      : "!text-[#a0a0a0] hover:!bg-[#181818] hover:!text-white",
  );
  const content = (
    <>
      <span className="truncate">{item.title}</span>
      {item.external ? <span className="ml-auto text-[11px] opacity-50">↗</span> : null}
    </>
  );
  if (item.external) return <a href={item.href} className={className} onClick={onNavClick}>{content}</a>;
  const link = <Link href={item.href} className={cn(className, pin && "pr-9")} aria-current={isActive ? "page" : undefined} onClick={onNavClick}>{content}</Link>;
  if (!pin) return link;
  return (
    <div className="group/row relative">
      {link}
      <PinButton pinned={pin.pinned} title={item.title} onToggle={pin.onToggle} />
    </div>
  );
}
