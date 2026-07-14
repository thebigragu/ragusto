"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SceneCanvas = dynamic(
  () => import("@/components/three/SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);

const HeroScene = dynamic(
  () => import("@/components/three/HeroScene").then((m) => m.HeroScene),
  { ssr: false },
);

export function HeroCanvas() {
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const update = () => {
      setReduced(mqReduced.matches);
      setMobile(mqMobile.matches);
    };
    update();
    setReady(true);
    mqReduced.addEventListener("change", update);
    mqMobile.addEventListener("change", update);
    return () => {
      mqReduced.removeEventListener("change", update);
      mqMobile.removeEventListener("change", update);
    };
  }, []);

  if (!ready) {
    return <div className="absolute inset-0 ambient-grid opacity-40" aria-hidden />;
  }

  if (reduced) {
    return (
      <div
        className="absolute inset-0 ambient-grid opacity-50"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at 70% 40%, color-mix(in oklab, var(--accent-violet) 22%, transparent), transparent 55%), radial-gradient(ellipse at 30% 70%, color-mix(in oklab, var(--accent-blue) 18%, transparent), transparent 50%)",
        }}
      />
    );
  }

  return (
    <SceneCanvas
      className="absolute inset-0"
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
    >
      <HeroScene reduced={mobile} />
    </SceneCanvas>
  );
}
