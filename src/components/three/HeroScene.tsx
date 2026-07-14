"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function GlassPanel({
  position,
  rotation,
  scale = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.6}>
      <mesh position={position} rotation={rotation} scale={scale}>
        <boxGeometry args={[1.6, 1, 0.06]} />
        <meshPhysicalMaterial
          color="#c9d4ff"
          roughness={0.12}
          metalness={0.15}
          transmission={0.85}
          thickness={0.35}
          ior={1.4}
          transparent
          opacity={0.92}
          reflectivity={0.4}
        />
      </mesh>
    </Float>
  );
}

function WireframeOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.25;
    ref.current.rotation.x += delta * 0.08;
  });

  return (
    <mesh ref={ref} scale={1.15}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#7c6cf0" wireframe transparent opacity={0.45} />
    </mesh>
  );
}

function Particles({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#14b8a6" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function MouseParallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    target.current.x = state.pointer.x * 0.35;
    target.current.y = state.pointer.y * 0.2;
    if (!group.current) return;
    group.current.rotation.y += (target.current.x - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (-target.current.y - group.current.rotation.x) * 0.05;
  });

  return <group ref={group}>{children}</group>;
}

export function HeroScene({ reduced = false }: { reduced?: boolean }) {
  return (
    <>
      <color attach="background" args={["transparent"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 3]} intensity={1.2} color="#dbeafe" />
      <pointLight position={[-3, -1, 2]} intensity={1.1} color="#7c6cf0" />
      <pointLight position={[2, 2, -2]} intensity={0.8} color="#14b8a6" />

      <MouseParallax>
        <WireframeOrb />
        {!reduced && (
          <>
            <GlassPanel position={[-2.1, 0.6, 0.4]} rotation={[0.2, 0.5, -0.15]} scale={0.95} />
            <GlassPanel position={[2.0, -0.3, 0.2]} rotation={[-0.15, -0.45, 0.1]} scale={1.05} />
            <GlassPanel position={[0.2, 1.4, -0.6]} rotation={[0.35, 0.15, 0.2]} scale={0.7} />
            <Particles count={70} />
          </>
        )}
      </MouseParallax>
    </>
  );
}
