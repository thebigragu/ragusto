"use client";

import { useMemo } from "react";
import * as THREE from "three";

/** Dark PCB substrate with metallic edge — RefractWeb/Armory product density */
export function CircuitBoard({
  width = 2.4,
  depth = 2.4,
  thickness = 0.08,
}: {
  width?: number;
  depth?: number;
  thickness?: number;
}) {
  const pads = useMemo(() => {
    const items: { pos: [number, number, number]; s: number }[] = [];
    const cols = 8;
    const rows = 8;
    for (let x = 0; x < cols; x++) {
      for (let z = 0; z < rows; z++) {
        if (x > 2 && x < 5 && z > 2 && z < 5) continue; // leave center for die
        items.push({
          pos: [
            -width * 0.38 + (x / (cols - 1)) * width * 0.76,
            thickness * 0.55,
            -depth * 0.38 + (z / (rows - 1)) * depth * 0.76,
          ],
          s: 0.06 + ((x + z) % 3) * 0.015,
        });
      }
    }
    return items;
  }, [width, depth, thickness]);

  const traces = useMemo(() => {
    const lines: { pos: [number, number, number]; len: number; rot: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const side = i % 2 === 0;
      lines.push({
        pos: [
          side ? -width * 0.28 : width * 0.28,
          thickness * 0.52,
          -depth * 0.32 + (i / 13) * depth * 0.64,
        ],
        len: 0.35 + (i % 4) * 0.08,
        rot: side ? 0 : Math.PI,
      });
    }
    return lines;
  }, [width, depth, thickness]);

  return (
    <group>
      {/* PCB body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color="#0d1f18" metalness={0.35} roughness={0.55} />
      </mesh>
      {/* Copper edge ring */}
      <mesh position={[0, thickness * 0.52, 0]}>
        <boxGeometry args={[width * 0.98, 0.004, depth * 0.98]} />
        <meshStandardMaterial color="#1a3d2e" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Gold contact pads */}
      {pads.map((p, i) => (
        <mesh key={i} position={p.pos} castShadow>
          <boxGeometry args={[p.s, 0.012, p.s]} />
          <meshStandardMaterial color="#c9a227" metalness={0.95} roughness={0.22} />
        </mesh>
      ))}
      {/* Trace lines */}
      {traces.map((t, i) => (
        <mesh key={`t-${i}`} position={t.pos} rotation={[0, t.rot, 0]}>
          <boxGeometry args={[t.len, 0.006, 0.018]} />
          <meshStandardMaterial
            color="#2dd4bf"
            metalness={0.7}
            roughness={0.3}
            emissive="#14b8a6"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
      {/* Mounting holes */}
      {[
        [-width * 0.42, thickness * 0.6, -depth * 0.42],
        [width * 0.42, thickness * 0.6, -depth * 0.42],
        [-width * 0.42, thickness * 0.6, depth * 0.42],
        [width * 0.42, thickness * 0.6, depth * 0.42],
      ].map((pos, i) => (
        <mesh key={`h-${i}`} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
          <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** Silicon die with etched lanes — signature technical object */
export function SiliconDie({ scale = 1 }: { scale?: number }) {
  const lanes = useMemo(() => {
    const items: { pos: [number, number, number]; w: number; d: number }[] = [];
    for (let i = 0; i < 9; i++) {
      items.push({
        pos: [-0.28 + i * 0.07, 0.045, 0],
        w: 0.018,
        d: 0.55,
      });
      items.push({
        pos: [0, 0.048, -0.28 + i * 0.07],
        w: 0.55,
        d: 0.018,
      });
    }
    return items;
  }, []);

  return (
    <group scale={scale}>
      <mesh castShadow>
        <boxGeometry args={[0.72, 0.06, 0.72]} />
        <meshStandardMaterial color="#2a3142" metalness={0.85} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.62, 0.02, 0.62]} />
        <meshStandardMaterial
          color="#3b82f6"
          metalness={0.6}
          roughness={0.25}
          emissive="#1d4ed8"
          emissiveIntensity={0.25}
        />
      </mesh>
      {lanes.map((l, i) => (
        <mesh key={i} position={l.pos}>
          <boxGeometry args={[l.w, 0.01, l.d]} />
          <meshStandardMaterial
            color="#93c5fd"
            metalness={0.9}
            roughness={0.15}
            emissive="#60a5fa"
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
      {/* Bond wires suggestion */}
      {[
        [-0.4, 0.02, -0.2],
        [0.4, 0.02, -0.15],
        [-0.35, 0.02, 0.25],
        [0.38, 0.02, 0.2],
      ].map((pos, i) => (
        <mesh key={`w-${i}`} position={pos as [number, number, number]} rotation={[0, 0, i % 2 ? 0.4 : -0.4]}>
          <boxGeometry args={[0.12, 0.006, 0.006]} />
          <meshStandardMaterial color="#e8e4d9" metalness={1} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

/** Browser chrome with dashboard UI — Vertex/Galvanite product clarity */
export function BrowserWindow({
  width = 2.2,
  height = 1.45,
  accent = "#3b82f6",
}: {
  width?: number;
  height?: number;
  accent?: string;
}) {
  const bars = useMemo(
    () =>
      [0.55, 0.82, 0.4, 0.7, 0.95, 0.48].map((h, i) => ({
        x: -0.7 + i * 0.28,
        h,
      })),
    [],
  );

  return (
    <group>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[width, height, 0.06]} />
        <meshStandardMaterial color="#121218" metalness={0.4} roughness={0.35} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, -0.04, 0.035]}>
        <boxGeometry args={[width * 0.94, height * 0.78, 0.01]} />
        <meshStandardMaterial color="#0b0b10" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Title bar */}
      <mesh position={[0, height * 0.4, 0.036]}>
        <boxGeometry args={[width * 0.94, 0.12, 0.01]} />
        <meshStandardMaterial color="#1c1c24" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Traffic lights */}
      {([-0.9, -0.78, -0.66] as const).map((x, i) => (
        <mesh key={i} position={[x * (width / 2.2), height * 0.4, 0.045]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial
            color={i === 0 ? "#ef4444" : i === 1 ? "#eab308" : "#22c55e"}
            emissive={i === 0 ? "#ef4444" : i === 1 ? "#eab308" : "#22c55e"}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
      {/* URL bar */}
      <mesh position={[0.15, height * 0.4, 0.045]}>
        <boxGeometry args={[width * 0.55, 0.055, 0.008]} />
        <meshStandardMaterial color="#2a2a34" roughness={0.6} />
      </mesh>
      {/* Sidebar */}
      <mesh position={[-width * 0.35, -0.08, 0.042]}>
        <boxGeometry args={[0.35, height * 0.65, 0.008]} />
        <meshStandardMaterial color="#16161e" roughness={0.55} />
      </mesh>
      {/* Chart bars */}
      {bars.map((b, i) => (
        <mesh key={i} position={[b.x, -0.45 + b.h * 0.35, 0.045]}>
          <boxGeometry args={[0.14, b.h * 0.7, 0.02]} />
          <meshStandardMaterial
            color={accent}
            metalness={0.3}
            roughness={0.35}
            emissive={accent}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
      {/* KPI cards */}
      {[0, 1, 2].map((i) => (
        <mesh key={`k-${i}`} position={[-0.15 + i * 0.42, 0.22, 0.045]}>
          <boxGeometry args={[0.36, 0.22, 0.012]} />
          <meshStandardMaterial color="#1a1a24" roughness={0.45} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/** Phone with app UI — product showcase language */
export function PhoneDevice({ accent = "#7c6cf0" }: { accent?: string }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.72, 1.45, 0.08]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.042]}>
        <boxGeometry args={[0.64, 1.32, 0.01]} />
        <meshStandardMaterial color="#08080c" roughness={0.4} />
      </mesh>
      {/* Notch */}
      <mesh position={[0, 0.58, 0.048]}>
        <boxGeometry args={[0.22, 0.05, 0.01]} />
        <meshStandardMaterial color="#050508" />
      </mesh>
      {/* App header */}
      <mesh position={[0, 0.4, 0.05]}>
        <boxGeometry args={[0.5, 0.08, 0.008]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.3} />
      </mesh>
      {/* Content cards */}
      {[0.15, -0.1, -0.35].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]}>
          <boxGeometry args={[0.52, 0.18, 0.008]} />
          <meshStandardMaterial color="#15151c" roughness={0.5} />
        </mesh>
      ))}
      {/* Home indicator */}
      <mesh position={[0, -0.58, 0.05]}>
        <boxGeometry args={[0.2, 0.02, 0.006]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
    </group>
  );
}

/** Laptop with open screen — Armory-style product presence */
export function LaptopDevice({ accent = "#14b8a6" }: { accent?: string }) {
  return (
    <group>
      {/* Base */}
      <mesh castShadow position={[0, 0, 0.15]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[2.0, 0.06, 1.3]} />
        <meshStandardMaterial color="#1c1c22" metalness={0.65} roughness={0.3} />
      </mesh>
      {/* Trackpad */}
      <mesh position={[0, 0.04, 0.35]}>
        <boxGeometry args={[0.55, 0.01, 0.35]} />
        <meshStandardMaterial color="#2a2a32" roughness={0.45} />
      </mesh>
      {/* Screen back */}
      <mesh position={[0, 0.72, -0.48]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[2.0, 1.25, 0.05]} />
        <meshStandardMaterial color="#141418" metalness={0.7} roughness={0.28} />
      </mesh>
      {/* Display */}
      <mesh position={[0, 0.72, -0.45]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[1.85, 1.1, 0.01]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.35} />
      </mesh>
      {/* Code lines */}
      {[0.35, 0.2, 0.05, -0.1, -0.25].map((y, i) => (
        <mesh key={i} position={[-0.35, 0.72 + y * 0.15, -0.44]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.7 + (i % 3) * 0.2, 0.035, 0.008]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? accent : "#3b82f6"}
            emissive={i % 2 === 0 ? accent : "#3b82f6"}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Floating UI card stack — Glass UI from Vertex principles, software-specific */
export function UiCardStack({ accent = "#7c6cf0" }: { accent?: string }) {
  const cards = [
    { y: 0.35, z: -0.08, s: 0.92, o: 0.95 },
    { y: 0.12, z: 0, s: 1, o: 1 },
    { y: -0.12, z: 0.08, s: 0.88, o: 0.9 },
  ];
  return (
    <group>
      {cards.map((c, i) => (
        <group key={i} position={[0, c.y, c.z]} scale={c.s}>
          <mesh>
            <boxGeometry args={[1.1, 0.7, 0.04]} />
            <meshPhysicalMaterial
              color="#1a1a28"
              metalness={0.2}
              roughness={0.2}
              transmission={0.15}
              thickness={0.2}
              transparent
              opacity={c.o}
            />
          </mesh>
          <mesh position={[-0.25, 0.18, 0.025]}>
            <boxGeometry args={[0.4, 0.08, 0.01]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, -0.05, 0.025]}>
            <boxGeometry args={[0.85, 0.06, 0.008]} />
            <meshStandardMaterial color="#3f3f4a" />
          </mesh>
          <mesh position={[0, -0.18, 0.025]}>
            <boxGeometry args={[0.65, 0.06, 0.008]} />
            <meshStandardMaterial color="#2a2a34" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function SoftGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]} receiveShadow>
      <circleGeometry args={[6, 48]} />
      <meshStandardMaterial color="#0a0a0b" roughness={1} metalness={0} />
    </mesh>
  );
}
