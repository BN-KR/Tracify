"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { searchDocs, type SearchableDoc } from "@/lib/docs-search";

type SearchDoc = SearchableDoc;

export function DocsSearch({ docs }: { docs: SearchDoc[] }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => searchDocs(docs, query, 5), [docs, query]);
  return <div className="relative border-b border-black bg-white p-4 md:p-5"><label htmlFor="docs-search" className="sr-only">Search documentation</label><div className="flex items-center gap-3"><span aria-hidden className="font-mono text-[10px] text-black/55">/</span><input id="docs-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documentation" className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none placeholder:text-black/55" /></div>{query.trim() && <div className="absolute inset-x-4 top-full z-10 border-x border-b border-black bg-[#f3f2ed] shadow-[8px_8px_0_#111] md:inset-x-5" role="listbox">{matches.length ? matches.map((doc) => <Link key={doc.slug} href={`/docs/${doc.slug}`} role="option" className="block border-t border-black p-4 hover:bg-[#f4d44d]"><p className="font-mono text-[10px] uppercase tracking-[.08em]">{doc.title} <span className="text-black/45">/ {doc.section}</span></p><p className="mt-1 text-xs leading-5 text-black/55">{doc.excerpt}</p></Link>) : <p className="border-t border-black p-4 text-sm text-black/55">No documentation matches.</p>}</div>}</div>;
}
