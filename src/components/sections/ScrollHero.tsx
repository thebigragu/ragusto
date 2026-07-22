"use client";

import { Button } from "@/components/ui/Button";
import { ContactModal } from "@/components/ui/ContactModal";
import { Magnetic } from "@/components/ui/Magnetic";
import { useHeroMobileVideo, useIsMobile } from "@/hooks/useIsMobile";
import { SITE } from "@/lib/seo";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";

type BeatVariant = {
  /** Orbit arc radius in px during exit */
  orbitR: number;
  radius: string;
  glass: string;
  rim: string;
  edgeGlow: string;
  /** Lighter complementary tint for the 3D thickness faces */
  depthTint: string;
  shimmerAngle: number;
  top: string;
  /**
   * Mobile vertical rest — keep in upper third (left-side beats) or
   * lower third (right-side beats); never the middle band.
   */
  /** Desktop vertical center; mobile band: top | bottom third */
  topMobile: "top" | "bottom";
  /** Glass thickness in px for side edge */
  thickness: number;
};

type Beat = {
  id: string;
  words: { t: string; emph?: boolean }[];
  sub: string;
  subEmph?: string[];
  side: "left" | "right";
  start: number;
  end: number;
  variant: BeatVariant;
};

/**
 * Timed across full scrub so the video finishes before the CTA.
 * Flat glass on hold → true orbital exit up & away.
 */
const BEATS: Beat[] = [
  {
    id: "spark",
    words: [
      { t: "Intelligence," },
      { t: "composed", emph: true },
    ],
    sub: "Where craft meets computation",
    subEmph: ["craft"],
    side: "left",
    start: 0.02,
    end: 0.24,
    variant: {
      orbitR: 720,
      radius: "1.4rem",
      glass: "rgba(38,40,48,0.98)",
      rim: "rgba(255,255,255,0.28)",
      edgeGlow: "rgba(196,165,116,0.55)",
      depthTint: "rgba(232,210,168,0.9)",
      shimmerAngle: 118,
      top: "68%",
      topMobile: "top",
      thickness: 112,
    },
  },
  {
    id: "design",
    words: [
      { t: "AI", emph: true },
      { t: "web design" },
    ],
    sub: "Interfaces that feel inevitable",
    subEmph: ["inevitable"],
    side: "right",
    start: 0.26,
    end: 0.48,
    variant: {
      orbitR: 780,
      radius: "1.15rem",
      glass: "rgba(28,36,44,0.98)",
      rim: "rgba(220,240,250,0.26)",
      edgeGlow: "rgba(160,205,220,0.5)",
      depthTint: "rgba(190,220,232,0.88)",
      shimmerAngle: 62,
      top: "34%",
      topMobile: "bottom",
      thickness: 120,
    },
  },
  {
    id: "apps",
    words: [
      { t: "Apps," },
      { t: "engineered", emph: true },
    ],
    sub: "Products built to ship — and endure",
    subEmph: ["ship"],
    side: "left",
    start: 0.5,
    end: 0.72,
    variant: {
      orbitR: 700,
      radius: "1.7rem",
      glass: "rgba(40,36,32,0.98)",
      rim: "rgba(196,165,116,0.32)",
      edgeGlow: "rgba(196,165,116,0.58)",
      depthTint: "rgba(236,214,178,0.92)",
      shimmerAngle: 108,
      top: "50%",
      topMobile: "top",
      thickness: 108,
    },
  },
  {
    id: "arc",
    words: [
      { t: "From spark" },
      { t: "to shipped", emph: true },
    ],
    sub: "One atelier. End to end.",
    subEmph: ["atelier"],
    side: "right",
    start: 0.74,
    end: 0.96,
    variant: {
      orbitR: 800,
      radius: "1rem",
      glass: "rgba(36,38,44,0.98)",
      rim: "rgba(255,255,255,0.28)",
      edgeGlow: "rgba(240,226,196,0.55)",
      depthTint: "rgba(245,230,200,0.92)",
      shimmerAngle: 72,
      top: "60%",
      topMobile: "bottom",
      thickness: 124,
    },
  },
];

function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

function beatT(p: number, beat: Beat) {
  if (p < beat.start) return 0;
  if (p >= beat.end) return 1;
  return (p - beat.start) / (beat.end - beat.start);
}

function smoothstep(e: number) {
  return e * e * (3 - 2 * e);
}

/** Longer enter/exit windows = slower rise, twist settle & leave */
const ENTER_END = 0.4;
const EXIT_START = 0.7;
const EXIT_LEN = 1 - EXIT_START;

const TYPE_FACE_SILVER = "#faf8f2";
const TYPE_FACE_GOLD = "#f0e2c4";
const TYPE_FACE_SUB = "#ebe6de";

/** Shared extrusion depth (px) for type, gold rim, and pulse bar */
function extrudeDepth(isMobile: boolean) {
  return isMobile ? 5 : 6;
}

/** Opaque 1px stem shadows — continuous solid extrusion, not stacked clones */
function extrudeTextShadow(colors: string[], depth: number) {
  return Array.from({ length: depth }, (_, i) => {
    const n = i + 1;
    const c = colors[Math.min(i, colors.length - 1)];
    // Straight down keeps the baseline locked (no diagonal “fall away”)
    return `0 ${n}px 0 ${c}`;
  }).join(", ");
}

