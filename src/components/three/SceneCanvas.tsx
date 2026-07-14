"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

type SceneCanvasProps = {
  children: ReactNode;
  className?: string;
  dpr?: [number, number];
};

export function SceneCanvas({ children, className, dpr = [1, 1.5] }: SceneCanvasProps) {
  return (
    <div className={className}>
      <Canvas
        dpr={dpr}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.55, 5.4], fov: 36 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
