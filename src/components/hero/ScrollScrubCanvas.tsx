"use client";

import { useCanvasScrub } from "@/hooks/useCanvasScrub";
import {
  CANVAS_ROTATE_MAX,
  CANVAS_SCALE_DEPTH,
} from "@/lib/hero-sequence/config";
import type { ScrubFrame } from "@/lib/hero-sequence/types";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

type ScrollScrubCanvasProps = {
  images: (ScrubFrame | undefined)[];
  targetFrameIndex: React.RefObject<number>;
  opacity: MotionValue<number>;
  scrollProgress: MotionValue<number>;
  enabled?: boolean;
};

export function ScrollScrubCanvas({
  images,
  targetFrameIndex,
  opacity,
  scrollProgress,
  enabled = true,
}: ScrollScrubCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCanvasScrub(canvasRef, { images, targetFrameIndex, enabled });

  const rotateX = useTransform(
    scrollProgress,
    [0, 0.5, 1],
    [0, CANVAS_ROTATE_MAX * 0.4, CANVAS_ROTATE_MAX],
  );
  const scale = useTransform(
    scrollProgress,
    [0, 1],
    [1, 1 + CANVAS_SCALE_DEPTH],
  );
  const canvasTransform = useTransform(
    [rotateX, scale],
    ([rx, s]) => `perspective(1200px) rotateX(${rx}deg) scale(${s})`,
  );

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0 origin-center"
        style={{ transform: canvasTransform }}
      >
        <canvas
          ref={canvasRef}
          role="presentation"
          className="absolute inset-0 h-full w-full"
        />
      </motion.div>
    </motion.div>
  );
}
