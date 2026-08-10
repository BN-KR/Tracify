const logos = [
  "NORTHSTAR",
  "RELAY",
  "HELIOS",
  "MOTION",
  "VECTOR",
  "SIGNAL",
  "ATLAS",
  "PILOT",
];

function Label({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-current/15 pb-4 font-mono text-[9px] uppercase tracking-[0.15em] opacity-55">
      <span>
        Logo study {number} / {title}
      </span>
      <span>Placeholder logos</span>
    </div>
  );
}

export function LogoShowcaseExplorations() {
  return (
    <section
      aria-label="Logo marquee and grid exploration gallery"
      className="border-t border-white/15 bg-black"
    >
      <div className="border-b border-white/15 px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1240px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4d44d]">
            New exploration set / customer proof
          </p>
          <h2 className="mt-6 max-w-[920px] font-pixel text-6xl leading-[0.85] tracking-[-0.075em] md:text-8xl">
            Make social proof feel like part of the brand.
          </h2>
          <p className="mt-7 max-w-[650px] text-lg leading-8 text-zinc-400">
            Five logo marquee and logo-grid directions. Every name below is a
            layout placeholder, ready to be replaced with approved customer
            marks.
          </p>
        </div>
      </div>

      <section
        id="logos-kinetic-marquee"
        className="overflow-hidden bg-[#f4d44d] py-20 text-black"
      >
        <div className="mx-auto max-w-[1240px] px-6 md:px-10">
          <Label number="01" title="kinetic wordmark marquee" />
          <h3 className="mt-10 max-w-[820px] font-pixel text-6xl leading-[0.86] tracking-[-0.07em] md:text-8xl">
            Built by teams shipping agents.
          </h3>
        </div>
        <div className="mt-16 flex w-max animate-[exploration-marquee_24s_linear_infinite] border-y border-black/30 font-mono text-4xl uppercase tracking-[-0.07em] hover:[animation-play-state:paused] motion-reduce:animate-none md:text-6xl">
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <span
              key={`${logo}-${index}`}
              className="flex items-center gap-9 px-9 py-6"
            >
              <span>{logo}</span>
              <span className="size-2 bg-black" />
            </span>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-[1240px] px-6 font-mono text-[9px] uppercase tracking-[0.13em] text-black/55 md:px-10">
          Hover to pause · replace placeholder wordmarks with approved logos
        </p>
      </section>

      <section
        id="logos-editorial-strip"
        className="bg-[#eceae3] px-6 py-20 text-black md:px-10"
      >
        <div className="mx-auto max-w-[1240px]">
          <Label number="02" title="editorial approval strip" />
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.64fr_1.36fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">
                Quiet confidence
              </p>
              <h3 className="mt-5 font-pixel text-6xl leading-[0.86] tracking-[-0.07em] md:text-8xl">
                The logos say enough.
              </h3>
            </div>
            <div className="grid grid-cols-2 border-l border-t border-black/20 sm:grid-cols-4">
              {logos.slice(0, 4).map((logo) => (
                <div
                  key={logo}
                  className="flex min-h-32 items-center justify-center border-b border-r border-black/20 p-5 font-mono text-lg tracking-[-0.06em]"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 font-mono text-[8px] uppercase tracking-[0.12em] text-black/45">
            A compact, high-trust band between product proof and pricing
          </p>
        </div>
      </section>

      <section id="logos-monogram-grid" className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1240px]">
          <Label number="03" title="monogram grid" />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <h3 className="max-w-[650px] font-pixel text-6xl leading-[0.86] tracking-[-0.07em] md:text-8xl">
                A customer wall with some rhythm.
              </h3>
              <p className="mt-6 max-w-[520px] text-lg leading-8 text-zinc-400">
                The grid feels designed instead of stamped on: uneven sizes,
                concise names, and one proof cell built into the pattern.
              </p>
            </div>
            <div className="grid grid-cols-4 grid-rows-3 border-l border-t border-white/15">
              <div className="col-span-2 row-span-2 flex items-end border-b border-r border-white/15 bg-[#8b7cff] p-5 text-black">
                <span className="font-pixel text-5xl tracking-[-0.06em]">
                  NORTH
                  <br />
                  STAR
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-center border-b border-r border-white/15 font-mono text-lg">
                RELAY
              </div>
              <div className="flex items-center justify-center border-b border-r border-white/15 font-mono text-sm">
                H
              </div>
              <div className="col-span-2 flex items-center justify-center border-b border-r border-white/15 font-mono text-lg">
                VECTOR
              </div>
              <div className="flex items-center justify-center border-b border-r border-white/15 font-mono text-sm">
                P
              </div>
              <div className="col-span-2 flex items-center justify-center border-b border-r border-white/15 bg-[#f4d44d] p-4 text-center font-mono text-[9px] uppercase text-black">
                Approved customer mark
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="logos-inverted-field"
        className="bg-[#0b0b0b] px-6 py-20 md:px-10"
      >
        <div className="mx-auto max-w-[1240px]">
          <Label number="04" title="inverted logo field" />
          <div className="mt-12 border border-white/15 bg-[#050505] p-6 sm:p-10">
            <div className="flex flex-col justify-between gap-8 border-b border-white/15 pb-10 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#7ee0b8]">
                  From first trace to full release loop
                </p>
                <h3 className="mt-5 max-w-[750px] font-pixel text-6xl leading-[0.86] tracking-[-0.07em] md:text-8xl">
                  Designed for teams already in production.
                </h3>
              </div>
              <p className="max-w-[260px] text-sm leading-6 text-zinc-500">
                A bolder proof treatment for a dark, product-heavy page.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
              {logos.map((logo, index) => (
                <div
                  key={logo}
                  className={`flex min-h-28 items-center justify-center p-4 font-mono text-sm tracking-[-0.06em] ${index === 5 ? "bg-[#7ee0b8] text-black" : "bg-[#050505] text-zinc-300"}`}
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="logos-proof-ledger"
        className="bg-[#ff655a] px-6 py-20 text-black md:px-10"
      >
        <div className="mx-auto max-w-[1240px]">
          <Label number="05" title="proof ledger" />
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <h3 className="font-pixel text-6xl leading-[0.86] tracking-[-0.07em] md:text-8xl">
                Logo proof, then the reason.
              </h3>
              <p className="mt-6 max-w-[480px] text-lg leading-8 text-black/65">
                Put the customer mark next to the outcome pattern it validates.
                Use only once names and claims are approved.
              </p>
            </div>
            <div className="border border-black/25 bg-black text-white">
              {[
                ["NORTHSTAR", "Faster incident investigation"],
                ["RELAY", "Release confidence"],
                ["HELIOS", "Lower retry waste"],
                ["VECTOR", "Evaluation coverage"],
              ].map(([logo, outcome], index) => (
                <div
                  key={logo}
                  className="grid grid-cols-[0.6fr_1.4fr_auto] items-center gap-4 border-b border-white/15 p-5 last:border-b-0"
                >
                  <span className="font-mono text-sm tracking-[-0.06em]">
                    {logo}
                  </span>
                  <span className="text-sm text-zinc-400">{outcome}</span>
                  <span className="font-mono text-[8px] text-zinc-600">
                    0{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
