"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, ArrowUpRight, BarChart3, Database, FlaskConical, LayoutDashboard, Lock, Menu, MessageSquareText, Bell, X } from "lucide-react";

import { DEMO_BASE_PATH, DEMO_PROJECT_NAME } from "@/lib/demo/demo-config";

const LIVE = [
  { title: "Overview", icon: LayoutDashboard, href: DEMO_BASE_PATH },
  { title: "Tracing", icon: Activity, href: `${DEMO_BASE_PATH}/tracing` },
  { title: "Costs", icon: BarChart3, href: `${DEMO_BASE_PATH}/costs` },
];
const LOCKED = [
  { title: "Alerts", icon: Bell },
  { title: "Prompts", icon: MessageSquareText },
  { title: "Evaluation", icon: FlaskConical },
  { title: "Datasets", icon: Database },
];

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-0 flex-1 flex-col font-mono">
      <nav aria-label="Demo project" className="py-2">
        <p className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-[0.14em] text-white/35">Observe</p>
        {LIVE.map((item) => {
          const active = item.href === DEMO_BASE_PATH ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
              className={`relative flex h-9 items-center gap-3 px-4 text-[13px] outline-none transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/55 ${active ? "bg-[#1c1c1c] font-semibold !text-white before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[#f4d44d]" : "!text-[#a0a0a0] hover:bg-[#181818] hover:!text-white"}`}>
              <Icon className="size-4" strokeWidth={1.7} aria-hidden="true" />{item.title}
            </Link>
          );
        })}
        <p className="px-4 pb-1 pt-5 text-[10px] uppercase tracking-[0.14em] text-white/35">In your own project</p>
        {LOCKED.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href="/sign-up" onClick={onNavigate} title="Available in your own free project"
              className="flex h-9 items-center gap-3 px-4 text-[13px] !text-[#6d6d6d] outline-none hover:bg-[#141414] hover:!text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/55">
              <Icon className="size-4" strokeWidth={1.7} aria-hidden="true" />{item.title}<Lock className="ml-auto size-3" aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-white/10 p-3">
        <div className="border border-[#f4d44d] bg-[#f4d44d] p-3 text-[#090909]">
          <p className="text-[12px] font-semibold">This is sample data.</p>
          <p className="mt-1 text-[11px] leading-snug">Send your own agent&apos;s traces here in a few minutes. Free, no card.</p>
          <Link href="/sign-up" className="mt-3 flex h-8 items-center justify-between bg-[#090909] px-3 text-[11px] uppercase tracking-[0.12em] !text-[#f4d44d] hover:!text-white">
            Start tracing free <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <Link href="/demo" className="mt-3 block px-1 text-[11px] !text-[#8d8d8d] hover:!text-white">← About this demo</Link>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link href={DEMO_BASE_PATH} aria-label="Tracify demo project">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logos/dissolve/tracify-name-on-dark.svg" alt="tracify" height={22} className="block h-[22px] w-auto" />
    </Link>
  );
}

/** The chrome around the public demo project: a sidebar like the dashboard's, with the real pages and nothing that needs an account. */
export function DemoShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-svh w-full bg-[#0B0D10] text-white/80">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col border-r border-white/10 bg-[#0b0b0b] lg:flex">
        <div className="flex h-12 items-center border-b border-white/10 px-4"><Brand /></div>
        <div className="border-b border-white/10 px-4 py-3 font-mono">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Project</p>
          <p className="mt-1 flex items-center gap-2 text-[13px] text-white"><span className="size-2 animate-pulse bg-[#5BE3A0]" aria-hidden="true" />{DEMO_PROJECT_NAME}</p>
          <p className="mt-0.5 text-[11px] text-white/45">Demo · read only</p>
        </div>
        <Nav />
      </aside>

      <div className="fixed inset-x-0 top-0 z-30 flex h-12 items-center justify-between border-b border-white/10 bg-[#0b0b0b] px-4 lg:hidden">
        <Brand />
        <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex size-8 items-center justify-center !text-white">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <div className="fixed inset-x-0 bottom-0 top-12 z-20 flex flex-col overflow-y-auto bg-[#0b0b0b] lg:hidden">
          <Nav onNavigate={() => setOpen(false)} />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col pt-12 lg:pl-[236px] lg:pt-0">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[#1F242C] bg-[#0E1115] px-4 py-1.5 font-mono text-[11px] text-[#8B93A1]">
          <span className="flex items-center gap-2"><span className="size-1.5 bg-[#f4d44d]" aria-hidden="true" />Demo project · sample data, read only, no sign-up needed</span>
          <Link href="/sign-up" className="!text-[#f4d44d] hover:!text-white">Create your own free project →</Link>
        </div>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
