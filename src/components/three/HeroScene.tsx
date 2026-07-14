"use client";

import {
  ContactShadows,
  Environment,
  Float,
  MeshReflectorMaterial,
  MeshTransmissionMaterial,
  RoundedBox,
  Stars,
  useGLTF,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

useGLTF.preload("/models/armchair/ArmChair_01_1k.gltf");

function MouseParallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const tx = state.pointer.x * 0.18;
    const ty = state.pointer.y * 0.07;
    group.current.rotation.y += (tx - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (-ty - group.current.rotation.x) * 0.04;
  });
  return <group ref={group}>{children}</group>;
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
  // Model is ~1m tall; scale into scene
  return <primitive object={clone} scale={1.35} position={[0.15, -1.15, 0.35]} rotation={[0, -0.55, 0]} />;
}

function GlassTable() {
  return (
    <group position={[-0.15, -0.55, -0.15]}>
      {/* Glass top */}
      <RoundedBox args={[1.7, 0.05, 0.95]} radius={0.02} smoothness={8} castShadow>
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.35}
          chromaticAberration={0.03}
          anisotropy={0.1}
          distortion={0.05}
          distortionScale={0.15}
          temporalDistortion={0.05}
          iridescence={0.2}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 400]}
          color="#e8eef8"
          roughness={0.08}
          metalness={0.05}
        />
      </RoundedBox>
      {/* Chrome legs */}
      {[
        [-0.7, -0.28, -0.35],
        [0.7, -0.28, -0.35],
        [-0.7, -0.28, 0.35],
        [0.7, -0.28, 0.35],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.55, 24]} />
          <meshPhysicalMaterial color="#c5ccd6" metalness={1} roughness={0.12} clearcoat={1} />
        </mesh>
      ))}
    </group>
  );
}

function FloatingBoard({
  position,
  rotation,
  color,
  size = [0.55, 0.75],
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  size?: [number, number];
}) {
  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.35}>
      <group position={position} rotation={rotation}>
        <RoundedBox args={[size[0], size[1], 0.03]} radius={0.015} smoothness={4} castShadow>
          <meshPhysicalMaterial
            color="#12131a"
            metalness={0.4}
            roughness={0.25}
            clearcoat={0.6}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[size[0] * 0.88, size[1] * 0.88]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.85}
            toneMapped={false}
          />
        </mesh>
        {/* UI bars */}
        {[0.2, 0.05, -0.1, -0.25].map((y, i) => (
          <mesh key={i} position={[0, y * size[1], 0.025]}>
            <planeGeometry args={[size[0] * (0.5 - i * 0.08), 0.035]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.35} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function SculptOrb() {
  return (
    <Float speed={0.9} rotationIntensity={0.15} floatIntensity={0.25}>
      <group position={[1.35, -0.15, -0.55]}>
        <MarblePedestal />
        <mesh position={[0, 0.45, 0]} castShadow>
          <sphereGeometry args={[0.18, 64, 64]} />
          <meshPhysicalMaterial
            color="#dfe5ef"
            metalness={1}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.5}
          />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.22, 64, 64]} />
          <MeshTransmissionMaterial
            samples={4}
            thickness={0.4}
            roughness={0.05}
            chromaticAberration={0.04}
            color="#cfe0ff"
            transmission={0.9}
          />
        </mesh>
      </group>
    </Float>
  );
}

function MarblePedestal() {
  const tex = useMemo(() => {
    const t = new THREE.TextureLoader().load("/textures/pbr/marble_diff.jpg");
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);
  return (
    <mesh castShadow>
      <cylinderGeometry args={[0.18, 0.22, 0.45, 48]} />
      <meshPhysicalMaterial map={tex} metalness={0.08} roughness={0.32} clearcoat={0.5} />
    </mesh>
  );
}

function SoftFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]} receiveShadow>
      <circleGeometry args={[6, 64]} />
      <MeshReflectorMaterial
        blur={[300, 80]}
        resolution={512}
        mixBlur={1}
        mixStrength={0.55}
        roughness={0.85}
        depthScale={0.6}
        minDepthThreshold={0.3}
        maxDepthThreshold={1.2}
        color="#0a0a0c"
        metalness={0.3}
        mirror={0.15}
      />
    </mesh>
  );
}

/**
 * Luxury atelier hero — real CC0 furniture + glass transmission + studio HDRI.
 */
export function HeroScene({ reduced = false }: { reduced?: boolean }) {
  return (
    <>
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 6, 16]} />

      <ambientLight intensity={0.15} />
      <spotLight
        position={[3, 5, 2]}
        angle={0.4}
        penumbra={0.7}
        intensity={2.2}
        color="#fff5eb"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight position={[-3, 3, -1]} angle={0.5} penumbra={0.8} intensity={1.2} color="#93c5fd" />
      <pointLight position={[1.2, 0.8, 0.5]} intensity={0.8} color="#a78bfa" distance={4} />

      <Environment files="/hdri/studio_small_09_1k.hdr" environmentIntensity={0.55} />

      {!reduced && <Stars radius={40} depth={24} count={600} factor={2} fade speed={0.25} />}

      <MouseParallax>
        <group position={[0.4, 0.05, 0]} rotation={[0, -0.25, 0]}>
          <ArmChair />
          <GlassTable />
          {!reduced && (
            <>
              <FloatingBoard
                position={[-1.55, 0.35, -0.4]}
                rotation={[0.15, 0.45, -0.1]}
                color="#6366f1"
              />
              <FloatingBoard
                position={[1.65, 0.55, 0.1]}
                rotation={[-0.1, -0.5, 0.08]}
                color="#14b8a6"
                size={[0.45, 0.6]}
              />
              <FloatingBoard
                position={[-1.2, 0.9, 0.5]}
                rotation={[0.2, 0.25, 0.15]}
                color="#3b82f6"
                size={[0.4, 0.5]}
              />
              <SculptOrb />
            </>
          )}
        </group>
      </MouseParallax>

      <SoftFloor />
      <ContactShadows
        position={[0, -1.14, 0]}
        opacity={0.65}
        scale={12}
        blur={2.5}
        far={4}
        color="#000"
      />

      {!reduced && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.55} intensity={0.55} mipmapBlur />
          <Vignette eskil={false} offset={0.15} darkness={0.55} />
          <SMAA />
        </EffectComposer>
      )}
    </>
  );
}
