"use client";

import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { useRef } from "react";

/**
 * Map scroll-driven progress (0–1) to an integer frame index.
 * No spring — frame index tracks scroll directly for frame-perfect scrub.
 */
export function useScrollFrameIndex(
  progress: MotionValue<number>,
  frameCount: number,
) {
  const targetFrameIndex = useRef(0);
  const maxIndex = Math.max(0, frameCount - 1);

  useMotionValueEvent(progress, "change", (p) => {
    const clamped = Math.min(1, Math.max(0, p));
    targetFrameIndex.current = Math.min(
      maxIndex,
      Math.max(0, Math.round(clamped * maxIndex)),
    );
  });

  return targetFrameIndex;
}
