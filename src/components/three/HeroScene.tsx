"use client";

import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  Sparkles,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  PhotorealChip,
  PrecisionCraft,
  SoftGround,
  StudioLaptop,
  StudioPhone,
  useStudioTextures,
} from "./models";

function MouseParallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    target.current.x = state.pointer.x * 0.22;
    target.current.y = state.pointer.y * 0.1;
    if (!group.current) return;
    group.current.rotation.y += (target.current.x - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (-target.current.y - group.current.rotation.x) * 0.04;
  });

  return <group ref={group}>{children}</group>;
}

function SlowSpin({
  children,
  speed = 0.1,
  axis = "y",
}: {
  children: React.ReactNode;
  speed?: number;
  axis?: "y" | "x";
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    if (axis === "y") ref.current.rotation.y += delta * speed;
    else ref.current.rotation.x += delta * speed;
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * Signature hero — photoreal chip (RefractWeb density) + machined craft (Galvanite polish).
 * Original Arcform sculpture; not a copy of either brand’s artwork.
 */
export function HeroScene({ reduced = false }: { reduced?: boolean }) {
  const textures = useStudioTextures();
  if (!textures) return null;

  return (
    <>
      <color attach="background" args={["transparent"]} />
      <fog attach="fog" args={["#0a0a0b", 10, 22]} />

      <ambientLight intensity={0.2} />
      <directionalLight
        position={[6, 8, 5]}
        intensity={1.6}
        color="#f2f5ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      <spotLight
        position={[-5, 6, 3]}
        angle={0.4}
        penumbra={0.7}
        intensity={2.2}
        color="#a78bfa"
        castShadow
      />
      <spotLight
        position={[3, 2, 4]}
        angle={0.35}
        penumbra={0.5}
        intensity={1.4}
        color="#67e8f9"
      />
      <pointLight position={[0, -1, 2]} intensity={0.6} color="#3b82f6" />

      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 4, 2]} scale={[8, 2, 1]} color="#eef2ff" />
        <Lightformer intensity={1.2} position={[-4, 1, -2]} scale={[4, 4, 1]} color="#7c6cf0" />
        <Lightformer intensity={1} position={[4, 0, 1]} scale={[3, 3, 1]} color="#14b8a6" />
      </Environment>

      <MouseParallax>
        {/* Dominant signature chip — macro product */}
        <Float speed={0.9} rotationIntensity={0.12} floatIntensity={0.28}>
          <group position={[0.35, -0.05, 0.2]} rotation={[0.55, -0.55, 0.12]} scale={1.15}>
            <SlowSpin speed={0.06}>
              <PhotorealChip textures={textures} />
            </SlowSpin>
          </group>
        </Float>

        {!reduced && (
          <>
            {/* Precision craft — launch metaphor */}
            <Float speed={1.15} rotationIntensity={0.18} floatIntensity={0.4}>
              <group position={[-2.35, 0.35, -0.2]} rotation={[0.25, 0.55, -0.2]} scale={0.95}>
                <SlowSpin speed={0.05}>
                  <PrecisionCraft textures={textures} />
                </SlowSpin>
              </group>
            </Float>

            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
              <group position={[2.55, 0.15, -0.5]} rotation={[0.1, -0.55, 0.05]} scale={0.55}>
                <StudioLaptop textures={textures} accent="#3b82f6" />
              </group>
            </Float>

            <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.45}>
              <group position={[2.1, -0.75, 0.55]} rotation={[0.15, -0.3, 0.1]} scale={0.95}>
                <StudioPhone textures={textures} />
              </group>
            </Float>

            <Sparkles
              count={28}
              scale={[8, 4, 4]}
              size={2}
              speed={0.25}
              opacity={0.35}
              color="#93c5fd"
            />
          </>
        )}
      </MouseParallax>

      <SoftGround />
      <ContactShadows
        position={[0, -1.54, 0]}
        opacity={0.55}
        scale={14}
        blur={2.8}
        far={5}
      />
    </>
  );
}
