"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Ticker({ items }: { items: readonly string[] }) {
  const reduce = useReducedMotion();
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden" aria-label={items.join(", ")}>
      <motion.div
        className="flex w-max gap-12 whitespace-nowrap"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 32, ease: "linear", repeat: Infinity }}
        aria-hidden="true"
      >
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-12 font-pixel text-2xl tracking-[-0.04em]">
            {item}
            <span className="size-2 bg-[#f4d44d]" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
