"use client";

import { ContactShadows, Environment, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

useGLTF.preload("/models/macbook-pro.glb");

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
  roundRect(ctx, 86, 12, 240, 20, 6);
  ctx.fill();
  ctx.fillStyle = "#8b919c";
  ctx.font = "11px system-ui,sans-serif";
  ctx.fillText("arcform.app / northwind-ops", 96, 26);

  // Sidebar
  ctx.fillStyle = "#0e1016";
  ctx.fillRect(0, 44, 150, h - 44);
  ["Overview", "Workflows", "Agents", "Analytics", "Settings"].forEach((label, i) => {
    const y = 78 + i * 38;
    const active = i === Math.floor(t * 0.4) % 5;
    if (active) {
      ctx.fillStyle = "rgba(59,130,246,0.2)";
      roundRect(ctx, 10, y - 14, 130, 30, 8);
      ctx.fill();
    }
    ctx.fillStyle = active ? "#f3f4f6" : "#9ca3af";
    ctx.font = "13px system-ui,sans-serif";
    ctx.fillText(label, 26, y + 4);
  });

  const mx = 170;
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
  roundRect(ctx, mx, 210, 510, 190, 14);
  ctx.fill();
  ctx.fillStyle = "#9ca3af";
  ctx.font = "12px system-ui,sans-serif";
  ctx.fillText("Throughput", mx + 16, 232);

  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < 50; i++) {
    const x = mx + 20 + i * 9.5;
    const y = 320 - Math.sin(i * 0.32 + t * 1.7) * 40 - Math.cos(i * 0.12 + t) * 14;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "#14b8a6";
  ctx.lineWidth = 1.75;
  ctx.beginPath();
  for (let i = 0; i < 50; i++) {
    const x = mx + 20 + i * 9.5;
    const y = 330 - Math.sin(i * 0.25 - t * 1.3) * 26;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Feed
  ctx.fillStyle = "#141821";
  roundRect(ctx, mx, 420, 510, 155, 14);
  ctx.fill();
  const rows = [
    "Agent routed invoice batch · Northwind",
    "RAG index refreshed · 1.2k docs",
    "Deploy green · portal.lumen",
    "Escalation closed · Harbor desk",
    "Webhook delivered · stripe.events",
  ];
  const off = Math.floor(t * 1.15) % rows.length;
  rows.forEach((_, i) => {
    const line = rows[(off + i) % rows.length];
    const y = 448 + i * 26;
    if (i === 0) {
      ctx.fillStyle = "rgba(59,130,246,0.12)";
      roundRect(ctx, mx + 8, y - 14, 494, 24, 6);
      ctx.fill();
    }
    ctx.fillStyle = "#34d399";
    ctx.font = "11px ui-monospace,monospace";
    ctx.fillText("●", mx + 18, y);
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "12px system-ui,sans-serif";
    ctx.fillText(line, mx + 36, y);
  });
}

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

function paintMacKeyboard(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const deck = "#0b0b0d";
  const gap = "#050506";
  const keyTop = "#3d3d42";
  const keyBottom = "#2a2a2f";
  const keyEdge = "#1a1a1e";
  const trackpad = "#45454c";
  const trackpadInner = "#3a3a40";

  ctx.fillStyle = deck;
  ctx.fillRect(0, 0, w, h);

  const kbX = w * 0.1;
  const kbY = h * 0.06;
  const kbW = w * 0.8;
  const kbH = h * 0.56;
  const padY = h * 0.66;
  const padH = h * 0.26;
  const padX = w * 0.28;
  const padW = w * 0.44;

  const rows: { cols: number; widths?: number[]; height?: number }[] = [
    { cols: 14, height: 0.11 },
    { cols: 14, height: 0.14 },
    { cols: 14, height: 0.14 },
    { cols: 13, widths: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6, 1], height: 0.14 },
    { cols: 12, widths: [1.6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.8], height: 0.14 },
    {
      cols: 10,
      widths: [1.2, 1.1, 1.1, 1.1, 4.8, 1.1, 1.1, 1.1, 1.1, 1.2],
      height: 0.14,
    },
  ];

  const rowGap = kbH * 0.028;
  let y = kbY;
  rows.forEach((row) => {
    const rowH = kbH * (row.height ?? 0.14);
    const units = row.widths ?? Array(row.cols).fill(1);
    const unitW = kbW / units.reduce((a, b) => a + b, 0);
    let x = kbX;
    units.forEach((unit) => {
      const kw = unitW * unit - rowGap;
      const kh = rowH - rowGap;
      const r = Math.min(kw, kh) * 0.16;

      ctx.fillStyle = gap;
      roundRect(ctx, x - 1, y - 1, kw + 2, kh + 2, r + 1);
      ctx.fill();

      const grad = ctx.createLinearGradient(x, y, x, y + kh);
      grad.addColorStop(0, keyTop);
      grad.addColorStop(1, keyBottom);
      ctx.fillStyle = grad;
      roundRect(ctx, x, y, kw, kh, r);
      ctx.fill();

      ctx.strokeStyle = keyEdge;
      ctx.lineWidth = 1;
      roundRect(ctx, x + 0.5, y + 0.5, kw - 1, kh - 1, r);
      ctx.stroke();

      x += unitW * unit;
    });
    y += rowH;
  });

  // Speaker grille dots flanking keyboard
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for (let side = 0; side < 2; side++) {
    const gx = side === 0 ? w * 0.04 : w * 0.94;
    for (let i = 0; i < 18; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.arc(gx, kbY + i * (kbH / 18) + j * 3, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Trackpad — inset glass slab
  ctx.fillStyle = gap;
  roundRect(ctx, padX - 3, padY - 3, padW + 6, padH + 6, 18);
  ctx.fill();

  const padGrad = ctx.createLinearGradient(padX, padY, padX, padY + padH);
  padGrad.addColorStop(0, trackpad);
  padGrad.addColorStop(0.5, trackpadInner);
  padGrad.addColorStop(1, "#323238");
  ctx.fillStyle = padGrad;
  roundRect(ctx, padX, padY, padW, padH, 16);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, padX + 1, padY + 1, padW - 2, padH - 2, 15);
  ctx.stroke();

  // Subtle deck sheen
  const sheen = ctx.createLinearGradient(0, 0, w, h * 0.4);
  sheen.addColorStop(0, "rgba(255,255,255,0.03)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
}

function createMacKeyboardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;
  paintMacKeyboard(ctx, 1024, 640);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function useLiveScreenTexture() {
  const { ctx, tex } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 640;
    const context = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return { ctx: context, tex: texture };
  }, []);

  useEffect(() => () => tex.dispose(), [tex]);

  useFrame((state) => {
    paintAppUI(ctx, 1024, 640, state.clock.elapsedTime);
    tex.needsUpdate = true;
  });

  return tex;
}

function addKeyboardDeck(body: THREE.Mesh, keyboardTex: THREE.CanvasTexture) {
  if (body.getObjectByName("keyboard_keys")) return;

  body.geometry.computeBoundingBox();
  const box = body.geometry.boundingBox;
  if (!box) return;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const kbW = size.x * 0.64;
  const kbZ0 = box.min.z + size.z * 0.52;
  const kbZ1 = box.min.z + size.z * 0.86;
  const startX = center.x - kbW * 0.5;
  const unitW = kbW / 14;
  const unitD = (kbZ1 - kbZ0) / 6;
  const keyY = box.max.y + 0.07;
  const deckZ = (kbZ0 + kbZ1) * 0.5;

  const deck = new THREE.Mesh(
    new THREE.PlaneGeometry(kbW, kbZ1 - kbZ0),
    new THREE.MeshStandardMaterial({
      map: keyboardTex,
      roughness: 0.48,
      metalness: 0.04,
      envMapIntensity: 0.3,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }),
  );
  deck.name = "keyboard_deck";
  deck.rotation.x = -Math.PI / 2;
  deck.position.set(center.x, box.max.y + 0.04, deckZ);
  deck.renderOrder = 2;
  body.add(deck);

  const rows = [
    { cols: 14, z: 0 },
    { cols: 14, z: 1 },
    { cols: 14, z: 2 },
    { cols: 13, z: 3, wideCol: 11, wide: 1.55 },
    { cols: 12, z: 4, wideStart: 0, wide: 1.45, wideEnd: 11, wideEndW: 1.65 },
    { cols: 10, z: 5, units: [1.1, 1, 1, 1, 4.6, 1, 1, 1, 1, 1.1] },
  ];

  const keyGeo = new THREE.BoxGeometry(unitW * 0.86, 0.06, unitD * 0.8);
  keyGeo.translate(0, 0.03, 0);
  const keyMat = new THREE.MeshStandardMaterial({
    color: "#3a3a40",
    roughness: 0.42,
    metalness: 0.12,
    envMapIntensity: 0.4,
  });

  const placements: THREE.Matrix4[] = [];
  const dummy = new THREE.Object3D();

  rows.forEach((row) => {
    const units =
      row.units ??
      Array.from({ length: row.cols }, (_, i) => {
        if (row.wideCol === i) return row.wide ?? 1.55;
        if (row.wideStart === i) return row.wide ?? 1.45;
        if (row.wideEnd === i) return row.wideEndW ?? 1.65;
        return 1;
      });

    let x = startX;
    const z = kbZ0 + row.z * unitD + unitD * 0.5;
    units.forEach((unit) => {
      const w = unitW * unit;
      dummy.position.set(x + w * 0.5, keyY, z);
      dummy.scale.set(unit, 1, 1);
      dummy.updateMatrix();
      placements.push(dummy.matrix.clone());
      x += w;
    });
  });

  const keys = new THREE.InstancedMesh(keyGeo, keyMat, placements.length);
  keys.name = "keyboard_keys";
  keys.castShadow = true;
  keys.receiveShadow = true;
  placements.forEach((m, i) => keys.setMatrixAt(i, m));
  keys.instanceMatrix.needsUpdate = true;
  body.add(keys);
}

function tuneMacMaterials(
  object: THREE.Object3D,
  screenTex: THREE.CanvasTexture,
  keyboardTex: THREE.CanvasTexture,
) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    if (child.name === "matte") {
      child.material = new THREE.MeshStandardMaterial({
        map: screenTex,
        emissiveMap: screenTex,
        emissive: "#ffffff",
        emissiveIntensity: 1.15,
        roughness: 0.35,
        metalness: 0,
        toneMapped: false,
      });
      return;
    }

    if (child.name === "body" || child.name === "back") {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (!(mat instanceof THREE.MeshStandardMaterial)) return;
        if (mat.name === "blackmatte" && child.name === "body") {
          mat.color.set("#0a0a0c");
          mat.metalness = 0.02;
          mat.roughness = 0.65;
          mat.envMapIntensity = 0.2;
          return;
        }
        mat.metalness = 1;
        mat.roughness = 0.2;
        mat.envMapIntensity = 1.5;
        if (mat.name === "aluminium") {
          mat.color.set("#c5c8cc");
        }
      });
    }

    if (child.name === "body" && child instanceof THREE.Mesh) {
      addKeyboardDeck(child, keyboardTex);
    }
  });
}

