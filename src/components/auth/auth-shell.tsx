"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthTerminalPanel } from "./auth-terminal-panel";

type AuthShellProps = {
  mode: "sign-in" | "sign-up";
  children: React.ReactNode;
};

/**
 * AuthShell Component
 * 
 * Provides the split-screen layout for authentication pages.
 * Left: Dynamic terminal visual (desktop only).
 * Right: Clerk authentication form.
 */
export function AuthShell({ mode, children }: AuthShellProps) {
  return (
    <div className="h-screen w-full flex bg-[#050505] text-[#CCCCCC] selection:bg-white/10 overflow-hidden relative">
      {/* Global Home Link (Top Right) */}
      <div className="absolute top-6 right-6 z-50">
        <Link 
          href="/" 
          className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#666666] hover:text-white transition-colors"
        >
          Home
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Left Panel: Full Terminal Visual (45% on large screens) */}
      <aside className="hidden lg:flex lg:w-[45%] flex-col bg-[#050505] border-r border-[#2A2A2A] relative">
        {/* Terminal Header */}
        <div className="h-10 border-b border-[#2A2A2A] bg-[#0A0A0A] flex items-center px-4 justify-between shrink-0">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#666666]">
            5to1r-trace-v1.0.4 — session_8f21a9
          </div>
          <div className="w-12" /> {/* Spacer */}
        </div>

        {/* Terminal Content Area */}
        <div className="flex-1 p-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-[440px] flex flex-col gap-10">
            {/* Logo & Branding */}
            <div className="flex flex-col gap-2">
              <div 
                className="font-pixel font-bold text-2xl text-white tracking-tighter"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                5to1r
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#666666]">
                agent observability infrastructure
              </p>
            </div>

            {/* Terminal Component - Full width now */}
            <div className="w-full">
              <AuthTerminalPanel />
            </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="h-8 border-t border-[#2A2A2A] bg-[#0A0A0A] flex items-center px-4 shrink-0">
          <div className="flex gap-6">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#444444]">utf-8</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#444444]">connected: secure-wss</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#444444]">telemetry: active</span>
          </div>
        </div>
      </aside>

      {/* Right Panel: Auth Content (55% or full width) */}
      <main className="flex-1 flex flex-col items-center p-6 md:p-12 lg:p-24 relative overflow-y-auto bg-[#050505] scrollbar-hide">
        <div className="w-full max-w-[440px] flex flex-col gap-4 my-auto">

          {/* Clerk Component Area */}
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
