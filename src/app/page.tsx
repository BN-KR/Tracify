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
import { Footer } from "@/components/marketing/footer";

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

      <Footer />
    </div>
  );
}
