"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function PipelineNode({
  position,
  progress,
  index,
}: {
  position: [number, number, number];
  progress: number;
  index: number;
}) {
  const active = progress > index * 0.22;
  return (
    <mesh position={position}>
      <boxGeometry args={[1.15, 0.72, 0.08]} />
      <meshStandardMaterial
        color={active ? "#3b82f6" : "#2a2a32"}
        transparent
        opacity={active ? 0.85 : 0.35}
        metalness={0.4}
        roughness={0.25}
        emissive={active ? "#3b82f6" : "#000000"}
        emissiveIntensity={active ? 0.35 : 0}
      />
    </mesh>
  );
}

function FlowLine({ progress }: { progress: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.scale.x = Math.max(0.05, progress);
  });

  return (
    <mesh ref={ref} position={[-1.8, 0, -0.2]} scale={[0.05, 1, 1]}>
      <boxGeometry args={[4.2, 0.02, 0.02]} />
      <meshBasicMaterial color="#14b8a6" transparent opacity={0.8} />
    </mesh>
  );
}

function AmbientDust({ count = 40 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return arr;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#7c6cf0" transparent opacity={0.55} />
    </points>
  );
}

export function ShowcaseScene({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = -0.35 + progress * 0.55;
    group.current.position.y = (1 - progress) * 0.25;
  });

  const nodes: [number, number, number][] = [
    [-2.2, 0.35, 0],
    [-0.7, -0.15, 0.15],
    [0.8, 0.25, -0.1],
    [2.2, -0.2, 0.05],
  ];

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 2]} intensity={1} />
      <pointLight position={[-2, 1, 2]} intensity={0.9} color="#7c6cf0" />
      <group ref={group}>
        <FlowLine progress={progress} />
        {nodes.map((pos, i) => (
          <PipelineNode key={i} position={pos} progress={progress} index={i} />
        ))}
        <AmbientDust />
      </group>
    </>
  );
}
