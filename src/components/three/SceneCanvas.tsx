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
  dpr = [1, 1.75],
  camera = { position: [0, 0.35, 4.2], fov: 38 },
}: SceneCanvasProps) {
  return (
    <div className={className}>
      <Canvas
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={camera}
        style={{ width: "100%", height: "100%" }}
        eventSource={typeof document !== "undefined" ? document.documentElement : undefined}
        eventPrefix="client"
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
