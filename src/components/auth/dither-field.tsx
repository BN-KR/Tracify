"use client";

import { useEffect, useRef } from "react";

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const CELL = 8;

/**
 * Slow dithered wave field in the brand pixel style. Dense and yellow at the
 * bottom, fading to sparse dark pixels toward the top, and it bulges toward the
 * pointer. Draws once (no motion) when the visitor prefers reduced motion.
 */
export function DitherField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    const mouse = { x: -1, y: -1 };
    const eased = { x: -1, y: -1, k: 0 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.ceil(r.width / CELL);
      h = Math.ceil(r.height / CELL);
      canvas.width = w * CELL;
      canvas.height = h * CELL;
      draw(performance.now());
    };

    function draw(now: number) {
      if (!ctx) return;
      const t = reduce ? 0 : now / 1000;
      ctx.clearRect(0, 0, w * CELL, h * CELL);
      for (let y = 0; y < h; y++) {
        const ny = y / h;
        for (let x = 0; x < w; x++) {
          const nx = x / w;
          let v = ny * 0.95 - 0.12 + (1 - nx) * 0.18;
          v += 0.26 * Math.sin(nx * 6 + t * 0.08 + ny * 3) + 0.12 * Math.sin(nx * 15 - t * 0.1);
          if (eased.k > 0.01) {
            const dx = x - eased.x;
            const dy = y - eased.y;
            v += 0.22 * eased.k * Math.exp(-(dx * dx + dy * dy) / 420);
          }
          const th = (BAYER[y & 3][x & 3] + 0.5) / 16;
          if (v <= th) continue;
          if (v > 0.85) {
            ctx.fillStyle = "#f4d44d";
            ctx.globalAlpha = 1;
          } else {
            ctx.fillStyle = "#090909";
            ctx.globalAlpha = 0.16 + Math.min(0.5, v * 0.5);
          }
          ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
        }
      }
      ctx.globalAlpha = 1;
    }

    const loop = (now: number) => {
      if (now - last > 40) {
        if (mouse.x >= 0) {
          if (eased.x < 0) { eased.x = mouse.x; eased.y = mouse.y; }
          eased.x += (mouse.x - eased.x) * 0.06;
          eased.y += (mouse.y - eased.y) * 0.06;
          eased.k += (1 - eased.k) * 0.05;
        }
        draw(now);
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / CELL;
      mouse.y = (e.clientY - r.top) / CELL;
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      window.addEventListener("pointermove", onMove);
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`absolute inset-0 -z-10 size-full ${className}`} />;
}
