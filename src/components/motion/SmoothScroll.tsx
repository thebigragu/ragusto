"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // Mobile: syncTouch tracks the finger closely (high lerp), then coasts
    // with decaying velocity after release. Desktop keeps wheel easing.
    const lenis = coarse
      ? new Lenis({
          syncTouch: true,
          // Higher = less dead-zone under the finger (was ~0.075 before)
          syncTouchLerp: 0.135,
          // Softer fling decay after swipe
          touchInertiaExponent: 1.2,
          lerp: 0.085,
          touchMultiplier: 1,
          autoResize: true,
          smoothWheel: false,
        })
      : new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 0.85,
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
