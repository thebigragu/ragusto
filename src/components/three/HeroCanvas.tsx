"use client";

import { WebGLErrorBoundary } from "@/components/three/WebGLErrorBoundary";
import { HeroHoloOverlay } from "@/components/ui/HoloOverlay";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

const SceneCanvas = dynamic(
  () => import("@/components/three/SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);

const LoungeScene = dynamic(
  () => import("@/components/three/LoungeScene").then((m) => m.LoungeScene),
  { ssr: false },
);

/**
 * Full original hero world (room, city, table, slat wall, holos) —
 * chair removed from the plate so the matching 3D chair can pop out.
 */
function HeroPlate({ animateHolos = true }: { animateHolos?: boolean }) {
  return (
    <div className="absolute inset-0">
      <Image
        src="/images/hero-studio-plate.jpg"
        alt="Arcform luxury design studio"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[55%_center]"
      />
      {/* Keep original still's holographic energy alive on the plate screens */}
      {animateHolos ? (
        <div className="absolute inset-0 mix-blend-screen opacity-90">
          <HeroHoloOverlay />
        </div>
      ) : null}
    </div>
  );
}

export function HeroCanvas() {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = window.innerHeight * 0.9;
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reduced motion: show the original complete still (with chair)
  if (reduced) {
    return (
      <div className="absolute inset-0">
        <Image
          src="/images/hero-studio.jpg"
          alt="Arcform luxury design studio"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center]"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <HeroPlate />

      {mounted ? (
        <div className="pointer-events-none absolute inset-0">
          <WebGLErrorBoundary
            fallback={
              // If WebGL fails, fall back to the original still with the chair in place
              <Image
                src="/images/hero-studio.jpg"
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-[62%_center]"
              />
            }
          >
            <SceneCanvas
              className="h-full w-full"
              camera={{ position: [0.05, 0.35, 3.4], fov: 40 }}
            >
              <LoungeScene scrollProgress={progress} />
            </SceneCanvas>
          </WebGLErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}
