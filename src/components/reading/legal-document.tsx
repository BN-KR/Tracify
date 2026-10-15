import Link from "next/link";
import type React from "react";
import { Reveal } from "@/components/marketing/landing/reveal";
import { LegalToc } from "./legal-toc";
import { PageHeader } from "@/components/marketing/page-header";
import { ReadingCta } from "./reading-cta";

export type LegalSection = { id: string; title: string; body: string; bullets?: readonly string[] };

const siblings = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
  { href: "/cookie-policy", label: "Cookie policy" },
] as const;

export function LegalDocument({
  current,
  eyebrow,
  title,
  description,
  updated,
  summary,
  highlights,
  extra,
  sections,
  contact,
}: {
  current: (typeof siblings)[number]["href"];
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  summary: string;
  highlights?: readonly { label: string; title: string; body: string }[];
  extra?: React.ReactNode;
  sections: readonly LegalSection[];
  contact?: { label: string; title: string; href: string; action: string };
}) {
  return (
    <main className="min-h-screen bg-[#eceae3] text-black">
      <PageHeader eyebrow={eyebrow} title={title} lede={description} image="/images/reading/legal.png">
        <span className="border border-white/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">Updated {updated}</span>
        <span className="border border-white/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">{sections.length} sections</span>
      </PageHeader>

      {highlights?.length ? (
        <section className="bg-[#090909] px-5 py-16 text-[#eceae3] md:px-10 md:py-24" aria-label="Key points">
          <div className="mx-auto max-w-[1320px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">The short version</p>
            <div className="mt-8 grid gap-px bg-white/15 md:grid-cols-3">
              {highlights.map((h, i) => (
                <Reveal key={h.title} delay={i * 0.08}>
                  <div className="group h-full bg-[#090909] p-7 transition-colors hover:bg-[#f4d44d] hover:text-black md:p-9">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4d44d] group-hover:text-black">{h.label}</p>
                    <p className="mt-10 font-pixel text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.95] tracking-[-0.055em]">{h.title}</p>
                    <p className="mt-4 text-sm leading-6 text-white/65 group-hover:text-black">{h.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {extra}

      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <LegalToc items={sections} />
          <div className="mt-10 border-t border-black/20 pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/55">Related</p>
            <ul className="mt-4 space-y-2 text-sm">
              {siblings.filter((s) => s.href !== current).map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="underline underline-offset-4 hover:bg-[#f4d44d]">{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 max-w-[760px]">
          <Reveal>
            <div className="border border-black bg-[#f4d44d] p-6 md:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em]">In plain words</p>
              <p className="mt-3 text-lg leading-8 md:text-xl md:leading-9">{summary}</p>
            </div>
          </Reveal>

          <div className="mt-6 divide-y divide-black/15">
            {sections.map((section, index) => (
              <Reveal key={section.id}>
                <section id={section.id} className="scroll-mt-28 py-10 md:py-12">
                  <div className="flex items-baseline gap-4">
                    <span className="font-pixel text-4xl leading-none text-black/25 md:text-5xl">{String(index + 1).padStart(2, "0")}</span>
                    <h2 className="font-pixel text-[clamp(1.9rem,4vw,2.8rem)] leading-[0.95] tracking-[-0.05em]">{section.title}</h2>
                  </div>
                  <p className="mt-6 text-base leading-8 text-black/75">{section.body}</p>
                  {section.bullets?.length ? (
                    <ul className="mt-5 space-y-3">
                      {section.bullets.map((item) => (
                        <li key={item} className="flex gap-3 text-base leading-7 text-black/75">
                          <span className="mt-2.5 size-2 shrink-0 bg-[#f4d44d] outline outline-1 outline-black" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {contact ? <ReadingCta label={contact.label} title={contact.title} href={contact.href} action={contact.action} /> : null}
    </main>
  );
}
