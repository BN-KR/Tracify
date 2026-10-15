"use client";

import { useEffect, useState } from "react";

export function LegalToc({ items }: { items: readonly { id: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    const onScroll = () => { if (window.scrollY < 300) setActive(items[0]?.id); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [items]);

  return (
    <nav aria-label="On this page">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/55">On this page</p>
      <ol className="mt-5 border-l border-black/20">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "true" : undefined}
              className={`-ml-px flex items-center gap-3 border-l-2 py-2 pl-4 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${active === item.id ? "border-[#f4d44d] bg-[#f4d44d]/40 text-black" : "border-transparent text-black/55 hover:text-black"}`}
            >
              <span className="text-black/40">{String(index + 1).padStart(2, "0")}</span>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
