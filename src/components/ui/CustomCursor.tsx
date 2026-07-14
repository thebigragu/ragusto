"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 420, damping: 32 });
  const springY = useSpring(y, { stiffness: 420, damping: 32 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    setEnabled(true);
    document.body.classList.add("has-custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest("a, button, [data-cursor='hover']");
      setHovering(Boolean(interactive));
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[90] mix-blend-difference"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
    >
      <motion.div
        className="rounded-full bg-white"
        animate={{
          width: hovering ? 48 : 12,
          height: hovering ? 48 : 12,
          opacity: hovering ? 0.9 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}
