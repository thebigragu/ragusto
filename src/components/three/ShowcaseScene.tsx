"use client";

import {
  ContactShadows,
  Environment,
  Float,
  RoundedBox,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Assembly({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.15 + progress * Math.PI * 0.35;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
  });

  const spread = 0.15 + progress * 0.55;

  return (
    <group ref={group}>
      <Float speed={1.1} floatIntensity={0.2} rotationIntensity={0.15}>
        <RoundedBox args={[1.4, 0.08, 0.9]} radius={0.02} position={[0, -0.2, 0]}>
          <meshPhysicalMaterial color="#12131a" metalness={0.7} roughness={0.25} clearcoat={0.5} />
        </RoundedBox>
        {[
          [-0.35, 0.15, 0],
          [0.15, 0.35, 0.1],
          [0.4, 0.1, -0.15],
        ].map((base, i) => (
          <mesh
            key={i}
            position={[base[0] * (1 + spread), base[1] + spread * 0.4, base[2]]}
            rotation={[0.1 * i, 0.2 * i, 0]}
          >
            <planeGeometry args={[0.45, 0.65]} />
            <meshStandardMaterial
              color={i === 0 ? "#5eead4" : i === 1 ? "#60a5fa" : "#a78bfa"}
              emissive={i === 0 ? "#5eead4" : i === 1 ? "#60a5fa" : "#a78bfa"}
              emissiveIntensity={0.8}
              toneMapped={false}
              transparent
              opacity={0.85}
            />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

export function ShowcaseScene({ progress = 0 }: { progress?: number }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} />
      <pointLight position={[-2, 2, 2]} intensity={0.6} color="#5eead4" />
      <Assembly progress={progress} />
      <ContactShadows position={[0, -0.85, 0]} opacity={0.45} scale={8} blur={2.4} />
      <Environment preset="city" environmentIntensity={0.35} />
    </>
  );
}
