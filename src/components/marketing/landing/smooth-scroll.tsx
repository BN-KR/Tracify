"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* Gentle inertia scroll for the landing page only. It moves the real page scroll,
   so the scroll-driven animations and the sticky nav keep working unchanged.
   Touch devices keep native scrolling; reduced-motion users get none of this. */
export function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches) return;

    const lenis = new Lenis({ lerp: 0.14, wheelMultiplier: 0.9, anchors: true });
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    const onChange = () => query.matches && lenis.destroy();
    query.addEventListener("change", onChange);
    return () => {
      query.removeEventListener("change", onChange);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
