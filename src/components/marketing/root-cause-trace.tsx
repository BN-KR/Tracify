"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SpanType = "llm_call" | "tool_call" | "retry" | "fallback" | "error";

interface Span {
  id: string;
  index: string;
  type: SpanType;
  name: string;
  cost: string;
  status: "ok" | "warning" | "error";
  group?: "web_search_loop" | "retry_chain" | "failure";
}

const SPANS: Span[] = [
  { id: "s1", index: "01", type: "llm_call", name: "claude-sonnet-4-5", cost: "$0.74", status: "ok" },
  { id: "s2", index: "02", type: "tool_call", name: "web_search", cost: "$0.01", status: "ok", group: "web_search_loop" },
  { id: "s3", index: "03", type: "tool_call", name: "web_search", cost: "$0.01", status: "ok", group: "web_search_loop" },
  { id: "s4", index: "04", type: "tool_call", name: "web_search", cost: "$0.01", status: "ok", group: "web_search_loop" },
  { id: "s5", index: "05", type: "tool_call", name: "web_search", cost: "$0.01", status: "ok", group: "web_search_loop" },
  { id: "s6", index: "06", type: "tool_call", name: "web_search", cost: "$0.01", status: "ok", group: "web_search_loop" },
  { id: "s7", index: "07", type: "tool_call", name: "web_search", cost: "$0.01", status: "ok", group: "web_search_loop" },
  { id: "s8", index: "08", type: "retry", name: "web_search", cost: "$0.42", status: "warning", group: "retry_chain" },
  { id: "s9", index: "09", type: "retry", name: "web_search", cost: "$0.63", status: "warning", group: "retry_chain" },
  { id: "s10", index: "10", type: "retry", name: "web_search", cost: "$0.88", status: "warning", group: "retry_chain" },
  { id: "s11", index: "11", type: "retry", name: "web_search", cost: "$1.04", status: "warning", group: "retry_chain" },
  { id: "s12", index: "12", type: "fallback", name: "gpt-4o", cost: "$1.12", status: "warning" },
  { id: "s13", index: "13", type: "llm_call", name: "gpt-4o", cost: "$1.43", status: "warning" },
  { id: "s14", index: "14", type: "error", name: "timeout", cost: "$1.67", status: "error", group: "failure" },
];

type Phase = "idle" | "highlight_repeated_calls" | "highlight_retries" | "highlight_error" | "show_diagnosis" | "hold";

