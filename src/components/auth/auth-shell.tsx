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
 * 
 * Performance: Stripped of all Framer Motion entrance animations to ensure
 * instant loading and avoid perceived 'black overlay' delays.
 */
export function AuthShell({ mode, children }: AuthShellProps) {
  return (
    <div className="h-screen w-full flex bg-[#050505] text-white selection:bg-white/20 overflow-hidden relative">
      {/* Global Home Link (Top Right) */}
      <div className="absolute top-6 right-6 z-50">
        <Link 
          href="/" 
          className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all active:scale-95"
        >
          Home
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1.5 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]" />
        </Link>
      </div>

      {/* Left Panel: Full Terminal Visual (45% on large screens) */}
      <aside className="hidden lg:flex lg:w-[45%] flex-col bg-[#050505] border-r border-white/10 relative">
        {/* Terminal Header */}
        <div className="h-10 border-b border-white/10 bg-[#0A0A0A] flex items-center px-4 justify-between shrink-0">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-default active:scale-90" 
              />
            ))}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
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
                className="font-pixel text-lg text-white"
              >
                5to1r
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
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
        <div className="h-8 border-t border-white/10 bg-[#0A0A0A] flex items-center px-4 shrink-0">
          <div className="flex gap-6">
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">utf-8</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">connected: secure-wss</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">telemetry: active</span>
          </div>
        </div>
      </aside>

      {/* Right Panel: Auth Content (55% or full width) */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative overflow-y-auto bg-[#050505] scrollbar-hide">
        <div className="w-full max-w-[440px] flex flex-col gap-4">
          {/* Clerk Component Area */}
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
