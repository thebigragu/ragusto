"use client";

import { useTiltInputContext } from "@/context/TiltInputContext";
import type { HeroLayout } from "@/lib/heroLayout";
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

const UI_W = 1280;
const UI_H = 832;

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

function paintRightRail(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const rx = 918;
  const rw = w - rx - 16;

  ctx.fillStyle = "#0c0e14";
  ctx.fillRect(rx, 44, rw, h - 44);
  ctx.strokeStyle = "#1a1e28";
  ctx.beginPath();
  ctx.moveTo(rx, 52);
  ctx.lineTo(rx, h - 10);
  ctx.stroke();

  ctx.fillStyle = "#9ca3af";
  ctx.font = "600 11px system-ui,sans-serif";
  ctx.fillText("FLEET CONTEXT", rx + 14, 72);

  // Health ring
  const cx = rx + rw * 0.5;
  const cy = 128;
  const score = 94 + Math.floor(Math.sin(t * 0.7) * 2);
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#3b82f6";
  ctx.beginPath();
  ctx.arc(cx, cy, 34, -Math.PI / 2, -Math.PI / 2 + (score / 100) * Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#f9fafb";
  ctx.font = "700 22px system-ui,sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${score}%`, cx, cy + 8);
  ctx.textAlign = "left";
  ctx.fillStyle = "#9ca3af";
  ctx.font = "11px system-ui,sans-serif";
  ctx.fillText("Fleet health", rx + 14, 178);

  // Active agents
  ctx.fillStyle = "#141821";
  roundRect(ctx, rx + 10, 192, rw - 20, 118, 10);
  ctx.fill();
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "600 12px system-ui,sans-serif";
  ctx.fillText("Active agents", rx + 22, 214);
  const agents = [
    { n: "Triage · Northwind", s: "running", c: "#34d399" },
    { n: "Indexer · RAG", s: "syncing", c: "#60a5fa" },
    { n: "Deploy · portal", s: "idle", c: "#9ca3af" },
    { n: "Escalation · Harbor", s: "alert", c: "#fbbf24" },
  ];
  agents.forEach((a, i) => {
    const y = 232 + i * 22;
    ctx.fillStyle = a.c;
    ctx.beginPath();
    ctx.arc(rx + 26, y - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d1d5db";
    ctx.font = "11px system-ui,sans-serif";
    ctx.fillText(a.n, rx + 38, y);
    ctx.fillStyle = "#6b7280";
    ctx.font = "10px system-ui,sans-serif";
    ctx.fillText(a.s, rx + rw - 58, y);
  });

  // Region latency
  ctx.fillStyle = "#141821";
  roundRect(ctx, rx + 10, 322, rw - 20, 108, 10);
  ctx.fill();
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "600 12px system-ui,sans-serif";
  ctx.fillText("Region latency", rx + 22, 344);
  const regions = [
    { l: "US-East", ms: 11 + Math.floor(Math.sin(t * 1.4) * 3), p: 0.92 },
    { l: "EU-West", ms: 24 + Math.floor(Math.cos(t) * 4), p: 0.74 },
    { l: "APAC", ms: 38 + Math.floor(Math.sin(t * 0.8) * 5), p: 0.58 },
  ];
  regions.forEach((r, i) => {
    const y = 362 + i * 26;
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px system-ui,sans-serif";
    ctx.fillText(r.l, rx + 22, y);
    ctx.fillStyle = "#4b5563";
    roundRect(ctx, rx + 88, y - 10, rw - 118, 8, 4);
    ctx.fill();
    ctx.fillStyle = i === 0 ? "#3b82f6" : "#14b8a6";
    roundRect(ctx, rx + 88, y - 10, (rw - 118) * r.p, 8, 4);
    ctx.fill();
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "10px ui-monospace,monospace";
    ctx.fillText(`${r.ms}ms`, rx + rw - 48, y);
  });

  // Deploy queue
  ctx.fillStyle = "#141821";
  roundRect(ctx, rx + 10, 442, rw - 20, 96, 10);
  ctx.fill();
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "600 12px system-ui,sans-serif";
  ctx.fillText("Deploy queue", rx + 22, 464);
  const deploys = [
    { n: "portal.lumen", p: 0.62 + Math.sin(t * 0.9) * 0.08 },
    { n: "ops-api", p: 0.28 },
  ];
  deploys.forEach((d, i) => {
    const y = 482 + i * 28;
    ctx.fillStyle = "#d1d5db";
    ctx.font = "11px system-ui,sans-serif";
    ctx.fillText(d.n, rx + 22, y);
    ctx.fillStyle = "#252a36";
    roundRect(ctx, rx + 22, y + 6, rw - 44, 6, 3);
    ctx.fill();
    ctx.fillStyle = "#8b5cf6";
    roundRect(ctx, rx + 22, y + 6, (rw - 44) * Math.min(1, d.p), 6, 3);
    ctx.fill();
  });

  // API quota + alerts
  ctx.fillStyle = "#141821";
  roundRect(ctx, rx + 10, 550, rw - 20, 88, 10);
  ctx.fill();
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "600 12px system-ui,sans-serif";
  ctx.fillText("API quota", rx + 22, 572);
  const quota = 0.68 + Math.sin(t * 0.5) * 0.04;
  ctx.fillStyle = "#252a36";
  roundRect(ctx, rx + 22, 584, rw - 44, 10, 5);
  ctx.fill();
  ctx.fillStyle = "#f59e0b";
  roundRect(ctx, rx + 22, 584, (rw - 44) * quota, 10, 5);
  ctx.fill();
  ctx.fillStyle = "#9ca3af";
  ctx.font = "10px system-ui,sans-serif";
  ctx.fillText(`${Math.floor(quota * 100)}% of 2M req/day`, rx + 22, 612);

  ctx.fillStyle = "#141821";
  roundRect(ctx, rx + 10, 650, rw - 20, h - 666, 10);
  ctx.fill();
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "600 12px system-ui,sans-serif";
  ctx.fillText("Alerts", rx + 22, 672);
  const alerts = [
    { t: "Spike in webhook retries", c: "#fbbf24" },
    { t: "SSL renew · 12 days", c: "#60a5fa" },
  ];
  alerts.forEach((a, i) => {
    const y = 692 + i * 24;
    ctx.fillStyle = a.c;
    ctx.fillText("▸", rx + 22, y);
    ctx.fillStyle = "#d1d5db";
    ctx.font = "11px system-ui,sans-serif";
    ctx.fillText(a.t, rx + 34, y);
  });
}

function paintAppUI(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = "#0a0b0f";
  ctx.fillRect(0, 0, w, h);

  // Chrome
  ctx.fillStyle = "#12141a";
  ctx.fillRect(0, 0, w, 44);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    ctx.beginPath();
    ctx.fillStyle = c;
    ctx.arc(20 + i * 16, 22, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#1c1f28";
  roundRect(ctx, 86, 12, 280, 20, 6);
  ctx.fill();
  ctx.fillStyle = "#8b919c";
  ctx.font = "11px system-ui,sans-serif";
  ctx.fillText("arcform.app / northwind-ops", 96, 26);

  // Left sidebar
  ctx.fillStyle = "#0e1016";
  ctx.fillRect(0, 44, 148, h - 44);
  ["Overview", "Workflows", "Agents", "Analytics", "Settings"].forEach((label, i) => {
    const y = 78 + i * 38;
    const active = i === Math.floor(t * 0.4) % 5;
    if (active) {
      ctx.fillStyle = "rgba(59,130,246,0.2)";
      roundRect(ctx, 10, y - 14, 128, 30, 8);
      ctx.fill();
    }
    ctx.fillStyle = active ? "#f3f4f6" : "#9ca3af";
    ctx.font = "13px system-ui,sans-serif";
    ctx.fillText(label, 26, y + 4);
  });

  const mx = 164;
  const mainW = 740;
  ctx.fillStyle = "#f9fafb";
  ctx.font = "600 22px system-ui,sans-serif";
  ctx.fillText("Operations Console", mx, 82);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "12px system-ui,sans-serif";
  ctx.fillText("Live systems · AI triage · role-based access", mx, 102);

  const stats = [
    { l: "Active jobs", v: String(14 + Math.floor((Math.sin(t) + 1) * 3)) },
    { l: "Latency", v: `${11 + Math.floor(Math.abs(Math.sin(t * 1.6)) * 7)}ms` },
    { l: "Uptime", v: "99.98%" },
  ];
  stats.forEach((s, i) => {
    const x = mx + i * 168;
    ctx.fillStyle = "#141821";
    roundRect(ctx, x, 120, 152, 72, 12);
    ctx.fill();
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px system-ui,sans-serif";
    ctx.fillText(s.l, x + 14, 142);
    ctx.fillStyle = "#f9fafb";
    ctx.font = "600 24px system-ui,sans-serif";
    ctx.fillText(s.v, x + 14, 172);
  });

  // Chart
  ctx.fillStyle = "#141821";
  roundRect(ctx, mx, 210, mainW, 190, 14);
  ctx.fill();
  ctx.fillStyle = "#9ca3af";
  ctx.font = "12px system-ui,sans-serif";
  ctx.fillText("Throughput", mx + 16, 232);

  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < 72; i++) {
    const x = mx + 20 + i * 9.8;
    const y = 320 - Math.sin(i * 0.32 + t * 1.7) * 40 - Math.cos(i * 0.12 + t) * 14;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "#14b8a6";
  ctx.lineWidth = 1.75;
  ctx.beginPath();
  for (let i = 0; i < 72; i++) {
    const x = mx + 20 + i * 9.8;
    const y = 330 - Math.sin(i * 0.25 - t * 1.3) * 26;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Feed
  ctx.fillStyle = "#141821";
  roundRect(ctx, mx, 420, mainW, h - 436, 14);
  ctx.fill();
  const rows = [
    "Agent routed invoice batch · Northwind",
    "RAG index refreshed · 1.2k docs",
    "Deploy green · portal.lumen",
    "Escalation closed · Harbor desk",
    "Webhook delivered · stripe.events",
    "Policy sync · SOC2 controls",
  ];
  const off = Math.floor(t * 1.15) % rows.length;
  rows.forEach((_, i) => {
    const line = rows[(off + i) % rows.length];
    const y = 448 + i * 26;
    if (i === 0) {
      ctx.fillStyle = "rgba(59,130,246,0.12)";
      roundRect(ctx, mx + 8, y - 14, mainW - 16, 24, 6);
      ctx.fill();
    }
    ctx.fillStyle = "#34d399";
    ctx.font = "11px ui-monospace,monospace";
    ctx.fillText("●", mx + 18, y);
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "12px system-ui,sans-serif";
    ctx.fillText(line, mx + 36, y);
  });

  paintRightRail(ctx, w, h, t);
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

function tuneMacMaterials(object: THREE.Object3D, screenTex: THREE.CanvasTexture) {
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
          emissiveMap: screenTex,
          emissive: new THREE.Color(1, 1, 1),
          emissiveIntensity: 0.95,
          roughness: 0.35,
          metalness: 0,
          toneMapped: false,
        });
      }

      if (HIDDEN_MATERIALS.has(mat.name)) {
        mat.visible = false;
      }

      return mat;
    });

    if (changed) {
      child.material = Array.isArray(child.material) ? next : next[0];
    }
  });
}

