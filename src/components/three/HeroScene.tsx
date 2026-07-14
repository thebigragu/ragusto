"use client";

import { ContactShadows, Environment, Float, Lightformer, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  LaunchRocket,
  LaunchSmoke,
  LuxuryLaptop,
  useLuxuryTextures,
} from "./luxuryModels";

function MouseParallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const tx = state.pointer.x * 0.18;
    const ty = state.pointer.y * 0.08;
    group.current.rotation.y += (tx - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (-ty - group.current.rotation.x) * 0.04;
  });
  return <group ref={group}>{children}</group>;
}

function AnimatedLaunch({
  textures,
  reduced,
}: {
  textures: NonNullable<ReturnType<typeof useLuxuryTextures>>;
  reduced: boolean;
}) {
  const rocket = useRef<THREE.Group>(null);
  const smoke = useRef<THREE.Group>(null);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    tRef.current = (tRef.current + delta * 0.14) % 1;
    const t = tRef.current;
    const launch = t < 0.75 ? t / 0.75 : 1 - ((t - 0.75) / 0.25) * 0.3;
    if (rocket.current) {
      rocket.current.position.y = 0.9 + launch * 1.6;
      rocket.current.rotation.z = Math.sin(t * Math.PI * 2) * 0.02;
    }
    if (smoke.current) {
      smoke.current.scale.setScalar(0.85 + launch * 0.45);
    }
  });

  return (
    <>
      <group ref={rocket}>
        <LaunchRocket textures={textures} launch={0} />
      </group>
      {!reduced && (
        <group ref={smoke}>
          <LaunchSmoke textures={textures} intensity={1} />
        </group>
      )}
    </>
  );
}

/**
 * Luxury AI agency hero — product launch metaphor.
 * Quality bar: Galvanite rocket-from-laptop cinematic (original Arcform sculpture).
 */
export function HeroScene({ reduced = false }: { reduced?: boolean }) {
  const textures = useLuxuryTextures();
  if (!textures) return null;

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 8, 20]} />

      <ambientLight intensity={0.15} />
      <directionalLight
        position={[-4, 5, 3]}
        intensity={0.9}
        color="#93c5fd"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[5, 3, 2]} intensity={1.4} color="#fdba74" />
      <spotLight
        position={[0, 4, 2]}
        angle={0.5}
        penumbra={0.6}
        intensity={1.2}
        color="#e2e8f0"
      />

      <Environment resolution={256}>
        <Lightformer intensity={1.5} position={[0, 5, -2]} scale={[10, 2, 1]} color="#1e3a5f" />
        <Lightformer intensity={2} position={[4, 1, 2]} scale={4} color="#fb923c" />
        <Lightformer intensity={1.2} position={[-4, 2, 1]} scale={3} color="#38bdf8" />
      </Environment>

      {!reduced && (
        <Stars radius={40} depth={30} count={1000} factor={3} saturation={0} fade speed={0.4} />
      )}

      <MouseParallax>
        <Float speed={0.8} rotationIntensity={0.06} floatIntensity={0.12}>
          <group position={[0.9, -0.85, 0]} rotation={[0.08, -0.35, 0]} scale={1.05}>
            <LuxuryLaptop textures={textures} />
            <AnimatedLaunch textures={textures} reduced={reduced} />
          </group>
        </Float>
      </MouseParallax>

      <ContactShadows
        position={[0, -1.55, 0]}
        opacity={0.65}
        scale={16}
        blur={3}
        far={6}
        color="#020617"
      />
    </>
  );
}
