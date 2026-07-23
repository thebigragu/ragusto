"use client";

import { useEffect, useState } from "react";

/** True below the Tailwind `md` breakpoint (768px). Mobile-first default avoids SSR desktop layout flash on phones. */
export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return mobile;
}

/**
 * Scales hero bubbles with viewport — smaller on compact laptops, larger on
 * ultrawide — so cards keep a balanced share of the frame.
 */
export function useResponsiveBubbleScale(isMobile: boolean) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (isMobile) {
        // Phone / small tablet: track a ~390×844 reference
        const byW = w / 390;
        const byH = h / 844;
        setScale(Math.min(1.08, Math.max(0.86, Math.min(byW, byH))));
        return;
      }

      // Desktop: 1100 → ~0.82, 1440 → 1, 1920 → ~1.05 — keep ultrawide restrained
      // so yawed cards don't clip past the frame edge
      const t = Math.min(1, Math.max(0, (w - 1100) / (2200 - 1100)));
      const eased = t * t * (3 - 2 * t);
      let next = 0.82 + eased * (1.08 - 0.82);
      // Short laptop screens: pull down a touch so bubbles don't dominate height
      if (h < 800) next *= 0.92 + (h / 800) * 0.08;
      setScale(Math.min(1.1, Math.max(0.78, next)));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isMobile]);

  return scale;
}

/**
 * Which hero sequence to load. Returns `null` until the viewport is measured
 * so preload never starts on mobile then switches to desktop (double decode).
 * Desktop landscape only when the viewport is wide and landscape.
 */
export function useHeroMobileVideo(): boolean | null {
  const [mobileVideo, setMobileVideo] = useState<boolean | null>(null);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 1023px)");
    const portrait = window.matchMedia("(orientation: portrait)");

    const update = () => {
      const tall = window.innerHeight >= window.innerWidth;
      setMobileVideo(narrow.matches || portrait.matches || tall);
    };

    update();
    narrow.addEventListener("change", update);
    portrait.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      narrow.removeEventListener("change", update);
      portrait.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return mobileVideo;
}
