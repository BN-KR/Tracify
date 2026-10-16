import type { Faq } from "@/lib/seo-pages";

/** Plain, server-rendered question and answer list. Its text is what search and AI answers quote. */
export function FaqList({ items, dark = false }: { items: readonly Faq[]; dark?: boolean }) {
  return (
    <dl className={`divide-y ${dark ? "divide-white/15 border-y border-white/15" : "divide-black/20 border-y border-black"}`}>
      {items.map((item) => (
        <div key={item.q} className="grid gap-3 py-7 md:grid-cols-[1fr_1.4fr] md:gap-10">
          <dt className="font-pixel text-2xl leading-tight tracking-[-0.05em]">{item.q}</dt>
          <dd className={`text-base leading-7 ${dark ? "text-white/70" : "text-black/70"}`}>{item.a}</dd>
        </div>
      ))}
    </dl>
  );
}
