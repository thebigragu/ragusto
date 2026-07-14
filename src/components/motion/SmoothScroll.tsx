"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
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
