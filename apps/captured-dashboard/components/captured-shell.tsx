"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useReducer, useState, type ComponentType } from "react";
import { Activity, Bell, ChevronDown, Database, FlaskConical, Grid2X2, Home, MessageSquareText, PanelLeftClose, Search, Settings2, Table2, Users } from "lucide-react";

import type { WorkspaceSurface } from "../features/dashboard-workspace/contracts";
import { PLAYGROUND_NAV_GROUPS, PLAYGROUND_SUPPORT_LINKS, SURFACE_LABELS, playgroundPath } from "../features/dashboard-workspace/route-map";

const NAV_ICONS: Partial<Record<WorkspaceSurface, ComponentType<{ className?: string }>>> = {
  home: Home,
  dashboards: Grid2X2,
  tracing: Activity,
  sessions: Activity,
  users: Users,
  alerts: Bell,
  prompts: MessageSquareText,
  playground: FlaskConical,
  scores: Table2,
  evaluators: FlaskConical,
  "annotation-queues": MessageSquareText,
  datasets: Database,
  experiments: FlaskConical,
  settings: Settings2,
};

type Overlay = "none" | "command" | "project" | "account";
type ShellState = { mobileOpen: boolean; overlay: Overlay };
type ShellAction =
  | { type: "toggle-sidebar" }
  | { type: "close-sidebar" }
  | { type: "open-overlay"; overlay: Overlay }
  | { type: "toggle-overlay"; overlay: Overlay }
  | { type: "close-overlays" };

// Single reducer owns every shell overlay state so keyboard, backdrop, and
// navigation gestures always settle the drawer, popovers, and palette together.
function shellReducer(state: ShellState, action: ShellAction): ShellState {
  switch (action.type) {
    case "toggle-sidebar":
      return { ...state, mobileOpen: !state.mobileOpen };
    case "close-sidebar":
      return { ...state, mobileOpen: false };
    case "open-overlay":
      return { ...state, overlay: action.overlay };
    case "toggle-overlay":
      return { ...state, overlay: state.overlay === action.overlay ? "none" : action.overlay };
    case "close-overlays":
      return { ...state, mobileOpen: false, overlay: "none" };
    default:
      return state;
  }
}

