"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const menus = {
  Product: [
    ["Observe", "Traces · sessions · costs", "/product/trace-viewer"],
    [
      "Improve",
      "Evaluations · datasets · prompts",
      "/product/evaluation-engine",
    ],
    ["Release", "Experiments · gates · monitors", "/product/lifecycle"],
    ["Operate", "Alerts · reports · integrations", "/integrations"],
  ],
  Solutions: [
    [
      "Support",
      "Find the decision behind every escalation",
      "/use-cases/support",
    ],
    ["Research", "Verify multi-step investigations", "/use-cases/research"],
    ["Automation", "Debug workflows and retry chains", "/use-cases/automation"],
    ["Tool calling", "Catch failed APIs and loops", "/use-cases/tool-calling"],
  ],
  Developers: [
    ["Docs", "Install and send your first trace", "/docs"],
    ["TypeScript SDK", "Trace Node and Next.js agents", "/docs/typescript"],
    ["Python SDK", "Instrument with a decorator", "/docs/python"],
    ["API reference", "Ingest from custom runtimes", "/docs/api"],
  ],
  Company: [
    ["Blog", "Agent engineering notes", "/blog"],
    ["Roadmap", "What is shipping next", "/roadmap"],
    ["Security", "How Tracify handles data", "/security"],
    ["Contact", "Talk through your stack", "/contact"],
  ],
} as const;

type MenuName = keyof typeof menus;

export function Navbar() {
  const [active, setActive] = useState<MenuName | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        onMouseLeave={() => setActive(null)}
        className="w-full border-b border-black/20 bg-[#eceae3] text-black shadow-[0_8px_0_rgba(0,0,0,0.22)]"
      >
        <div className="flex h-[54px] items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="relative isolate px-1 font-pixel text-2xl tracking-[-0.06em] before:absolute before:-inset-x-1 before:bottom-0.5 before:-z-10 before:h-[68%] before:-rotate-1 before:skew-x-[-7deg] before:bg-[#f4d44d]/80 before:content-['']"
          >
            tracify
          </Link>
          <nav className="hidden h-full items-center gap-7 font-mono text-[9px] uppercase tracking-[0.12em] md:flex">
            {(Object.keys(menus) as MenuName[]).map((name) => (
              <button
                key={name}
                type="button"
                onMouseEnter={() => setActive(name)}
                onFocus={() => setActive(name)}
                onClick={() =>
                  setActive((current) => (current === name ? null : name))
                }
                aria-expanded={active === name}
                className={`h-full border-b-2 transition-colors ${active === name ? "border-black" : "border-transparent hover:border-black/35"}`}
              >
                {name}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/admin/library"
              className="font-mono text-[8px] uppercase tracking-[0.12em] text-black/55 hover:text-black"
            >
              Admin
            </Link>
            <Link
              href="/sign-up"
              className="bg-black px-4 py-2.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white hover:bg-[#f4d44d] hover:text-black"
            >
              Start free
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation"
            className="md:hidden"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
        <div>
          {active ? (
            <DesktopPanel name={active} onClose={() => setActive(null)} />
          ) : null}
        </div>
        {mobileOpen ? (
          <MobilePanel onClose={() => setMobileOpen(false)} />
        ) : null}
      </div>
    </header>
  );
}

function DesktopPanel({
  name,
  onClose,
}: {
  name: MenuName;
  onClose: () => void;
}) {
  return (
    <div className="grid border-t border-black/15 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="grid sm:grid-cols-2">
        {menus[name].map(([title, body, href]) => (
          <Link
            onClick={onClose}
            key={title}
            href={href}
            className="border-b border-r border-black/10 p-6 transition-colors hover:bg-[#f4d44d]"
          >
            <p className="font-pixel text-4xl tracking-[-0.06em]">{title}</p>
            <p className="mt-3 text-xs leading-5 text-black/55">{body}</p>
          </Link>
        ))}
      </div>
      <div className="bg-black p-7 text-white">
        <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-zinc-600">
          Featured
        </p>
        <p className="mt-10 font-pixel text-5xl leading-[0.88] tracking-[-0.06em]">
          The complete agent lifecycle.
        </p>
        <Link
          onClick={onClose}
          href="/product/lifecycle"
          className="mt-10 inline-block border-b border-[#f4d44d] pb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#f4d44d]"
        >
          Explore workflow
        </Link>
      </div>
    </div>
  );
}

function MobilePanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="border-t border-black/15 p-4 md:hidden">
      {(Object.keys(menus) as MenuName[]).map((name) => (
        <div key={name} className="border-b border-black/10 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.13em]">
            {name}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {menus[name].map(([title, , href]) => (
              <Link
                onClick={onClose}
                key={title}
                href={href}
                className="font-mono text-[9px] text-black/60 hover:text-black"
              >
                {title}
              </Link>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-5 flex gap-3">
        <Link
          onClick={onClose}
          href="/admin/library"
          className="border border-black px-3 py-2 font-mono text-[8px] uppercase"
        >
          Admin
        </Link>
        <Link
          onClick={onClose}
          href="/sign-up"
          className="bg-black px-3 py-2 font-mono text-[8px] uppercase text-white"
        >
          Start free
        </Link>
      </div>
    </div>
  );
}
