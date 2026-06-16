"use client";

import { useEffect, useState } from "react";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function TableOfContents({ body, collapsible }: { body: any[]; collapsible?: boolean }) {
  const [activeId, setActiveId] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState(0);

  if (!body || !Array.isArray(body)) return null;

  const headings = body.filter(
    (block: any) => block?._type === "block" && (block.style === "h2" || block.style === "h3")
  );

  const headingItems = headings.map((heading: any) => {
    const text = heading.children?.map((c: any) => c.text).join("") || "";
    const slug = slugify(text);
    return { text, slug, level: heading.style };
  });

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);

      for (let i = headingItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(headingItems[i].slug);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveId(headingItems[i].slug);
          return;
        }
      }
      setActiveId(headingItems[0]?.slug || "");
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headingItems]);

  if (headingItems.length < 2) return null;

  const list = (
    <ul className="flex flex-col gap-1">
      {headingItems.map((item) => (
        <li key={item.slug}>
          <a
            href={`#${item.slug}`}
            className={`block font-sans text-[13px] leading-relaxed transition-colors duration-150 ${
              item.level === "h3" ? "pl-4" : ""
            } ${
              activeId === item.slug
                ? "text-white"
                : "text-[#666666] hover:text-[#CCCCCC]"
            }`}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  const tocContent = (
    <div className="flex gap-3">
      <div className="relative w-[2px] bg-[#2A2A2A] shrink-0">
        <div
          className="absolute top-0 left-0 w-full bg-white transition-[height] duration-150 ease-out"
          style={{ height: `${scrollProgress * 100}%` }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#666666] mb-3">
          On this page
        </h4>
        {list}
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <details open className="border border-[#2A2A2A] bg-[#0A0A0A] group">
        <summary className="font-mono text-[11px] uppercase tracking-widest text-[#666666] px-4 py-3 cursor-pointer select-none list-none flex items-center justify-between">
          On this page
          <span className="text-[#666666] group-open:rotate-180 transition-transform text-[10px]">▼</span>
        </summary>
        <div className="px-4 pb-4 border-t border-[#2A2A2A] pt-3">
          {tocContent}
        </div>
      </details>
    );
  }

  return <nav>{tocContent}</nav>;
}
