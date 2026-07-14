"use client";

import {
  ContactShadows,
  Environment,
  Float,
  useGLTF,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

useGLTF.preload("/models/arcform-lounge.glb");
useGLTF.preload("/models/armchair/ArmChair_01_1k.gltf");

function AnimatedScreens({ root }: { root: THREE.Object3D }) {
  const canvases = useRef<
    { ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture; phase: number }[]
  >([]);

  useEffect(() => {
    const entries: typeof canvases.current = [];
    root.traverse((obj) => {
      if (!obj.name.startsWith("Screen_") || obj.name.includes("Frame")) return;
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 768;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      mesh.material = new THREE.MeshStandardMaterial({
        map: tex,
        emissiveMap: tex,
        emissive: new THREE.Color("#5eead4"),
        emissiveIntensity: 1.6,
        roughness: 0.3,
        metalness: 0.15,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
      entries.push({ ctx, tex, phase: Math.random() * Math.PI * 2 });
    });
    canvases.current = entries;
    return () => entries.forEach((e) => e.tex.dispose());
  }, [root]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (const { ctx, tex, phase } of canvases.current) {
      const w = 512;
      const h = 768;
      ctx.fillStyle = "#041016";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(45,212,191,0.3)";
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.strokeStyle = "#5eead4";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = 170 + Math.sin(x * 0.035 + t * 2.5 + phase) * 30;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const bh = 30 + Math.abs(Math.sin(t * 2.2 + i * 0.55 + phase)) * 110;
        ctx.fillStyle = "#2dd4bf";
        ctx.fillRect(48 + i * 34, 560 - bh, 18, bh);
      }
      ctx.fillStyle = "#99f6e4";
      ctx.font = "13px monospace";
      const lines = ["ARC sync", "12ms ok", "batch 04", "60fps"];
      const offset = Math.floor(t * 1.8 + phase) % lines.length;
      for (let i = 0; i < 6; i++) {
        ctx.fillText(`0${i + 1}  ${lines[(offset + i) % lines.length]}`, 36, 320 + i * 20);
      }
      const scanY = (t * 140 + phase * 50) % h;
      ctx.fillStyle = "rgba(45,212,191,0.25)";
      ctx.fillRect(0, scanY, w, 18);
      tex.needsUpdate = true;
    }
  });

  return null;
}

function LoungeRoom() {
  const { scene } = useGLTF("/models/arcform-lounge.glb");
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

  return (
    <group position={[-0.4, -0.15, -0.3]} scale={1.1}>
      <primitive object={clone} />
      <AnimatedScreens root={clone} />
    </group>
  );
}

/** Hero centerpiece — PBR armchair with mouse + scroll motion */
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

    // Swivel toward cursor + gentle idle drift
    const targetY = -0.55 + px * 0.45 + Math.sin(t * 0.35) * 0.04;
    const targetX = py * 0.06 + Math.sin(t * 0.5) * 0.02;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.06;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.06;

    // Subtle hover + scroll lift
    const baseY = -0.22 + scrollProgress * 0.08;
    const floatY = Math.sin(t * 0.9) * 0.035;
    group.current.position.set(
      1.05 + px * 0.08,
      baseY + floatY,
      0.15 + scrollProgress * -0.12,
    );
  });

  return (
    <group ref={group} position={[1.05, -0.22, 0.15]}>
      <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.35}>
        <primitive object={clone} scale={1.55} rotation={[0, -0.55, 0]} />
      </Float>
      <spotLight
        position={[1.5, 2.2, 1.8]}
        angle={0.45}
        penumbra={0.6}
        intensity={2.2}
        color="#fff8f0"
        castShadow
      />
    </group>
  );
}

function HeroCamera({ scrollProgress }: { scrollProgress: number }) {
  useFrame((state) => {
    const p = scrollProgress;
    state.camera.position.lerp(
      new THREE.Vector3(
        THREE.MathUtils.lerp(0.1, 0.45, p),
        THREE.MathUtils.lerp(0.95, 1.15, p),
        THREE.MathUtils.lerp(4.8, 4.0, p),
      ),
      0.06,
    );
    state.camera.lookAt(0.85, 0.45, 0);
  });
  return null;
}

export function LoungeScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <>
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 8, 18]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[-3, 5, 3]} intensity={1.4} castShadow />
      <pointLight position={[-2.5, 1.5, 2]} intensity={0.85} color="#fbbf24" distance={9} />
      <pointLight position={[2.5, 2, 1]} intensity={0.7} color="#5eead4" distance={8} />
      <hemisphereLight args={["#c8d4e8", "#0a0a0c", 0.35]} />

      <HeroCamera scrollProgress={scrollProgress} />
      <LoungeRoom />
      <HeroChair scrollProgress={scrollProgress} />

      <ContactShadows
        position={[0.9, -0.38, 0.1]}
        opacity={0.55}
        scale={3.5}
        blur={2.2}
        far={4}
      />
      <Environment preset="apartment" environmentIntensity={0.6} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.4} luminanceThreshold={0.6} mipmapBlur />
        <Vignette offset={0.2} darkness={0.45} />
      </EffectComposer>
    </>
  );
}
