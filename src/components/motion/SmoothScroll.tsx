"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const lenis = new Lenis({
      // Desktop: longer glide. Mobile: snappier so scrub stays responsive.
      duration: coarse ? 0.85 : 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Light touch inertia — keeps native feel while damping scrub jitter
      syncTouch: coarse,
      syncTouchLerp: coarse ? 0.075 : 0.1,
      touchMultiplier: coarse ? 1.15 : 1.5,
      wheelMultiplier: 0.92,
      autoResize: true,
    });

    document.documentElement.classList.add("lenis");

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("lenis");
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
