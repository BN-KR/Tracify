"use client";

import React from "react";
import Link from "next/link";
import { Show, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { DropdownNavigation, type NavItem } from "./dropdown-navigation";
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
  FileCode
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
    id: 3,
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
    ],
  },
  {
    id: 4,
    label: "Pricing",
    href: "/pricing",
  },
  {
    id: 5,
    label: "Changelog",
    href: "/changelog",
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
      </div>
    </header>
  );
}
