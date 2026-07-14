"use client";

import {
  ContactShadows,
  Environment,
  Float,
  useGLTF,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

useGLTF.preload("/models/arcform-lounge.glb");
useGLTF.preload("/models/armchair/ArmChair_01_1k.gltf");

function MouseParallax({
  children,
  strength = 0.22,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const tx = state.pointer.x * strength;
    const ty = state.pointer.y * (strength * 0.4);
    group.current.rotation.y += (tx - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (-ty - group.current.rotation.x) * 0.05;
    group.current.position.x += (state.pointer.x * 0.12 - group.current.position.x) * 0.04;
    group.current.position.y += (state.pointer.y * 0.06 - group.current.position.y) * 0.04;
  });
  return <group ref={group}>{children}</group>;
}

function ScrollCamera({ progress }: { progress: number }) {
  useFrame((state) => {
    const p = progress;
    state.camera.position.z = THREE.MathUtils.lerp(4.2, 3.35, p);
    state.camera.position.y = THREE.MathUtils.lerp(0.4, 0.65, p);
    state.camera.position.x = THREE.MathUtils.lerp(0.15, 0.55, p);
    state.camera.lookAt(0.4, 0.35, -0.4);
  });
  return null;
}

function AnimatedScreens({ root }: { root: THREE.Object3D }) {
  const canvases = useRef<{ mesh: THREE.Mesh; ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture; phase: number }[]>([]);

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
      tex.anisotropy = 4;
      mesh.material = new THREE.MeshStandardMaterial({
        map: tex,
        emissiveMap: tex,
        emissive: new THREE.Color("#5eead4"),
        emissiveIntensity: 1.35,
        roughness: 0.35,
        metalness: 0.2,
        toneMapped: false,
      });
      entries.push({ mesh, ctx, tex, phase: Math.random() * Math.PI * 2 });
    });
    canvases.current = entries;
    return () => {
      entries.forEach((e) => {
        e.tex.dispose();
        (e.mesh.material as THREE.Material).dispose();
      });
    };
  }, [root]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (const entry of canvases.current) {
      const { ctx, tex, phase } = entry;
      const w = 512;
      const h = 768;
      ctx.fillStyle = "rgba(4,12,16,0.92)";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(45,212,191,0.25)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // waveform
      ctx.strokeStyle = "rgba(94,234,212,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y =
          180 +
          Math.sin(x * 0.035 + t * 2.4 + phase) * 28 +
          Math.sin(x * 0.01 + t * 1.1) * 12;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(56,189,248,0.55)";
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = 260 + Math.sin(x * 0.05 - t * 3 + phase) * 18;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // bars
      for (let i = 0; i < 12; i++) {
        const bh = 30 + Math.abs(Math.sin(t * 2.2 + i * 0.55 + phase)) * 110;
        ctx.fillStyle = `rgba(45,212,191,${0.45 + (i % 3) * 0.15})`;
        ctx.fillRect(48 + i * 34, 560 - bh, 18, bh);
      }

      // scrolling log
      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(153,246,228,0.85)";
      const lines = [
        "ARC · telemetry sync",
        "latency 12ms · ok",
        "inference · batch",
        "render · 60fps",
        "vector · stable",
        "edge cache · warm",
      ];
      const offset = Math.floor(t * 1.6 + phase * 3) % lines.length;
      for (let i = 0; i < 8; i++) {
        const line = lines[(offset + i) % lines.length];
        ctx.fillText(`0${(i % 8) + 1}  ${line}`, 36, 340 + i * 18);
      }

      // scan
      const scanY = ((t * 120 + phase * 40) % h);
      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      grad.addColorStop(0, "rgba(45,212,191,0)");
      grad.addColorStop(0.5, "rgba(45,212,191,0.28)");
      grad.addColorStop(1, "rgba(45,212,191,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 20, w, 40);

      // brackets
      ctx.strokeStyle = "rgba(94,234,212,0.9)";
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, w - 20, h - 20);

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
    <group position={[0.1, -0.95, 0.2]} scale={1.05}>
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
        const m = c as THREE.Mesh;
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
  }, [clone]);
  return (
    <primitive
      object={clone}
      scale={1.28}
      position={[0.55, -0.95, 0.55]}
      rotation={[0, -0.65, 0]}
    />
  );
}

export function LoungeScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <>
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 6, 16]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[-3, 5, 4]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[2.2, 2.4, 1]} intensity={1.1} color="#5eead4" distance={8} />
      <pointLight position={[-2.5, 1.5, 2]} intensity={0.7} color="#fbbf24" distance={7} />

      <ScrollCamera progress={scrollProgress} />

      <MouseParallax>
        <Float speed={0.6} rotationIntensity={0.04} floatIntensity={0.08}>
          <LoungeModel />
          <ArmChair />
        </Float>
      </MouseParallax>

      <ContactShadows
        position={[0, -0.94, 0]}
        opacity={0.55}
        scale={12}
        blur={2.6}
        far={6}
      />
      <Environment preset="city" environmentIntensity={0.4} />

      <EffectComposer multisampling={0}>
        <SMAA />
        <Bloom intensity={0.55} luminanceThreshold={0.55} mipmapBlur />
        <Vignette offset={0.25} darkness={0.55} />
      </EffectComposer>
    </>
  );
}
