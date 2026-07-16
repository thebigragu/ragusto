"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type CinematicVideoProps = {
  srcBase: string;
  poster: string;
  className?: string;
  videoClassName?: string;
  priority?: boolean;
  opacity?: number;
  alt?: string;
  /** Cache-bust query, e.g. "v=2" */
  revision?: string;
};

/**
 * Muted looping cinematic plate. Pauses when offscreen.
 * prefers-reduced-motion → poster only.
 */
export function CinematicVideo({
  srcBase,
  poster,
  className,
  videoClassName,
  priority = false,
  opacity = 1,
  alt = "",
  revision = "4",
}: CinematicVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const q = revision ? `?${revision}` : "";

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          void el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, ready]);

  if (reduced) {
    return (
      <div className={cn("absolute inset-0 overflow-hidden", className)} style={{ opacity }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${poster}${q}`}
          alt={alt}
          className={cn("h-full w-full object-cover", videoClassName)}
          fetchPriority={priority ? "high" : "auto"}
        />
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} style={{ opacity }}>
      {/* Poster underneath until video can paint */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${poster}${q}`}
        alt=""
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
          ready ? "opacity-0" : "opacity-100",
          videoClassName,
        )}
        fetchPriority={priority ? "high" : "auto"}
      />
      <video
        ref={ref}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0",
          videoClassName,
        )}
        muted
        loop
        playsInline
        autoPlay
        preload={priority ? "auto" : "metadata"}
        poster={`${poster}${q}`}
        aria-label={alt || undefined}
        onCanPlay={() => setReady(true)}
      >
        <source src={`${srcBase}.webm${q}`} type="video/webm" />
        <source src={`${srcBase}.mp4${q}`} type="video/mp4" />
      </video>
    </div>
  );
}
