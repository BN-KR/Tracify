"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Reveal, Ticker } from "@/components/marketing/landing/reveal";

export const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

export function Button({ href, children, variant = "yellow" }: { href: string; children: ReactNode; variant?: "yellow" | "line" }) {
  const base = "group inline-flex items-center gap-3 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors";
  const tone = variant === "yellow" ? "bg-[#f4d44d] text-[#090909] hover:bg-[#eceae3]" : "border border-white/30 text-[#eceae3] hover:border-[#f4d44d] hover:text-[#f4d44d]";
  return (
    <Link href={href} className={`${base} ${tone}`}>
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

/* ---------- Hero: dithered artwork reveals with a clip-path wipe ---------- */

export function PageHero({
  eyebrow,
  title,
  lead,
  img,
  facts,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  img: string;
  facts: readonly (readonly [string, string])[];
  primary: readonly [string, string];
  secondary?: readonly [string, string];
}) {
  const reduce = useReducedMotion();
  return (
    <header className="relative isolate overflow-hidden bg-[#090909] text-[#eceae3]">
      <motion.div
        className="absolute inset-y-0 right-0 -z-10 w-full opacity-45 lg:w-[56%] lg:opacity-100"
        initial={reduce ? false : { clipPath: "inset(0 0 0 100%)" }}
        animate={{ clipPath: "inset(0 0 0 0%)" }}
        transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
      >
        <Image src={img} alt="" fill priority unoptimized sizes="60vw" className="object-cover object-left [image-rendering:pixelated]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#090909_0%,rgba(9,9,9,0.6)_22%,rgba(9,9,9,0)_48%),linear-gradient(to_top,#090909_0%,rgba(9,9,9,0)_25%)]" />
      </motion.div>
      <div className="mx-auto flex min-h-[88vh] max-w-[1440px] flex-col justify-end px-5 pb-10 pt-28 md:px-8 md:pb-14">
        <motion.p
          className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4d44d]"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <span className="size-2 bg-[#f4d44d]" aria-hidden="true" />
          {eyebrow}
        </motion.p>
        <motion.h1
          className={`mt-6 text-balance font-pixel leading-[0.8] tracking-[-0.075em] ${title.length > 24 ? "max-w-[13ch] text-[clamp(2.9rem,7.4vw,7rem)]" : "max-w-[12ch] text-[clamp(3.6rem,10vw,9.5rem)]"}`}
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="mt-8 max-w-xl text-pretty text-base leading-7 text-[#eceae3]/72 md:text-lg"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.7 }}
        >
          {lead}
        </motion.p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href={primary[1]}>{primary[0]}</Button>
          {secondary ? (
            <Button href={secondary[1]} variant="line">
              {secondary[0]}
            </Button>
          ) : null}
        </div>
        <dl className="mt-14 grid grid-cols-3 border-t border-white/15 pt-6">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">{k}</dt>
              <dd className="mt-2 font-pixel text-2xl tracking-[-0.05em] md:text-4xl">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}

export function SignalTicker({ items }: { items: readonly string[] }) {
  return (
    <div className="border-y border-black bg-[#f4d44d] py-5 text-[#090909]">
      <Ticker items={items} />
    </div>
  );
}

/* ---------- Sticky story: a pinned stage driven by scroll position ---------- */

export type StageProps = { p: number; active: number; count: number };

export function StickyStory({
  kicker,
  heading,
  steps,
  stage,
}: {
  kicker: string;
  heading: string;
  steps: readonly { title: string; body: string }[];
  stage: (s: StageProps) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [p, setP] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setP(Math.round(clamp(v) * 400) / 400));
  const n = steps.length;
  const eff = reduce ? 1 : p;
  const active = Math.min(n - 1, Math.floor(eff * n));
  return (
    <section className="bg-[#090909] text-[#eceae3]">
      <div ref={ref} style={{ height: reduce ? "auto" : `${n * 60 + 30}vh` }} className="relative">
        <div className={reduce ? "py-20" : "sticky top-0 flex h-screen items-center overflow-hidden"}>
          <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-5 pt-16 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:pt-12">
            <div className="flex flex-col justify-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4d44d]">{kicker}</p>
              <h2 className="mt-4 font-pixel text-[clamp(2rem,4.4vw,4rem)] leading-[0.9] tracking-[-0.06em]">{heading}</h2>
              <ol className="mt-6 space-y-1 lg:mt-9">
                {steps.map((s, i) => (
                  <li key={s.title} className={`border-l-2 pl-4 transition-colors duration-300 ${i === active ? "border-[#f4d44d]" : "border-white/15"}`}>
                    <p className={`font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${i === active ? "text-[#eceae3]" : "text-white/35"}`}>
                      <span className="mr-3 text-[#f4d44d]/80">0{i + 1}</span>
                      {s.title}
                    </p>
                    <div className={`grid transition-all duration-500 ${i === active || reduce ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <p className="overflow-hidden text-sm leading-6 text-white/65">
                        <span className="block pb-3 pt-1">{s.body}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="min-h-[300px] border border-white/15 bg-[#eceae3] p-4 text-[#090909] md:p-7 lg:min-h-[520px]">{stage({ p: eff, active, count: n })}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Art band: artwork drifts as you scroll past ---------- */

export function ArtBand({ img, label, statement, aside, points }: { img: string; label: string; statement: string; aside: string; points?: readonly string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <section ref={ref} className="bg-[#eceae3] px-5 py-24 text-[#090909] md:px-8 md:py-32">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#090909]">
          <motion.div style={{ y }} className="absolute -inset-[10%]">
            <Image src={img} alt="" fill unoptimized sizes="50vw" className="object-cover [image-rendering:pixelated]" />
          </motion.div>
        </div>
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50">{label}</p>
          <p className="mt-6 font-pixel text-[clamp(2.2rem,4.6vw,4.4rem)] leading-[0.92] tracking-[-0.06em]">{statement}</p>
          <p className="mt-6 max-w-lg text-base leading-7 text-black/62">{aside}</p>
          {points ? (
            <ul className="mt-8 space-y-2 font-mono text-[11px] uppercase tracking-[0.1em]">
              {points.map((t) => (
                <li key={t} className="flex gap-3 border-t border-black/20 pt-2">
                  <span className="mt-1 size-2 shrink-0 bg-[#090909]" />
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Capability cards ---------- */

export function CapabilityGrid({ heading, items }: { heading: string; items: readonly { title: string; body: string }[] }) {
  return (
    <section className="bg-[#090909] px-5 py-24 text-[#eceae3] md:px-8 md:py-32">
      <div className="mx-auto max-w-[1440px]">
        <Reveal>
          <h2 className="max-w-3xl font-pixel text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.9] tracking-[-0.06em]">{heading}</h2>
        </Reveal>
        <div className="mt-14 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((d, i) => (
            <Reveal key={d.title} delay={i * 0.08} className="group relative bg-[#090909] p-7 transition-colors duration-300 hover:bg-[#f4d44d] hover:text-[#090909] md:p-8">
              <span className="font-pixel text-5xl tracking-[-0.06em] text-white/20 transition-colors group-hover:text-black/30">0{i + 1}</span>
              <h3 className="mt-16 font-mono text-[12px] uppercase tracking-[0.14em]">{d.title}</h3>
              <p className="mt-4 text-sm leading-6 text-white/60 transition-colors group-hover:text-black/75">{d.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <section className="bg-[#eceae3] px-5 py-24 text-[#090909] md:px-8 md:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.7fr_1.3fr]">
        <h2 className="font-pixel text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.9] tracking-[-0.06em]">Questions people ask.</h2>
        <div className="divide-y divide-black border-y border-black">
          {items.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-mono text-[12px] uppercase tracking-[0.1em] marker:content-none">
                {f.q}
                <Plus className="size-4 shrink-0 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-black/65">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EndCta({ heading, links }: { heading: string; links: readonly (readonly [string, string])[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#090909] px-5 py-24 text-[#eceae3] md:px-8 md:py-36">
      <Image src="/images/landing/footer-ridges.png" alt="" fill unoptimized sizes="100vw" className="-z-10 object-cover object-bottom opacity-40 [image-rendering:pixelated]" />
      <div className="mx-auto max-w-[1440px]">
        <Reveal>
          <p className="max-w-5xl font-pixel text-[clamp(3rem,8vw,7.4rem)] leading-[0.84] tracking-[-0.07em]">{heading}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/sign-up">Start tracing free</Button>
            <Button href="/docs" variant="line">
              Read the docs
            </Button>
          </div>
        </Reveal>
        <div className="mt-20 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="group flex items-center justify-between bg-[#090909]/90 p-6 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-[#f4d44d] hover:text-[#090909]">
              {label}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
