"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { ChevronDown, Grid2X2, Home, PanelLeftClose, Search, Settings2, Table2, Users, Activity, Bell, MessageSquareText, FlaskConical, Database, PhoneCall } from "lucide-react";

type NavItem = [title: string, href: string, icon: ComponentType<{ className?: string }>];
type NavGroup = { label: string; items: NavItem[] };
const groups: NavGroup[] = [
  { label: "", items: [["Home", "/playground", Home], ["Dashboards", "/playground/dashboards", Grid2X2]] },
  { label: "Observability", items: [["Tracing", "/playground/tracing", Activity], ["Sessions", "/playground/sessions", Activity], ["Users", "/playground/users", Users], ["Alerts", "/playground/alerts", Bell]] },
  { label: "Prompt Management", items: [["Prompts", "/playground/prompts", MessageSquareText], ["Playground", "/playground/playground", FlaskConical]] },
  { label: "Evaluation", items: [["Scores", "/playground/scores", Table2], ["Evaluators", "/playground/evaluators", FlaskConical], ["Human Annotation", "/playground/annotation-queues", MessageSquareText], ["Datasets", "/playground/datasets", Database], ["Experiments", "/playground/experiments", FlaskConical]] },
  { label: "", items: [["Settings", "/playground/settings", Settings2]] },
  { label: "", items: [["Book a call", "mailto:support@tracify.tech?subject=Book%20a%20call", PhoneCall], ["Support", "mailto:support@tracify.tech", MessageSquareText]] },
];

function isActive(pathname: string, href: string) {
  return href === "/playground" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  useEffect(() => {
    const openCommand = () => setCommandOpen(true);
    const openProject = () => setProjectOpen(true);
    window.addEventListener("tracify:open-command", openCommand);
    window.addEventListener("tracify:open-project-switcher", openProject);
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setProjectOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("tracify:open-command", openCommand);
      window.removeEventListener("tracify:open-project-switcher", openProject);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  return <>
    <aside className={`captured-app-sidebar ${open ? "is-open" : ""}`}>
      <div className="captured-app-brand-row">
        <Link href="/playground" aria-label="Tracify dashboard" className="captured-reference-brand"><i aria-hidden="true" />tracify</Link>
        <button type="button" aria-label="Close sidebar" onClick={onClose}><PanelLeftClose className="size-4" /></button>
      </div>
      <button type="button" className="captured-app-project" aria-expanded={projectOpen} onClick={() => setProjectOpen((value) => !value)}>Demo Project (view only) <ChevronDown className="ml-auto size-3" /></button>
      <div className="captured-app-context"><Link href="/playground" className={isActive(pathname, "/playground") ? "active" : ""}>↗ <span>Live demo</span></Link><button type="button" className="captured-app-context-link" onClick={() => setProjectOpen(true)}>⊞ <span>Your Orgs</span></button></div>
      <nav className="captured-app-nav">
          <button type="button" className="captured-app-nav-search" onClick={() => setCommandOpen(true)}><Search className="size-4" /><span>Go to...</span><kbd className="ml-auto text-[9px]">Ctrl K</kbd></button>
        {groups.map((group) => <div className="captured-app-nav-group" key={group.label || group.items[0][0]}>
          {group.label ? <div className="captured-app-nav-label">{group.label}</div> : null}
          {group.items.map(([title, href, Icon]) => <Link href={href} key={title} className={`captured-app-nav-link ${href.startsWith("/") && isActive(pathname, href) ? "active" : ""}`} onClick={onClose}><Icon className="size-4 shrink-0" /><span className="truncate">{title}</span></Link>)}
        </div>)}
      </nav>
      <button type="button" className="captured-app-account" aria-label="Kristoffer Bon account menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((value) => !value)}>
        <span className="captured-app-avatar" aria-hidden="true">KB</span><span className="captured-app-account-copy"><span className="truncate">Kristoffer Bon</span><span className="truncate">kristoffer.bon@gmail.com</span></span><ChevronDown className="ml-auto size-3" />
      </button>
      {projectOpen ? <div className="captured-app-popover captured-app-project-popover" role="dialog" aria-label="Project switcher"><strong>Demo Project</strong><span>Sandbox reference workspace</span><button type="button" onClick={() => setProjectOpen(false)}>Close</button></div> : null}
      {accountOpen ? <div className="captured-app-popover captured-app-account-popover" role="dialog" aria-label="Account menu"><strong>Kristoffer Bon</strong><span>kristoffer.bon@gmail.com</span><button type="button" onClick={() => setAccountOpen(false)}>Close</button></div> : null}
    </aside>
    {open ? <button type="button" aria-label="Close sidebar" className="captured-app-backdrop" onClick={onClose} /> : null}
    {commandOpen ? <div className="captured-app-command-layer"><button type="button" className="captured-app-command-backdrop" aria-label="Close command menu" onClick={() => setCommandOpen(false)} /><div className="captured-app-command" role="dialog" aria-label="Go to"><div><Search className="size-4" /><input autoFocus aria-label="Search navigation" placeholder="Search navigation" onKeyDown={(event) => { if (event.key === "Escape") setCommandOpen(false); }} /></div>{groups.flatMap((group) => group.items).map(([title, href, Icon]) => <Link href={href} key={title} onClick={() => setCommandOpen(false)}><Icon className="size-4" />{title}</Link>)}</div></div> : null}
  </>;
}

export function CapturedShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const toggle = () => setMobileOpen((current) => !current);
    window.addEventListener("tracify:toggle-sidebar", toggle);
    return () => window.removeEventListener("tracify:toggle-sidebar", toggle);
  }, []);
  return <div className="captured-app-shell"><Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="captured-app-main"><main className="captured-app-scroll">{children}</main></div></div>;
}
