"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

type SceneCanvasProps = {
  children: ReactNode;
  className?: string;
  dpr?: [number, number];
  camera?: { position?: [number, number, number]; fov?: number };
};

export function SceneCanvas({
  children,
  className,
  dpr = [1, 1.5],
  camera = { position: [0.2, 1.1, 5.2], fov: 40 },
}: SceneCanvasProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", minHeight: "100%" }}>
      <Canvas
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        camera={camera}
        style={{ width: "100%", height: "100%", display: "block" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
