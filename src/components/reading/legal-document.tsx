import Link from "next/link";
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
  sections,
  contact,
}: {
  current: (typeof siblings)[number]["href"];
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  summary: string;
  sections: readonly LegalSection[];
  contact?: { label: string; title: string; href: string; action: string };
}) {
  return (
    <main className="min-h-screen bg-[#eceae3] text-black">
      <PageHeader eyebrow={eyebrow} title={title} lede={description} image="/images/reading/legal.png">
        <span className="border border-white/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">Updated {updated}</span>
        <span className="border border-white/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">{sections.length} sections</span>
      </PageHeader>

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