/** MacBook Pro GLB with live product UI mapped to the display mesh */
function HeroLaptop({ scrollProgress }: { scrollProgress: number }) {
  const { scene } = useGLTF("/models/macbook-pro.glb");
  const group = useRef<THREE.Group>(null);
  const laptopRoot = useRef<THREE.Object3D>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const screenTex = useLiveScreenTexture();
  const keyboardTex = useMemo(() => createMacKeyboardTexture(), []);
  const materialsReady = useRef(false);

  useEffect(() => {
    if (materialsReady.current) return;
    tuneMacMaterials(scene, screenTex, keyboardTex);
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    materialsReady.current = true;
  }, [scene, screenTex, keyboardTex]);

  useEffect(() => () => keyboardTex.dispose(), [keyboardTex]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    // GLB hinge rests closed at 90°. ~66° cracks the lid slightly toward camera.
    const screen = laptopRoot.current?.getObjectByName("screen");
    if (screen) {
      screen.rotation.x = THREE.MathUtils.degToRad(68);
    }

    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const px = pointer.current.x;
    const py = pointer.current.y;

    const targetY = 0.28 + px * 0.38;
    const targetX = 0.18 + py * 0.08;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.07;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.07;

    const pop = 0.12 + Math.abs(px) * 0.08 + scrollProgress * 0.14;
    const breathe = Math.sin(t * 0.9) * 0.018;
    group.current.position.set(0.7 + px * 0.05, -0.15 + breathe + scrollProgress * 0.04, pop);

    const s = 1.08 + pop * 0.032;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, s, 0.08));
  });

  return (
    <group ref={group} position={[0.7, -0.15, 0.12]} rotation={[0.18, 0.28, 0]}>
      <primitive
        ref={laptopRoot}
        object={scene}
        scale={0.051}
        position={[0, 0.04, 0]}
      />
    </group>
  );
}

