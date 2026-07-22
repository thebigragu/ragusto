"use client";

import { Button } from "@/components/ui/Button";
import { ContactModal } from "@/components/ui/ContactModal";
import { Magnetic } from "@/components/ui/Magnetic";
import { useHeroMobileVideo, useIsMobile, useResponsiveBubbleScale } from "@/hooks/useIsMobile";
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
      orbitR: 720,
      radius: "1.15rem",
      glass: "rgba(34,36,42,0.98)",
      rim: "rgba(255,255,255,0.28)",
      edgeGlow: "rgba(196,165,116,0.55)",
      depthTint: "rgba(232,210,168,0.9)",
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
      orbitR: 720,
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
      orbitR: 720,
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

const TYPE_FACE_SILVER = "#ffffff";
/** Brand accent gold — solid, not cream-washed */
const TYPE_FACE_GOLD = "#c4a574";
const TYPE_FACE_SUB = "#ffffff";
/** Hard 1px stem only — keeps glyphs sharp (no soft glow wash) */
const TYPE_FACE_EDGE = "0 1px 0 rgba(0,0,0,0.78)";

/** Deeper chrome extrusion for gold rim + pulse bar */
function chromeExtrudeDepth(isMobile: boolean) {
  return isMobile ? 11 : 14;
}

