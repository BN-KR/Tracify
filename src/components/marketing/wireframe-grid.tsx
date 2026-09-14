/**
 * Blueprint/wireframe accents — monochrome + yellow only (matches the
 * production palette: #eceae3 cream, #090909 near-black, #f4d44d/#fff4b5
 * yellow). Unlike a page-spanning grid overlay (which just reads as ruled
 * notebook paper once it crosses text), these are the actual conventions a
 * technical drawing or a design tool's inspector uses: a component-selection
 * frame with corner handles, a measured dimension line with arrow ticks, and
 * a crosshair marking a single reference point. Used sparingly, in
 * whitespace, never laid over content.
 */

export function BlueprintFrame({
  label,
  dimension,
  className = "",
  children,
}: {
  label: string;
  dimension?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute -top-1 -left-1 h-2.5 w-2.5 border-l-2 border-t-2 border-black/70" />
      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 border-r-2 border-t-2 border-black/70" />
      <span className="absolute -bottom-1 -left-1 h-2.5 w-2.5 border-b-2 border-l-2 border-black/70" />
      <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-black/70" />
      <div className="absolute -top-6 left-0 flex w-full items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-black/40">
        <span>{label}</span>
        {dimension ? <span className="text-black/30">{dimension}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** A single small "+" reference mark, the way a technical drawing pins a point. */
export function Crosshair({ className = "" }: { className?: string }) {
  return (
    <span className={`pointer-events-none relative inline-block h-3 w-3 ${className}`} aria-hidden="true">
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/30" />
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-black/30" />
    </span>
  );
}

/** A measured dimension line with arrow ticks and a centered label, like an annotated technical drawing. */
export function DimensionLine({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-hidden="true">
      <span className="h-2 w-px bg-black/30" />
      <span className="h-px flex-1 bg-black/30" />
      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-black/40">{label}</span>
      <span className="h-px flex-1 bg-black/30" />
      <span className="h-2 w-px bg-black/30" />
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
