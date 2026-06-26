"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Show, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { DropdownNavigation, type NavItem } from "./dropdown-navigation";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Activity,
  BarChart3,
  FileText,
  Wrench,
  Cpu,
  AlertTriangle,
  Search,
  MessageSquare,
  Workflow,
  Terminal,
  BookOpen,
  Code2,
  Braces,
  FileCode,
  Feather,
  GitCompare,
  Menu,
  ChevronDown,
} from "lucide-react";

const NAV_ITEMS: NavItem[] = [
  {
    id: 1,
    label: "Products",
    subMenus: [
      {
        title: "Platform",
        items: [
          {
            label: "Trace Viewer",
            description: "Inspect every tool call, LLM decision, and failure.",
            href: "/product/trace-viewer",
            icon: Activity,
          },
          {
            label: "Cost Dashboard",
            description: "See spend by run, model, tool, and span.",
            href: "/product/cost-dashboard",
            icon: BarChart3,
          },
          {
            label: "Reports",
            description: "Print activity, cost, alerts, and failed-trace proof.",
            href: "/pricing",
            icon: FileText,
          },
        ],
      },
      {
        title: "Signals",
        items: [
          {
            label: "Tool Calls",
            description: "Track external API and function calls.",
            href: "/product/tool-calls",
            icon: Wrench,
          },
          {
            label: "LLM Calls",
            description: "Capture model, latency, tokens, and cost.",
            href: "/product/llm-calls",
            icon: Cpu,
          },
          {
            label: "Failures",
            description: "Surface errors, retries, stalls, and loops.",
            href: "/product/failures",
            icon: AlertTriangle,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    label: "Developers",
    subMenus: [
      {
        title: "Start",
        items: [
          {
            label: "Docs",
            description: "Install the SDK and send your first span.",
            href: "/docs",
            icon: BookOpen,
          },
          {
            label: "Python SDK",
            description: "Instrument agents with a decorator.",
            href: "/docs/python",
            icon: Code2,
          },
          {
            label: "TypeScript SDK",
            description: "Trace Node and Next.js agent workflows.",
            href: "/docs/typescript",
            icon: Braces,
          },
          {
            label: "API Reference",
            description: "Ingest spans directly from custom runtimes.",
            href: "/docs/api",
            icon: FileCode,
          },
        ],
      },
      {
        title: "Resources",
        items: [
          {
            label: "Blog",
            description: "Engineering insights and agent patterns.",
            href: "/blog",
            icon: Feather,
          },
          {
            label: "Changelog",
            description: "Product updates and release notes.",
            href: "/changelog",
            icon: GitCompare,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Use Cases",
    subMenus: [
      {
        title: "Agent Types",
        items: [
          {
            label: "Research Agents",
            description: "Trace browsing, summarization, and source gathering.",
            href: "/use-cases/research",
            icon: Search,
          },
          {
            label: "Support Agents",
            description: "Inspect conversations, tools, and escalation paths.",
            href: "/use-cases/support",
            icon: MessageSquare,
          },
          {
            label: "Automation Agents",
            description: "Debug multi-step workflows and retries.",
            href: "/use-cases/automation",
            icon: Workflow,
          },
          {
            label: "Tool-Calling Agents",
            description: "Catch loops, failed APIs, and hidden cost spikes.",
            href: "/use-cases/tool-calling",
            icon: Terminal,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    label: "Pricing",
    href: "/pricing",
  },
  {
    id: 5,
    label: "Blog",
    href: "/blog",
  },
];

export function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center border-b bg-background/80 backdrop-blur-md border-[#1A1A1A]"
      style={{ height: "60px" }}
    >
      <div className="w-full max-w-[1200px] px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center">
          <div
            className="font-pixel text-lg text-white"
          >
            tracify
          </div>
        </Link>

        {/* Center: Navigation */}
        <div className="hidden md:block">
          <DropdownNavigation navItems={NAV_ITEMS} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Show when="signed-in">
              <SignOutButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-mono text-xs h-8 px-4"
                >
                  Sign out
                </Button>
              </SignOutButton>
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  size="sm"
                  className="font-mono text-xs h-8 px-4"
                >
                  Dashboard
                </Button>
              </Link>
            </Show>
            <Show when="signed-out">
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className="font-mono text-[13px] px-3 py-1"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  variant="default"
                  size="sm"
                  className="font-mono text-xs h-8 px-4"
                >
                  Start free
                </Button>
              </Link>
            </Show>
          </div>

          {/* Mobile hamburger */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <Sheet>
      <SheetTrigger
        className="md:hidden"
        render={
          <Button variant="ghost" size="icon-sm" />
        }
      >
        <Menu className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] sm:w-[350px] bg-[#050505] border-l border-[#1A1A1A] flex flex-col"
      >
        <SheetHeader className="border-b border-[#1A1A1A] pb-4">
          <SheetTitle>
            <Link href="/" className="font-pixel text-lg text-white">
              tracify
            </Link>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                {item.subMenus ? (
                  <>
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === item.id ? null : item.id
                        )
                      }
                      className="flex items-center justify-between w-full px-2 py-2.5 font-mono text-[13px] text-[#666666] hover:text-white transition-colors text-left"
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedId === item.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedId === item.id && (
                      <div className="ml-2 border-l border-[#1A1A1A] pl-3">
                        {item.subMenus.map((section, idx) => (
                          <div key={idx} className="py-1">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-[#444444] px-2 py-1">
                              {section.title}
                            </p>
                            {section.items.map((subItem, sIdx) => (
                              <Link
                                key={sIdx}
                                href={subItem.href}
                                className="flex items-center gap-3 px-2 py-2 font-mono text-[13px] text-[#999999] hover:text-white hover:bg-[#0A0A0A] transition-colors rounded"
                              >
                                <subItem.icon className="w-4 h-4 shrink-0" />
                                <span>{subItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="block px-2 py-2.5 font-mono text-[13px] text-[#666666] hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-[#1A1A1A] px-4 py-4 flex flex-col gap-2">
          <Show when="signed-out">
            <Link href="/sign-in" className="w-full">
              <Button
                variant="ghost"
                className="w-full font-mono text-[13px] justify-center"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up" className="w-full">
              <Button
                variant="default"
                className="w-full font-mono text-xs h-8"
              >
                Start free
              </Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="w-full">
              <Button
                variant="secondary"
                className="w-full font-mono text-xs h-8"
              >
                Dashboard
              </Button>
            </Link>
            <SignOutButton>
              <Button
                variant="ghost"
                className="w-full font-mono text-xs h-8"
              >
                Sign out
              </Button>
            </SignOutButton>
          </Show>
        </div>
      </SheetContent>
    </Sheet>
  );
}