/** MacBook Pro M3 16" with live Operations Console on the display */
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
  const { input } = useTiltInputContext();
  const screenTex = useLiveScreenTexture();

  useEffect(() => {
    tuneMacMaterials(scene, screenTex);
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene, screenTex]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const px = input.current.x;
    const py = input.current.y;
    const parallax = layout.mobile ? 0.22 : 0.34;
    const lift = layout.mobile ? 0.04 : 0.07;

    const targetY = (layout.mobile ? 0.1 : 0.22) + px * parallax;
    const targetX = (layout.mobile ? 0.08 : 0.14) + py * lift;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.07;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.07;

    const pop = 0.08 + Math.abs(px) * 0.05 + scrollProgress * 0.1;
    const breathe = Math.sin(t * 0.9) * 0.012;
    const slide = layout.mobile ? 0.03 : 0.05;
    group.current.position.set(
      layout.focusX + px * slide,
      layout.laptopBaseY + breathe + scrollProgress * 0.03,
      layout.laptopBaseZ + pop,
    );

    const s = 1.04 + pop * 0.022;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, s, 0.08));
  });

  return (
    <group
      ref={group}
      position={[layout.focusX, layout.laptopBaseY, layout.laptopBaseZ]}
      rotation={[0.14, layout.mobile ? 0.18 : 0.36, 0]}
    >
      <primitive object={scene} scale={layout.laptopScale} position={[0, 0.02, 0]} />
    </group>
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
        THREE.MathUtils.lerp(layout.cameraPosition[0], layout.cameraPosition[0] + 0.2, p),
        THREE.MathUtils.lerp(layout.cameraPosition[1], layout.cameraPosition[1] + 0.22, p),
        THREE.MathUtils.lerp(layout.cameraPosition[2], layout.cameraPosition[2] - 0.45, p),
      ),
      0.06,
    );
    cam.lookAt(layout.focusX, layout.focusY, 0);
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
      <ambientLight intensity={0.42} />
      <directionalLight position={[-2.5, 4, 2]} intensity={0.75} color="#dbe4f0" />
      <spotLight
        position={[2.5, 2.5, 2]}
        angle={0.5}
        penumbra={0.8}
        intensity={3.2}
        color="#ffc89a"
        castShadow
        distance={12}
      />
      <pointLight position={[1, 1.2, 1.5]} intensity={0.7} color="#ffffff" />
      <pointLight position={[2, 0.8, -0.5]} intensity={0.45} color="#5eead4" />
      <hemisphereLight args={["#c5d0e0", "#0a0a0c", 0.35]} />

      <MatchCamera scrollProgress={scrollProgress} layout={layout} />
      <HeroLaptop scrollProgress={scrollProgress} layout={layout} />

      <ContactShadows
        position={[layout.shadowX, -0.4, 0.1]}
        opacity={0.8}
        scale={5.5}
        blur={2.6}
        far={4.5}
      />
      <Environment preset="city" environmentIntensity={0.55} />
    </>
  );
}
