"use client";

import { ContactShadows, Environment, Float, Lightformer, Stars, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

useGLTF.preload("/models/studio-hero.glb");

function MouseParallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const tx = state.pointer.x * 0.2;
    const ty = state.pointer.y * 0.08;
    group.current.rotation.y += (tx - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (-ty - group.current.rotation.x) * 0.04;
  });
  return <group ref={group}>{children}</group>;
}

function StudioHeroModel({ reduced }: { reduced: boolean }) {
  const { scene } = useGLTF("/models/studio-hero.glb");
  const clone = useMemo(() => scene.clone(true), [scene]);

  // Enable shadows on meshes
  useMemo(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Hide heavy floor disc on mobile for clarity
        if (reduced && mesh.name.toLowerCase().includes("floor")) {
          mesh.visible = false;
        }
      }
    });
  }, [clone, reduced]);

  return <primitive object={clone} />;
}

/**
 * Luxury design studio hero — Blender-authored GLB.
 * Glass desk, dual monitors, floating boards, sculptural orb, lamp.
 */
export function HeroScene({ reduced = false }: { reduced?: boolean }) {
  return (
    <>
      <color attach="background" args={["#07070a"]} />
      <fog attach="fog" args={["#07070a", 7, 18]} />

      <ambientLight intensity={0.25} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.5}
        color="#f8fafc"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.7} color="#93c5fd" />
      <spotLight
        position={[0, 5, 2]}
        angle={0.45}
        penumbra={0.65}
        intensity={1.4}
        color="#e2e8f0"
      />
      <pointLight position={[1.5, 1.2, 0.5]} intensity={1.2} color="#67e8f9" distance={5} />
      <pointLight position={[-1.5, 1.4, 0.3]} intensity={0.9} color="#a78bfa" distance={4} />

      <Environment resolution={256}>
        <Lightformer intensity={1.8} position={[0, 4, 1]} scale={[8, 2, 1]} color="#e2e8f0" />
        <Lightformer intensity={1.2} position={[-3, 1, 2]} scale={3} color="#7c6cf0" />
        <Lightformer intensity={1} position={[3, 0, -1]} scale={3} color="#14b8a6" />
      </Environment>

      {!reduced && (
        <Stars radius={50} depth={28} count={800} factor={2.5} saturation={0} fade speed={0.3} />
      )}

      <MouseParallax>
        <Float speed={0.7} rotationIntensity={0.05} floatIntensity={0.12}>
          <group position={[0.55, -0.95, 0]} rotation={[0.05, -0.45, 0]} scale={1.15}>
            <StudioHeroModel reduced={reduced} />
          </group>
        </Float>
      </MouseParallax>

      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.55}
        scale={14}
        blur={2.8}
        far={5}
        color="#000000"
      />
    </>
  );
}
