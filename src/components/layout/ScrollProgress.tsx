"use client";

import { motion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 right-0 left-0 z-[80] h-[2px] origin-left bg-gradient-to-r from-accent-blue via-accent-violet to-accent-teal"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
