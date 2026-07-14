"use client";

import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { AuroraBackdrop, GroundEmbers } from "./luxuryModels";

useGLTF.preload("/models/studio-pavilion.glb");

function PavilionModel() {
  const { scene } = useGLTF("/models/studio-pavilion.glb");
  const clone = useMemo(() => scene.clone(true), [scene]);

  useMemo(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [clone]);

  return <primitive object={clone} />;
}

/**
 * Immersive pavilion landscape — Blender GLB + atmospheric layers.
 */
export function ShowcaseScene({ progress }: { progress: number }) {
  const root = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!root.current) return;
    root.current.rotation.y = -0.3 + progress * 0.6;
    root.current.position.y = (1 - progress) * 0.15;
    const s = 0.85 + THREE.MathUtils.smoothstep(progress, 0, 0.5) * 0.25;
    root.current.scale.setScalar(s);
  });

  return (
    <>
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 7, 20]} />

      <ambientLight intensity={0.15} />
      <directionalLight position={[-2, 5, -3]} intensity={1.6} color="#22d3ee" />
      <directionalLight position={[5, 2, 2]} intensity={1.0} color="#fb7185" castShadow />
      <pointLight position={[2.5, 0.8, 1]} intensity={1.8} color="#f97316" distance={7} />
      <spotLight position={[0, 6, 2]} angle={0.5} intensity={1.1} color="#e2e8f0" />

      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 3, -4]} scale={[12, 4, 1]} color="#0891b2" />
        <Lightformer intensity={0.9} position={[4, 1, 2]} scale={3} color="#fb7185" />
      </Environment>

      <AuroraBackdrop />

      <group ref={root} position={[0, -0.9, 0]} scale={0.95}>
        <PavilionModel />
      </group>

      <GroundEmbers count={280} />

      <ContactShadows position={[0, -0.95, 0]} opacity={0.5} scale={18} blur={2.5} far={8} />
    </>
  );
}
