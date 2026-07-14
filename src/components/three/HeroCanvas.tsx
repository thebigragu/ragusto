"use client";

import { WebGLErrorBoundary } from "@/components/three/WebGLErrorBoundary";
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

/** Window/city only — chair is 3D, not baked into the photo */
function HeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="/images/hero-studio.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-110 object-cover object-[12%_center] opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/55 to-black/90" />
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

  if (reduced) {
    return <HeroBackdrop />;
  }

  return (
    <div className="absolute inset-0">
      <HeroBackdrop />

      {mounted ? (
        <div className="absolute inset-0">
          <WebGLErrorBoundary fallback={null}>
            <SceneCanvas
              className="h-full w-full"
              camera={{ position: [0.1, 0.95, 4.8], fov: 38 }}
            >
              <LoungeScene scrollProgress={progress} />
            </SceneCanvas>
          </WebGLErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}
