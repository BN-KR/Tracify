"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Eye, EyeOff, LayoutTemplate } from "lucide-react";

const sections = [
  { id: "hero", title: "Release-proof hero", category: "Heroes" },
  { id: "product", title: "Trace investigation", category: "Product stories" },
  { id: "proof", title: "Operating advantage", category: "Customer proof" },
  { id: "readiness", title: "Readiness audit", category: "Lead generation" },
  { id: "pricing", title: "Pricing", category: "Pricing" },
  { id: "cta", title: "Trace clinic CTA", category: "Contact & CTA" },
  { id: "footer", title: "Full-bleed footer", category: "Footers" },
] as const;

export function HomepageComposer() {
  const [visible, setVisible] = useState(
    () => new Set(sections.map((section) => section.id)),
  );
  const previewHref = useMemo(
    () => `/alternative?sections=${Array.from(visible).join(",")}`,
    [visible],
  );

  function toggle(id: (typeof sections)[number]["id"]) {
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-black pt-[60px] text-white selection:bg-yellow-300/40">
      <main className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1120px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4d44d]">
            Admin / homepage composer
          </p>
          <div className="mt-6 flex flex-col justify-between gap-8 border-b border-white/15 pb-10 md:flex-row md:items-end">
            <div>
              <h1 className="max-w-[800px] font-pixel text-6xl leading-[0.82] tracking-[-0.08em] md:text-8xl">
                Show only what the page needs.
              </h1>
              <p className="mt-6 max-w-[610px] text-lg leading-8 text-zinc-400">
                Toggle a section on or off, then open a shareable version of the
                alternative homepage. This is a simple preview system—not a new
                CMS.
              </p>
            </div>
            <Link
              href={previewHref}
              className="inline-flex items-center justify-center gap-3 bg-[#f4d44d] px-5 py-4 font-mono text-[9px] uppercase tracking-[0.12em] text-black hover:bg-white"
            >
              Preview selected <ArrowUpRight className="size-3" />
            </Link>
          </div>

          <section className="mt-10 grid gap-px border border-white/15 bg-white/15 md:grid-cols-2">
            {sections.map((section, index) => {
              const isVisible = visible.has(section.id);
              return (
                <article
                  key={section.id}
                  className="flex items-center justify-between gap-5 bg-[#090909] p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="font-mono text-[9px] text-zinc-600">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="font-pixel text-2xl tracking-[-0.05em]">
                        {section.title}
                      </p>
                      <Link
                        href={`/admin/library?category=${encodeURIComponent(section.category)}`}
                        className="mt-2 inline-block font-mono text-[8px] uppercase tracking-[0.12em] text-zinc-500 hover:text-[#f4d44d]"
                      >
                        Browse {section.category}
                      </Link>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(section.id)}
                    aria-pressed={isVisible}
                    className={`shrink-0 border px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] ${isVisible ? "border-[#7ee0b8] text-[#7ee0b8]" : "border-white/15 text-zinc-600"}`}
                  >
                    {isVisible ? (
                      <span className="flex items-center gap-2">
                        <Eye className="size-3" /> Show
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <EyeOff className="size-3" /> Hidden
                      </span>
                    )}
                  </button>
                </article>
              );
            })}
          </section>

          <section className="mt-10 border border-[#f4d44d]/60 bg-[#111008] p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 border-b border-[#f4d44d]/25 pb-6 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#f4d44d]">
                  Recommended default / product-led + developer-first
                </p>
                <h2 className="mt-4 max-w-[720px] font-pixel text-5xl leading-[0.87] tracking-[-0.07em] md:text-6xl">
                  Sell the outcome first. Prove it technically next.
                </h2>
              </div>
              <Link
                href="/alternative?sections=hero,product,proof,readiness,pricing,cta,footer"
                className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#f4d44d] hover:text-white"
              >
                Open recommended preview <ArrowUpRight className="size-3" />
              </Link>
            </div>
            <div className="mt-6 grid gap-px bg-[#f4d44d]/20 md:grid-cols-3">
              {[
                [
                  "01",
                  "Product-led opening",
                  "Hero → proof → release outcome",
                  "Heroes",
                ],
                [
                  "02",
                  "Developer confidence",
                  "Trace view → quickstart → integrations",
                  "Developer & onboarding",
                ],
                [
                  "03",
                  "Commercial close",
                  "Readiness audit → pricing → CTA → footer",
                  "Contact & CTA",
                ],
              ].map(([number, title, detail, category]) => (
                <Link
                  key={title}
                  href={`/admin/library?category=${encodeURIComponent(category)}`}
                  className="group bg-[#111008] p-5 hover:bg-[#f4d44d] hover:text-black"
                >
                  <span className="font-mono text-[9px] text-[#f4d44d] group-hover:text-black/55">
                    {number}
                  </span>
                  <p className="mt-7 font-pixel text-3xl tracking-[-0.05em]">
                    {title}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-500 group-hover:text-black/65">
                    {detail}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-10 grid gap-4 border-t border-white/15 pt-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-center gap-4">
              <LayoutTemplate className="size-5 text-[#f4d44d]" />
              <p className="text-sm leading-6 text-zinc-500">
                {visible.size} of {sections.length} sections are selected. The
                URL carries the selection, so you can copy it or open it in
                another tab.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setVisible(new Set(sections.map((section) => section.id)))
              }
              className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500 hover:text-white"
            >
              Reset all
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
