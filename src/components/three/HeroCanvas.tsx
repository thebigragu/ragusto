"use client";

import { PointerFieldProvider, usePointerFieldContext } from "@/context/PointerFieldContext";
import { WebGLErrorBoundary } from "@/components/three/WebGLErrorBoundary";
import { HeroHoloOverlay } from "@/components/ui/HoloOverlay";
import { CinematicVideo } from "@/components/ui/CinematicVideo";
import { MotionEnablePrompt } from "@/components/ui/MotionEnablePrompt";
import { getHeroLayout, type HeroLayout } from "@/lib/heroLayout";
import { expSmooth } from "@/lib/smoothTilt";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const SceneCanvas = dynamic(
  () => import("@/components/three/SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);

const LoungeScene = dynamic(
  () => import("@/components/three/LoungeScene").then((m) => m.LoungeScene),
  { ssr: false },
);

function ParallaxPlate({ children }: { children: React.ReactNode }) {
  const { input } = usePointerFieldContext();
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Opposite to cursor — plate drifts under the fixed desk MacBook
      const tx = input.current.x * -18;
      const ty = input.current.y * -12;
      pos.current.x = expSmooth(pos.current.x, tx, 14, dt);
      pos.current.y = expSmooth(pos.current.y, ty, 14, dt);
      if (ref.current) {
        ref.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) scale(1.08)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [input]);

  return (
    <div ref={ref} className="absolute inset-[-4%] will-change-transform">
      {children}
    </div>
  );
}

function HeroPlate() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <ParallaxPlate>
        <CinematicVideo
          srcBase="/videos/hero-desk-loop"
          poster="/videos/hero-desk-loop-poster.jpg"
          priority
          alt="Arcform cinematic design studio"
          videoClassName="object-cover object-center md:object-[55%_center]"
        />
      </ParallaxPlate>
      <div className="absolute inset-0 mix-blend-screen opacity-85">
        <HeroHoloOverlay />
      </div>
    </div>
  );
}

export function HeroCanvas() {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<HeroLayout>(() =>
    getHeroLayout(typeof window !== "undefined" ? window.innerWidth : 1280),
  );

  useEffect(() => {
    setMounted(true);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const onResize = () => setLayout(getHeroLayout(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
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
    return (
      <div className="absolute inset-0">
        <CinematicVideo
          srcBase="/videos/hero-desk-loop"
          poster="/videos/hero-desk-loop-poster.jpg"
          priority
          alt="Arcform cinematic design studio"
          videoClassName="object-cover object-center md:object-[55%_center]"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {mounted ? (
        <PointerFieldProvider>
          <MotionEnablePrompt />
          <HeroPlate />
          <div className="pointer-events-none absolute inset-0">
            <WebGLErrorBoundary fallback={null}>
              <SceneCanvas
                className="h-full w-full"
                camera={{
                  position: layout.cameraPosition,
                  fov: layout.cameraFov,
                }}
              >
                <LoungeScene scrollProgress={progress} layout={layout} />
              </SceneCanvas>
            </WebGLErrorBoundary>
          </div>
        </PointerFieldProvider>
      ) : (
        <CinematicVideo
          srcBase="/videos/hero-desk-loop"
          poster="/videos/hero-desk-loop-poster.jpg"
          priority
          alt="Arcform cinematic design studio"
          videoClassName="object-cover object-center md:object-[55%_center]"
        />
      )}
    </div>
  );
}
