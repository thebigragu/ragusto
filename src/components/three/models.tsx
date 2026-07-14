"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { usePcbTextures } from "./textures";

type TexPack = NonNullable<ReturnType<typeof usePcbTextures>>;

/**
 * Hyper-detailed BGA / QFP computing module.
 * Fidelity target: RefractWeb Blender chip — dense pins, solder mask map,
 * silicon die photomask, SMDs, gold finish, macro lighting response.
 */
export function PhotorealChip({
  textures,
  scale = 1,
}: {
  textures: TexPack;
  scale?: number;
}) {
  const balls = useMemo(() => {
    const positions: number[] = [];
    const n = 14;
    const span = 1.55;
    for (let x = 0; x < n; x++) {
      for (let z = 0; z < n; z++) {
        if (x > 4 && x < 9 && z > 4 && z < 9) continue;
        positions.push(
          -span / 2 + (x / (n - 1)) * span,
          -0.055,
          -span / 2 + (z / (n - 1)) * span,
        );
      }
    }
    return new Float32Array(positions);
  }, []);

  const pins = useMemo(() => {
    const items: { pos: [number, number, number]; rot: number }[] = [];
    const count = 28;
    const half = 1.05;
    for (let i = 0; i < count; i++) {
      const t = -0.95 + (i / (count - 1)) * 1.9;
      items.push({ pos: [t, -0.02, half], rot: 0 });
      items.push({ pos: [t, -0.02, -half], rot: 0 });
      items.push({ pos: [half, -0.02, t], rot: Math.PI / 2 });
      items.push({ pos: [-half, -0.02, t], rot: Math.PI / 2 });
    }
    return items;
  }, []);

  const smds = useMemo(() => {
    const items: { pos: [number, number, number]; w: number; d: number; kind: "c" | "r" }[] = [];
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const r = 0.95 + (i % 3) * 0.12;
      items.push({
        pos: [Math.cos(angle) * r, 0.06, Math.sin(angle) * r],
        w: i % 2 ? 0.08 : 0.12,
        d: i % 2 ? 0.05 : 0.06,
        kind: i % 3 === 0 ? "c" : "r",
      });
    }
    return items;
  }, []);

  const ballGeo = useMemo(() => new THREE.SphereGeometry(0.028, 10, 10), []);
  const ballMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d4af37",
        metalness: 1,
        roughness: 0.18,
      }),
    [],
  );

  return (
    <group scale={scale}>
      {/* PCB substrate */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.09, 2.2]} />
        <meshPhysicalMaterial
          map={textures.pcb}
          roughness={0.45}
          metalness={0.25}
          clearcoat={0.35}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* Beveled package rim */}
      <mesh position={[0, 0.055, 0]}>
        <boxGeometry args={[1.95, 0.04, 1.95]} />
        <meshPhysicalMaterial
          color="#1a1a1e"
          metalness={0.7}
          roughness={0.28}
          clearcoat={0.5}
        />
      </mesh>

      {/* Heat spreader / IHS */}
      <mesh position={[0, 0.095, 0]} castShadow>
        <boxGeometry args={[1.55, 0.05, 1.55]} />
        <meshPhysicalMaterial
          color="#c5cad3"
          metalness={0.95}
          roughness={0.22}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          map={textures.metal}
        />
      </mesh>

      {/* Silicon die under glass */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.72, 0.02, 0.72]} />
        <meshPhysicalMaterial
          map={textures.die}
          metalness={0.85}
          roughness={0.12}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 800]}
          emissive="#1e3a8a"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Die window / epoxy */}
      <mesh position={[0, 0.145, 0]}>
        <boxGeometry args={[0.78, 0.012, 0.78]} />
        <meshPhysicalMaterial
          color="#9ec5ff"
          transmission={0.75}
          thickness={0.2}
          roughness={0.05}
          metalness={0}
          transparent
          opacity={0.55}
          ior={1.5}
        />
      </mesh>

      {/* BGA solder balls */}
      <BgaBalls geometry={ballGeo} material={ballMat} positions={balls} />

      {/* Edge pins */}
      {pins.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={[0.35, p.rot, 0]} castShadow>
          <boxGeometry args={[0.035, 0.02, 0.14]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
        </mesh>
      ))}

      {/* SMD passives */}
      {smds.map((s, i) => (
        <group key={i} position={s.pos}>
          <mesh castShadow>
            <boxGeometry args={[s.w, 0.035, s.d]} />
            <meshStandardMaterial
              color={s.kind === "c" ? "#1a1a1a" : "#c4a574"}
              metalness={s.kind === "c" ? 0.4 : 0.2}
              roughness={0.45}
            />
          </mesh>
          {s.kind === "r" && (
            <>
              <mesh position={[-s.w * 0.4, 0, 0]}>
                <boxGeometry args={[0.02, 0.036, s.d * 0.95]} />
                <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.25} />
              </mesh>
              <mesh position={[s.w * 0.4, 0, 0]}>
                <boxGeometry args={[0.02, 0.036, s.d * 0.95]} />
                <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.25} />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* Crystal oscillator can */}
      <mesh position={[0.72, 0.08, -0.72]} castShadow>
        <boxGeometry args={[0.22, 0.07, 0.16]} />
        <meshPhysicalMaterial color="#d8dde6" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Inductor */}
      <mesh position={[-0.75, 0.075, 0.7]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

function BgaBalls({
  geometry,
  material,
  positions,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  positions: Float32Array;
}) {
  const mesh = useMemo(() => {
    const count = positions.length / 3;
    const m = new THREE.InstancedMesh(geometry, material, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.castShadow = true;
    return m;
  }, [geometry, material, positions]);

  return <primitive object={mesh} />;
}

/**
 * Precision-machined launch craft.
 * Fidelity target: Galvanite hero-object polish — panel seams, nozzles,
 * brushed metal, rivets, emissive propulsion — applied as Arcform “ship it” metaphor.
 */
export function PrecisionCraft({
  textures,
  scale = 1,
}: {
  textures: TexPack;
  scale?: number;
}) {
  const rivets = useMemo(() => {
    const items: [number, number, number][] = [];
    for (let ring = 0; ring < 5; ring++) {
      const y = -0.55 + ring * 0.35;
      const r = 0.28 - ring * 0.02;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        items.push([Math.cos(a) * r, y, Math.sin(a) * r]);
      }
    }
    return items;
  }, []);

  return (
    <group scale={scale}>
      {/* Nose cone */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <coneGeometry args={[0.22, 0.55, 32]} />
        <meshPhysicalMaterial
          map={textures.metal}
          color="#e8ecf2"
          metalness={0.95}
          roughness={0.18}
          clearcoat={0.7}
          clearcoatRoughness={0.12}
        />
      </mesh>

      {/* Upper body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.3, 0.7, 48]} />
        <meshPhysicalMaterial
          map={textures.metal}
          color="#b8c0cc"
          metalness={0.92}
          roughness={0.22}
          clearcoat={0.55}
        />
      </mesh>

      {/* Mid band / accent */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.305, 0.305, 0.08, 48]} />
        <meshPhysicalMaterial
          color="#3b82f6"
          metalness={0.7}
          roughness={0.25}
          emissive="#1d4ed8"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Lower body */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.85, 48]} />
        <meshPhysicalMaterial
          map={textures.metal}
          color="#9aa3b0"
          metalness={0.9}
          roughness={0.28}
        />
      </mesh>

      {/* Panel groove rings */}
      {[0.8, 0.45, 0.05, -0.35].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.305 - i * 0.01, 0.008, 8, 48]} />
          <meshStandardMaterial color="#2a2e36" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}

      {/* Porthole */}
      <mesh position={[0.28, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 24]} />
        <meshPhysicalMaterial
          color="#7dd3fc"
          transmission={0.6}
          thickness={0.3}
          roughness={0.05}
          metalness={0.1}
          transparent
          opacity={0.85}
          emissive="#38bdf8"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Fins */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.38, -0.55, Math.sin(a) * 0.38]}
            rotation={[0.15, -a, 0.35]}
            castShadow
          >
            <boxGeometry args={[0.04, 0.55, 0.28]} />
            <meshPhysicalMaterial
              map={textures.metal}
              color="#c5ccd6"
              metalness={0.9}
              roughness={0.25}
            />
          </mesh>
        );
      })}

      {/* Engine bells */}
      {[
        [0, -1.05, 0],
        [0.18, -0.95, 0.16],
        [-0.18, -0.95, 0.16],
        [0, -0.95, -0.2],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh castShadow>
            <cylinderGeometry args={[i === 0 ? 0.14 : 0.07, i === 0 ? 0.2 : 0.1, 0.28, 24]} />
            <meshPhysicalMaterial
              color="#3a3f48"
              metalness={0.95}
              roughness={0.2}
              clearcoat={0.4}
            />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <sphereGeometry args={[i === 0 ? 0.09 : 0.045, 16, 12]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#3b82f6"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* Plume */}
      <mesh position={[0, -1.45, 0]}>
        <coneGeometry args={[0.12, 0.7, 16, 1, true]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive="#60a5fa"
          emissiveIntensity={2}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Rivets */}
      {rivets.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#dfe3ea" metalness={1} roughness={0.15} />
        </mesh>
      ))}

      {/* Antenna */}
      <mesh position={[0.12, 1.35, 0]} rotation={[0.2, 0, 0.15]}>
        <cylinderGeometry args={[0.008, 0.008, 0.35, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}

/** MacBook-class laptop with textured display */
export function StudioLaptop({
  textures,
  accent = "#14b8a6",
}: {
  textures: TexPack;
  accent?: string;
}) {
  const screen =
    accent === "#7c6cf0"
      ? textures.dashViolet
      : accent === "#14b8a6"
        ? textures.dashTeal
        : textures.dashBlue;

  return (
    <group>
      <mesh castShadow position={[0, 0, 0.2]} receiveShadow>
        <boxGeometry args={[2.2, 0.05, 1.45]} />
        <meshPhysicalMaterial color="#1c1c20" metalness={0.85} roughness={0.28} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.03, 0.45]}>
        <boxGeometry args={[0.7, 0.008, 0.45]} />
        <meshStandardMaterial color="#2a2a30" roughness={0.5} />
      </mesh>
      {/* Keyboard keys suggestion */}
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 12 }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[-0.85 + col * 0.15, 0.03, -0.15 + row * 0.12]}
          >
            <boxGeometry args={[0.12, 0.01, 0.09]} />
            <meshStandardMaterial color="#25252c" roughness={0.55} />
          </mesh>
        )),
      )}
      <group position={[0, 0.78, -0.52]} rotation={[0.18, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.2, 1.4, 0.04]} />
          <meshPhysicalMaterial color="#111114" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[2.0, 1.2]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.62, 0.022]}>
          <boxGeometry args={[0.08, 0.08, 0.01]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      </group>
    </group>
  );
}

/** Phone with glass + OLED screen texture */
export function StudioPhone({ textures }: { textures: TexPack }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.78, 1.6, 0.09]} />
        <meshPhysicalMaterial
          color="#1a1a1e"
          metalness={0.85}
          roughness={0.22}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
        />
      </mesh>
      <mesh position={[0, 0, 0.048]}>
        <planeGeometry args={[0.7, 1.48]} />
        <meshBasicMaterial map={textures.dashViolet} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.68, 0.05]}>
        <boxGeometry args={[0.2, 0.04, 0.01]} />
        <meshStandardMaterial color="#050508" />
      </mesh>
      <mesh position={[0, -0.7, 0.05]}>
        <boxGeometry args={[0.22, 0.015, 0.008]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
    </group>
  );
}

export function SoftGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]} receiveShadow>
      <circleGeometry args={[8, 64]} />
      <meshStandardMaterial color="#070708" roughness={1} metalness={0} />
    </mesh>
  );
}

export function useStudioTextures() {
  return usePcbTextures();
}
