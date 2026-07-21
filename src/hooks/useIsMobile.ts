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
 * Which hero video to load. Defaults to the portrait mobile asset so phones
 * never flash the landscape desktop cut. Desktop landscape only when the
 * viewport is wide and landscape.
 */
export function useHeroMobileVideo() {
  const [mobileVideo, setMobileVideo] = useState(true);

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
