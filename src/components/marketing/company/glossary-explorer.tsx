"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export type GlossaryTerm = { slug: string; term: string; definition: string; expansion: string; related: readonly string[] };

/** Search box, A-Z jump bar and the term list. Search matches term and definition. */
export function GlossaryExplorer({ terms }: { terms: readonly GlossaryTerm[] }) {
  const [query, setQuery] = useState("");
  const sorted = useMemo(() => [...terms].sort((a, b) => a.term.localeCompare(b.term)), [terms]);
  const q = query.trim().toLowerCase();
  const shown = q ? sorted.filter((t) => `${t.term} ${t.definition} ${t.expansion}`.toLowerCase().includes(q)) : sorted;
  const letters = [...new Set(sorted.map((t) => t.term[0].toUpperCase()))];
  const lettersShown = new Set(shown.map((t) => t.term[0].toUpperCase()));
  const nameOf = (slug: string) => terms.find((t) => t.slug === slug)?.term ?? slug;

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-5 border-y-2 border-black bg-[#eceae3]/95 px-5 py-3 backdrop-blur md:-mx-10 md:px-10">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex items-center gap-3 border border-black bg-white px-3 py-2.5 md:w-[380px]">
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">Search the glossary</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${terms.length} terms`}
              className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-black/40"
            />
          </label>
          <nav aria-label="Jump to letter" className="flex flex-wrap gap-1">
            {letters.map((l) => (
              <a
                key={l}
                href={`#letter-${l}`}
                className={`flex size-8 items-center justify-center border font-mono text-[11px] ${lettersShown.has(l) ? "border-black hover:bg-[#f4d44d]" : "pointer-events-none border-black/15 text-black/25"}`}
              >
                {l}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-black/50" role="status">
        {shown.length} {shown.length === 1 ? "term" : "terms"}{q ? ` matching “${query.trim()}”` : ""}
      </p>

      <div className="mt-4">
        {shown.length === 0 && <p className="border-y border-black py-16 font-pixel text-4xl tracking-[-0.05em]">No term matches that. Try a shorter word.</p>}
        {shown.map((t, i) => {
          const letter = t.term[0].toUpperCase();
          const firstOfLetter = i === 0 || shown[i - 1].term[0].toUpperCase() !== letter;
          return (
            <div key={t.slug} id={firstOfLetter ? `letter-${letter}` : undefined} className="scroll-mt-40">
              <article id={t.slug} className="grid scroll-mt-40 gap-4 border-b border-black py-8 md:grid-cols-[80px_1fr] md:gap-8">
                <span className={`font-pixel text-6xl leading-none ${firstOfLetter ? "text-black" : "text-black/0"}`} aria-hidden="true">{letter}</span>
                <div>
                  <h2 className="font-pixel text-3xl leading-none tracking-[-0.05em] md:text-4xl"><Link href={`/glossary/${t.slug}`} className="underline decoration-[#f4d44d] decoration-4 underline-offset-8 hover:bg-[#f4d44d]">{t.term}</Link></h2>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-black/80">{t.definition}</p>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-black/55">{t.expansion}</p>
                  <Link href={`/glossary/${t.slug}`} className="mt-5 inline-flex items-center gap-2 border border-black bg-[#f4d44d] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] hover:bg-black hover:text-[#f4d44d]">
                    What is {t.term}? <ArrowRight className="size-3" aria-hidden="true" />
                  </Link>
                  {t.related.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em]">
                      <span className="text-black/45">Related</span>
                      {t.related.map((slug) => (
                        <Link key={slug} href={`/glossary/${slug}`} className="border border-black px-2 py-1 hover:bg-[#f4d44d]">
                          {nameOf(slug)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
