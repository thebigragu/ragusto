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

function HeroBackdrop() {
  return (
    <div className="absolute inset-0">
      <Image
        src="/images/hero-studio.jpg"
        alt="Arcform studio"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[58%_center]"
      />
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

  return (
    <div className="absolute inset-0">
      {/* Always-visible photoreal base */}
      <HeroBackdrop />

      {mounted && !reduced ? (
        <div className="pointer-events-none absolute inset-0">
          <WebGLErrorBoundary fallback={null}>
            <SceneCanvas
              className="h-full w-full"
              camera={{ position: [0.35, 0.55, 3.8], fov: 40 }}
            >
              <LoungeScene scrollProgress={progress} />
            </SceneCanvas>
          </WebGLErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}
