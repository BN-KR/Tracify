import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type Tone = "paper" | "ink" | "signal";

export function FuturePage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`future19-public-page min-h-screen overflow-hidden bg-[#eceae3] pt-[54px] text-black ${className}`}
    >
      {children}
    </main>
  );
}

export function FutureMasthead({
  eyebrow,
  title,
  description,
  index = "F19",
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  index?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="border-b border-black">
      <div className="mx-auto grid max-w-[1240px] md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="border-black px-5 py-14 sm:px-8 md:border-r md:px-10 md:py-20">
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.16em]">
            <span className="inline-block size-2 bg-[#f4d44d]" aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="mt-7 max-w-5xl text-balance font-pixel text-[clamp(3.4rem,8vw,7.8rem)] leading-[0.82] tracking-[-0.075em]">
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-pretty text-base leading-7 text-black/58 md:text-lg">
            {description}
          </p>
        </div>
        <div className="flex min-h-44 flex-col justify-between border-t border-black bg-black p-6 text-white md:min-h-0 md:border-t-0">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
            {index} / public record
          </span>
          {aside ?? (
            <div>
              <div className="mb-4 h-2 w-20 bg-[#f4d44d]" />
              <p className="font-mono text-[10px] uppercase leading-5 tracking-[0.12em] text-white/65">
                Evidence before opinion.
                <br />Every signal traceable.
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function FutureBand({
  label,
  children,
  tone = "paper",
  className = "",
  id,
}: {
  label?: string;
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
}) {
  const toneClass =
    tone === "ink"
      ? "bg-black text-white"
      : tone === "signal"
        ? "bg-[#f4d44d] text-black"
        : "bg-[#eceae3] text-black";
  return (
    <section id={id} className={`border-b border-black ${toneClass} ${className}`}>
      <div className="mx-auto max-w-[1240px]">
        {label ? (
          <div className="border-b border-current/25 px-5 py-3 font-mono text-[8px] uppercase tracking-[0.16em] opacity-60 sm:px-8 md:px-10">
            {label}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function FutureAction({
  href,
  children,
  inverted = false,
}: {
  href: string;
  children: ReactNode;
  inverted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`active-press inline-flex min-h-12 items-center justify-between gap-6 border px-5 py-3 font-mono text-[9px] uppercase tracking-[0.13em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        inverted
          ? "border-white bg-white text-black hover:border-[#f4d44d] hover:bg-[#f4d44d] focus-visible:outline-white"
          : "border-black bg-black text-white hover:bg-[#f4d44d] hover:text-black focus-visible:outline-black"
      }`}
    >
      {children}
      <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
    </Link>
  );
}

export function FutureIndex({ value }: { value: string }) {
  return (
    <span className="font-pixel text-5xl leading-none tracking-[-0.06em] text-black/16" aria-hidden="true">
      {value}
    </span>
  );
}

export const futureArticleClass =
  "future19-article text-[15px] leading-7 text-black/68 [&_a]:font-medium [&_a]:text-black [&_a]:underline [&_a]:decoration-[#d1af18] [&_a]:decoration-2 [&_a]:underline-offset-4 [&_blockquote]:border-l-8 [&_blockquote]:border-[#f4d44d] [&_blockquote]:bg-white/55 [&_blockquote]:px-6 [&_blockquote]:py-4 [&_code]:bg-black [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-[#f4d44d] [&_h2]:mt-16 [&_h2]:border-t [&_h2]:border-black [&_h2]:pt-5 [&_h2]:font-pixel [&_h2]:text-4xl [&_h2]:leading-none [&_h2]:tracking-[-0.05em] [&_h3]:mt-10 [&_h3]:font-mono [&_h3]:text-xs [&_h3]:uppercase [&_h3]:tracking-[0.13em] [&_li]:my-2 [&_ol]:my-6 [&_ol]:pl-6 [&_p]:my-6 [&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-black [&_pre]:bg-black [&_pre]:p-5 [&_pre_code]:bg-transparent [&_ul]:my-6 [&_ul]:list-square [&_ul]:pl-6";
