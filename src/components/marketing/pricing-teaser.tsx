"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function PricingTeaser() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const proFeatures = [
    { label: "spans/month", value: "5,000,000" },
    { label: "history", value: "90 days" },
    { label: "run replay", value: "included" },
    { label: "cost alerts", value: "included" },
    { label: "slack alerts", value: "included" },
    { label: "projects", value: "10" },
    { label: "team seats", value: "5 included" },
    { 
      label: "extra seats", 
      value: billingCycle === "monthly" ? "$19 / seat / month" : "$14.25 / seat / month" 
    },
  ];

  const teamFeatures = [
    { label: "spans/month", value: "50,000,000" },
    { label: "history", value: "1 year" },
    { label: "run replay", value: "included" },
    { label: "eval engine", value: "included" },
    { label: "alerts", value: "email + slack" },
    { label: "projects", value: "unlimited" },
    { label: "team seats", value: "10 included" },
    { 
      label: "extra seats", 
      value: billingCycle === "monthly" ? "$29 / seat / month" : "$21.75 / seat / month" 
    },
  ];

  const enterpriseFeatures = [
    { label: "span volume", value: "custom" },
    { label: "retention", value: "custom" },
    { label: "sso / saml", value: "included" },
    { label: "audit logs", value: "included" },
    { label: "data residency", value: "available" },
    { label: "deployment", value: "on-prem option" },
    { label: "dedicated engineer", value: "included" },
    { label: "sla", value: "guaranteed" },
  ];

  const freeFeatures = [
    { label: "spans/month", value: "50,000" },
    { label: "history", value: "7 days" },
    { label: "trace viewer", value: "included" },
    { label: "cost dashboard", value: "included" },
    { label: "projects", value: "1" },
    { label: "team members", value: "1" },
  ];

  const pricing = {
    pro: billingCycle === "monthly" 
      ? { price: "49", unit: "/ month", total: "" } 
      : { price: "36.75", unit: "/ month", total: "billed annually at $441" },
    team: billingCycle === "monthly" 
      ? { price: "299", unit: "/ month", total: "" } 
      : { price: "224.25", unit: "/ month", total: "billed annually at $2,691" },
  };

  return (
    <section className="w-full bg-[#050505] pt-16 pb-[72px] border-t border-[#1A1A1A]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        
        {/* Header */}
        <div className="max-w-[760px] mb-6">
          <h2 
            className="text-white font-bold tracking-tighter uppercase font-pixel leading-tight mb-4"
            style={{ 
              fontFamily: "var(--font-pixel)",
              fontSize: "clamp(28px, 5vw, 40px)"
            }}
          >
            Start free. Scale when your agents do.
          </h2>
          <p className="text-[#999999] text-[15px] leading-relaxed">
            Use 5to1r free while you build. Upgrade when you need replay, longer history, alerts, team workflows, or enterprise controls.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mb-12 flex flex-col items-start gap-4">
          <div className="flex items-center border border-[#2A2A2A] bg-[#0A0A0A] p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                billingCycle === "monthly" ? "bg-white text-black" : "text-[#999999] hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                billingCycle === "annual" ? "bg-white text-black" : "text-[#999999] hover:text-white"
              }`}
            >
              Annual <span className="ml-1 opacity-60">— 3 months free</span>
            </button>
          </div>
          <p className="font-mono text-[10px] text-[#444444] uppercase tracking-widest">
            Annual prices shown as effective monthly rates.
          </p>
        </div>

        {/* Paid Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          
          {/* Pro Plan */}
          <div className="bg-[#0A0A0A] p-6 md:p-8 flex flex-col h-full border border-[#2A2A2A]">
            <div className="mb-8">
              <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.2em] font-bold">Pro</span>
              <p className="mt-2 text-[#999999] text-[13px] h-10">For agents running in production.</p>
              <div className="mt-6 flex flex-col">
                <div className="flex items-baseline gap-1 h-10">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={billingCycle}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-4xl font-bold text-white font-mono"
                    >
                      ${pricing.pro.price}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[#666666] font-mono text-sm">{pricing.pro.unit}</span>
                </div>
                <div className="h-4">
                  <AnimatePresence mode="wait">
                    {billingCycle === "annual" && (
                      <motion.span
                        key="pro-annual-total"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="font-mono text-[10px] text-[#666666] mt-1 uppercase tracking-wider block"
                      >
                        {pricing.pro.total}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-[#1A1A1A] mb-8" />

            <div className="flex-1 flex flex-col gap-3 mb-10">
              {proFeatures.map((f, i) => (
                <div key={i} className="flex justify-between items-baseline border-b border-[#1A1A1A]/50 pb-2">
                  <div className="flex flex-col">
                    <span className="font-mono text-[11px] text-[#444444] uppercase tracking-wider">{f.label}</span>
                    {f.label === "extra seats" && billingCycle === "annual" && (
                      <span className="font-mono text-[9px] text-[#333333] uppercase tracking-wider">billed annually at $171 / seat</span>
                    )}
                  </div>
                  <div className="h-4 flex items-center">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${f.label}-${billingCycle}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="font-mono text-[11px] text-[#999999] text-right"
                      >
                        {f.value}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/sign-up?plan=pro">
              <Button 
                className="w-full h-12 rounded-none bg-white text-black hover:bg-[#EEEEEE] font-mono text-[13px] uppercase tracking-widest transition-colors"
                style={{ borderRadius: "0px" }}
              >
                Start Pro
              </Button>
            </Link>
          </div>

          {/* Team Plan */}
          <div className="bg-[#111111] p-6 md:p-8 flex flex-col h-full border border-[#3A3A3A] -mt-px md:mt-0 md:-ml-px z-10">
            <div className="mb-8">
              <span className="font-mono text-[10px] text-[#999999] uppercase tracking-[0.2em] font-bold">Team</span>
              <p className="mt-2 text-[#CCCCCC] text-[13px] h-10">For teams with heavy agent workloads.</p>
              <div className="mt-6 flex flex-col">
                <div className="flex items-baseline gap-1 h-10">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={billingCycle}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-4xl font-bold text-white font-mono"
                    >
                      ${pricing.team.price}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[#666666] font-mono text-sm">{pricing.team.unit}</span>
                </div>
                <div className="h-4">
                  <AnimatePresence mode="wait">
                    {billingCycle === "annual" && (
                      <motion.span
                        key="team-annual-total"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="font-mono text-[10px] text-[#666666] mt-1 uppercase tracking-wider block"
                      >
                        {pricing.team.total}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-[#2A2A2A] mb-8" />

            <div className="flex-1 flex flex-col gap-3 mb-10">
              {teamFeatures.map((f, i) => (
                <div key={i} className="flex justify-between items-baseline border-b border-[#2A2A2A] pb-2">
                  <div className="flex flex-col">
                    <span className="font-mono text-[11px] text-[#666666] uppercase tracking-wider">{f.label}</span>
                    {f.label === "extra seats" && billingCycle === "annual" && (
                      <span className="font-mono text-[9px] text-[#444444] uppercase tracking-wider">billed annually at $261 / seat</span>
                    )}
                  </div>
                  <div className="h-4 flex items-center">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${f.label}-${billingCycle}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="font-mono text-[11px] text-[#FFFFFF] text-right"
                      >
                        {f.value}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/sign-up?plan=team">
              <Button 
                variant="outline"
                className="w-full h-12 rounded-none border-[#2A2A2A] text-white hover:bg-[#161616] font-mono text-[13px] uppercase tracking-widest transition-colors bg-transparent"
                style={{ borderRadius: "0px" }}
              >
                Start Team
              </Button>
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-[#0A0A0A] p-6 md:p-8 flex flex-col h-full border border-[#3A3A3A] -mt-px md:mt-0 md:-ml-px">
            <div className="mb-8">
              <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.2em] font-bold">Enterprise</span>
              <p className="mt-2 text-[#999999] text-[13px] h-10">For organizations with compliance and residency requirements.</p>
              <div className="mt-6 flex flex-col">
                <div className="flex items-baseline gap-1 h-10">
                  <span className="text-4xl font-bold text-white font-mono">Custom</span>
                </div>
                <div className="h-4" />
              </div>
            </div>

            <div className="w-full h-px bg-[#1A1A1A] mb-8" />

            <div className="flex-1 flex flex-col gap-3 mb-10">
              {enterpriseFeatures.map((f, i) => (
                <div key={i} className="flex justify-between items-baseline border-b border-[#1A1A1A]/50 pb-2">
                  <span className="font-mono text-[11px] text-[#444444] uppercase tracking-wider">{f.label}</span>
                  <span className="font-mono text-[11px] text-[#999999]">{f.value}</span>
                </div>
              ))}
            </div>

            <Link href="mailto:sales@5to1r.com">
              <Button 
                variant="outline"
                className="w-full h-12 rounded-none border-[#3A3A3A] text-white hover:bg-[#161616] font-mono text-[13px] uppercase tracking-widest transition-colors bg-transparent"
                style={{ borderRadius: "0px" }}
              >
                Contact sales
              </Button>
            </Link>
          </div>

        </div>

        {/* Free Plan Row (Full Width) */}
        <div className="mt-6 border border-[#2A2A2A] bg-[#0A0A0A] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 flex flex-col md:flex-row items-baseline gap-4 md:gap-8 w-full md:w-auto">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.2em] font-bold">Free</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white font-mono">$0</span>
                <span className="text-[#444444] font-mono text-xs">/ month</span>
              </div>
            </div>
            <p className="text-[#666666] text-[13px] max-w-[280px]">
              For testing and early agent builds.
            </p>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-x-12 gap-y-2 flex-[2]">
            {freeFeatures.map((f, i) => (
              <div key={i} className="flex justify-between items-baseline border-b border-[#1A1A1A]/50 pb-1">
                <span className="font-mono text-[10px] text-[#333333] uppercase tracking-wider">{f.label}</span>
                <span className="font-mono text-[10px] text-[#666666]">{f.value}</span>
              </div>
            ))}
          </div>

          <Link href="/sign-up">
            <Button 
              variant="outline"
              className="w-full md:w-auto h-11 px-8 rounded-none border-[#2A2A2A] text-[#666666] hover:text-white hover:bg-[#161616] font-mono text-[12px] uppercase tracking-widest transition-colors bg-transparent"
              style={{ borderRadius: "0px" }}
            >
              Start free
            </Button>
          </Link>
        </div>

        {/* Muted line at bottom */}
        <div className="mt-8 text-center">
          <p className="font-mono text-[10px] text-[#333333] uppercase tracking-widest">
            No credit card required for Free. Upgrade when your volume grows.
          </p>
        </div>

      </div>
    </section>
  );
}