function AsyncWord({
  text,
  emph,
  progress,
  beat,
  index,
  kind,
  isMobile,
}: {
  text: string;
  emph?: boolean;
  progress: MotionValue<number>;
  beat: Beat;
  index: number;
  kind: "title" | "sub";
  isMobile: boolean;
}) {
  const delay = useMemo(() => {
    const base = hashSeed(`${beat.id}-${kind}-${index}-${text}`);
    return 0.03 + base * 0.2;
  }, [beat.id, kind, index, text]);

  const opacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.55) return t / (ENTER_END * 0.55);
    if (t < EXIT_START) return 1;
    const local = (t - EXIT_START) / EXIT_LEN;
    const start = delay;
    const fade = Math.min(1, Math.max(0, (local - start) / 0.28));
    return 1 - fade;
  });

  // Opacity-only exit — no per-word Y/Z/tilt so the line never misaligns
  const depth = extrudeDepth(isMobile);
  const stemColors = emph
    ? ["#2a2016", "#3a2c1c", "#4a3824", "#5c462c", "#6e5636", "#826840"]
    : kind === "sub"
      ? ["#14151a", "#1c1e24", "#262830", "#32353f", "#404450", "#505562"]
      : ["#101114", "#181a20", "#22252c", "#2e323a", "#3c414c", "#505562"];
  const faceColor = emph ? TYPE_FACE_GOLD : kind === "sub" ? TYPE_FACE_SUB : TYPE_FACE_SILVER;
  const faceClass =
    kind === "title" ? (emph ? "font-serif italic" : "font-serif") : "";

  return (
    <motion.span
      style={{
        opacity,
        // Single raised face — extrusion body is continuous text-shadow (no ribbed clones)
        transform: `translateZ(${depth}px)`,
        transformStyle: "preserve-3d",
        color: faceColor,
        textShadow: extrudeTextShadow(stemColors, depth),
        WebkitTextStroke:
          kind === "title" ? "0.3px rgba(10,10,12,0.25)" : "0.15px rgba(10,10,12,0.2)",
        paintOrder: "stroke fill",
      }}
      className={`relative inline-block align-baseline whitespace-nowrap ${faceClass}`}
    >
      {text}
    </motion.span>
  );
}

