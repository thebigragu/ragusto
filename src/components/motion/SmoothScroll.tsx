"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // Mobile: track the finger, then coast slowly so scrub can play every frame.
    // High touchInertiaExponent amplifies flings (v ** exp) — keep it near 1.
    const lenis = coarse
      ? new Lenis({
          syncTouch: true,
          syncTouchLerp: 0.1,
          touchInertiaExponent: 1.05,
          lerp: 0.05,
          touchMultiplier: 0.72,
          autoResize: true,
          smoothWheel: false,
          // Cap per-tick deltas so a hard flick can’t leap past scrub frames
          virtualScroll: (data) => {
            const maxDelta = 42;
            if (Math.abs(data.deltaY) > maxDelta) {
              data.deltaY = Math.sign(data.deltaY) * maxDelta;
            }
            return true;
          },
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
