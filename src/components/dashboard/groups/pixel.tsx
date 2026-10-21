/** Small pixel artwork shared by the Sessions and Users pages: the same dither language as the logo and the landing page. */

function hash(text: string) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index++) value = Math.imul(value ^ text.charCodeAt(index), 16777619);
  return value >>> 0;
}

/** A 5 x 5 mirrored pixel face, always the same for the same id. */
export function PixelId({ id, size = 40, dark = true }: { id: string; size?: number; dark?: boolean }) {
  let seed = hash(id) || 1;
  const bits: boolean[] = [];
  for (let index = 0; index < 15; index++) { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; bits.push((seed & 3) !== 0); }
  const cells: Array<[number, number]> = [];
  for (let row = 0; row < 5; row++) for (let column = 0; column < 3; column++) if (bits[row * 3 + column]) { cells.push([column, row]); if (column < 2) cells.push([4 - column, row]); }
  return (
    <svg aria-hidden viewBox="-1 -1 7 7" width={size} height={size} shapeRendering="crispEdges" className="shrink-0">
      <rect x="-1" y="-1" width="7" height="7" fill={dark ? "#090909" : "#eceae3"} />
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={dark ? "#f4d44d" : "#090909"} />)}
    </svg>
  );
}

/** One cell per run, scaled to at most `max` cells: yellow for runs that finished, red for failed ones. */
export function RunCells({ runs, failed, max = 24, className = "" }: { runs: number; failed: number; max?: number; className?: string }) {
  const total = Math.max(1, Math.min(max, runs));
  const bad = failed > 0 ? Math.max(1, Math.round((failed / Math.max(1, runs)) * total)) : 0;
  return (
    <span role="img" aria-label={`${runs} runs, ${failed} failed`} className={`flex flex-wrap gap-[2px] ${className}`}>
      {Array.from({ length: total }, (_, index) => <span key={index} className={`h-3 w-2.5 shrink-0 ${index >= total - bad ? "bg-[#FF6B6B]" : "bg-[#f4d44d]"}`} />)}
    </span>
  );
}
