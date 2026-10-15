"use client";

import { useEffect, useState } from "react";

/**
 * A trace-style reading bar pinned under the nav: one span per section, a
 * yellow playhead that advances as you read. Click a segment to jump to it.
 */
export function ReadPlayhead({ sections }: { sections: readonly { id: string; title: string }[] }) {
  const [progress, setProgress] = useState(0);
  const [bounds, setBounds] = useState<number[]>([]);

  useEffect(() => {
    const measure = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      setBounds(sections.map((s) => {
        const el = document.getElementById(s.id);
        return el ? Math.max(0, Math.min(1, (el.getBoundingClientRect().top + window.scrollY - 120) / total)) : 0;
      }));
    };
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setProgress(Math.min(1, window.scrollY / total));
    };
    onScroll();
    const t = window.setTimeout(measure, 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [sections]);

  const pct = Math.round(progress * 100);
  return (
    <div className="fixed inset-x-0 top-16 z-40 border-b border-white/10 bg-[#090909]/95 backdrop-blur-sm" role="navigation" aria-label="Reading progress">
      <div className="relative mx-auto flex h-7 max-w-[1440px] items-center gap-3 px-5 md:px-8">
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[#f4d44d]">{String(pct).padStart(2, "0")}%</span>
        <div className="relative h-2 flex-1 bg-white/10">
          <div className="absolute inset-y-0 left-0 bg-[#f4d44d]" style={{ width: `${progress * 100}%` }} />
          {bounds.map((b, i) => (
            <a
              key={sections[i].id}
              href={`#${sections[i].id}`}
              title={sections[i].title}
              aria-label={`Jump to ${sections[i].title}`}
              className="absolute inset-y-[-8px] w-2 -translate-x-1/2 after:absolute after:inset-y-[6px] after:left-1/2 after:w-px after:bg-white/40 hover:after:bg-[#f4d44d]"
              style={{ left: `${b * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
