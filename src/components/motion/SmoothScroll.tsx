"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Native touch scroll on phones — Lenis syncTouch felt laboured / laggy.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return;

    const lenis = new Lenis({
      // Controlled settle; wheel gain high enough that each notch covers
      // several hero video frames (less 1-frame slideshow jitter).
      duration: 1.45,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.78,
      touchMultiplier: 1,
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
