"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  PhotorealChip,
  PrecisionCraft,
  StudioLaptop,
  StudioPhone,
  useStudioTextures,
} from "./models";

/**
 * Scroll-scrubbed assembly of photoreal product assets.
 */
export function ShowcaseScene({ progress }: { progress: number }) {
  const textures = useStudioTextures();
  const root = useRef<THREE.Group>(null);
  const chip = useRef<THREE.Group>(null);
  const craft = useRef<THREE.Group>(null);
  const laptop = useRef<THREE.Group>(null);
  const phone = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = progress;
    if (root.current) {
      root.current.rotation.y = -0.35 + p * 0.55;
      root.current.position.y = (1 - p) * 0.15;
    }
    if (chip.current) {
      const a = THREE.MathUtils.smoothstep(p, 0, 0.3);
      chip.current.scale.setScalar(0.5 + a * 0.65);
      chip.current.position.set(0, THREE.MathUtils.lerp(0.9, 0.05, a), 0);
      chip.current.rotation.set(0.5, -0.4, 0.1);
      chip.current.visible = a > 0.02;
    }
    if (craft.current) {
      const a = THREE.MathUtils.smoothstep(p, 0.2, 0.55);
      craft.current.position.set(
        THREE.MathUtils.lerp(-3.2, -1.6, a),
        THREE.MathUtils.lerp(0.6, 0.1, a),
        THREE.MathUtils.lerp(-0.5, 0.2, a),
      );
      craft.current.rotation.set(0.2, 0.45, -0.15);
      craft.current.scale.setScalar(0.55 + a * 0.35);
      craft.current.visible = a > 0.04;
    }
    if (laptop.current) {
      const a = THREE.MathUtils.smoothstep(p, 0.45, 0.78);
      laptop.current.position.set(
        THREE.MathUtils.lerp(3, 1.5, a),
        THREE.MathUtils.lerp(-0.4, -0.35, a),
        THREE.MathUtils.lerp(-0.8, -0.2, a),
      );
      laptop.current.rotation.set(0.08, -0.45, 0);
      laptop.current.scale.setScalar(0.35 + a * 0.2);
      laptop.current.visible = a > 0.04;
    }
    if (phone.current) {
      const a = THREE.MathUtils.smoothstep(p, 0.65, 1);
      phone.current.position.set(
        THREE.MathUtils.lerp(0.2, 0.15, a),
        THREE.MathUtils.lerp(-1.3, -0.7, a),
        THREE.MathUtils.lerp(1.2, 0.85, a),
      );
      phone.current.rotation.set(0.15, -0.2, 0.08);
      phone.current.scale.setScalar(0.7 + a * 0.35);
      phone.current.visible = a > 0.04;
    }
  });

  if (!textures) return null;

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} color="#f8fafc" castShadow />
      <spotLight position={[-3, 4, 2]} intensity={1.5} angle={0.45} color="#a78bfa" />
      <pointLight position={[2, 0, 2]} intensity={0.8} color="#38bdf8" />
      <Environment resolution={128}>
        <Lightformer intensity={1.5} position={[0, 3, 1]} scale={[6, 2, 1]} />
        <Lightformer intensity={0.8} position={[-3, 0, -1]} scale={3} color="#7c6cf0" />
      </Environment>

      <group ref={root}>
        <group ref={chip}>
          <PhotorealChip textures={textures} />
        </group>
        <group ref={craft}>
          <PrecisionCraft textures={textures} />
        </group>
        <group ref={laptop}>
          <StudioLaptop textures={textures} accent="#3b82f6" />
        </group>
        <group ref={phone}>
          <StudioPhone textures={textures} />
        </group>
      </group>

      <ContactShadows position={[0, -1.5, 0]} opacity={0.5} scale={12} blur={2.4} far={4} />
    </>
  );
}
