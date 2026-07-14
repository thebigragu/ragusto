"use client";

import { ContactShadows, Environment, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

useGLTF.preload("/models/hero-chair.glb");

/**
 * The chair from the hero still — matching black leather wingback on chrome star base.
 * "Pops" out of the flat image: lifts toward camera, swivels with the mouse.
 */
function PopChair({ scrollProgress }: { scrollProgress: number }) {
  const { scene } = useGLTF("/models/hero-chair.glb");
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const clone = useMemo(() => scene.clone(true), [scene]);

  useMemo(() => {
    clone.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        const m = c as THREE.Mesh;
        m.castShadow = true;
        m.receiveShadow = true;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat?.isMeshStandardMaterial) {
          mat.envMapIntensity = 1.15;
          if (mat.metalness > 0.5) {
            mat.roughness = Math.min(mat.roughness ?? 0.15, 0.18);
          }
        }
      }
    });
  }, [clone]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const px = pointer.current.x;
    const py = pointer.current.y;

    // Rest pose matches photo: right of center, angled toward the window
    const restY = -0.55;
    const hoverY = restY + px * 0.35 + Math.sin(t * 0.45) * 0.03;
    group.current.rotation.y += (hoverY - group.current.rotation.y) * 0.06;
    group.current.rotation.x += (py * 0.05 - group.current.rotation.x) * 0.06;

    // Pop depth: sits in the image plane, lifts toward camera on interaction + scroll
    const pop = 0.08 + Math.abs(px) * 0.18 + scrollProgress * 0.22;
    const breathe = Math.sin(t * 0.9) * 0.015;
    const targetZ = pop + breathe;
    const targetY = -0.95 + scrollProgress * 0.06 + Math.sin(t * 0.7) * 0.02;
    const targetX = 0.95 + px * 0.06;

    group.current.position.x += (targetX - group.current.position.x) * 0.08;
    group.current.position.y += (targetY - group.current.position.y) * 0.08;
    group.current.position.z += (targetZ - group.current.position.z) * 0.08;

    // Subtle scale pulse so it reads as lifting off the plate
    const s = 1.55 + pop * 0.08;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, s, 0.08));
  });

  return (
    <group ref={group} position={[0.95, -0.95, 0.08]} rotation={[0, -0.55, 0]}>
      <primitive object={clone} />
    </group>
  );
}

function MatchCamera({ scrollProgress }: { scrollProgress: number }) {
  useFrame((state) => {
    const p = scrollProgress;
    // Camera framed like the hero still — look into the lounge from slightly left
    state.camera.position.lerp(
      new THREE.Vector3(
        THREE.MathUtils.lerp(0.05, 0.25, p),
        THREE.MathUtils.lerp(0.35, 0.5, p),
        THREE.MathUtils.lerp(3.4, 2.95, p),
      ),
      0.06,
    );
    state.camera.lookAt(0.85, 0.05, 0);
  });
  return null;
}

/**
 * Transparent WebGL layer: only the popping chair.
 * Room, table, city, and holographic screens stay in the photoreal plate.
 */
export function LoungeScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <>
      {/* Lighting matched to the still: warm wall wash + cool holo fill */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[-2.5, 3.5, 2]} intensity={0.55} color="#c8d4e8" />
      <spotLight
        position={[2.2, 1.8, 1.5]}
        angle={0.55}
        penumbra={0.7}
        intensity={3.2}
        color="#ffb56b"
        castShadow
        distance={8}
      />
      <pointLight position={[1.8, 1.2, -0.4]} intensity={0.85} color="#5eead4" distance={5} />
      <pointLight position={[-1.5, 1.0, 1.5]} intensity={0.4} color="#f5f0e8" distance={6} />
      <hemisphereLight args={["#9aabbc", "#0a0a0c", 0.35]} />

      <MatchCamera scrollProgress={scrollProgress} />
      <PopChair scrollProgress={scrollProgress} />

      <ContactShadows
        position={[0.95, -0.98, 0.1]}
        opacity={0.7}
        scale={3.2}
        blur={2.6}
        far={3.5}
        color="#000000"
      />
      <Environment preset="apartment" environmentIntensity={0.55} />
    </>
  );
}
