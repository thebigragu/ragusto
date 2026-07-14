"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  AuroraBackdrop,
  DesertGround,
  GroundEmbers,
  RockMass,
  StudioPavilion,
  useLuxuryTextures,
} from "./luxuryModels";

/**
 * Immersive studio landscape — Vertex-class cinematic environment (original).
 * Scroll progresses camera orbit / reveal of the pavilion.
 */
export function ShowcaseScene({ progress }: { progress: number }) {
  const textures = useLuxuryTextures();
  const root = useRef<THREE.Group>(null);
  const pavilion = useRef<THREE.Group>(null);

  useFrame(() => {
    if (root.current) {
      root.current.rotation.y = -0.25 + progress * 0.55;
      root.current.position.y = (1 - progress) * 0.2;
    }
    if (pavilion.current) {
      const a = THREE.MathUtils.smoothstep(progress, 0.1, 0.55);
      pavilion.current.scale.setScalar(0.7 + a * 0.45);
      pavilion.current.position.y = THREE.MathUtils.lerp(-0.4, 0, a);
    }
  });

  if (!textures) return null;

  return (
    <>
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 6, 18]} />

      <ambientLight intensity={0.12} />
      <directionalLight position={[-2, 4, -3]} intensity={1.8} color="#22d3ee" />
      <directionalLight position={[5, 2, 2]} intensity={1.1} color="#fb7185" castShadow />
      <pointLight position={[2.5, 0.5, 1]} intensity={2} color="#f97316" distance={6} />
      <spotLight position={[0, 5, 2]} angle={0.5} intensity={1.2} color="#e2e8f0" />

      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 3, -4]} scale={[12, 4, 1]} color="#0891b2" />
        <Lightformer intensity={1} position={[4, 1, 2]} scale={3} color="#fb7185" />
      </Environment>

      <AuroraBackdrop />

      <group ref={root}>
        <group ref={pavilion} position={[0, 0, 0.3]}>
          <StudioPavilion />
        </group>

        <RockMass textures={textures} position={[-2.4, 0.2, -1.2]} scale={1.15} />
        <RockMass textures={textures} position={[2.6, 0.1, -0.8]} scale={1.35} warm />
        <RockMass textures={textures} position={[0.2, 0.6, -2.4]} scale={1.6} />
        <RockMass textures={textures} position={[-3.2, -0.2, 0.8]} scale={0.85} />

        <GroundEmbers count={320} />
        <DesertGround />
      </group>

      <ContactShadows position={[0, -0.88, 0]} opacity={0.5} scale={18} blur={2.5} far={8} />
    </>
  );
}
