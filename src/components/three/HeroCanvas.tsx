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

function HeroStill() {
  return (
    <>
      <Image
        src="/images/hero-studio.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center]"
      />
      <div className="absolute inset-0">
        <HeroHoloOverlay />
      </div>
    </>
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

  // Always paint the photoreal still so the hero is never blank.
  // WebGL layers on top when available.
  return (
    <div className="absolute inset-0">
      <HeroStill />

      {mounted && !reduced ? (
        <div className="absolute inset-0 mix-blend-normal opacity-[0.92]">
          <WebGLErrorBoundary fallback={null}>
            <SceneCanvas
              className="h-full w-full"
              camera={{ position: [0.2, 1.1, 5.2], fov: 40 }}
            >
              <LoungeScene scrollProgress={progress} />
            </SceneCanvas>
          </WebGLErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}