function MatchCamera({ scrollProgress }: { scrollProgress: number }) {
  useFrame((state) => {
    const p = scrollProgress;
    state.camera.position.lerp(
      new THREE.Vector3(
        THREE.MathUtils.lerp(0.2, 0.45, p),
        THREE.MathUtils.lerp(0.7, 0.85, p),
        THREE.MathUtils.lerp(3.1, 2.65, p),
      ),
      0.06,
    );
    state.camera.lookAt(0.7, 0.15, 0);
  });
  return null;
}

export function LoungeScene({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[-2.5, 4, 2]} intensity={0.8} color="#dbe4f0" />
      <spotLight
        position={[2.5, 2.5, 2]}
        angle={0.5}
        penumbra={0.8}
        intensity={3.6}
        color="#ffc89a"
        castShadow
        distance={12}
      />
      <pointLight position={[1, 1.2, 1.5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[2, 0.8, -0.5]} intensity={0.5} color="#5eead4" />
      <hemisphereLight args={["#c5d0e0", "#0a0a0c", 0.4]} />

      <MatchCamera scrollProgress={scrollProgress} />
      <HeroLaptop scrollProgress={scrollProgress} />

      <ContactShadows
        position={[0.75, -0.42, 0.1]}
        opacity={0.8}
        scale={5.5}
        blur={2.6}
        far={4.5}
      />
      <Environment preset="city" environmentIntensity={0.7} />
    </>
  );
}
