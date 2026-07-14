"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function makeRadialTexture(color: string, size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.45, color.replace(/[\d.]+\)$/, "0.35)").replace("rgb", "rgba").includes("rgba") ? color : color);
  // simpler stops:
  ctx.clearRect(0, 0, size, size);
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,200,120,0.55)");
  grad.addColorStop(0.7, "rgba(80,40,20,0.15)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeSmokeTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - size / 2;
      const dy = y - size / 2;
      const dist = Math.sqrt(dx * dx + dy * dy) / (size / 2);
      const n =
        Math.sin(x * 0.08) * Math.cos(y * 0.07) * 0.3 +
        Math.sin(x * 0.03 + y * 0.04) * 0.4 +
        Math.random() * 0.35;
      const a = Math.max(0, (1 - dist * dist) * (0.35 + n * 0.45));
      const i = (y * size + x) * 4;
      const c = 40 + n * 80;
      img.data[i] = c;
      img.data[i + 1] = c * 0.85;
      img.data[i + 2] = c * 0.75;
      img.data[i + 3] = Math.min(255, a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 320);
  g.addColorStop(0, "#0a1628");
  g.addColorStop(0.5, "#122038");
  g.addColorStop(1, "#1a0a08");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 320);
  // subtle UI chrome on screen behind rocket
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(24, 24, 120, 12);
  ctx.fillRect(24, 48, 80, 8);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = `rgba(56,189,248,${0.08 + i * 0.03})`;
    ctx.fillRect(24, 90 + i * 28, 160 - i * 12, 14);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeBrushed() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#9aa3b0";
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y++) {
    ctx.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.08})`;
    ctx.fillRect(0, y, 512, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeRockTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#1a1512";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = `rgba(${30 + Math.random() * 40},${25 + Math.random() * 30},${22 + Math.random() * 25},${0.3})`;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * 512,
      Math.random() * 512,
      20 + Math.random() * 80,
      10 + Math.random() * 40,
      Math.random(),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  // strata lines
  for (let y = 0; y < 512; y += 14) {
    ctx.strokeStyle = `rgba(0,0,0,${0.15 + Math.random() * 0.2})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y) * 3);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function useLuxuryTextures() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    return {
      smoke: makeSmokeTexture(),
      glow: makeRadialTexture("rgba(255,180,80,1)"),
      screen: makeScreenTexture(),
      metal: makeBrushed(),
      rock: makeRockTexture(),
    };
  }, []);
}

type Tex = NonNullable<ReturnType<typeof useLuxuryTextures>>;

/** Premium open laptop — Galvanite-launch stage */
export function LuxuryLaptop({ textures }: { textures: Tex }) {
  return (
    <group>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0, 0.15]}>
        <boxGeometry args={[2.6, 0.06, 1.7]} />
        <meshPhysicalMaterial
          color="#1a1c22"
          metalness={0.9}
          roughness={0.28}
          clearcoat={0.55}
          clearcoatRoughness={0.2}
        />
      </mesh>
      {/* Keyboard deck */}
      <mesh position={[0, 0.035, 0.05]}>
        <boxGeometry args={[2.2, 0.01, 1.0]} />
        <meshStandardMaterial color="#12141a" roughness={0.55} />
      </mesh>
      {/* Keys */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 14 }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[-1.0 + col * 0.15, 0.042, -0.25 + row * 0.13]}
          >
            <boxGeometry args={[0.12, 0.012, 0.1]} />
            <meshStandardMaterial color="#22252e" roughness={0.5} metalness={0.2} />
          </mesh>
        )),
      )}
      {/* Trackpad */}
      <mesh position={[0, 0.04, 0.55]}>
        <boxGeometry args={[0.85, 0.008, 0.5]} />
        <meshPhysicalMaterial color="#2a2e38" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Screen lid */}
      <group position={[0, 0.03, -0.7]} rotation={[0.12, 0, 0]}>
        <mesh castShadow position={[0, 0.85, 0]}>
          <boxGeometry args={[2.6, 1.7, 0.05]} />
          <meshPhysicalMaterial
            color="#14161c"
            metalness={0.88}
            roughness={0.25}
            clearcoat={0.4}
          />
        </mesh>
        <mesh position={[0, 0.85, 0.03]}>
          <planeGeometry args={[2.35, 1.45]} />
          <meshBasicMaterial map={textures.screen} toneMapped={false} />
        </mesh>
        {/* Camera */}
        <mesh position={[0, 1.55, 0.03]}>
          <circleGeometry args={[0.025, 16]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      </group>
    </group>
  );
}

