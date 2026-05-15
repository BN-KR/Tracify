"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FirstTrace() {
  const [isDecorated, setIsDecorated] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);

  useEffect(() => {
    // Animation Sequence: Under 1.5s total
    const decorateTimer = setTimeout(() => setIsDecorated(true), 400);
    const captureTimer = setTimeout(() => setIsCaptured(true), 600);

    return () => {
      clearTimeout(decorateTimer);
      clearTimeout(captureTimer);
    };
  }, []);

  return (
    <section className="w-full bg-[#050505] py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        
        {/* Header Block */}
        <div className="mb-16 max-w-[760px]">
          <h2 className="text-white text-3xl font-bold mb-6 tracking-tighter uppercase font-pixel">
            Catch the next one.
          </h2>
          <p className="text-[#999999] text-[15px] leading-relaxed max-w-[540px] mb-4">
            One decorator turns the next run into a trace.
          </p>
          <p className="text-[#444444] text-[11px] uppercase tracking-[0.2em] font-bold">
            No config files. No framework lock-in. No infrastructure to wire.
          </p>
        </div>

        {/* Product Surface */}
        <div className="grid grid-cols-1 md:grid-cols-[55%_45%] border border-[#2A2A2A] bg-[#0A0A0A] overflow-hidden min-h-[440px]">
          
          {/* LEFT SIDE: CODE DIFF */}
          <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-[#2A2A2A] flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <span className="font-mono text-[10px] text-[#444444] uppercase tracking-widest font-bold">main.py</span>
              <span className="font-mono text-[10px] text-[#666666] uppercase tracking-widest font-bold">Diff</span>
            </div>

            <div className="flex-1 font-mono text-[14px] leading-relaxed text-[#888888] selection:bg-white/10">
              {/* Added Line */}
              <AnimatePresence mode="wait">
                {isDecorated && (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 bg-[#10B981]/5 px-2 -mx-2 py-0.5"
                  >
                    <span className="text-[#10B981] w-4">+</span>
                    <span className="text-white font-bold">@trace_agent()</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex gap-4 px-2 -mx-2">
                <span className="opacity-0 w-4">+</span>
                <span>async def research_agent(query):</span>
              </div>
              <div className="flex gap-4 px-2 -mx-2">
                <span className="opacity-0 w-4">+</span>
                <span>    return await run(query)</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#1A1A1A] flex items-center justify-between">
              <div className="font-mono text-[10px] text-[#444444] uppercase tracking-widest font-bold">
                small code change
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: NEXT RUN CAPTURED */}
          <div className="p-8 md:p-12 bg-[#0C0C0C] flex flex-col">
            <div className="mb-10">
              <span className="font-mono text-[10px] text-[#444444] uppercase tracking-[0.4em] font-bold">next run captured</span>
            </div>

            <div className="flex flex-col gap-6 font-mono">
              {[
                { label: "run_id", value: "run_91d7c2" },
                { label: "spans", value: "23" },
                { label: "retries", value: "2" },
                { label: "cost", value: "$1.12" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-baseline border-b border-[#1A1A1A] pb-3">
                  <span className="text-[11px] text-[#666666] uppercase tracking-widest font-bold">{row.label}</span>
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isCaptured ? 1 : 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="text-[14px] text-white font-bold"
                  >
                    {row.value}
                  </motion.span>
                </div>
              ))}

              <div className="flex justify-between items-baseline pt-2">
                <span className="text-[11px] text-[#666666] uppercase tracking-widest font-bold">status</span>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isCaptured ? 1 : 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 bg-[#10B981] animate-pulse" />
                  <span className="text-[11px] text-[#10B981] uppercase tracking-widest font-bold">visible</span>
                </motion.div>
              </div>
            </div>

            {/* Optional Small Line */}
            <div className="mt-auto pt-12">
              <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-tight">
                <span className="text-[#444444]">previous run: <span className="text-red-500/50">wasted $18.42</span></span>
                <span className="text-[#222222]">|</span>
                <span className="text-[#444444]">next run: <span className="text-white">visible</span></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
