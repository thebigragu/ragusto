"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent,
  type ReactNode,
} from "react";

type InteractiveMediaProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  overlay?: ReactNode;
  grade?: ReactNode;
  intensity?: number;
  scrollParallax?: boolean;
};

export function InteractiveMedia({
  src,
  alt,
  className,
  imageClassName,
  priority,
  sizes = "100vw",
  overlay,
  grade,
  intensity = 1,
  scrollParallax = true,
}: InteractiveMediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const scrollY = useMotionValue(0);

  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5.5 * intensity, -5.5 * intensity]), {
    stiffness: 180,
    damping: 24,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-7.5 * intensity, 7.5 * intensity]), {
    stiffness: 180,
    damping: 24,
  });
  const tiltX = useSpring(useTransform(mx, [-0.5, 0.5], [-14 * intensity, 14 * intensity]), {
    stiffness: 140,
    damping: 22,
  });
  const tiltY = useSpring(useTransform(my, [-0.5, 0.5], [-10 * intensity, 10 * intensity]), {
    stiffness: 140,
    damping: 22,
  });
  const parallax = useSpring(useTransform(scrollY, [0, 1], [0, 48 * intensity]), {
    stiffness: 70,
    damping: 28,
  });
  const y = useTransform([tiltY, parallax], ([a, b]) => Number(a) + Number(b));

  const overlayX = useSpring(useTransform(mx, [-0.5, 0.5], [-10 * intensity, 10 * intensity]), {
    stiffness: 160,
    damping: 22,
  });
  const overlayY = useSpring(useTransform(my, [-0.5, 0.5], [-8 * intensity, 8 * intensity]), {
    stiffness: 160,
    damping: 22,
  });

  const glowX = useTransform(mx, [-0.5, 0.5], ["18%", "82%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["22%", "78%"]);
  const glow = useMotionTemplate`radial-gradient(540px circle at ${glowX} ${glowY}, rgba(20,184,166,0.2), transparent 58%)`;

  useEffect(() => {
    if (!scrollParallax) return;
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const progress = 1 - (rect.top + rect.height) / (view + rect.height);
      scrollY.set(Math.min(1, Math.max(0, progress)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollParallax, scrollY]);

  const onMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    },
    [mx, my],
  );

  const onLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <div
      ref={ref}
      className={cn("group relative isolate overflow-hidden", className)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        className="absolute inset-[-5%] will-change-transform"
        style={{
          rotateX: rx,
          rotateY: ry,
          x: tiltX,
          y: scrollParallax ? y : tiltY,
          transformStyle: "preserve-3d",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", imageClassName)}
        />
        {grade}
        {overlay ? (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ x: overlayX, y: overlayY }}
          >
            {overlay}
          </motion.div>
        ) : null}
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-screen opacity-70 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: glow }}
        />
      </motion.div>
    </div>
  );
}
