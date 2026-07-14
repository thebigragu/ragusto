"use client";

import { ContactShadows, Environment, useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer, SMAA, Vignette } from "@react-three/postprocessing";
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

      <ambientLight intensity={0.12} />
      <directionalLight position={[-2, 5, -3]} intensity={1.4} color="#22d3ee" />
      <directionalLight position={[5, 2, 2]} intensity={1.0} color="#fb7185" castShadow />
      <pointLight position={[2.5, 0.8, 1]} intensity={1.6} color="#f97316" distance={7} />

      <Environment files="/hdri/studio_small_09_1k.hdr" environmentIntensity={0.35} />
      <AuroraBackdrop />

      <group ref={root} position={[0, -0.9, 0]} scale={0.95}>
        <PavilionModel />
      </group>

      <GroundEmbers count={280} />
      <ContactShadows position={[0, -0.95, 0]} opacity={0.5} scale={18} blur={2.5} far={8} />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.45} intensity={0.7} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
        <SMAA />
      </EffectComposer>
    </>
  );
}
