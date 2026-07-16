"use client";

import { usePointerFieldContext } from "@/context/PointerFieldContext";
import type { HeroLayout } from "@/lib/heroLayout";
import { expSmooth } from "@/lib/smoothTilt";
import { ContactShadows, Environment, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/** jackbaeten — MacBook Pro M3 16" 2024 (CC BY, via Sketchfab / themockitship) */
const MACBOOK_MODEL = "/models/macbook-m3-16.glb";
const SCREEN_MATERIAL = "sfCQkHOWyrsLmor";
const HIDDEN_MATERIALS = new Set([
  "jwuTsnFxKtBUxpK",
  "fNHiBfcxHUJCahl",
  "ZCDwChwkbBfITSW",
]);
const STUDIO_HDRI = "/hdri/studio_small_09_1k.hdr";

const UI_W = 1280;
const UI_H = 832;

/** Soft specular glint on the screen — tracks pointer in UV space. */
const screenGlint = { x: 0.55, y: 0.42 };

useGLTF.preload(MACBOOK_MODEL);

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paintAppUI(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Arcform Overview dashboard — matches reference hero screen
  ctx.fillStyle = "#111214";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#0c0d10";
  ctx.fillRect(0, 0, 64, h);
  for (let i = 0; i < 6; i++) {
    const y = 70 + i * 52;
    const active = i === 0;
    if (active) {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      roundRect(ctx, 10, y - 16, 44, 36, 8);
      ctx.fill();
    }
    ctx.fillStyle = active ? "#f5f5f4" : "#6b7280";
    ctx.beginPath();
    ctx.arc(32, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#141518";
  ctx.fillRect(64, 0, w - 64, 56);
  ctx.fillStyle = "#f5f5f4";
  ctx.font = "600 15px system-ui,sans-serif";
  ctx.fillText("ARCFORM", 84, 34);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "12px system-ui,sans-serif";
  ctx.fillText("Overview", 180, 34);

  ctx.beginPath();
  ctx.fillStyle = "#3f3f46";
  ctx.arc(w - 160, 28, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "12px system-ui,sans-serif";
  ctx.fillText("Alex Morgan", w - 140, 26);
  ctx.fillStyle = "#71717a";
  ctx.font = "10px system-ui,sans-serif";
  ctx.fillText("Studio Director", w - 140, 40);

  const stats = [
    { l: "Active Projects", v: "24", d: "+2" },
    { l: "Tasks in Progress", v: String(34 + Math.floor((Math.sin(t) + 1) * 2)), d: "+5" },
    { l: "Hours Logged", v: "1,429", d: "+48" },
    { l: "Budget Utilization", v: "68%", d: "-2%" },
  ];
  stats.forEach((s, i) => {
    const x = 84 + i * 288;
    ctx.fillStyle = "#1a1b1f";
    roundRect(ctx, x, 76, 272, 88, 12);
    ctx.fill();
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px system-ui,sans-serif";
    ctx.fillText(s.l, x + 18, 100);
    ctx.fillStyle = "#f5f5f4";
    ctx.font = "600 28px system-ui,sans-serif";
    ctx.fillText(s.v, x + 18, 138);
    ctx.fillStyle = s.d.startsWith("-") ? "#f87171" : "#60a5fa";
    ctx.font = "11px system-ui,sans-serif";
    ctx.fillText(s.d, x + 210, 138);
  });

  ctx.fillStyle = "#1a1b1f";
  roundRect(ctx, 84, 184, 760, 280, 14);
  ctx.fill();
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "600 13px system-ui,sans-serif";
  ctx.fillText("Project Progress", 104, 212);
  ctx.strokeStyle = "#2a2d35";
  ctx.lineWidth = 1;
  for (let g = 0; g < 4; g++) {
    const y = 250 + g * 48;
    ctx.beginPath();
    ctx.moveTo(104, y);
    ctx.lineTo(820, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < 48; i++) {
    const x = 110 + i * 14.8;
    const y = 380 - Math.sin(i * 0.18 + t * 0.4) * 18 - i * 2.1 - Math.cos(i * 0.08) * 8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].forEach((m, i) => {
    ctx.fillStyle = "#6b7280";
    ctx.font = "10px system-ui,sans-serif";
    ctx.fillText(m, 120 + i * 100, 445);
  });

  ctx.fillStyle = "#1a1b1f";
  roundRect(ctx, 864, 184, 380, 280, 14);
  ctx.fill();
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "600 13px system-ui,sans-serif";
  ctx.fillText("Tasks by Status", 884, 212);
  const cx = 1054;
  const cy = 330;
  const segs = [
    { c: "#3b82f6", p: 0.42 },
    { c: "#6366f1", p: 0.28 },
    { c: "#eab308", p: 0.18 },
    { c: "#6b7280", p: 0.12 },
  ];
  let a0 = -Math.PI / 2;
  segs.forEach((s) => {
    const a1 = a0 + s.p * Math.PI * 2;
    ctx.beginPath();
    ctx.strokeStyle = s.c;
    ctx.lineWidth = 22;
    ctx.arc(cx, cy, 62, a0, a1);
    ctx.stroke();
    a0 = a1;
  });
  ctx.fillStyle = "#f5f5f4";
  ctx.font = "600 22px system-ui,sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("128", cx, cy + 4);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "10px system-ui,sans-serif";
  ctx.fillText("total", cx, cy + 20);
  ctx.textAlign = "left";
  [
    { l: "Completed", c: "#3b82f6" },
    { l: "In Progress", c: "#6366f1" },
    { l: "Review", c: "#eab308" },
    { l: "Backlog", c: "#6b7280" },
  ].forEach((L, i) => {
    const y = 250 + i * 28;
    ctx.fillStyle = L.c;
    ctx.beginPath();
    ctx.arc(1180, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d1d5db";
    ctx.font = "11px system-ui,sans-serif";
    ctx.fillText(L.l, 1194, y + 4);
  });

  ctx.fillStyle = "#1a1b1f";
  roundRect(ctx, 84, 484, 760, 320, 14);
  ctx.fill();
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "600 13px system-ui,sans-serif";
  ctx.fillText("Recent Activity", 104, 514);
  const rows = [
    "Maya Chen completed Brand system v2",
    "Deploy pipeline finished for portal.lumen",
    "Jonah Lee opened review on pricing UI",
    "Budget alert cleared for Q3 campaign",
    "New brief received — Harbor Logistics",
  ];
  const off = Math.floor(t * 0.55) % rows.length;
  rows.forEach((_, i) => {
    const line = rows[(off + i) % rows.length];
    const y = 550 + i * 46;
    ctx.beginPath();
    ctx.fillStyle = "#3f3f46";
    ctx.arc(118, y - 4, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "12px system-ui,sans-serif";
    ctx.fillText(line, 144, y);
    ctx.fillStyle = "#6b7280";
    ctx.font = "10px system-ui,sans-serif";
    ctx.fillText(`${i + 1}h ago`, 760, y);
  });

  ctx.fillStyle = "#1a1b1f";
  roundRect(ctx, 864, 484, 380, 320, 14);
  ctx.fill();
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "600 13px system-ui,sans-serif";
  ctx.fillText("Budget Overview", 884, 514);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "11px system-ui,sans-serif";
  ctx.fillText("Q3 remaining", 884, 560);
  ctx.fillStyle = "#f5f5f4";
  ctx.font = "600 32px system-ui,sans-serif";
  ctx.fillText("$128.4k", 884, 600);
  ctx.fillStyle = "#25262b";
  roundRect(ctx, 884, 630, 340, 12, 6);
  ctx.fill();
  const bp = 0.68 + Math.sin(t * 0.3) * 0.02;
  ctx.fillStyle = "#60a5fa";
  roundRect(ctx, 884, 630, 340 * bp, 12, 6);
  ctx.fill();
  ctx.fillStyle = "#9ca3af";
  ctx.font = "11px system-ui,sans-serif";
  ctx.fillText("Utilized", 884, 670);
  ctx.fillText("Reserved", 884, 710);
  ctx.fillText("Available", 884, 750);
  ctx.fillStyle = "#e5e7eb";
  ctx.fillText("68%", 1180, 670);
  ctx.fillText("19%", 1180, 710);
  ctx.fillText("13%", 1180, 750);

  // Warm specular reflection — follows mouse across the glass
  const gx = screenGlint.x * w;
  const gy = screenGlint.y * h;
  const glow = ctx.createRadialGradient(gx, gy, 4, gx, gy, Math.min(w, h) * 0.38);
  glow.addColorStop(0, "rgba(255, 255, 255, 0.28)");
  glow.addColorStop(0.25, "rgba(255, 236, 214, 0.12)");
  glow.addColorStop(0.55, "rgba(255, 220, 180, 0.04)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = prev;
}

function useLiveScreenTexture() {
  const { ctx, tex } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = UI_W;
    canvas.height = UI_H;
    const context = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.flipY = true;
    return { ctx: context, tex: texture };
  }, []);

  useEffect(() => () => tex.dispose(), [tex]);

  useFrame((state) => {
    paintAppUI(ctx, UI_W, UI_H, state.clock.elapsedTime);
    tex.needsUpdate = true;
  });

  return tex;
}

type ChassisMat = {
  mat: THREE.MeshStandardMaterial;
  baseRough: number;
  baseEnv: number;
};

function tuneMacMaterials(
  object: THREE.Object3D,
  screenTex: THREE.CanvasTexture,
  chassis: ChassisMat[],
) {
  chassis.length = 0;
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const mats = Array.isArray(child.material) ? child.material : [child.material];
    let changed = false;
    const next = mats.map((mat) => {
      if (!(mat instanceof THREE.MeshStandardMaterial)) return mat;

      if (mat.name === SCREEN_MATERIAL) {
        changed = true;
        return new THREE.MeshStandardMaterial({
          map: screenTex,
          // No emissiveMap — UI greens were blooming as a green halo
          emissive: new THREE.Color(0.08, 0.085, 0.09),
          emissiveIntensity: 0.35,
          roughness: 0.42,
          metalness: 0,
          toneMapped: true,
        });
      }

      if (HIDDEN_MATERIALS.has(mat.name)) {
        mat.visible = false;
        return mat;
      }

      // Photographed aluminum via HDRI
      mat.metalness = Math.max(mat.metalness, 0.78);
      mat.roughness = Math.min(Math.max(mat.roughness * 0.65, 0.22), 0.48);
      mat.envMapIntensity = 0.85;
      chassis.push({
        mat,
        baseRough: mat.roughness,
        baseEnv: mat.envMapIntensity,
      });

      return mat;
    });

    if (changed) {
      child.material = Array.isArray(child.material) ? next : next[0];
    }
  });
}

/** Desk-planted MacBook — pointer/gyro tilt like the earlier hero, base faces copy. */
function HeroLaptop({
  scrollProgress,
  layout,
}: {
  scrollProgress: number;
  layout: HeroLayout;
}) {
  const { scene: srcScene } = useGLTF(MACBOOK_MODEL);
  const scene = useMemo(() => srcScene.clone(true), [srcScene]);
  const group = useRef<THREE.Group>(null);
  const chassis = useRef<ChassisMat[]>([]);
  const motion = useRef({ rotY: 0, rotX: 0, posX: 0, posY: 0, posZ: 0, scale: 1 });
  const { input, isCoarse } = usePointerFieldContext();
  const screenTex = useLiveScreenTexture();

  useEffect(() => {
    tuneMacMaterials(scene, screenTex, chassis.current);
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    motion.current.rotY = layout.laptopRotY;
    motion.current.rotX = layout.laptopRotX;
    motion.current.posX = layout.focusX;
    motion.current.posY = layout.laptopBaseY;
    motion.current.posZ = layout.laptopBaseZ;
  }, [scene, screenTex, layout]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const px = input.current.x;
    const py = input.current.y;

    // Mild yaw; pitch adds forward tip toward viewer without big side lean
    const parallax = layout.mobile ? 0.22 : 0.14;
    const pitch = layout.mobile ? 0.18 : 0.1;
    const follow = isCoarse ? 52 : 18;
    const breathe = Math.sin(t * 0.7) * 0.003;
    const pop = Math.max(0, -py) * (layout.mobile ? 0.03 : 0.02);
    const slideX = layout.mobile ? 0.04 : 0.03;
    const slideY = layout.mobile ? 0.025 : 0;

    const targetRotY = layout.laptopRotY + px * parallax;
    // Keep forward bias; damp side-to-side. Clamp so base never rolls.
    const targetRotX = layout.laptopRotX + py * pitch;
    const targetPosX = layout.focusX + px * slideX;
    const targetPosY = layout.laptopBaseY + breathe + scrollProgress * 0.03 + py * slideY;
    const targetPosZ = layout.laptopBaseZ + pop;
    const targetScale = 1.02 + pop * 0.018;

    const m = motion.current;
    m.rotY = expSmooth(m.rotY, targetRotY, follow, dt);
    m.rotX = expSmooth(m.rotX, targetRotX, follow, dt);
    m.posX = expSmooth(m.posX, targetPosX, follow, dt);
    m.posY = expSmooth(m.posY, targetPosY, follow, dt);
    m.posZ = expSmooth(m.posZ, targetPosZ, follow, dt);
    m.scale = expSmooth(m.scale, targetScale, follow, dt);

    group.current.rotation.y = m.rotY;
    group.current.rotation.x = m.rotX;
    group.current.rotation.z = layout.laptopRotZ;
    group.current.position.set(m.posX, m.posY, m.posZ);
    group.current.scale.setScalar(m.scale);

    // Specular / roughness nudge toward cursor side
    const side = (px + 1) * 0.5;
    for (const entry of chassis.current) {
      entry.mat.roughness = expSmooth(
        entry.mat.roughness,
        entry.baseRough * (0.92 + side * 0.12),
        8,
        dt,
      );
      entry.mat.envMapIntensity = expSmooth(
        entry.mat.envMapIntensity,
        entry.baseEnv * (1.05 + Math.abs(px) * 0.22),
        8,
        dt,
      );
    }

    // Screen glass reflection tracks the mouse / gyro
    screenGlint.x = expSmooth(screenGlint.x, 0.5 + px * 0.38, 14, dt);
    screenGlint.y = expSmooth(screenGlint.y, 0.42 - py * 0.32, 14, dt);
  });

  return (
    <group
      ref={group}
      position={[layout.focusX, layout.laptopBaseY, layout.laptopBaseZ]}
      rotation={[layout.laptopRotX, layout.laptopRotY, layout.laptopRotZ]}
    >
      <primitive object={scene} scale={layout.laptopScale} position={[0, 0.02, 0]} />
    </group>
  );
}

function CursorKeyLight() {
  const light = useRef<THREE.SpotLight>(null);
  const { input } = usePointerFieldContext();
  // Front-left key so aluminum reads clean when the laptop faces the copy
  const pos = useRef(new THREE.Vector3(0.2, 2.35, 2.4));

  useFrame((_, delta) => {
    if (!light.current) return;
    const dt = Math.min(delta, 0.05);
    const px = input.current.x;
    const py = input.current.y;
    const tx = 0.15 + px * 1.1;
    const ty = 2.2 - py * 0.7;
    const tz = 2.35 + px * 0.2;
    pos.current.x = expSmooth(pos.current.x, tx, 16, dt);
    pos.current.y = expSmooth(pos.current.y, ty, 16, dt);
    pos.current.z = expSmooth(pos.current.z, tz, 16, dt);
    light.current.position.copy(pos.current);
    light.current.intensity = 0.95 + Math.hypot(px, py) * 0.25;
  });

  return (
    <spotLight
      ref={light}
      position={[0.2, 2.35, 2.4]}
      angle={0.58}
      penumbra={0.92}
      intensity={0.95}
      color="#ffd8b0"
      castShadow
      distance={14}
    />
  );
}

function MatchCamera({
  scrollProgress,
  layout,
}: {
  scrollProgress: number;
  layout: HeroLayout;
}) {
  useFrame((state) => {
    const p = scrollProgress;
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.fov = THREE.MathUtils.lerp(cam.fov, layout.cameraFov, 0.08);
    cam.updateProjectionMatrix();

    cam.position.lerp(
      new THREE.Vector3(
        THREE.MathUtils.lerp(layout.cameraPosition[0], layout.cameraPosition[0] + 0.12, p),
        THREE.MathUtils.lerp(layout.cameraPosition[1], layout.cameraPosition[1] + 0.1, p),
        THREE.MathUtils.lerp(layout.cameraPosition[2], layout.cameraPosition[2] - 0.28, p),
      ),
      0.06,
    );
    cam.lookAt(layout.lookAtX, layout.lookAtY, 0);
  });
  return null;
}

export function LoungeScene({
  scrollProgress = 0,
  layout,
}: {
  scrollProgress?: number;
  layout: HeroLayout;
}) {
  return (
    <>
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#c8d4e4", "#0a0a0c", 0.28]} />
      <directionalLight position={[-2.2, 3.5, 1.5]} intensity={0.35} color="#e8eef6" />
      <pointLight position={[1.4, 0.8, 0.6]} intensity={0.18} color="#f0e6d8" />
      <CursorKeyLight />

      <MatchCamera scrollProgress={scrollProgress} layout={layout} />
      <HeroLaptop scrollProgress={scrollProgress} layout={layout} />

      <ContactShadows
        position={[layout.shadowX, layout.laptopBaseY - 0.18, 0.08]}
        opacity={0.72}
        scale={5.2}
        blur={2.8}
        far={4.2}
      />
      <Environment files={STUDIO_HDRI} environmentIntensity={0.55} />
    </>
  );
}