export function RootCauseTrace() {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const sequence = async () => {
      setPhase("idle");
      await new Promise(r => setTimeout(r, 1000));
      
      setPhase("highlight_repeated_calls");
      await new Promise(r => setTimeout(r, 1200));
      
      setPhase("highlight_retries");
      await new Promise(r => setTimeout(r, 1000));
      
      setPhase("highlight_error");
      await new Promise(r => setTimeout(r, 800));
      
      setPhase("show_diagnosis");
      await new Promise(r => setTimeout(r, 4000));
      
      setPhase("idle");
    };

    const timer = setInterval(sequence, 9000);
    sequence();
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-[#050505] py-[72px] font-mono selection:bg-white/10 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Header Block */}
        <div className="mb-12 max-w-[600px]">
          <div className="text-[#666666] text-[10px] uppercase tracking-[0.3em] mb-4">Trace Inspection</div>
          <h2 className="text-white text-3xl font-bold mb-4 tracking-tight">Find the step that caused it.</h2>
          <p className="text-[#999999] text-sm leading-relaxed">
            Retries, inputs, outputs, and wasted cost — tied back to the exact span.
          </p>
        </div>

        {/* Product Workspace Visual */}
        <div 
          className="w-full h-auto lg:h-[520px] bg-[#0A0A0A] border border-[#2A2A2A] flex flex-col overflow-hidden relative shadow-2xl"
          aria-label="Root cause trace showing repeated web_search calls causing retries, timeout, and wasted cost."
        >
          
          {/* ZONE 1: TOP RUN HEADER */}
          <div className="h-[56px] border-b border-[#2A2A2A] flex items-center justify-between px-6 bg-[#0D0D0D] shrink-0">
            <div className="flex items-center gap-4 sm:gap-8 overflow-hidden">
              <span className="text-white text-[13px] font-bold tracking-tight shrink-0">run_8f21a9</span>
              <div className="flex items-center gap-3 sm:gap-5 text-[10px] text-[#666666] uppercase tracking-[0.1em] overflow-hidden whitespace-nowrap">
                <span className="hidden sm:inline">spans: 14</span>
                <span className="hidden sm:inline">retries: 4</span>
                <span className="hidden sm:inline">duration: 8.4s</span>
                <span className="sm:hidden text-[9px]">14 spans · 4 retries</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[#666666] text-[10px] uppercase tracking-widest hidden xs:inline">wasted_cost:</span>
              <motion.span 
                animate={phase === "show_diagnosis" ? { scale: [1, 1.05, 1], color: ["#EF4444", "#FFFFFF", "#EF4444"] } : {}}
                className="text-[#EF4444] text-[13px] font-bold tabular-nums"
              >
                $12.91
              </motion.span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            
            {/* ZONE 2: LEFT TRACE LIST */}
            <div className="w-full lg:w-[45%] border-r border-[#2A2A2A] flex flex-col bg-[#0A0A0A] overflow-y-auto lg:overflow-hidden no-scrollbar">
              {SPANS.map((span) => {
                const isRepeatedHighlight = phase !== "idle" && span.group === "web_search_loop";
                const isRetryHighlight = (phase === "highlight_retries" || phase === "highlight_error" || phase === "show_diagnosis") && span.group === "retry_chain";
                const isErrorHighlight = (phase === "highlight_error" || phase === "show_diagnosis") && span.group === "failure";

                const isMuted = phase !== "idle" && !isRepeatedHighlight && !isRetryHighlight && !isErrorHighlight;
                const isActive = isRepeatedHighlight || isRetryHighlight || isErrorHighlight;

                return (
                  <div 
                    key={span.id}
                    className={`h-[36px] border-b border-[#1C1C1C] flex items-center px-4 sm:px-6 transition-all duration-300 relative shrink-0
                      ${isActive ? 'bg-[#161616]' : 'bg-[#0A0A0A]'}
                      ${isMuted ? 'opacity-40' : 'opacity-100'}
                    `}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-span"
                        className="absolute left-0 w-1 h-full bg-[#EF4444]"
                      />
                    )}

                    <div className="w-6 sm:w-8 shrink-0 text-[#333333] text-[9px]">{span.index}</div>
                    <div className={`w-20 sm:w-24 shrink-0 text-[10px] uppercase tracking-wider
                      ${span.type === 'error' ? 'text-[#EF4444]' : span.type === 'retry' ? 'text-[#F59E0B]' : 'text-[#666666]'}
                    `}>
                      {span.type.replace('_', ' ')}
                    </div>
                    <div className="flex-1 text-[11px] text-[#888888] truncate pr-4">{span.name}</div>
                    <div className="w-14 sm:w-16 shrink-0 text-right text-[11px] text-[#666666] tabular-nums">{span.cost}</div>
                  </div>
                );
              })}
            </div>

            {/* ZONE 3: RIGHT ROOT CAUSE PANEL */}
            <div className="w-full lg:w-[55%] bg-[#0D0D0D] p-8 sm:p-12 flex flex-col relative overflow-hidden">
              <AnimatePresence mode="wait">
                {phase === "show_diagnosis" || phase === "highlight_error" || phase === "highlight_retries" ? (
                  <motion.div 
                    key="diagnosis"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-col h-full"
                  >
                    <div className="text-[#666666] text-[10px] uppercase tracking-[0.3em] mb-8 shrink-0">Root Cause Analysis</div>
                    
                    <div className="mb-10 shrink-0">
                      <h3 className="text-white text-xl sm:text-2xl font-bold mb-3 tracking-tight">web_search loop detected</h3>
                      <p className="text-[#666666] text-[13px] leading-relaxed max-w-[400px]">
                        The agent entered a recursive state, attempting the same tool call 6 times without measurable progress.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-8 mb-10 shrink-0">
                      <div>
                        <div className="text-[#444444] text-[9px] uppercase tracking-[0.2em] mb-1.5 font-bold">Repeated Calls</div>
                        <div className="text-white text-[16px] font-bold">6</div>
                      </div>
                      <div>
                        <div className="text-[#444444] text-[9px] uppercase tracking-[0.2em] mb-1.5 font-bold">Retries</div>
                        <div className="text-white text-[16px] font-bold">4</div>
                      </div>
                      <div>
                        <div className="text-[#444444] text-[9px] uppercase tracking-[0.2em] mb-1.5 font-bold">Final Error</div>
                        <div className="text-[#EF4444] text-[16px] font-bold">timeout</div>
                      </div>
                      <div>
                        <div className="text-[#444444] text-[9px] uppercase tracking-[0.2em] mb-1.5 font-bold">Wasted Cost</div>
                        <div className="text-[#EF4444] text-[16px] font-bold tabular-nums">$12.91</div>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-[#222222] pt-8 overflow-hidden">
                      <div className="text-[#444444] text-[9px] uppercase tracking-[0.2em] mb-5 font-bold">Cause-Effect Chain</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
                        {[
                          { text: "web_search loop", color: "text-white" },
                          { text: "retries", color: "text-[#F59E0B]" },
                          { text: "fallback", color: "text-[#666666]" },
                          { text: "timeout", color: "text-[#EF4444]" },
                          { text: "wasted cost", color: "text-[#EF4444]" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 sm:gap-4 shrink-0">
                            {i > 0 && <span className="text-[#2A2A2A] text-[10px] hidden sm:inline">→</span>}
                            <span className={`${item.color} text-[11px] font-bold tracking-tight whitespace-nowrap`}>
                              {i > 0 && <span className="sm:hidden text-[#2A2A2A] mr-2">↳</span>}
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center"
                  >
                    <div className="text-[#222222] text-[11px] uppercase tracking-[0.5em] font-bold">Awaiting Trace Context</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
