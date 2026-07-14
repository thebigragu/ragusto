"use client";

import { ContactShadows, Environment, Float, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

useGLTF.preload("/models/armchair/ArmChair_01_1k.gltf");

function LiveHoloPanel({
  position,
  rotation,
  scale = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 768;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useEffect(() => () => tex.dispose(), [tex]);

  useFrame((state) => {
    const ctx = (tex.image as HTMLCanvasElement).getContext("2d");
    if (!ctx) return;
    const t = state.clock.elapsedTime;
    const w = 512;
    const h = 768;
    ctx.fillStyle = "rgba(4,16,20,0.85)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(45,212,191,0.45)";
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.strokeStyle = "#5eead4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = 200 + Math.sin(x * 0.04 + t * 2.6) * 36;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let i = 0; i < 10; i++) {
      const bh = 24 + Math.abs(Math.sin(t * 2 + i * 0.5)) * 100;
      ctx.fillStyle = "#2dd4bf";
      ctx.fillRect(60 + i * 38, 580 - bh, 20, bh);
    }
    ctx.fillStyle = "#99f6e4";
    ctx.font = "14px monospace";
    const lines = ["ARC live", "12ms", "batch ok", "60fps"];
    for (let i = 0; i < 5; i++) {
      ctx.fillText(lines[i % lines.length], 48, 360 + i * 22);
    }
    const scan = (t * 160) % h;
    ctx.fillStyle = "rgba(45,212,191,0.22)";
    ctx.fillRect(0, scan, w, 16);
    tex.needsUpdate = true;

    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.04;
    }
  });

  return (
    <Float speed={1.2} floatIntensity={0.25} rotationIntensity={0.15}>
      <mesh ref={mesh} position={position} rotation={rotation} scale={scale}>
        <planeGeometry args={[0.55, 0.82]} />
        <meshStandardMaterial
          map={tex}
          emissiveMap={tex}
          emissive="#5eead4"
          emissiveIntensity={1.4}
          transparent
          opacity={0.92}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

/** Interactive PBR armchair — hero centerpiece */
function HeroChair({ scrollProgress }: { scrollProgress: number }) {
  const { scene } = useGLTF("/models/armchair/ArmChair_01_1k.gltf");
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const clone = useMemo(() => scene.clone(true), [scene]);

  useMemo(() => {
    clone.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        const m = c as THREE.Mesh;
        m.castShadow = true;
        m.receiveShadow = true;
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

    const targetY = -0.35 + px * 0.55 + Math.sin(t * 0.4) * 0.05;
    const targetX = py * 0.08;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.07;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.07;

    const baseY = -0.85 + scrollProgress * 0.1;
    const floatY = Math.sin(t * 1.1) * 0.04;
    group.current.position.set(1.15 + px * 0.1, baseY + floatY, 0.2);
  });

  return (
    <group ref={group} position={[1.15, -0.85, 0.2]}>
      <primitive object={clone} scale={1.85} rotation={[0, -0.5, 0]} />
    </group>
  );
}

function HeroCamera({ scrollProgress }: { scrollProgress: number }) {
  useFrame((state) => {
    const p = scrollProgress;
    state.camera.position.lerp(
      new THREE.Vector3(
        THREE.MathUtils.lerp(0.35, 0.7, p),
        THREE.MathUtils.lerp(0.55, 0.75, p),
        THREE.MathUtils.lerp(3.8, 3.2, p),
      ),
      0.07,
    );
    state.camera.lookAt(0.9, 0.15, 0);
  });
  return null;
}

/**
 * Transparent WebGL layer — chair + holos only.
 * No opaque background / EffectComposer (those wiped the hero photo).
 */
export function LoungeScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 5, 3]} intensity={1.8} castShadow />
      <directionalLight position={[-3, 2, 2]} intensity={0.7} color="#b8c8ff" />
      <pointLight position={[1.5, 1.5, 2]} intensity={1.2} color="#fff4e6" />
      <pointLight position={[2.2, 1.2, -0.5]} intensity={0.9} color="#5eead4" />
      <hemisphereLight args={["#e8eef8", "#1a1a1c", 0.55]} />

      <HeroCamera scrollProgress={scrollProgress} />
      <HeroChair scrollProgress={scrollProgress} />

      <LiveHoloPanel position={[2.05, 0.55, -0.35]} rotation={[0, -0.45, 0.05]} scale={1.05} />
      <LiveHoloPanel position={[2.55, 0.35, 0.15]} rotation={[0, -0.75, -0.04]} scale={0.9} />
      <LiveHoloPanel position={[1.7, 0.75, -0.7]} rotation={[0, -0.2, 0.08]} scale={0.85} />

      <ContactShadows
        position={[1.15, -0.95, 0.2]}
        opacity={0.65}
        scale={4}
        blur={2.4}
        far={5}
      />
      <Environment preset="apartment" environmentIntensity={0.75} />
    </>
  );
}
