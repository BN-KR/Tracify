/** Yellow call-out strip used at the bottom of reading pages. */
export function ReadingCta({ label, title, href, action }: { label: string; title: string; href: string; action: string }) {
  return (
    <section className="bg-[#f4d44d] text-black">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between md:py-16">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]">{label}</p>
          <p className="mt-3 max-w-xl font-pixel text-[clamp(2rem,4.5vw,3.6rem)] leading-[0.92] tracking-[-0.06em]">{title}</p>
        </div>
        <a href={href} className="inline-flex min-h-12 items-center justify-center bg-black px-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[#eceae3] transition-colors hover:bg-white hover:text-black">
          {action} →
        </a>
      </div>
    </section>
  );
}
