"use client";

import { ContactShadows, Environment, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  BrowserWindow,
  CircuitBoard,
  LaptopDevice,
  PhoneDevice,
  SiliconDie,
  SoftGround,
  UiCardStack,
} from "./models";

function MouseParallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    target.current.x = state.pointer.x * 0.28;
    target.current.y = state.pointer.y * 0.14;
    if (!group.current) return;
    group.current.rotation.y += (target.current.x - group.current.rotation.y) * 0.045;
    group.current.rotation.x += (-target.current.y - group.current.rotation.x) * 0.045;
  });

  return <group ref={group}>{children}</group>;
}

function SlowSpin({
  children,
  speed = 0.12,
}: {
  children: React.ReactNode;
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * Hero composition — original Arcform product sculpture.
 * Principles (not copies): RefractWeb signature hardware density,
 * Armory product-as-story, Vertex layered UI depth, Galvanite clarity of product UI.
 */
export function HeroScene({ reduced = false }: { reduced?: boolean }) {
  return (
    <>
      <color attach="background" args={["transparent"]} />
      <fog attach="fog" args={["#0a0a0b", 8, 18]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[5, 6, 4]}
        intensity={1.35}
        color="#e8eefc"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight
        position={[-4, 5, 2]}
        angle={0.45}
        penumbra={0.6}
        intensity={1.2}
        color="#7c6cf0"
      />
      <pointLight position={[3, 1, -2]} intensity={0.9} color="#14b8a6" />
      <Environment preset="city" environmentIntensity={0.35} />

      <MouseParallax>
        {/* Signature computing module — centerpiece */}
        <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.35}>
          <group position={[0.55, -0.15, 0]} rotation={[0.35, -0.45, 0.08]} scale={1.05}>
            <SlowSpin speed={0.08}>
              <CircuitBoard />
              <group position={[0, 0.08, 0]}>
                <SiliconDie />
              </group>
            </SlowSpin>
          </group>
        </Float>

        {!reduced && (
          <>
            {/* Dashboard browser — right rear */}
            <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.45}>
              <group position={[2.35, 0.55, -0.6]} rotation={[0.12, -0.55, 0.08]} scale={0.72}>
                <BrowserWindow accent="#3b82f6" />
              </group>
            </Float>

            {/* Phone — left mid */}
            <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.55}>
              <group position={[-2.15, 0.15, 0.35]} rotation={[0.15, 0.55, -0.12]} scale={1.05}>
                <PhoneDevice accent="#7c6cf0" />
              </group>
            </Float>

            {/* Laptop — lower left depth */}
            <Float speed={0.9} rotationIntensity={0.1} floatIntensity={0.3}>
              <group position={[-1.5, -0.85, -1.1]} rotation={[0.05, 0.35, 0]} scale={0.55}>
                <LaptopDevice accent="#14b8a6" />
              </group>
            </Float>

            {/* UI card stack — upper left */}
            <Float speed={1.3} rotationIntensity={0.2} floatIntensity={0.4}>
              <group position={[-2.4, 1.05, -0.4]} rotation={[0.2, 0.4, -0.1]} scale={0.7}>
                <UiCardStack accent="#14b8a6" />
              </group>
            </Float>

            {/* Second browser — far right small */}
            <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.35}>
              <group position={[2.6, -0.55, 0.4]} rotation={[-0.1, -0.35, 0.05]} scale={0.45}>
                <BrowserWindow width={2} height={1.3} accent="#7c6cf0" />
              </group>
            </Float>
          </>
        )}
      </MouseParallax>

      <SoftGround />
      <ContactShadows
        position={[0, -1.34, 0]}
        opacity={0.45}
        scale={12}
        blur={2.5}
        far={4}
      />
    </>
  );
}
