"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";

type ArcformMarkProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
};

const sizes = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-14 w-14 md:h-16 md:w-16",
};

/** Geometric Arcform mark — stroke-draw on mount, subtle scroll morph. */
export function ArcformMark({ className, size = "md", animated = true }: ArcformMarkProps) {
  const { scrollYProgress } = useScroll();
  const latticeOpacity = useTransform(scrollYProgress, [0, 0.12, 0.4], [0.85, 1, 0.5]);
  const nodeY = useTransform(scrollYProgress, [0, 0.25], [0, 2]);

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={cn(sizes[size], "text-current", className)}
    >
      <motion.path
        d="M12 44 C12 22 22 12 32 12 C42 12 52 22 52 44"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        initial={animated ? { pathLength: 0, opacity: 0.35 } : undefined}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M18 44 H46"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={animated ? { pathLength: 0 } : undefined}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ delay: 0.22, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M24 44 V28 M32 44 V22 M40 44 V28"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={animated ? { pathLength: 0 } : undefined}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ delay: 0.38, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={animated ? { opacity: latticeOpacity } : { opacity: 0.85 }}
      />
      <motion.circle
        cx="32"
        cy="18"
        r="2.2"
        fill="currentColor"
        initial={animated ? { scale: 0, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 1 } : undefined}
        transition={{ delay: 0.7, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={animated ? { y: nodeY } : undefined}
      />
    </svg>
  );
}

export function ArcformWordmark({
  className,
  markSize = "md",
  textClassName,
}: {
  className?: string;
  markSize?: "sm" | "md" | "lg";
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <ArcformMark size={markSize} />
      <span className={cn("font-display tracking-tight", textClassName)}>Arcform</span>
    </span>
  );
}