/** Sleek launch craft — original Arcform vessel */
export function LaunchRocket({ textures, launch = 0 }: { textures: Tex; launch?: number }) {
  const y = launch * 1.8;
  return (
    <group position={[0, 0.9 + y, -0.55]} rotation={[0.05, 0.15, 0.02]}>
      {/* Nose */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <coneGeometry args={[0.18, 0.5, 32]} />
        <meshPhysicalMaterial
          map={textures.metal}
          color="#d5dbe6"
          metalness={0.95}
          roughness={0.15}
          clearcoat={0.85}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* Body */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.95, 48]} />
        <meshPhysicalMaterial
          map={textures.metal}
          color="#b8c0cc"
          metalness={0.92}
          roughness={0.2}
          clearcoat={0.6}
        />
      </mesh>
      {/* Cyan porthole */}
      <mesh position={[0.2, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 24]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#22d3ee"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
      {/* Fins */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.28, -0.15, Math.sin(a) * 0.28]}
            rotation={[0.2, -a, 0.4]}
            castShadow
          >
            <boxGeometry args={[0.035, 0.45, 0.22]} />
            <meshPhysicalMaterial
              map={textures.metal}
              color="#c5ccd8"
              metalness={0.9}
              roughness={0.22}
            />
          </mesh>
        );
      })}
      {/* Nozzle */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 0.28, 24]} />
        <meshPhysicalMaterial color="#2a3038" metalness={0.95} roughness={0.18} />
      </mesh>
      {/* Core flame */}
      <mesh position={[0, -0.55, 0]}>
        <coneGeometry args={[0.1, 0.45, 16]} />
        <meshStandardMaterial
          color="#fff7ed"
          emissive="#fb923c"
          emissiveIntensity={4}
          transparent
          opacity={0.95}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, -0.5, 0]} intensity={4 + launch * 2} color="#fb923c" distance={4} />
      <pointLight position={[0, -0.3, 0]} intensity={2} color="#67e8f9" distance={2.5} />
    </group>
  );
}

/** Billowing launch smoke — dense soft volumes */
export function LaunchSmoke({
  textures,
  intensity = 1,
}: {
  textures: Tex;
  intensity?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const puffs = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        x: (Math.random() - 0.5) * 2.2,
        y: -0.1 + Math.random() * 0.9,
        z: -0.4 + (Math.random() - 0.5) * 1.2,
        s: 0.55 + Math.random() * 0.95,
        speed: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        hot: i < 6,
      })),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      const p = puffs[i];
      if (!p || !(child instanceof THREE.Mesh)) return;
      child.position.y = p.y + Math.sin(t * p.speed + p.phase) * 0.12 + t * 0.04 * intensity;
      child.position.x = p.x + Math.cos(t * p.speed * 0.7 + p.phase) * 0.08;
      const pulse = 1 + Math.sin(t * 1.2 + p.phase) * 0.08;
      child.scale.setScalar(p.s * pulse * intensity);
      const mat = child.material as THREE.MeshBasicMaterial;
      mat.opacity = (p.hot ? 0.55 : 0.28) * (0.85 + Math.sin(t + p.phase) * 0.1);
    });
  });

  return (
    <group ref={group} position={[0, 0.35, -0.35]}>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={p.s}>
          <planeGeometry args={[1.4, 1.4]} />
          <meshBasicMaterial
            map={textures.smoke}
            color={p.hot ? "#ffb060" : "#6a7380"}
            transparent
            opacity={p.hot ? 0.55 : 0.28}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Ember sprites */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={`e-${i}`}
          position={[
            (Math.random() - 0.5) * 1.5,
            Math.random() * 0.8,
            -0.3 + (Math.random() - 0.5),
          ]}
        >
          <planeGeometry args={[0.12, 0.12]} />
          <meshBasicMaterial
            map={textures.glow}
            transparent
            opacity={0.7}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            color="#fdba74"
          />
        </mesh>
      ))}
    </group>
  );
}

