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
      <span className="absolute -top-2.5 -left-2.5 h-7 w-7 border-l-[3px] border-t-[3px] border-[#f4d44d]" />
      <span className="absolute -top-2.5 -right-2.5 h-7 w-7 border-r-[3px] border-t-[3px] border-[#f4d44d]" />
      <span className="absolute -bottom-2.5 -left-2.5 h-7 w-7 border-b-[3px] border-l-[3px] border-[#f4d44d]" />
      <span className="absolute -bottom-2.5 -right-2.5 h-7 w-7 border-b-[3px] border-r-[3px] border-[#f4d44d]" />
      <div className="absolute -top-8 left-0 flex w-full items-baseline justify-between font-mono text-xs font-bold uppercase tracking-[0.1em] text-black">
        <span>{label}</span>
        {dimension ? <span className="text-black/60">{dimension}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** A single small "+" reference mark, the way a technical drawing pins a point. */
export function Crosshair({ className = "" }: { className?: string }) {
  return (
    <span className={`pointer-events-none relative inline-block h-5 w-5 ${className}`} aria-hidden="true">
      <span className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-[#f4d44d]" />
      <span className="absolute top-1/2 left-0 h-[3px] w-full -translate-y-1/2 bg-[#f4d44d]" />
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-[#eceae3]" />
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
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-3 w-[3px] bg-[#f4d44d]" />
      <span className="h-[3px] flex-1 bg-[#f4d44d]" />
      <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-black">{label}</span>
      <span className="h-[3px] flex-1 bg-[#f4d44d]" />
      <span className="h-3 w-[3px] bg-[#f4d44d]" />
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
