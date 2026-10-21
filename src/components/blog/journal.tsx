"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { PostArt } from "@/components/reading/post-art";

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  label: string;
  minutes: number;
  categories: string[];
};

const pretty = (value: string) => value.replace(/-/g, " ");

/* ---------- Hero: the newest articles stream in like a live trace ---------- */

export function JournalHero({ posts, total }: { posts: JournalPost[]; total: number }) {
  const reduce = useReducedMotion();
  const feed = posts.slice(0, 6);
  const [count, setCount] = useState(reduce ? feed.length : 1);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const bgX = useTransform(sx, (v) => v * -18);
  const bgY = useTransform(sy, (v) => v * -12);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setCount((c) => (c >= feed.length + 3 ? 1 : c + 1)), 1100);
    return () => window.clearInterval(id);
  }, [reduce, feed.length]);

  const shown = feed.slice(0, Math.min(count, feed.length));
  return (
    <section
      className="relative isolate overflow-hidden bg-[#090909] text-[#eceae3]"
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      <motion.div className="absolute inset-[-40px] -z-10" style={{ x: bgX, y: bgY }} initial={reduce ? false : { scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}>
        <Image src="/images/reading/blog.png" alt="" fill priority unoptimized sizes="100vw" className="object-cover opacity-55 [image-rendering:pixelated]" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#090909_8%,rgba(9,9,9,0.6)_55%,rgba(9,9,9,0.2)_100%)]" />
      <div className="mx-auto grid min-h-[min(82svh,760px)] max-w-[1320px] items-center gap-12 px-5 py-20 md:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p initial={reduce ? false : { y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 border border-white/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
            <span className="bg-[#f4d44d] px-1.5 text-black">{total}</span> field notes on running agents
          </motion.p>
          <motion.h1 initial={reduce ? false : { y: 30 }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="mt-8 font-pixel text-[clamp(3.2rem,9vw,8.4rem)] leading-[0.88] tracking-[-0.07em]">
            Notes from inside the <span className="text-[#f4d44d]">agent loop.</span>
          </motion.h1>
          <motion.p initial={reduce ? false : { y: 8 }} animate={{ y: 0 }} transition={{ delay: 0.7 }} className="mt-7 max-w-[540px] text-base leading-7 text-white/70 md:text-lg md:leading-8">
            Engineering reports on traces, evaluations, production failures and the human decisions around them.
          </motion.p>
          <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 flex flex-wrap gap-3">
            <a href="#archive" className="inline-flex min-h-12 items-center bg-[#f4d44d] px-6 font-mono text-[11px] uppercase tracking-[0.14em] text-black transition-colors hover:bg-white">Browse all {total} →</a>
            <Link href="/blog/rss.xml" className="inline-flex min-h-12 items-center border border-white/30 px-6 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:border-[#f4d44d] hover:text-[#f4d44d]">RSS</Link>
          </motion.div>
        </div>

        <motion.div initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="border border-white/20 bg-[#090909]/90 font-mono text-[11px] backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/15 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-white/55">
            <span>journal · latest runs</span>
            <span className="flex items-center gap-1.5 text-[#f4d44d]"><span className="size-1.5 animate-pulse bg-[#f4d44d]" /> streaming</span>
          </div>
          <ul className="min-h-[300px] px-3 py-2">
            {shown.map((p, i) => (
              <motion.li key={p.slug} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                <Link href={`/blog/${p.slug}`} className="group grid grid-cols-[46px_1fr] items-baseline gap-3 py-2.5 transition-colors hover:text-[#f4d44d]">
                  <span className="text-white/40">{(i * 1.37).toFixed(2).padStart(5, "0")}</span>
                  <span>
                    <span className="block text-[9px] uppercase tracking-[0.12em] text-white/50">{pretty(p.categories[0] ?? "note")} · {p.minutes} min</span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-white/90 group-hover:text-[#f4d44d]">{p.title}</span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Topics: sticky artwork that changes per chapter ---------- */

export type JournalTopic = { name: string; count: number; posts: JournalPost[] };

export function TopicStory({ topics }: { topics: JournalTopic[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = topics[active] ?? topics[0];
  if (!current) return null;

  return (
    <section className="bg-[#090909] px-5 py-24 text-[#eceae3] md:px-10 md:py-32">
      <div className="mx-auto max-w-[1320px]">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">Start with a question</p>
        <h2 className="mt-5 max-w-3xl font-pixel text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.07em]">Pick the problem you have today.</h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            {topics.map((t, i) => (
              <motion.div key={t.name} onViewportEnter={() => setActive(i)} viewport={{ amount: 0.6 }} className="flex flex-col justify-center border-t border-white/15 py-8 lg:min-h-[46vh]">
                <span className={`font-mono text-sm transition-colors ${active === i ? "text-[#f4d44d]" : "text-white/35"}`}>{String(i + 1).padStart(2, "0")} / {String(topics.length).padStart(2, "0")} · {t.count} articles</span>
                <h3 className="mt-5 font-pixel text-[clamp(2rem,4vw,3.4rem)] capitalize leading-none tracking-[-0.06em]">{pretty(t.name)}</h3>
                <ul className="mt-8 space-y-1">
                  {t.posts.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`} className="group flex items-baseline justify-between gap-4 border-b border-white/10 py-3 transition-colors hover:text-[#f4d44d]">
                        <span className="text-base leading-6 text-white/80 group-hover:text-[#f4d44d]">{p.title}</span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">{p.minutes} min →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="relative mt-8 aspect-[7/5] w-full overflow-hidden border border-white/15 lg:hidden">
                  <PostArt seed={t.name} className="size-full" />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-[calc(64px+10vh)] aspect-[7/5] w-full overflow-hidden border border-white/20">
              <AnimatePresence mode="popLayout">
                <motion.div key={current.name} className="absolute inset-0" initial={reduce ? false : { opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                  <PostArt seed={current.name} className="size-full" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#090909] to-transparent p-6 pt-24">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4d44d]">Topic</p>
                    <p className="mt-2 font-pixel text-5xl capitalize leading-none tracking-[-0.06em]">{pretty(current.name)}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Archive: every article is a span, its length is the read time ---------- */

export function TraceArchive({ posts, categories }: { posts: JournalPost[]; categories: string[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [shortest, longest] = useMemo(() => [Math.min(...posts.map((p) => p.minutes)), Math.max(...posts.map((p) => p.minutes), 1)], [posts]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => (!topic || p.categories.includes(topic)) && (!q || `${p.title} ${p.categories.join(" ")}`.toLowerCase().includes(q)));
  }, [posts, query, topic]);

  return (
    <section id="archive" className="scroll-mt-24 bg-[#eceae3] px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1320px]">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50">The full trace</p>
        <h2 className="mt-5 max-w-3xl font-pixel text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.07em]">Every article. Longer bar, longer read.</h2>

        <div className="mt-10 flex flex-col gap-4 border-y-2 border-black py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
            <button type="button" aria-pressed={topic === null} onClick={() => setTopic(null)} className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${topic === null ? "border-black bg-black text-[#eceae3]" : "border-black/30 hover:border-black"}`}>All</button>
            {categories.map((c) => (
              <button key={c} type="button" aria-pressed={topic === c} onClick={() => setTopic(topic === c ? null : c)} className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${topic === c ? "border-black bg-[#f4d44d]" : "border-black/30 hover:border-black"}`}>{pretty(c)}</button>
            ))}
          </div>
          <label className="flex min-h-11 items-center gap-3 border border-black bg-white px-3 md:w-72">
            <span className="sr-only">Search articles</span>
            <span aria-hidden="true" className="font-mono text-xs text-black/55">/</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles" className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none placeholder:text-black/50" />
            <span className="font-mono text-[10px] text-black/55">{shown.length}</span>
          </label>
        </div>

        {shown.length ? (
          <ul>
            {shown.map((p, i) => (
              <motion.li key={p.slug} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.03 }} className="border-b border-black/15">
                <Link href={`/blog/${p.slug}`} className="group grid items-center gap-x-6 gap-y-2 py-4 sm:grid-cols-[110px_minmax(0,1fr)_minmax(120px,240px)] sm:px-2">
                  <time dateTime={p.date} className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/55">{p.label}</time>
                  <span className="font-pixel text-xl leading-tight tracking-[-0.04em] transition-transform group-hover:translate-x-1 md:text-[1.7rem]">{p.title}</span>
                  <span className="flex items-center gap-3">
                    <span className="h-3 flex-1 bg-black/10">
                      <span className="block h-full bg-[#090909] transition-colors group-hover:bg-[#f4d44d] group-hover:outline group-hover:outline-1 group-hover:outline-black" style={{ width: `${20 + (80 * (p.minutes - shortest)) / Math.max(longest - shortest, 1)}%` }} />
                    </span>
                    <span className="w-14 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.1em] text-black/60">{p.minutes} min</span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="py-16 font-mono text-xs uppercase tracking-[0.14em] text-black/60">Nothing matches that. Try another topic.</p>
        )}
      </div>
    </section>
  );
}