function isActive(pathname: string, href: string) {
  return href === "/playground" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function CapturedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, dispatch] = useReducer(shellReducer, { mobileOpen: false, overlay: "none" });
  const [commandQuery, setCommandQuery] = useState("");

  useEffect(() => {
    const openCommand = () => dispatch({ type: "open-overlay", overlay: "command" });
    const openProject = () => dispatch({ type: "open-overlay", overlay: "project" });
    const toggleSidebar = () => dispatch({ type: "toggle-sidebar" });
    window.addEventListener("tracify:open-command", openCommand);
    window.addEventListener("tracify:open-project-switcher", openProject);
    window.addEventListener("tracify:toggle-sidebar", toggleSidebar);
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        dispatch({ type: "open-overlay", overlay: "command" });
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "i") {
        event.preventDefault();
        dispatch({ type: "open-overlay", overlay: "command" });
      }
      if (event.key === "Escape") {
        dispatch({ type: "close-overlays" });
        setCommandQuery("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("tracify:open-command", openCommand);
      window.removeEventListener("tracify:open-project-switcher", openProject);
      window.removeEventListener("tracify:toggle-sidebar", toggleSidebar);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const navEntries = PLAYGROUND_NAV_GROUPS.flatMap((group) => group.surfaces.map((surface) => ({
    title: SURFACE_LABELS[surface],
    href: playgroundPath("/playground", surface),
    Icon: NAV_ICONS[surface] ?? Activity,
  })));
  const supportEntries = PLAYGROUND_SUPPORT_LINKS.map(([title, href]) => ({ title, href, Icon: MessageSquareText }));
  const paletteMatches = [...navEntries, ...supportEntries].filter((entry) => {
    const query = commandQuery.trim().toLowerCase();
    return !query || entry.title.toLowerCase().includes(query) || entry.href.toLowerCase().includes(query);
  });

  const settleAfterNavigation = () => {
    dispatch({ type: "close-overlays" });
    setCommandQuery("");
  };

  return <div className="captured-app-shell">
    <aside className={`captured-app-sidebar ${state.mobileOpen ? "is-open" : ""}`}>
      <div className="captured-app-brand-row">
        <Link href="/playground" aria-label="Tracify dashboard" className="captured-reference-brand"><i aria-hidden="true" />tracify</Link>
        <button type="button" aria-label="Close sidebar" onClick={() => dispatch({ type: "close-sidebar" })}><PanelLeftClose className="size-4" /></button>
      </div>
      <button type="button" className="captured-app-project" aria-expanded={state.overlay === "project"} onClick={() => dispatch({ type: "toggle-overlay", overlay: "project" })}>Demo Project (view only) <ChevronDown className="ml-auto size-3" /></button>
      <div className="captured-app-context"><Link href="/playground" className={isActive(pathname, "/playground") ? "active" : ""} onClick={settleAfterNavigation}>↗ <span>Live demo</span></Link><button type="button" className="captured-app-context-link" onClick={() => dispatch({ type: "open-overlay", overlay: "project" })}>⊞ <span>Your Orgs</span></button></div>
      <nav className="captured-app-nav">
        <button type="button" className="captured-app-nav-search" onClick={() => dispatch({ type: "open-overlay", overlay: "command" })}><Search className="size-4" /><span>Go to...</span><kbd className="ml-auto text-[9px]">Ctrl K</kbd></button>
        {PLAYGROUND_NAV_GROUPS.map((group) => <div className="captured-app-nav-group" key={group.label || group.surfaces[0]}>
          {group.label ? <div className="captured-app-nav-label">{group.label}</div> : null}
          {group.surfaces.map((surface) => {
            const Icon = NAV_ICONS[surface] ?? Activity;
            const href = playgroundPath("/playground", surface);
            return <Link href={href} key={surface} className={`captured-app-nav-link ${isActive(pathname, href) ? "active" : ""}`} onClick={settleAfterNavigation}><Icon className="size-4 shrink-0" /><span className="truncate">{SURFACE_LABELS[surface]}</span></Link>;
          })}
        </div>)}
        <div className="captured-app-nav-group">
          {PLAYGROUND_SUPPORT_LINKS.map(([title, href]) => <a href={href} key={title} className="captured-app-nav-link"><MessageSquareText className="size-4 shrink-0" /><span className="truncate">{title}</span></a>)}
        </div>
      </nav>
      <button type="button" className="captured-app-account" aria-label="Kristoffer Bon account menu" aria-expanded={state.overlay === "account"} onClick={() => dispatch({ type: "toggle-overlay", overlay: "account" })}>
        <span className="captured-app-avatar" aria-hidden="true">KB</span><span className="captured-app-account-copy"><span className="truncate">Kristoffer Bon</span><span className="truncate">kristoffer.bon@gmail.com</span></span><ChevronDown className="ml-auto size-3" />
      </button>
      {state.overlay === "project" ? <div className="captured-app-popover captured-app-project-popover" role="dialog" aria-label="Project switcher"><strong>Demo Project</strong><span>Sandbox reference workspace</span><button type="button" onClick={() => dispatch({ type: "open-overlay", overlay: "none" })}>Close</button></div> : null}
      {state.overlay === "account" ? <div className="captured-app-popover captured-app-account-popover" role="dialog" aria-label="Account menu"><strong>Kristoffer Bon</strong><span>kristoffer.bon@gmail.com</span><button type="button" onClick={() => dispatch({ type: "open-overlay", overlay: "none" })}>Close</button></div> : null}
    </aside>
    {state.mobileOpen ? <button type="button" aria-label="Close sidebar" className="captured-app-backdrop" onClick={() => dispatch({ type: "close-sidebar" })} /> : null}
    {state.overlay === "command" ? <div className="captured-app-command-layer">
      <button type="button" className="captured-app-command-backdrop" aria-label="Close command menu" onClick={() => dispatch({ type: "open-overlay", overlay: "none" })} />
      <div className="captured-app-command" role="dialog" aria-label="Go to">
        <div><Search className="size-4" /><input autoFocus aria-label="Search navigation" placeholder="Search navigation" value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") dispatch({ type: "close-overlays" }); }} /></div>
        {paletteMatches.length ? paletteMatches.map((entry) => {
          const Icon = entry.Icon;
          return <Link href={entry.href} key={`${entry.title}-${entry.href}`} onClick={settleAfterNavigation}><Icon className="size-4" />{entry.title}</Link>;
        }) : <p className="captured-command-empty">No navigation target matches “{commandQuery.trim()}”.</p>}
      </div>
    </div> : null}
    <div className="captured-app-main"><main className="captured-app-scroll">{children}</main></div>
  </div>;
}
