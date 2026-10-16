/** Full-screen loading state: the Dissolve bars streaming in, nothing else (covers any navbar/sidebar). */
export function BrandLoader({ label = "Loading" }: { label?: string }) {
  const bars = [
    { w: 100, delay: 0 },
    { w: 52, delay: 0.18 },
    { w: 36, delay: 0.36 },
  ];
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-[#090909]" role="status" aria-live="polite" aria-label={label}>
      <div className="flex w-24 flex-col items-end gap-2.5 sm:w-32" aria-hidden="true">
        {bars.map((bar) => (
          <span
            key={bar.w}
            className="h-4 origin-right bg-[#f4d44d] animate-[brand-loader_1.6s_ease-in-out_infinite] motion-reduce:animate-none sm:h-5"
            style={{ width: `${bar.w}%`, animationDelay: `${bar.delay}s` }}
          />
        ))}
      </div>
      <span className="sr-only">{label}</span>
      <style>{`@keyframes brand-loader{0%{transform:scaleX(0);opacity:.2}45%,70%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}`}</style>
    </div>
  );
}
