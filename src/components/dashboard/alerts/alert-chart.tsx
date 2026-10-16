type Props = {
  series: number[];
  threshold: number;
  color: string;
  height?: number;
  /** Draw bars (preview) instead of a line (cards). */
  bars?: boolean;
  label: string;
};

const WIDTH = 400;

export function AlertChart({ series, threshold, color, height = 84, bars = false, label }: Props) {
  const max = Math.max(threshold * 1.35, ...series, 1);
  const y = (value: number) => height - (Math.min(value, max) / max) * (height - 4) - 2;
  const step = series.length > 1 ? WIDTH / (series.length - 1) : WIDTH;
  const limitY = y(threshold);
  const line = series.map((value, index) => `${index ? "L" : "M"}${(index * step).toFixed(1)},${y(value).toFixed(1)}`).join(" ");
  const barWidth = WIDTH / Math.max(series.length, 1);
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${WIDTH} ${height}`} preserveAspectRatio="none" className="block w-full" style={{ height }}>
      {bars ? series.map((value, index) => (
        <rect key={index} x={index * barWidth} y={y(value)} width={Math.max(barWidth - 1.5, 1)} height={height - y(value)} fill={value > threshold ? "#FF6B6B" : "#2F3641"} />
      )) : (
        <>
          <path d={`${line} L${WIDTH},${height} L0,${height} Z`} fill={color} opacity={0.12} />
          <path d={line} fill="none" stroke={color} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
        </>
      )}
      <line x1={0} x2={WIDTH} y1={limitY} y2={limitY} stroke="#F4D44D" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