/** Minimalist glass pavilion — Vertex-class architecture (original) */
export function StudioPavilion() {
  return (
    <group>
      {/* Main volume */}
      <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.8, 0.9, 1.1]} />
        <meshPhysicalMaterial
          color="#e8eaef"
          metalness={0.35}
          roughness={0.25}
          clearcoat={0.6}
        />
      </mesh>
      {/* Upper cantilever */}
      <mesh castShadow position={[0.35, 1.05, -0.15]}>
        <boxGeometry args={[1.1, 0.55, 0.85]} />
        <meshPhysicalMaterial color="#f0f2f5" metalness={0.3} roughness={0.22} clearcoat={0.5} />
      </mesh>
      {/* Side wing */}
      <mesh castShadow position={[-0.95, 0.35, 0.15]}>
        <boxGeometry args={[0.55, 0.7, 0.7]} />
        <meshPhysicalMaterial color="#dde1e8" metalness={0.35} roughness={0.28} />
      </mesh>
      {/* Glass panes — emissive interior */}
      {[
        [0, 0.45, 0.56],
        [0.35, 1.05, 0.28],
        [-0.95, 0.35, 0.51],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <planeGeometry args={[i === 0 ? 1.4 : 0.7, i === 0 ? 0.65 : 0.4]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#38bdf8"
            emissiveIntensity={0.85}
            toneMapped={false}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
      {/* Roof orb */}
      <mesh position={[0.5, 1.45, -0.1]}>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#7dd3fc"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 0.5, 0.3]} intensity={1.2} color="#7dd3fc" distance={3} />
    </group>
  );
}

/** Sedimentary rock mass */
export function RockMass({
  textures,
  position,
  scale = 1,
  warm = false,
}: {
  textures: Tex;
  position: [number, number, number];
  scale?: number;
  warm?: boolean;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow rotation={[0, 0.3, 0.05]}>
        <boxGeometry args={[1.4, 2.2, 1.0]} />
        <meshStandardMaterial
          map={textures.rock}
          color={warm ? "#4a3028" : "#2a2420"}
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0.35, -0.2, 0.2]} rotation={[0.1, -0.4, 0.1]} castShadow>
        <boxGeometry args={[0.9, 1.4, 0.8]} />
        <meshStandardMaterial map={textures.rock} color="#231e1a" roughness={0.95} />
      </mesh>
      <mesh position={[-0.3, 0.6, -0.25]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.6]} />
        <meshStandardMaterial map={textures.rock} color="#2e2824" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Magenta ground particle field */
export function GroundEmbers({ count = 400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = Math.random() * 0.15;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref} position={[0, -0.85, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#f472b6"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/** Soft aurora / nebula backdrop planes */
export function AuroraBackdrop() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      const m = ref.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.35 + Math.sin(s.clock.elapsedTime * 0.4) * 0.08;
    }
  });
  return (
    <group position={[0, 1.5, -6]}>
      <mesh ref={ref}>
        <planeGeometry args={[16, 8]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[3, -0.5, 1]} rotation={[0, 0.2, 0.1]}>
        <planeGeometry args={[8, 5]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-2, 1, 0.5]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function DesertGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]} receiveShadow>
      <circleGeometry args={[12, 64]} />
      <meshStandardMaterial color="#0c0a09" roughness={1} metalness={0} />
    </mesh>
  );
}
