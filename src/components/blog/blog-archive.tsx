"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ArchiveItem = { slug: string; title: string; date: string; label: string; minutes: number; categories: string[] };

export function BlogArchive({ items }: { items: ArchiveItem[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.title} ${item.categories.join(" ")}`.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <section className="mt-16" aria-labelledby="archive-heading">
      <div className="flex flex-col gap-4 border-b-2 border-black pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/55">The full archive</p>
          <h2 id="archive-heading" className="mt-2 font-pixel text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.055em]">Every article</h2>
        </div>
        <label className="flex min-h-11 items-center gap-3 border border-black bg-white px-3 md:w-80">
          <span className="sr-only">Search articles</span>
          <span aria-hidden="true" className="font-mono text-xs text-black/55">/</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles" className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none placeholder:text-black/50" />
          <span className="font-mono text-[10px] text-black/55">{shown.length}</span>
        </label>
      </div>
      {shown.length ? (
        <ul>
          {shown.map((item) => (
            <li key={item.slug} className="border-b border-black/20">
              <Link href={`/blog/${item.slug}`} className="group grid gap-2 py-4 transition-colors hover:bg-[#f4d44d] sm:grid-cols-[120px_1fr_auto] sm:items-baseline sm:gap-6 sm:px-3">
                <time dateTime={item.date} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/60 group-hover:text-black">{item.label}</time>
                <span>
                  <span className="font-pixel text-xl leading-tight tracking-[-0.04em] md:text-2xl">{item.title}</span>
                  {item.categories[0] ? <span className="ml-3 hidden font-mono text-[9px] uppercase tracking-[0.12em] text-black/50 md:inline">{item.categories[0]}</span> : null}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/60 transition-transform group-hover:translate-x-1 group-hover:text-black">{item.minutes} min →</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-10 font-mono text-xs uppercase tracking-[0.14em] text-black/60">No articles match “{query}”.</p>
      )}
    </section>
  );
}
