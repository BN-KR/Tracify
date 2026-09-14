"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type AnimKind =
  | "fade"
  | "fade-up"
  | "fade-up-big"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "zoom-out"
  | "blur-in";

const DEFAULTS = {
  duration: 0.8,
  distance: 40,
  ease: "power3.out",
  start: "top 88%",
};

function variantFor(kind: AnimKind, distance: number) {
  switch (kind) {
    case "fade":
      return { from: { opacity: 0 } };
    case "fade-up":
      return { from: { opacity: 0, y: distance } };
    case "fade-up-big":
      return { from: { opacity: 0, y: 200 } };
    case "fade-down":
      return { from: { opacity: 0, y: -distance } };
    case "fade-left":
      return { from: { opacity: 0, x: -distance } };
    case "fade-right":
      return { from: { opacity: 0, x: distance } };
    case "zoom-in":
      return { from: { opacity: 0, scale: 0.85 } };
    case "zoom-out":
      return { from: { opacity: 0, scale: 1.15 } };
    case "blur-in":
      return { from: { opacity: 0, filter: "blur(12px)" }, clearProps: "filter" };
    default:
      return { from: { opacity: 0 } };
  }
}

function readNumber(el: HTMLElement, key: string, fallback: number) {
  const raw = el.dataset[key];
  return raw !== undefined ? parseFloat(raw) : fallback;
}

function readString(el: HTMLElement, key: string, fallback: string) {
  const raw = el.dataset[key];
  return raw !== undefined ? raw : fallback;
}

/**
 * Mounts once and wires every [data-anim] element on the page to a
 * ScrollTrigger-driven entrance animation. Attributes mirror a single,
 * predictable contract: data-anim, data-anim-delay, data-anim-duration,
 * data-anim-distance, data-anim-ease, data-anim-start, data-anim-stagger,
 * data-anim-once ("false" to replay on scroll back out).
 */
export function ScrollRevealInit() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggers: ScrollTrigger[] = [];
    const elements = document.querySelectorAll<HTMLElement>("[data-anim]");

    elements.forEach((el) => {
      const kind = el.dataset.anim as AnimKind | undefined;
      if (!kind) return;

      const duration = readNumber(el, "animDuration", DEFAULTS.duration);
      const delay = readNumber(el, "animDelay", 0);
      const distance = readNumber(el, "animDistance", DEFAULTS.distance);
      const ease = readString(el, "animEase", DEFAULTS.ease);
      const start = readString(el, "animStart", DEFAULTS.start);
      const once = readString(el, "animOnce", "true") !== "false";
      const stagger = readNumber(el, "animStagger", 0);

      const { from, clearProps } = variantFor(kind, distance);
      const target = stagger > 0 ? Array.from(el.children) : el;

      gsap.set(target, from);

      const trigger = ScrollTrigger.create({
        trigger: el,
        start,
        once,
        onEnter: () => {
          gsap.to(target, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: clearProps ? "blur(0px)" : undefined,
            duration,
            delay,
            ease,
            stagger: stagger || 0,
            clearProps,
          });
        },
        onLeaveBack: once
          ? undefined
          : () => {
              gsap.set(target, from);
            },
      });

      triggers.push(trigger);
    });

    const lines = document.querySelectorAll<HTMLElement>("[data-anim-line]");
    lines.forEach((el) => {
      const axis = el.dataset.animLine === "height" ? "height" : "width";
      const duration = readNumber(el, "animDuration", 0.8);
      const delay = readNumber(el, "animDelay", 0);

      gsap.set(el, axis === "width" ? { width: "0%" } : { height: "0%" });

      const trigger = ScrollTrigger.create({
        trigger: el.parentElement ?? el,
        start: DEFAULTS.start,
        once: true,
        onEnter: () => {
          gsap.to(el, {
            [axis]: "100%",
            duration,
            delay,
            ease: "power2.inOut",
          });
        },
      });

      triggers.push(trigger);
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
}

/**
 * Draws a border/divider line in from 0 to full width or height once its
 * container scrolls into view. Mirrors the "line drawing itself in" accent
 * used across the section dividers.
 */
export function LineReveal({
  axis = "width",
  className,
  delay = 0,
  duration = 0.8,
  style,
}: {
  axis?: "width" | "height";
  className?: string;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      data-anim-line={axis}
      data-anim-delay={delay}
      data-anim-duration={duration}
      className={className}
      style={style}
    />
  );
}