function AsyncWord({
  text,
  emph,
  progress,
  beat,
  index,
  kind,
}: {
  text: string;
  emph?: boolean;
  progress: MotionValue<number>;
  beat: Beat;
  index: number;
  kind: "title" | "sub";
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

  const faceColor = emph ? TYPE_FACE_GOLD : kind === "sub" ? TYPE_FACE_SUB : TYPE_FACE_SILVER;
  const faceClass =
    kind === "title" ? (emph ? "font-serif italic" : "font-serif") : "";

  return (
    <motion.span
      style={{
        opacity,
        color: faceColor,
        textShadow: TYPE_FACE_EDGE,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "geometricPrecision",
        fontWeight: kind === "title" ? 700 : 650,
        letterSpacing: kind === "sub" ? undefined : "0.01em",
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
  const layoutScale = useResponsiveBubbleScale(isMobile);
  // Elongated prism depth — visible at rest via opposite-side tilt
  const T = Math.max(
    isMobile ? 22 : 32,
    isMobile ? Math.round(v.thickness * 0.42) : Math.round(v.thickness * 0.58),
  );
  const halfT = T / 2;
  const restTop = isMobile ? undefined : v.top;
  const mobileBand = v.topMobile;
  const radius = isMobile ? "1.05rem" : v.radius;

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
  const scrollScale = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0.96;
    const t = beatT(p, beat);
    if (t < ENTER_END) return 0.96 + 0.04 * smoothstep(t / ENTER_END);
    if (t > EXIT_START) {
      const e = smoothstep((t - EXIT_START) / EXIT_LEN);
      return 1 + 0.14 * Math.sin(e * Math.PI) - e * 0.22;
    }
    return 1;
  });
  const layoutScaleMv = useMotionValue(layoutScale);
  useEffect(() => {
    layoutScaleMv.set(layoutScale);
  }, [layoutScale, layoutScaleMv]);
  const scale = useTransform(
    [scrollScale, layoutScaleMv],
    ([s, l]) => (s as number) * (l as number),
  );

  // Mobile: pitch only (no left/right yaw). Top band tips down, bottom tips up.
  // Desktop: yaw toward hero center so prism thickness reads between panes.
  const restY = isMobile
    ? 0
    : beat.side === "left"
      ? 22
      : -22;
  // Top → down, bottom → up (signs verified against live mobile tilt)
  const restX = isMobile ? (mobileBand === "top" ? -16 : 16) : 0;
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

  // Mouse magnetism while the bubble is on screen (enter, rest, and exit)
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const springMagX = useSpring(magX, { stiffness: 220, damping: 22 });
  const springMagY = useSpring(magY, { stiffness: 220, damping: 22 });
  const cardShellRef = useRef<HTMLDivElement>(null);

  const onCardPointerMove = useCallback(
    (e: MouseEvent) => {
      if (isMobile) return;
      const p = progress.get();
      if (p < beat.start || p >= beat.end) {
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
    [beat.end, beat.start, isMobile, magX, magY, progress],
  );

  const onCardPointerLeave = useCallback(() => {
    magX.set(0);
    magY.set(0);
  }, [magX, magY]);

  useMotionValueEvent(progress, "change", (p) => {
    if (p < beat.start || p >= beat.end) {
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
    return restX - e * 52 * tiltScale;
  });

  const rotateY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    // Mobile stays square on yaw — pitch (rotateX) carries the up/down tip only
    if (isMobile) {
      if (t <= EXIT_START) return 0;
      const e = smoothstep((t - EXIT_START) / EXIT_LEN);
      return exitDir * e * 72 * tiltScale;
    }
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
    // Shared exit yaw for every beat — keeps left/right exits matched
    return restY + exitDir * e * 72 * tiltScale;
  });

  const rotateZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    // No roll on mobile — keeps faces square left↔right
    if (isMobile) {
      if (t <= EXIT_START) return 0;
      const e = smoothstep((t - EXIT_START) / EXIT_LEN);
      return exitDir * e * 28 * tiltScale;
    }
    if (t < ENTER_END) {
      const u = t / ENTER_END;
      const startZ = exitDir * -8 * tiltScale;
      if (u < 0.48) return startZ * (1 - smoothstep(u / 0.48));
      const twistU = (u - 0.48) / 0.52;
      return exitDir * Math.sin(Math.min(1, twistU) * Math.PI) * 6;
    }
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    return exitDir * e * 28 * tiltScale;
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

  const chromeExtrude = chromeExtrudeDepth(isMobile);
  const rimStem = [
    "#3a2e1c",
    "#4a3a24",
    "#5c4a2e",
    "#6e5a38",
    "#8a7350",
    "#9a8058",
    "#a68558",
    "#b8956a",
    "#c4a574",
    "#d4b888",
    "#e0c898",
    "#e8d2a8",
    "#f0e2c4",
    "#f5ead0",
  ];
  const barStem = [
    "#3a2e1c",
    "#4a3a24",
    "#5c4a2e",
    "#6e5a38",
    "#7a6340",
    "#8a7350",
    "#9a8058",
    "#a68558",
    "#b8956a",
    "#c4a574",
    "#d4b888",
    "#e0c898",
    "#e8d2a8",
    "#f0e2c4",
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
      ? "left-5 origin-center md:left-8 lg:left-10 xl:left-12"
      : "right-5 origin-center md:right-8 lg:right-10 xl:right-12";

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

  // Equal inset from hero top/bottom; large enough to clear the fixed logo
  const mobileEdgeInset = "max(6.75rem, 12dvh)";
  const mobilePosStyle: CSSProperties = isMobile
    ? mobileBand === "top"
      ? { top: mobileEdgeInset, bottom: "auto" }
      : { top: "auto", bottom: mobileEdgeInset }
    : { top: restTop };

  return (
    <motion.div
      ref={cardShellRef}
      className={`pointer-events-auto absolute z-20 will-change-transform ${
        isMobile
          ? "left-1/2 w-[min(88vw,clamp(16rem,72vw,22rem))] max-w-[min(88vw,clamp(16rem,72vw,22rem))]"
          : `w-[min(90vw,34rem)] max-w-[min(90vw,34rem)] -translate-y-1/2 ${sideClass}`
      }`}
      style={{
        ...mobilePosStyle,
        x: isMobile ? "-50%" : 0,
        opacity,
        y: enterY,
        scale,
        perspective: isMobile ? 1400 : 1600,
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
          Prism: rear + volume same footprint as the front face. Gold fill lives
          only in the Z gap between panes so tilt shows thickness — no outer spill.
        */}
        <div className="relative" style={{ transformStyle: "preserve-3d" }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: radius,
              transform: `translateZ(${-halfT}px)`,
              background: faceMetal,
              opacity: 1,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          />

          {Array.from({ length: Math.max(10, Math.round(T)) }, (_, i) => {
            const count = Math.max(10, Math.round(T));
            const t = (i + 0.5) / count; // 0 = rear, 1 = front
            const z = -halfT + t * T;
            return (
              <div
                key={`vol-${i}`}
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  borderRadius: radius,
                  transform: `translateZ(${z}px)`,
                  background: v.depthTint,
                  opacity: 0.1,
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
                0 14px 28px rgba(0,0,0,0.28)
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
            {/* Gold rim — thicker, brighter, deeper extrusion */}
            {rimStem.slice(0, chromeExtrude).map((color, i) => (
              <div
                key={i}
                className="absolute inset-0"
                style={{
                  borderRadius: radius,
                  transform: `translateZ(${i}px)`,
                  boxShadow: `inset 0 0 0 4px ${color}`,
                }}
              />
            ))}
            {/* Bright top face of the rim */}
            <div
              className="absolute inset-0"
              style={{
                borderRadius: radius,
                transform: `translateZ(${chromeExtrude}px)`,
                boxShadow: `
                  inset 0 1px 0 rgba(255,248,230,0.85),
                  inset 0 0 0 4px #f8efd4
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
              className="relative z-10 px-5 py-5 text-center sm:px-8 sm:py-7 md:px-10 md:py-8"
              style={{
                borderRadius: radius,
                transform: contentTransform,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <p
                className="mx-auto max-w-full text-center font-serif text-[clamp(1.15rem,0.7rem+1.4vw,2.35rem)] font-bold leading-tight tracking-normal text-white"
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
                    />
                  </span>
                ))}
              </p>
              <p
                className="mx-auto mt-2 max-w-full whitespace-nowrap text-center text-[clamp(0.58rem,0.42rem+0.55vw,0.86rem)] font-semibold leading-none tracking-[0.06em] text-white uppercase sm:mt-3 sm:tracking-[0.08em] md:mt-3.5 md:tracking-[0.09em]"
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
                    />
                  );
                })}
              </p>

              {/* Gold underline — thicker extruded bead */}
              <div
                className="relative mx-auto mt-3 h-[4px] w-[min(100%,14rem)] sm:mt-4 sm:h-[5px] sm:w-[min(100%,18rem)] md:mt-5"
                style={{ transformStyle: "preserve-3d" }}
              >
                {barStem.slice(0, chromeExtrude).map((color, i) => (
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
                    transform: `translateZ(${chromeExtrude}px)`,
                    background: "#f5ead0",
                    transformStyle: "preserve-3d",
                    boxShadow: "0 0 12px rgba(196,165,116,0.65), 0 0 22px rgba(240,226,196,0.35)",
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
  scrollProgress,
  isMobile,
}: {
  scrollProgress: MotionValue<number>;
  isMobile: boolean;
}) {
  // Fully gone by the bottom of the scrub (contact) — no residual ghost
  const opacity = useTransform(
    scrollProgress,
    [0, 0.7, 0.82, 0.92, 1],
    [1, 1, 0.4, 0, 0],
  );

  // Desktop: mid-right → bottom-right.
  // Mobile: center → lower-right corner (clears the bottom-band bubble at rest).
  const left = useTransform(scrollProgress, [0, 0.16], isMobile ? [50, 96] : [91, 94]);
  const top = useTransform(scrollProgress, [0, 0.16], isMobile ? [24, 98.5] : [48, 90]);
  const cueRef = useRef<HTMLDivElement>(null);
  const anchorX = useTransform(scrollProgress, [0, 0.16], [-50, -100]);
  const anchorY = useTransform(scrollProgress, [0, 0.16], [-50, -100]);
  const scale = useTransform(scrollProgress, [0, 0.16], isMobile ? [1.12, 0.78] : [1.35, 1]);
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
/** Desktop wheel notch ≈ this many consecutive frames on mobile touch ticks too */
const FRAMES_PER_WHEEL_NOTCH = 14;
/** Finger px that equals one mouse-wheel increment for video scrub */
const TOUCH_PX_PER_WHEEL_NOTCH = 42;

export function ScrollHero() {
  const scrubRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTime = useRef(0);
  const rafRef = useRef(0);
  const fpsRef = useRef(24);
  const lastFrameIndex = useRef(-1);
  const mobileNotchRef = useRef(0);
  const touchScrollAccumPx = useRef(0);
  const lastTouchScrollY = useRef(0);
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

  // Soft spring on both platforms so fast flicks still play bubble /
  // contact transitions through instead of teleporting.
  const sprungProgress = useSpring(scrollYProgress, {
    stiffness: isMobile ? 150 : 130,
    damping: isMobile ? 30 : 28,
    mass: isMobile ? 0.18 : 0.2,
    restDelta: 0.00005,
    restSpeed: 0.00005,
  });
  const driveProgress = sprungProgress;

  const videoProgressRaw = useTransform(driveProgress, (p) => {
    if (p <= SCRUB_HANDOFF_START) {
      return (p / SCRUB_HANDOFF_START) * VIDEO_HANDOFF;
    }
    const handoff = (p - SCRUB_HANDOFF_START) / (1 - SCRUB_HANDOFF_START);
    return VIDEO_HANDOFF + handoff * (1 - VIDEO_HANDOFF);
  });
  // Target tracks scroll; display walks consecutive frames toward it (see applyTime)
  const videoProgress = useSpring(videoProgressRaw, {
    stiffness: isMobile ? 380 : 360,
    damping: isMobile ? 40 : 38,
    mass: isMobile ? 0.07 : 0.08,
    restDelta: 0.00001,
    restSpeed: 0.00001,
  });

  // Hero lifts up as contact rises.
  // Mobile settles with the hero bottom at ~2/3 viewport (top of bottom third);
  // desktop still parks the hero bottom at halfway.
  const stickyLift = useTransform(driveProgress, (p) => {
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const a = SCRUB_HANDOFF_START;
    const b = SCRUB_HANDOFF_START + 0.12;
    const endLift = isMobile ? -(1 / 3) * vh : -0.5 * vh;
    const midLift = isMobile ? -0.18 * vh : -0.28 * vh;

    if (p <= a) return 0;
    if (p >= 1) return endLift;
    if (p <= b) {
      const t = smoothstep((p - a) / (b - a));
      return midLift * t;
    }
    const t = smoothstep((p - b) / (1 - b));
    return midLift + (endLift - midLift) * t;
  });
  // Dark join wash — taller + denser so contact copy sits on a dark field
  // Input offsets MUST be strictly increasing (mobile WAAPI crashes otherwise)
  // Mobile intensity kept softer than desktop
  const featherOpacity = useTransform(
    driveProgress,
    [
      SCRUB_HANDOFF_START + 0.06,
      SCRUB_HANDOFF_START + 0.12,
      0.92,
      0.96,
      1,
    ],
    isMobile
      ? [0, 0.00225, 0.0061875, 0.0135, 0.0163125]
      : [0, 0.08, 0.22, 0.48, 0.58],
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
  // Contact dark backdrop fades separately — slower than the copy.
  // Mobile stays lighter so the video reads through behind the headline.
  const contactBgOpacity = useTransform(
    driveProgress,
    [
      SCRUB_HANDOFF_START + 0.06,
      SCRUB_HANDOFF_START + 0.14,
      SCRUB_HANDOFF_START + 0.2,
      1,
    ],
    isMobile ? [0, 0.18, 0.4, 0.55] : [0, 0.3, 0.7, 1],
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
    // Mobile video target is driven by wheel-notch ticks (see touch scroll effect)
    if (isMobile) return;
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    targetTime.current = Math.min(video.duration - 0.001, Math.max(0, p) * video.duration);
  });

  // Mobile: each small finger scroll advances one desktop-wheel-notch of frames
  useEffect(() => {
    if (!isMobile) return;

    const syncNotchFromProgress = () => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
      const fps = fpsRef.current;
      const maxFrame = Math.max(0, Math.round(video.duration * fps) - 1);
      const maxNotch = Math.max(0, Math.floor(maxFrame / FRAMES_PER_WHEEL_NOTCH));
      const desiredFrame = Math.round(
        Math.min(1, Math.max(0, videoProgressRaw.get())) * video.duration * fps,
      );
      mobileNotchRef.current = Math.min(
        maxNotch,
        Math.max(0, Math.round(desiredFrame / FRAMES_PER_WHEEL_NOTCH)),
      );
      targetTime.current = Math.min(
        video.duration - 0.001,
        (mobileNotchRef.current * FRAMES_PER_WHEEL_NOTCH) / fps,
      );
    };

    lastTouchScrollY.current = window.scrollY;
    touchScrollAccumPx.current = 0;
    syncNotchFromProgress();

    const onScroll = () => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

      const y = window.scrollY;
      const dy = y - lastTouchScrollY.current;
      lastTouchScrollY.current = y;
      if (dy === 0) return;

      touchScrollAccumPx.current += dy;
      const fps = fpsRef.current;
      const maxFrame = Math.max(0, Math.round(video.duration * fps) - 1);
      const maxNotch = Math.max(0, Math.floor(maxFrame / FRAMES_PER_WHEEL_NOTCH));

      while (Math.abs(touchScrollAccumPx.current) >= TOUCH_PX_PER_WHEEL_NOTCH) {
        const dir = Math.sign(touchScrollAccumPx.current) as 1 | -1;
        touchScrollAccumPx.current -= dir * TOUCH_PX_PER_WHEEL_NOTCH;
        mobileNotchRef.current = Math.min(
          maxNotch,
          Math.max(0, mobileNotchRef.current + dir),
        );
        targetTime.current = Math.min(
          video.duration - 0.001,
          (mobileNotchRef.current * FRAMES_PER_WHEEL_NOTCH) / fps,
        );
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, videoProgressRaw, videoSrc]);

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
     * Both assets are 24fps all-intra H.264. Scroll moves the *target* ahead;
     * each display refresh walks consecutive frames toward it. Cap per tick is
     * high enough that a wheel notch's frame run finishes quickly (smoother
     * motion) without hard-skipping large gaps.
     */
    const applyTime = (t: number) => {
      const v = videoRef.current;
      if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return;

      const fps = fpsRef.current;
      const maxFrame = Math.max(0, Math.round(v.duration * fps) - 1);
      const targetFrame = Math.min(maxFrame, Math.max(0, Math.round(t * fps)));

      let frameIndex = targetFrame;
      const prev = lastFrameIndex.current;
      if (prev >= 0) {
        const delta = targetFrame - prev;
        if (delta === 0) return;
        // Same catch-up rate on mobile + desktop — consecutive frames toward target
        const maxPerTick = 10;
        const step = Math.min(Math.abs(delta), maxPerTick);
        frameIndex = prev + Math.sign(delta) * step;
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
      if (isMobile) {
        const fps = fpsRef.current;
        const maxFrame = Math.max(0, Math.round(video.duration * fps) - 1);
        const maxNotch = Math.max(0, Math.floor(maxFrame / FRAMES_PER_WHEEL_NOTCH));
        const desiredFrame = Math.round(
          Math.min(1, Math.max(0, videoProgressRaw.get())) * video.duration * fps,
        );
        mobileNotchRef.current = Math.min(
          maxNotch,
          Math.max(0, Math.round(desiredFrame / FRAMES_PER_WHEEL_NOTCH)),
        );
        targetTime.current = Math.min(
          video.duration - 0.001,
          (mobileNotchRef.current * FRAMES_PER_WHEEL_NOTCH) / fps,
        );
      } else {
        const t = Math.min(
          video.duration - 0.001,
          Math.max(0, videoProgress.get()) * video.duration,
        );
        targetTime.current = t;
      }
      applyTime(targetTime.current);
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
  }, [videoProgress, videoProgressRaw, videoSrc, isMobile]);

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
            className="relative h-14 w-auto opacity-95 transition duration-500 hover:brightness-125 sm:h-16 md:h-[5.25rem] lg:h-24"
          />
        </div>
      </div>

      {/* Mobile track ~½ height → same 2× frames-per-scroll as desktop wheel gain */}
      <section ref={scrubRef} className="relative h-[340vh] bg-transparent md:h-[740vh]">
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
              scrollProgress={driveProgress}
              isMobile={isMobile}
            />

            {/* Soft darkening toward the join — taller field behind contact / Begin */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[49%] md:h-[74%]"
              style={{
                opacity: featherOpacity,
                background: isMobile
                  ? "linear-gradient(to bottom, transparent 0%, transparent 10%, rgba(8,9,11,0.0017) 24%, rgba(8,9,11,0.0057) 42%, rgba(8,9,11,0.012) 58%, rgba(8,9,11,0.02) 76%, rgba(8,9,11,0.025) 90%, rgba(8,9,11,0.027) 100%)"
                  : "linear-gradient(to bottom, transparent 0%, transparent 10%, rgba(8,9,11,0.06) 24%, rgba(8,9,11,0.2) 42%, rgba(8,9,11,0.45) 58%, rgba(8,9,11,0.7) 76%, rgba(8,9,11,0.88) 90%, rgba(8,9,11,0.96) 100%)",
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
            {/* Tall dark backdrop behind Begin / headline — softer on mobile so video peeks through */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 bottom-0 top-0"
              style={{
                opacity: contactBgOpacity,
                background: isMobile
                  ? "linear-gradient(to bottom, transparent 0%, transparent 14%, rgba(8,9,11,0.06) 30%, rgba(8,9,11,0.18) 48%, rgba(8,9,11,0.32) 68%, rgba(8,9,11,0.42) 100%)"
                  : "linear-gradient(to bottom, transparent 0%, transparent 8%, rgba(8,9,11,0.12) 22%, rgba(8,9,11,0.45) 38%, rgba(8,9,11,0.78) 52%, #08090b 68%, #08090b 100%)",
              }}
            />
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 h-full"
              style={{
                opacity: contactBgOpacity,
                background: isMobile
                  ? "radial-gradient(ellipse 100% 50% at 50% 35%, rgba(196,165,116,0.04) 0%, rgba(196,165,116,0.01) 45%, transparent 70%)"
                  : "radial-gradient(ellipse 100% 50% at 50% 35%, rgba(196,165,116,0.07) 0%, rgba(196,165,116,0.02) 45%, transparent 70%)",
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
                    className="bg-[#c4a574] text-base text-[#0c0c0e] hover:bg-[#1a5b68] hover:text-white md:text-lg"
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
