"use client";

import { ContactShadows, Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  BrowserWindow,
  CircuitBoard,
  LaptopDevice,
  PhoneDevice,
  SiliconDie,
  UiCardStack,
} from "./models";

/**
 * Scroll-scrubbed product assembly:
 * wireframe intent → silicon core → devices → live product UI.
 */
export function ShowcaseScene({ progress }: { progress: number }) {
  const root = useRef<THREE.Group>(null);
  const chip = useRef<THREE.Group>(null);
  const laptop = useRef<THREE.Group>(null);
  const phone = useRef<THREE.Group>(null);
  const browser = useRef<THREE.Group>(null);
  const cards = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = progress;
    if (root.current) {
      root.current.rotation.y = -0.4 + p * 0.65;
      root.current.position.y = (1 - p) * 0.2;
    }
    if (chip.current) {
      const a = THREE.MathUtils.smoothstep(p, 0, 0.28);
      chip.current.scale.setScalar(0.55 + a * 0.55);
      chip.current.position.y = THREE.MathUtils.lerp(0.8, 0, a);
      chip.current.visible = a > 0.02;
    }
    if (laptop.current) {
      const a = THREE.MathUtils.smoothstep(p, 0.18, 0.48);
      laptop.current.position.set(
        THREE.MathUtils.lerp(-3.2, -1.35, a),
        THREE.MathUtils.lerp(0.4, -0.55, a),
        THREE.MathUtils.lerp(-1, -0.35, a),
      );
      laptop.current.rotation.set(0.1, 0.35, 0);
      laptop.current.scale.setScalar(0.4 + a * 0.15);
      laptop.current.visible = a > 0.05;
    }
    if (phone.current) {
      const a = THREE.MathUtils.smoothstep(p, 0.35, 0.65);
      phone.current.position.set(
        THREE.MathUtils.lerp(3, 1.55, a),
        THREE.MathUtils.lerp(-0.2, 0.15, a),
        THREE.MathUtils.lerp(0.8, 0.45, a),
      );
      phone.current.rotation.set(0.12, -0.4, 0.08);
      phone.current.scale.setScalar(0.85 + a * 0.2);
      phone.current.visible = a > 0.05;
    }
    if (browser.current) {
      const a = THREE.MathUtils.smoothstep(p, 0.5, 0.82);
      browser.current.position.set(0.15, THREE.MathUtils.lerp(1.4, 0.85, a), -0.9);
      browser.current.rotation.set(0.08, -0.2, 0);
      browser.current.scale.setScalar(0.35 + a * 0.35);
      browser.current.visible = a > 0.05;
    }
    if (cards.current) {
      const a = THREE.MathUtils.smoothstep(p, 0.7, 1);
      cards.current.position.set(-0.2, THREE.MathUtils.lerp(-1.2, -0.05, a), 0.9);
      cards.current.scale.setScalar(0.45 + a * 0.35);
      cards.current.visible = a > 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 5, 3]} intensity={1.2} color="#eef2ff" />
      <pointLight position={[-3, 2, 2]} intensity={0.85} color="#7c6cf0" />
      <pointLight position={[2, 1, -1]} intensity={0.7} color="#14b8a6" />
      <Environment preset="city" environmentIntensity={0.3} />

      <group ref={root}>
        <group ref={chip} position={[0, 0, 0]} rotation={[0.5, -0.35, 0.1]}>
          <CircuitBoard width={1.8} depth={1.8} />
          <group position={[0, 0.08, 0]}>
            <SiliconDie scale={0.95} />
          </group>
        </group>

        <group ref={laptop}>
          <LaptopDevice accent="#14b8a6" />
        </group>

        <group ref={phone}>
          <PhoneDevice accent="#7c6cf0" />
        </group>

        <group ref={browser}>
          <BrowserWindow accent="#3b82f6" />
        </group>

        <group ref={cards}>
          <UiCardStack accent="#3b82f6" />
        </group>
      </group>

      <ContactShadows position={[0, -1.4, 0]} opacity={0.4} scale={10} blur={2.2} far={4} />
    </>
  );
}
