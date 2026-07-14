"use client";

import {
  ContactShadows,
  Environment,
  Float,
  useGLTF,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

useGLTF.preload("/models/arcform-lounge.glb");
useGLTF.preload("/models/armchair/ArmChair_01_1k.gltf");

function MouseParallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    if (!group.current) return;
    const tx = target.current.x * 0.2;
    const ty = target.current.y * 0.08;
    group.current.rotation.y += (tx - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (-ty - group.current.rotation.x) * 0.05;
  });

  return <group ref={group}>{children}</group>;
}

function ScrollCamera({ progress }: { progress: number }) {
  useFrame((state) => {
    const p = progress;
    state.camera.position.lerp(
      new THREE.Vector3(
        THREE.MathUtils.lerp(0.2, 0.7, p),
        THREE.MathUtils.lerp(1.1, 1.35, p),
        THREE.MathUtils.lerp(5.2, 4.2, p),
      ),
      0.08,
    );
    state.camera.lookAt(0.6, 0.7, 0);
  });
  return null;
}

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
    return () => {
      entries.forEach((e) => e.tex.dispose());
    };
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
      const lines = ["ARC sync", "12ms ok", "batch 04", "60fps", "cache warm", "auth live"];
      const offset = Math.floor(t * 1.8 + phase) % lines.length;
      for (let i = 0; i < 7; i++) {
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

function LoungeModel() {
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
    <group position={[0, -0.15, 0]} scale={1.15}>
      <primitive object={clone} />
      <AnimatedScreens root={clone} />
    </group>
  );
}

function ArmChair() {
  const { scene } = useGLTF("/models/armchair/ArmChair_01_1k.gltf");
  const clone = useMemo(() => scene.clone(true), [scene]);
  useMemo(() => {
    clone.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        (c as THREE.Mesh).castShadow = true;
        (c as THREE.Mesh).receiveShadow = true;
      }
    });
  }, [clone]);
  return (
    <primitive
      object={clone}
      scale={1.35}
      position={[0.7, -0.15, 0.7]}
      rotation={[0, -0.7, 0]}
    />
  );
}

export function LoungeScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[-2.5, 6, 4]} intensity={1.6} castShadow />
      <pointLight position={[2, 2.5, 1.5]} intensity={1.4} color="#5eead4" distance={10} />
      <pointLight position={[-2, 1.8, 2]} intensity={0.9} color="#fbbf24" distance={8} />
      <hemisphereLight args={["#b8c4d4", "#1a1a1c", 0.45]} />

      <ScrollCamera progress={scrollProgress} />

      <MouseParallax>
        <Float speed={0.5} rotationIntensity={0.03} floatIntensity={0.06}>
          <LoungeModel />
          <ArmChair />
        </Float>
      </MouseParallax>

      <ContactShadows position={[0, -0.14, 0]} opacity={0.45} scale={14} blur={2.5} far={8} />
      <Environment preset="apartment" environmentIntensity={0.55} />
    </>
  );
}
