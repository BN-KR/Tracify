"use client";

import { motion, useReducedMotion } from "framer-motion";

export type WaterfallRow = {
  label: string;
  start: number; // 0-100, where the bar begins
  width: number; // 0-100
  state?: "done" | "active" | "idle";
};

const dither = "repeating-linear-gradient(90deg,#f4d44d 0 2px,transparent 2px 4px)";

/**
 * The trace-waterfall motif from the landing page: each bar is dithered on the
 * left and solid on the right, and the bars draw in one after another.
 */
export function PixelWaterfall({ rows, loop = false, className = "" }: { rows: WaterfallRow[]; loop?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <ol className={`grid gap-2.5 ${className}`}>
      {rows.map((row, i) => {
        const state = row.state ?? "done";
        return (
          <li key={row.label} className="grid grid-cols-[104px_1fr] items-center gap-3 sm:grid-cols-[110px_1fr]">
            <span className={`truncate font-mono text-[9px] uppercase tracking-[0.12em] ${state === "idle" ? "text-white/30" : "text-white/70"}`}>{row.label}</span>
            <div className="relative h-3 bg-white/[0.06]">
              <motion.div
                className="absolute inset-y-0 origin-left"
                style={{ left: `${row.start}%`, width: `${row.width}%` }}
                initial={reduce ? false : { scaleX: 0 }}
                animate={
                  state === "idle"
                    ? { scaleX: 1, opacity: 0.18 }
                    : loop && !reduce
                      ? { scaleX: [0, 1, 1, 0], opacity: 1 }
                      : { scaleX: 1, opacity: state === "active" ? [1, 0.45, 1] : 1 }
                }
                transition={
                  loop && !reduce && state !== "idle"
                    ? { duration: 5.2, delay: i * 0.22, times: [0, 0.3, 0.85, 1], ease: "easeOut", repeat: Infinity, repeatDelay: 0.4 }
                    : state === "active"
                      ? { opacity: { duration: 1.4, repeat: Infinity }, scaleX: { duration: 0.7, delay: i * 0.12 } }
                      : { duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }
                }
              >
                <div className="absolute inset-y-0 left-0 w-[45%]" style={{ backgroundImage: dither }} />
                <div className="absolute inset-y-0 right-0 w-[55%] bg-[#f4d44d]" />
              </motion.div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