function BeatCard({
  beat,
  progress,
  isMobile,
}: {
  beat: Beat;
  progress: MotionValue<number>;
  isMobile: boolean;
}) {
  const v = beat.variant;
  // Left panes exit up/right; right panes exit up/left (diagonally opposite)
  const exitDir = beat.side === "left" ? 1 : -1;
  const subTokens = useMemo(() => beat.sub.split(/(\s+)/), [beat.sub]);
  const orbitScale = isMobile ? 0.55 : 1;
  const tiltScale = isMobile ? 0.55 : 1;
  // Elongated prism depth — visible at rest via opposite-side tilt
  const T = Math.max(
    isMobile ? 22 : 32,
    isMobile ? Math.round(v.thickness * 0.42) : Math.round(v.thickness * 0.58),
  );
  const halfT = T / 2;
  const restTop = isMobile ? undefined : v.top;
  const mobileBand = v.topMobile;
  // Near edge (toward hero center) carries the thickness wall
  const depthOnLeft = beat.side === "left";
  const radius = isMobile ? "1.05rem" : v.radius;
  const volSteps = isMobile ? 5 : 8;

  const enterY = useTransform(progress, (p) => {
    // Numeric px only — string units (vh) crash mobile WAAPI via Framer bindings
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const t = beatT(p, beat);
    if (p < beat.start) return isMobile ? 0.7 * vh : 1.1 * vh;
    if (p >= beat.end) return isMobile ? -0.3 * vh : -0.4 * vh;
    if (t < ENTER_END) {
      const eased = smoothstep(t / ENTER_END);
      const from = isMobile ? 0.7 * vh : 1.1 * vh;
      return from - from * eased;
    }
    return 0;
  });

  const opacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.45) return t / (ENTER_END * 0.45);
    if (t > 0.92) return Math.max(0, (1 - t) / 0.08);
    return 1;
  });

  // No CSS filter blur on the card — it paints a rectangular ghost behind rounded corners
  const scale = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0.96;
    const t = beatT(p, beat);
    if (t < ENTER_END) return 0.96 + 0.04 * smoothstep(t / ENTER_END);
    if (t > EXIT_START) {
      const e = smoothstep((t - EXIT_START) / EXIT_LEN);
      return 1 + 0.14 * Math.sin(e * Math.PI) - e * 0.22;
    }
    return 1;
  });

  // At rest: left panes aim right across the hero; right panes aim left —
  // enough yaw that the full-depth side glow is visible.
  // Mobile: rest square-on to the viewer (no yaw/pitch). Desktop keeps opposite-side tilt.
  const restY = isMobile ? 0 : beat.side === "left" ? 22 : -22;
  const restX = isMobile ? 0 : 5;
  const twistAmp = isMobile ? 0 : 34 * tiltScale;

  const orbitX = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.92;
    // Stretch horizontal travel further across the hero on exit
    const xAmp = isMobile ? 1.5 : 1.45;
    return exitDir * v.orbitR * orbitScale * Math.sin(theta) * xAmp;
  });

  const orbitY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.92;
    return -v.orbitR * orbitScale * (1 - Math.cos(theta)) - e * (isMobile ? 160 : 340);
  });

  // Mouse magnetism at rest only (desktop)
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const springMagX = useSpring(magX, { stiffness: 220, damping: 22 });
  const springMagY = useSpring(magY, { stiffness: 220, damping: 22 });
  const cardShellRef = useRef<HTMLDivElement>(null);

  const onCardPointerMove = useCallback(
    (e: MouseEvent) => {
      if (isMobile) return;
      const t = beatT(progress.get(), beat);
      if (t < ENTER_END || t > EXIT_START) {
        magX.set(0);
        magY.set(0);
        return;
      }
      const el = cardShellRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      magX.set(dx * 0.14);
      magY.set(dy * 0.14);
    },
    [beat, isMobile, magX, magY, progress],
  );

  const onCardPointerLeave = useCallback(() => {
    magX.set(0);
    magY.set(0);
  }, [magX, magY]);

  useMotionValueEvent(progress, "change", (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END || t > EXIT_START) {
      magX.set(0);
      magY.set(0);
    }
  });

  const combinedOrbitX = useTransform(
    [orbitX, springMagX],
    ([o, m]) => (o as number) + (m as number),
  );
  const combinedOrbitY = useTransform(
    [orbitY, springMagY],
    ([o, m]) => (o as number) + (m as number),
  );

  const orbitZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    const restZ = isMobile ? 52 : 108;
    if (t < ENTER_END) {
      // Brief push toward camera during the depth-reveal twist
      const u = t / ENTER_END;
      if (u > 0.48 && u < 1) {
        const twistU = (u - 0.48) / 0.52;
        const bump = Math.sin(Math.min(1, twistU) * Math.PI) * (isMobile ? 14 : 22);
        return restZ + bump;
      }
      return restZ;
    }
    if (t <= EXIT_START) return restZ;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.92;
    return restZ - v.orbitR * orbitScale * Math.sin(theta) * 1.05;
  });

  const rotateX = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END) {
      const u = t / ENTER_END;
      const startX = restX + 16 * tiltScale;
      // Longer settle into rest before the slow depth twist
      if (u < 0.48) {
        return startX + (restX - startX) * smoothstep(u / 0.48);
      }
      const twistU = (u - 0.48) / 0.52;
      const lift = Math.sin(Math.min(1, twistU) * Math.PI) * (isMobile ? 5 : 7);
      if (u < 0.78) {
        const e = smoothstep((u - 0.48) / 0.3);
        return restX + lift * e;
      }
      const e = smoothstep((u - 0.78) / 0.22);
      return restX + lift * (1 - e);
    }
    if (t <= EXIT_START) return restX;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    return restX - e * 78 * tiltScale;
  });

  const rotateY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END) {
      const u = t / ENTER_END;
      const startY = restY + exitDir * 22 * tiltScale;
      // Opposite-side peak: reveals the elongated prism edge, then soft-settles
      const peakY = restY + exitDir * twistAmp;
      if (u < 0.48) {
        return startY + (restY - startY) * smoothstep(u / 0.48);
      }
      if (u < 0.78) {
        const e = smoothstep((u - 0.48) / 0.3);
        return restY + (peakY - restY) * e;
      }
      // Soft settle — no hard overshoot snap
      const e = smoothstep((u - 0.78) / 0.22);
      const soft = Math.sin(e * Math.PI) * exitDir * -1.2;
      return peakY + (restY - peakY) * e + soft * (1 - e);
    }
    if (t <= EXIT_START) return restY;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    return restY + exitDir * e * 118 * tiltScale;
  });

  const rotateZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END) {
      const u = t / ENTER_END;
      const startZ = exitDir * -8 * tiltScale;
      if (u < 0.48) return startZ * (1 - smoothstep(u / 0.48));
      const twistU = (u - 0.48) / 0.52;
      return exitDir * Math.sin(Math.min(1, twistU) * Math.PI) * (isMobile ? 4 : 6);
    }
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    return exitDir * e * 42 * tiltScale;
  });

  const orbitTransform = useMotionTemplate`translate3d(${combinedOrbitX}px, ${combinedOrbitY}px, ${orbitZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;

  // Keep content planted on the face — extrusion stacks provide the raise
  const layerBoost = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END) return 0.55 + 0.45 * smoothstep(t / ENTER_END);
    if (t <= EXIT_START) return 1;
    return 1 + smoothstep((t - EXIT_START) / EXIT_LEN) * 1.35;
  });

  const shimmerZ = useTransform(layerBoost, (b) => 1 + 2 * b);
  const shimmerLayerTransform = useMotionTemplate`translateZ(${shimmerZ}px)`;
  const shimmerLayerRef = useRef<HTMLDivElement>(null);

  // Near-flush to the metal face so raised type/rim/bar stay connected
  const contentZ = useTransform(layerBoost, (b) => (isMobile ? 1 : 2) * b);
  const contentRx = useTransform(rotateX, () => 0);
  const contentRy = useTransform(rotateY, () => 0);
  const contentTransform = useMotionTemplate`translateZ(${contentZ}px) rotateX(${contentRx}deg) rotateY(${contentRy}deg)`;

  const extrude = extrudeDepth(isMobile);
  const rimStem = [
    "#4a3a24",
    "#5c4a2e",
    "#6e5a38",
    "#8a7350",
    "#a68558",
    "#c4a574",
    "#e0c898",
  ];
  const barStem = [
    "#4a3a24",
    "#5c4a2e",
    "#7a6340",
    "#8a7350",
    "#a68558",
    "#c4a574",
    "#e8d2a8",
  ];

  const shimmerPos = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    const shimmerEnd = ENTER_END + 0.14;
    if (t < 0.05) return 120;
    if (t > shimmerEnd) return -40;
    return 120 - ((t - 0.05) / (shimmerEnd - 0.05)) * 160;
  });

  const shimmerOpacity = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    const shimmerEnd = ENTER_END + 0.14;
    if (t < 0.05) return 0;
    if (t < ENTER_END * 0.45) return ((t - 0.05) / Math.max(0.01, ENTER_END * 0.45 - 0.05)) * 0.68;
    if (t < ENTER_END) return 0.68;
    if (t < shimmerEnd) return 0.68 * (1 - (t - ENTER_END) / (shimmerEnd - ENTER_END));
    return 0;
  });

  // Wide metallic specular band — kept soft so it reads as sheen, not glare
  const shimmerBackground = useMotionTemplate`linear-gradient(${v.shimmerAngle}deg,
      transparent 0%,
      transparent ${shimmerPos}%,
      rgba(255,255,255,0.04) calc(${shimmerPos}% + 3%),
      rgba(255,252,245,0.38) calc(${shimmerPos}% + 10%),
      rgba(240,226,196,0.28) calc(${shimmerPos}% + 16%),
      rgba(196,165,116,0.18) calc(${shimmerPos}% + 22%),
      rgba(255,255,255,0.08) calc(${shimmerPos}% + 28%),
      transparent calc(${shimmerPos}% + 38%),
      transparent 100%)`;

  // Gradient backgrounds can't go through Framer→WAAPI style binding on mobile
  useMotionValueEvent(shimmerBackground, "change", (bg) => {
    const el = shimmerLayerRef.current;
    if (el) el.style.background = bg;
  });
  useEffect(() => {
    const el = shimmerLayerRef.current;
    if (el) el.style.background = shimmerBackground.get();
  }, [shimmerBackground]);

  const sideClass = isMobile
    ? "left-1/2 origin-center"
    : beat.side === "left"
      ? "left-4 origin-center md:left-10 lg:left-16"
      : "right-4 origin-center md:right-10 lg:right-16";

  // Front face: solid brushed metal — corner sheen mirrors by side (TL ↔ TR)
  const sheenAngle = beat.side === "left" ? 118 : 62;
  const faceWashAngle = beat.side === "left" ? 155 : 205;
  const cornerSheen =
    beat.side === "left"
      ? "radial-gradient(ellipse 58% 48% at 14% 10%, rgba(255,255,255,0.32) 0%, rgba(240,226,196,0.14) 38%, transparent 72%)"
      : "radial-gradient(ellipse 58% 48% at 86% 10%, rgba(255,255,255,0.32) 0%, rgba(240,226,196,0.14) 38%, transparent 72%)";
  const faceMetal = `
    ${cornerSheen},
    linear-gradient(${sheenAngle}deg,
      transparent 0%,
      rgba(255,255,255,0.18) 12%,
      transparent 22%,
      transparent 48%,
      rgba(240,226,196,0.14) 61%,
      transparent 74%),
    linear-gradient(${faceWashAngle}deg,
      rgba(210,205,198,1) 0%,
      rgba(120,118,122,1) 14%,
      ${v.glass} 32%,
      rgba(42,44,50,1) 52%,
      rgba(18,19,22,1) 78%,
      rgba(8,9,11,1) 100%)
  `;
  const faceMetalSheen = `
    linear-gradient(${v.shimmerAngle}deg,
      transparent 0%,
      rgba(255,255,255,0.06) 28%,
      rgba(255,248,230,0.2) 46%,
      rgba(196,165,116,0.14) 52%,
      rgba(255,255,255,0.04) 58%,
      transparent 78%)
  `;

  const faceStyle: CSSProperties = {
    borderRadius: radius,
    border: "none",
    outline: "none",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  const mobilePosStyle: CSSProperties = isMobile
    ? mobileBand === "top"
      ? { top: "max(0.75rem, 8dvh)", bottom: "auto" }
      : { top: "auto", bottom: "max(0.75rem, 10dvh)" }
    : { top: restTop };

  return (
    <motion.div
      ref={cardShellRef}
      className={`pointer-events-auto absolute z-20 will-change-transform ${
        isMobile
          ? "left-1/2 w-[min(88vw,20rem)] max-w-[min(88vw,20rem)]"
          : `max-w-[min(94vw,36rem)] -translate-y-1/2 ${sideClass}`
      }`}
      style={{
        ...mobilePosStyle,
        x: isMobile ? "-50%" : 0,
        opacity,
        y: enterY,
        scale,
        perspective: isMobile ? 980 : 1500,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={onCardPointerMove}
      onMouseLeave={onCardPointerLeave}
    >
      <motion.div
        className="relative"
        style={{ transform: orbitTransform, transformStyle: "preserve-3d" }}
      >
        {/*
          Prism: soft rear plate + rectangular volume glow filling the slab
          between rear and front (not a 2D side wall).
        */}
        <div className="relative" style={{ transformStyle: "preserve-3d" }}>
          {/* Rear face — restored soft glow plate */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: radius,
              transform: `translateZ(${-halfT}px)`,
              background: `
                radial-gradient(ellipse 70% 55% at 50% 45%, rgba(255,248,230,0.35) 0%, ${v.depthTint} 32%, rgba(196,165,116,0.28) 58%, rgba(20,20,24,0.55) 100%),
                linear-gradient(180deg, rgba(240,226,196,0.22) 0%, rgba(40,38,42,0.65) 100%)
              `,
              boxShadow: `
                inset 0 0 0 1px rgba(240,226,196,0.28),
                0 0 28px ${v.edgeGlow},
                0 0 48px rgba(196,165,116,0.22)
              `,
              opacity: 0.9,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          />

          {/*
            Volume aura — full-card rectangles stacked through Z so the glow
            fills the entire prism volume between rear and front panes.
          */}
          {Array.from({ length: volSteps }, (_, i) => {
            const t = (i + 1) / (volSteps + 1);
            const z = -halfT + t * T;
            // Slightly brighter toward the middle of the slab
            const mid = 1 - Math.abs(t - 0.5) * 1.4;
            return (
              <div
                key={`vol-${i}`}
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  borderRadius: radius,
                  transform: `translateZ(${z}px)`,
                  background: `
                    radial-gradient(ellipse 85% 75% at 50% 48%, rgba(255,248,230,${0.2 + mid * 0.16}) 0%, ${v.depthTint} 38%, rgba(196,165,116,${0.22 + mid * 0.18}) 68%, rgba(196,165,116,0.06) 100%)
                  `,
                  boxShadow: `
                    inset 0 0 0 1px rgba(240,226,196,${0.12 + mid * 0.12}),
                    0 0 ${18 + mid * 16}px ${v.edgeGlow}
                  `,
                  opacity: 0.42 + mid * 0.28,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              />
            );
          })}

          <div
            className="relative"
            style={{
              borderRadius: radius,
              transform: `translateZ(${halfT}px)`,
              transformStyle: "preserve-3d",
            }}
          >

          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              ...faceStyle,
              background: faceMetal,
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.32),
                inset 0 -1px 0 rgba(0,0,0,0.5),
                inset 18px 0 28px -18px rgba(255,248,230,0.08),
                inset -18px 0 28px -18px rgba(0,0,0,0.35),
                0 0 0 1px ${v.rim},
                ${depthOnLeft ? "6px" : "-6px"} 10px 22px rgba(0,0,0,0.32),
                0 18px 36px rgba(0,0,0,0.26)
              `,
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: radius,
              background: faceMetalSheen,
              opacity: 0.42,
            }}
          />

          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: radius,
              transformStyle: "preserve-3d",
            }}
            animate={{ opacity: [0.82, 1, 0.82] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Gold rim extrusion — same depth as type + bar, solid 1px plates */}
            {rimStem.slice(0, extrude).map((color, i) => (
              <div
                key={i}
                className="absolute inset-0"
                style={{
                  borderRadius: radius,
                  transform: `translateZ(${i}px)`,
                  boxShadow: `inset 0 0 0 3px ${color}`,
                }}
              />
            ))}
            {/* Bright top face of the rim */}
            <div
              className="absolute inset-0"
              style={{
                borderRadius: radius,
                transform: `translateZ(${extrude}px)`,
                boxShadow: `
                  inset 0 1px 0 rgba(255,248,230,0.55),
                  inset 0 0 0 3px #f0e2c4
                `,
              }}
            />
          </motion.div>

          <motion.div
            ref={shimmerLayerRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              opacity: shimmerOpacity,
              borderRadius: radius,
              transform: shimmerLayerTransform,
              transformStyle: "preserve-3d",
            }}
          />

            <motion.div
              className="relative px-5 py-5 text-center sm:px-8 sm:py-7 md:px-10 md:py-10"
              style={{
                borderRadius: radius,
                transform: contentTransform,
                transformStyle: "preserve-3d",
              }}
            >
              <p
                className="mx-auto max-w-full text-balance text-center font-serif text-[calc(1.34rem+0.5pt)] font-[500] leading-snug tracking-normal text-[#faf8f2] sm:text-[calc(1.92rem+0.5pt)] sm:leading-snug md:text-[calc(2.39rem+0.5pt)] md:leading-[1.25]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {beat.words.map((w, i) => (
                  <span key={`${w.t}-${i}`} className="inline">
                    {i > 0 ? " " : null}
                    <AsyncWord
                      text={w.t}
                      emph={w.emph}
                      progress={progress}
                      beat={beat}
                      index={i}
                      kind="title"
                      isMobile={isMobile}
                    />
                  </span>
                ))}
              </p>
              <p
                className="mx-auto mt-3 max-w-full text-pretty text-center text-[calc(0.69rem+0.5pt)] font-[500] leading-relaxed tracking-[0.08em] text-[#ebe6de] uppercase sm:mt-5 sm:text-[calc(0.92rem+0.5pt)] sm:tracking-[0.1em] md:mt-6 md:text-[calc(0.94rem+0.5pt)] md:tracking-[0.12em]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {subTokens.map((part, i) => {
                  if (/^\s+$/.test(part)) return <span key={i}>{part}</span>;
                  const clean = part.replace(/[.—,]/g, "");
                  const emph = beat.subEmph?.some(
                    (e) => clean.toLowerCase() === e.toLowerCase(),
                  );
                  return (
                    <AsyncWord
                      key={`${part}-${i}`}
                      text={part}
                      emph={emph}
                      progress={progress}
                      beat={beat}
                      index={i + 10}
                      kind="sub"
                      isMobile={isMobile}
                    />
                  );
                })}
              </p>

              {/* Gold underline — extruded bead planted on the face */}
              <div
                className="relative mx-auto mt-4 h-[3px] w-[min(100%,12rem)] sm:mt-6 sm:w-[min(100%,16rem)] md:mt-7"
                style={{ transformStyle: "preserve-3d" }}
              >
                {barStem.slice(0, extrude).map((color, i) => (
                  <div
                    key={i}
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{
                      transform: `translateZ(${i}px)`,
                      background: color,
                    }}
                  />
                ))}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    transform: `translateZ(${extrude}px)`,
                    background: "#f0e2c4",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <motion.span
                    className="absolute inset-0 block origin-center rounded-full bg-gradient-to-r from-[#8a7350] via-[#f0e2c4] to-[#c4a574]"
                    animate={{
                      scaleX: [0.18, 1, 0.18],
                      opacity: [0.75, 1, 0.75],
                    }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ScrollCue({
  progress,
  scrollProgress,
  isMobile,
}: {
  progress: MotionValue<number>;
  scrollProgress: MotionValue<number>;
  isMobile: boolean;
}) {
  const opacity = useTransform(progress, [0, 0.82, 0.95, 1], [1, 1, 0.35, 0.1]);

  // Desktop: mid-right → bottom-right.
  // Mobile: horizontal center, upper-third → bottom-right.
  const left = useTransform(scrollProgress, [0, 0.16], isMobile ? [50, 92] : [91, 94]);
  const top = useTransform(scrollProgress, [0, 0.16], isMobile ? [24, 88] : [48, 90]);
  const cueRef = useRef<HTMLDivElement>(null);
  const anchorX = useTransform(scrollProgress, [0, 0.16], [-50, -100]);
  const anchorY = useTransform(scrollProgress, [0, 0.16], [-50, -100]);
  const scale = useTransform(scrollProgress, [0, 0.16], isMobile ? [1.12, 0.85] : [1.35, 1]);
  const cueTransform = useMotionTemplate`translate(${anchorX}%, ${anchorY}%) scale(${scale})`;

  useMotionValueEvent(left, "change", (v) => {
    if (cueRef.current) cueRef.current.style.left = `${v}%`;
  });
  useMotionValueEvent(top, "change", (v) => {
    if (cueRef.current) cueRef.current.style.top = `${v}%`;
  });
  useEffect(() => {
    if (!cueRef.current) return;
    cueRef.current.style.left = `${left.get()}%`;
    cueRef.current.style.top = `${top.get()}%`;
  }, [left, top]);

  return (
    <motion.div
      ref={cueRef}
      className="pointer-events-none absolute z-40"
      style={{
        opacity,
        transform: cueTransform,
      }}
      aria-hidden
    >
      <motion.div
        className="flex flex-col items-center gap-2 md:gap-3"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[9px] font-medium tracking-[0.36em] text-[#e8d5b0] uppercase drop-shadow-[0_0_12px_rgba(196,165,116,0.55)] md:text-xs md:tracking-[0.42em]">
          Scroll
        </span>

        <div className="relative">
          <motion.div
            className="absolute -inset-2 rounded-full bg-[#c4a574]/25 blur-md md:-inset-3"
            animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.92, 1.08, 0.92] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative flex h-11 w-6 items-start justify-center rounded-full border-2 border-[#c4a574]/70 bg-black/45 p-1.5 shadow-[0_0_28px_rgba(196,165,116,0.45),inset_0_0_18px_rgba(196,165,116,0.12)] backdrop-blur-md md:h-[4.5rem] md:w-10 md:p-2"
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span
              className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#f0e2c4] shadow-[0_0_16px_rgba(240,226,196,0.95)] md:h-3 md:w-3"
              animate={{ y: [0, isMobile ? 14 : 26, 0], opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        <motion.div
          className="flex flex-col items-center gap-0.5 text-[#c4a574]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="12" height="8" viewBox="0 0 14 10" fill="none" aria-hidden className="md:h-[10px] md:w-[14px]">
            <path
              d="M1 1.5L7 7.5L13 1.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            width="12"
            height="8"
            viewBox="0 0 14 10"
            fill="none"
            className="-mt-1 opacity-55 md:-mt-1.5 md:h-[10px] md:w-[14px]"
            aria-hidden
          >
            <path
              d="M1 1.5L7 7.5L13 1.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** First 9s map to most of scrub; last second shares scroll with contact reveal. */
const VIDEO_HANDOFF = 0.9;
const SCRUB_HANDOFF_START = 0.78;

export function ScrollHero() {
  const scrubRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTime = useRef(0);
  const rafRef = useRef(0);
  const fpsRef = useRef(24);
  const lastFrameIndex = useRef(-1);
  const [contactOpen, setContactOpen] = useState(false);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const isMobile = useIsMobile();
  const useMobileVideo = useHeroMobileVideo();
  const videoSrc = useMobileVideo
    ? "/videos/hero-kling-mobile.mp4"
    : "/videos/hero-kling.mp4";

  const { scrollYProgress } = useScroll({
    target: scrubRef,
    offset: ["start start", "end end"],
  });

  // Layout polish only — keep this off the video path so frames aren't lagged/bunched
  const sprungProgress = useSpring(scrollYProgress, {
    stiffness: isMobile ? 280 : 200,
    damping: isMobile ? 36 : 34,
    mass: isMobile ? 0.1 : 0.14,
    restDelta: 0.00005,
    restSpeed: 0.00005,
  });
  const driveProgress = isMobile ? scrollYProgress : sprungProgress;

  // Video scrub tracks scroll directly on mobile (no soft spring lag)
  const videoProgressRaw = useTransform(driveProgress, (p) => {
    if (p <= SCRUB_HANDOFF_START) {
      return (p / SCRUB_HANDOFF_START) * VIDEO_HANDOFF;
    }
    const handoff = (p - SCRUB_HANDOFF_START) / (1 - SCRUB_HANDOFF_START);
    return VIDEO_HANDOFF + handoff * (1 - VIDEO_HANDOFF);
  });
  const videoProgressSmooth = useSpring(videoProgressRaw, {
    stiffness: 380,
    damping: 42,
    mass: 0.08,
    restDelta: 0.00001,
    restSpeed: 0.00001,
  });
  const videoProgress = isMobile ? videoProgressRaw : videoProgressSmooth;

  // Hero lifts only ~halfway — remaining lower frame stays visible under contact
  // Numeric px — percentage strings crash mobile Chromium WAAPI
  const stickyLift = useTransform(driveProgress, (p) => {
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const a = SCRUB_HANDOFF_START;
    const b = SCRUB_HANDOFF_START + 0.12;
    if (p <= a) return 0;
    if (p >= 1) return -0.5 * vh;
    if (p <= b) {
      const t = smoothstep((p - a) / (b - a));
      return -0.28 * vh * t;
    }
    const t = smoothstep((p - b) / (1 - b));
    return (-0.28 + (-0.5 + 0.28) * t) * vh;
  });
  // Dark join wash — taller + denser so contact copy sits on a dark field
  // Input offsets MUST be strictly increasing (mobile WAAPI crashes otherwise)
  const featherOpacity = useTransform(
    driveProgress,
    [
      SCRUB_HANDOFF_START + 0.06,
      SCRUB_HANDOFF_START + 0.12,
      0.92,
      0.96,
      1,
    ],
    [0, 0.08, 0.22, 0.48, 0.58],
  );
  // Mask dissolves only the tip at first, then slowly opens — no hard step
  const heroMask = useTransform(
    driveProgress,
    [
      0,
      SCRUB_HANDOFF_START + 0.04,
      SCRUB_HANDOFF_START + 0.1,
      SCRUB_HANDOFF_START + 0.16,
      SCRUB_HANDOFF_START + 0.2,
      1,
    ],
    [
      "linear-gradient(to bottom, #000 0%, #000 100%, #000 100%, #000 100%, #000 100%, #000 100%)",
      "linear-gradient(to bottom, #000 0%, #000 100%, #000 100%, #000 100%, #000 100%, #000 100%)",
      "linear-gradient(to bottom, #000 0%, #000 90%, rgba(0,0,0,0.96) 95%, rgba(0,0,0,0.7) 98%, rgba(0,0,0,0.25) 100%, transparent 100%)",
      "linear-gradient(to bottom, #000 0%, #000 78%, rgba(0,0,0,0.92) 88%, rgba(0,0,0,0.55) 95%, rgba(0,0,0,0.18) 99%, transparent 100%)",
      "linear-gradient(to bottom, #000 0%, #000 62%, rgba(0,0,0,0.88) 76%, rgba(0,0,0,0.48) 88%, rgba(0,0,0,0.14) 96%, transparent 100%)",
      "linear-gradient(to bottom, #000 0%, #000 50%, rgba(0,0,0,0.82) 68%, rgba(0,0,0,0.4) 82%, rgba(0,0,0,0.1) 94%, transparent 100%)",
    ],
  );
  const videoFade = useTransform(
    driveProgress,
    [SCRUB_HANDOFF_START + 0.08, SCRUB_HANDOFF_START + 0.2, 1],
    [1, 0.92, 0.8],
  );
  // Contact parallax: rises into the lower half only (never into the upper hero band)
  // Mobile settles a bit higher so copy sits nearer mid-viewport
  const contactParallax = useTransform(driveProgress, (p) => {
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const a = SCRUB_HANDOFF_START;
    const b = SCRUB_HANDOFF_START + 0.14;
    const from = (isMobile ? 0.36 : 0.42) * vh;
    const mid = (isMobile ? 0.04 : 0.1) * vh;
    const to = (isMobile ? -0.08 : 0) * vh;
    if (p <= a) return from;
    if (p >= 1) return to;
    if (p <= b) {
      const t = smoothstep((p - a) / (b - a));
      return from + (mid - from) * t;
    }
    const t = smoothstep((p - b) / (1 - b));
    return mid + (to - mid) * t;
  });
  const contactOpacity = useTransform(
    driveProgress,
    [SCRUB_HANDOFF_START, SCRUB_HANDOFF_START + 0.12, SCRUB_HANDOFF_START + 0.2, 1],
    [0, 0.45, 1, 1],
  );
  // Contact dark backdrop fades separately — slower than the copy
  const contactBgOpacity = useTransform(
    driveProgress,
    [
      SCRUB_HANDOFF_START + 0.06,
      SCRUB_HANDOFF_START + 0.14,
      SCRUB_HANDOFF_START + 0.2,
      1,
    ],
    [0, 0.3, 0.7, 1],
  );

  const heroFrameRef = useRef<HTMLDivElement>(null);
  // mask-image gradients crash mobile WAAPI when bound as MotionValues
  useMotionValueEvent(heroMask, "change", (mask) => {
    const el = heroFrameRef.current;
    if (!el) return;
    el.style.maskImage = mask;
    el.style.webkitMaskImage = mask;
  });
  useEffect(() => {
    const el = heroFrameRef.current;
    if (!el) return;
    const mask = heroMask.get();
    el.style.maskImage = mask;
    el.style.webkitMaskImage = mask;
  }, [heroMask]);

  useMotionValueEvent(videoProgress, "change", (p) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    targetTime.current = Math.min(video.duration - 0.001, Math.max(0, p) * video.duration);
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    try {
      video.disableRemotePlayback = true;
    } catch {
      /* ignore */
    }

    /**
     * Both desktop + mobile assets are 24fps all-intra H.264 — every frame is a
     * keyframe. Mobile allows a few frames per tick so flicks stay responsive
     * without hard-skipping the whole scrub.
     */
    const applyTime = (t: number) => {
      const v = videoRef.current;
      if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return;

      const fps = fpsRef.current;
      const maxFrame = Math.max(0, Math.round(v.duration * fps) - 1);
      const targetFrame = Math.min(maxFrame, Math.max(0, Math.round(t * fps)));

      let frameIndex = targetFrame;
      const prev = lastFrameIndex.current;
      if (prev >= 0 && isMobile) {
        const delta = targetFrame - prev;
        const maxStep = 3;
        if (Math.abs(delta) > maxStep) {
          frameIndex = prev + Math.sign(delta) * maxStep;
        }
      }

      if (frameIndex === lastFrameIndex.current) return;
      lastFrameIndex.current = frameIndex;

      const framed = Math.min(v.duration - 0.001, frameIndex / fps);
      try {
        v.currentTime = framed;
      } catch {
        /* ignore */
      }
    };

    const detectFps = () => {
      const d = video.duration;
      if (!(d > 0)) return;
      // Prefer exact 24fps when duration aligns (hero-kling*), else 30, else 24 fallback
      if (Math.abs(d * 24 - Math.round(d * 24)) < 0.08) {
        fpsRef.current = 24;
      } else if (Math.abs(d * 30 - Math.round(d * 30)) < 0.08) {
        fpsRef.current = 30;
      } else {
        fpsRef.current = 24;
      }
    };

    const onMeta = () => {
      detectFps();
      lastFrameIndex.current = -1;
      const t = Math.min(
        video.duration - 0.001,
        Math.max(0, videoProgress.get()) * video.duration,
      );
      targetTime.current = t;
      applyTime(t);
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

    // Commit at display refresh — one seek per changed frame index
    const tick = () => {
      applyTime(targetTime.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      cancelAnimationFrame(rafRef.current);
      lastFrameIndex.current = -1;
    };
  }, [videoProgress, videoSrc, isMobile]);

  return (
    <>
      <div className="pointer-events-auto fixed top-8 left-7 z-50 sm:top-8 sm:left-8 md:top-14 md:left-14">
        <div className="relative inline-flex items-center justify-center">
          {/* Outer breath — teal to match logo R (#1a5b68) */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-[170%] w-[190%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl md:h-[200%] md:w-[220%] md:blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse 58% 52% at 50% 45%, rgba(26,91,104,0.75) 0%, rgba(26,91,104,0.38) 32%, rgba(42,122,140,0.14) 52%, transparent 72%)",
            }}
            animate={{
              opacity: [0.55, 1, 0.55],
              scale: [0.92, 1.12, 0.92],
            }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Mid breath — cooler core */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[40%] -z-10 h-[130%] w-[145%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl md:h-[150%] md:w-[165%] md:blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(42,122,140,0.7) 0%, rgba(26,91,104,0.4) 38%, rgba(26,91,104,0.12) 62%, transparent 76%)",
            }}
            animate={{
              opacity: [0.5, 0.95, 0.5],
              scale: [0.96, 1.08, 0.96],
            }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
          />
          {/* Inner pulse — tight halo on the emblem */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[90%] w-[105%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-lg md:h-[95%] md:w-[110%] md:blur-xl"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(58,140,155,0.55) 0%, rgba(26,91,104,0.32) 45%, transparent 70%)",
            }}
            animate={{
              opacity: [0.45, 0.9, 0.45],
              scale: [1, 1.06, 1],
            }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
          <Image
            src="/brand/ragusto-logo.png"
            alt="Ragusto"
            width={220}
            height={260}
            priority
            className="relative h-12 w-auto opacity-95 transition duration-500 hover:brightness-125 sm:h-16 md:h-[5.25rem] lg:h-24"
          />
        </div>
      </div>

      <section ref={scrubRef} className="relative h-[620vh] bg-transparent md:h-[680vh]">
        <div className="sticky top-0 z-20 h-[100dvh] w-full overflow-hidden bg-transparent">
          <motion.div
            ref={heroFrameRef}
            className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#08090b] will-change-transform"
            style={{
              y: stickyLift,
            }}
          >
            <motion.video
              key={videoSrc}
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-center will-change-[opacity]"
              src={videoSrc}
              muted
              playsInline
              preload={isMobile ? "metadata" : "auto"}
              aria-hidden
              style={{ opacity: videoFade }}
            />

            {BEATS.map((beat) => (
              <BeatCard
                key={beat.id}
                beat={beat}
                progress={videoProgress}
                isMobile={isMobile}
              />
            ))}

            <ScrollCue
              progress={videoProgress}
              scrollProgress={driveProgress}
              isMobile={isMobile}
            />

            {/* Soft darkening toward the join — taller field behind contact / Begin */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[49%] md:h-[74%]"
              style={{
                opacity: featherOpacity,
                background:
                  "linear-gradient(to bottom, transparent 0%, transparent 10%, rgba(8,9,11,0.06) 24%, rgba(8,9,11,0.2) 42%, rgba(8,9,11,0.45) 58%, rgba(8,9,11,0.7) 76%, rgba(8,9,11,0.88) 90%, rgba(8,9,11,0.96) 100%)",
              }}
            />
          </motion.div>

          {/*
            Contact lives inside the sticky frame so it can only rise into the lower
            half over the remaining ~50% hero — same on mobile and desktop. Scroll
            ends with the scrub, so contact can’t keep climbing and leave a gap
            under the CTA.
          */}
          <motion.div
            id="contact"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex max-h-[78dvh] flex-col justify-center px-5 pb-10 pt-4 md:max-h-[58dvh] md:justify-end md:px-6 md:pb-12 md:pt-0"
            style={{ y: contactParallax, opacity: contactOpacity }}
          >
            {/* Tall dark backdrop — solid field behind Begin / headline */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 bottom-0 top-0"
              style={{
                opacity: contactBgOpacity,
                background:
                  "linear-gradient(to bottom, transparent 0%, transparent 8%, rgba(8,9,11,0.12) 22%, rgba(8,9,11,0.45) 38%, rgba(8,9,11,0.78) 52%, #08090b 68%, #08090b 100%)",
              }}
            />
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 h-full"
              style={{
                opacity: contactBgOpacity,
                background:
                  "radial-gradient(ellipse 100% 50% at 50% 35%, rgba(196,165,116,0.07) 0%, rgba(196,165,116,0.02) 45%, transparent 70%)",
              }}
            />

            <div className="pointer-events-auto relative mx-auto w-full max-w-3xl pb-1 text-center md:pb-2">
              <p className="text-[10.5pt] tracking-[0.28em] text-[#c4a574]/90 uppercase md:text-[13pt]">
                Begin
              </p>
              <h2 className="mt-3 font-serif text-[1.85rem] leading-tight tracking-tight text-white sm:text-4xl md:mt-4 md:text-6xl lg:text-7xl">
                Ready to build something{" "}
                <span className="inline-block bg-gradient-to-br from-[#f0e2c4] via-[#c4a574] to-[#8a7350] bg-clip-text pe-[0.28em] pb-[0.08em] italic text-transparent">
                  exceptional
                </span>
                ?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-white/60 md:mt-5 md:text-lg">
                {SITE.description.split(" ").map((word, i, arr) => {
                  const clean = word.replace(/[.,]/g, "");
                  const emph = ["cinematic", "atelier-level", "craft"].includes(clean);
                  return (
                    <span key={`${word}-${i}`}>
                      {emph ? <span className="text-[#c4a574]">{word}</span> : word}
                      {i < arr.length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </p>

              <div className="mt-6 flex justify-center md:mt-8">
                <Magnetic>
                  <Button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="bg-[#c4a574] text-base text-[#0c0c0e] hover:bg-[#d4b888] hover:text-[#0c0c0e] md:text-lg"
                  >
                    Get in touch
                  </Button>
                </Magnetic>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <ContactModal open={contactOpen} onClose={closeContact} />
    </>
  );
}
