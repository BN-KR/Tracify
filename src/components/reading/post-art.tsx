/**
 * Deterministic pixel artwork generated from a seed (an article slug, a topic).
 * Each seed draws its own "trace": bars that dissolve from dithered to solid,
 * the same language as the Dissolve logo and the landing page timeline.
 */
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const COLS = 128;
const ROWS = 44;
const CELL = 8;

export function PostArt({ seed, className = "", accentRow }: { seed: string; className?: string; accentRow?: number }) {
  const rand = rng(seed);
  const rows = 8 + Math.floor(rand() * 3);
  const accent = accentRow ?? 2 + Math.floor(rand() * (rows - 3));
  const rects: { x: number; y: number; c: 0 | 1 }[] = [];
  let start = Math.floor(rand() * 6);
  for (let r = 0; r < rows; r++) {
    const y = 2 + Math.floor((r * (ROWS - 4)) / rows);
    const width = 14 + Math.floor(rand() * 70);
    const from = Math.max(0, Math.min(start, COLS - width - 1));
    const dissolve = Math.floor(width * (0.35 + rand() * 0.4));
    for (let i = 0; i < width; i++) {
      const t = i / width;
      const solid = i >= dissolve;
      const checker = (i + y) % 2 === 0;
      const keep = solid || (checker && rand() < 0.3 + t * 0.9) || rand() < t * 0.2;
      if (keep) for (let h = 0; h < 2; h++) rects.push({ x: from + i, y: y + h, c: r === accent ? 1 : 0 });
    }
    start = Math.max(0, Math.min(COLS - 16, from + Math.floor(rand() * 30) - 6));
  }
  for (let i = 0; i < 70; i++) rects.push({ x: Math.floor(rand() * COLS), y: Math.floor(rand() * ROWS), c: 0 });

  return (
    <svg viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" role="presentation" aria-hidden="true" className={`block bg-[#090909] ${className}`}>
      {rects.map((r, i) => (
        <rect key={i} x={r.x * CELL} y={r.y * CELL} width={CELL} height={CELL} fill={r.c ? "#f4d44d" : "#eceae3"} fillOpacity={r.c ? 1 : 0.9} />
      ))}
    </svg>
  );
}
