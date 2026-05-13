"use client";

import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { Problem } from "@/components/marketing/problem";
import { DebugStream } from "@/components/marketing/debug-stream";
import { FirstTrace } from "@/components/marketing/first-trace";
import { WhatYouGet } from "@/components/marketing/what-you-get";
import { UseCases } from "@/components/marketing/use-cases";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { FinalCTA } from "@/components/marketing/final-cta";
import { Navbar } from "@/components/marketing/navbar";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-white font-sans selection:bg-white/10"
      style={{ backgroundColor: "#050505" }}
    >
      <Navbar />

      {/* ── Main content ──────────────────────────────────────────── */}
      <main id="main-content">
        <Hero />
        <Problem />
        <DebugStream />
        <FirstTrace />
        <WhatYouGet />
        <UseCases />
        <PricingTeaser />

        <FinalCTA />
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer
        className="border-t py-12 px-6 bg-[#0A0A0A]"
        style={{ borderColor: "#2A2A2A" }}
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1">
              <div 
                className="text-lg text-white mb-6 tracking-tight"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                5to1r
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-[#666666]">
                Agent observability infrastructure
                <br />
                for developers building with AI.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-white">Product</h4>
              <nav className="flex flex-col gap-3 font-mono text-[11px] text-[#666666]">
                <Link href="/product" className="hover:text-white">Features</Link>
                <Link href="/pricing" className="hover:text-white">Pricing</Link>
                <Link href="/docs" className="hover:text-white">Documentation</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-white">Company</h4>
              <nav className="flex flex-col gap-3 font-mono text-[11px] text-[#666666]">
                <Link href="/about" className="hover:text-white">About</Link>
                <Link href="/changelog" className="hover:text-white">Changelog</Link>
                <Link href="/privacy" className="hover:text-white">Privacy</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-white">Legal</h4>
              <nav className="flex flex-col gap-3 font-mono text-[11px] text-[#666666]">
                <Link href="/terms" className="hover:text-white">Terms</Link>
                <Link href="/privacy" className="hover:text-white">Privacy</Link>
              </nav>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-[#1A1A1A] flex justify-between items-center">
            <p className="font-mono text-[10px] text-[#333333]">
              © 2024 5to1r Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
