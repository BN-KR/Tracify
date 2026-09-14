"use client";

/**
 * Wireframe/grid exploration layer — monochrome + yellow only (matches the
 * production palette: #eceae3 cream, #090909 near-black, #f4d44d/#fff4b5
 * yellow). Two pieces:
 *  - GridOverlay: a fixed column-guide + ruler layer running the full page,
 *    like a design tool's grid guides.
 *  - BlueprintFrame: a dashed border with corner ticks and a small
 *    monospace label, for wrapping individual sections/panels.
 * Purely additive/visual — no page logic lives here.
 */

const COLUMNS = 12;

export function GridOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
      <div className="mx-auto grid h-full max-w-[1240px] grid-cols-12 px-6 md:px-10">
        {Array.from({ length: COLUMNS }).map((_, i) => (
          <div key={i} className="relative border-l border-black/[0.06] last:border-r">
            {i === 0 ? (
              <span className="absolute left-1 top-1 font-mono text-[8px] text-black/25">01</span>
            ) : null}
            {i === COLUMNS - 1 ? (
              <span className="absolute right-1 top-1 font-mono text-[8px] text-black/25">12</span>
            ) : null}
          </div>
        ))}
      </div>
      {/* Ruler ticks along the left edge */}
      <div className="absolute inset-y-0 left-0 hidden w-6 flex-col justify-between py-4 lg:flex">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="h-px w-2 bg-black/15" />
            {i % 5 === 0 ? <span className="font-mono text-[7px] text-black/25">{i * 5}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlueprintFrame({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative border border-dashed border-black/20 ${className}`}>
      <span className="absolute -top-px -left-px h-3 w-3 border-l border-t border-black/50" />
      <span className="absolute -top-px -right-px h-3 w-3 border-r border-t border-black/50" />
      <span className="absolute -bottom-px -left-px h-3 w-3 border-b border-l border-black/50" />
      <span className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-black/50" />
      <span className="absolute -top-2.5 left-2 z-10 bg-[#eceae3] px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-black/45">
        {label}
      </span>
      {children}
    </div>
  );
}

export function GridTick({ n }: { n: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-black/40">
      <span className="h-1.5 w-1.5 bg-[#f4d44d]" />
      {n}
    </span>
  );
}
