"use client";

import { Button } from "@/components/ui/Button";
import { ContactModal } from "@/components/ui/ContactModal";
import { Magnetic } from "@/components/ui/Magnetic";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SITE } from "@/lib/seo";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

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
  topMobile: string;
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
      orbitR: 520,
      radius: "1.4rem",
      glass: "rgba(38,40,48,0.98)",
      rim: "rgba(255,255,255,0.28)",
      edgeGlow: "rgba(196,165,116,0.55)",
      depthTint: "rgba(232,210,168,0.9)",
      shimmerAngle: 118,
      top: "68%",
      topMobile: "18%",
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
      orbitR: 560,
      radius: "1.15rem",
      glass: "rgba(28,36,44,0.98)",
      rim: "rgba(220,240,250,0.26)",
      edgeGlow: "rgba(160,205,220,0.5)",
      depthTint: "rgba(190,220,232,0.88)",
      shimmerAngle: 64,
      top: "34%",
      topMobile: "80%",
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
      orbitR: 500,
      radius: "1.7rem",
      glass: "rgba(40,36,32,0.98)",
      rim: "rgba(196,165,116,0.32)",
      edgeGlow: "rgba(196,165,116,0.58)",
      depthTint: "rgba(236,214,178,0.92)",
      shimmerAngle: 108,
      top: "50%",
      topMobile: "22%",
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
      orbitR: 580,
      radius: "1rem",
      glass: "rgba(36,38,44,0.98)",
      rim: "rgba(255,255,255,0.28)",
      edgeGlow: "rgba(240,226,196,0.55)",
      depthTint: "rgba(245,230,200,0.92)",
      shimmerAngle: 52,
      top: "60%",
      topMobile: "76%",
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

function AsyncWord({
  text,
  emph,
  progress,
  beat,
  index,
  kind,
  exitDir,
  depth,
}: {
  text: string;
  emph?: boolean;
  progress: MotionValue<number>;
  beat: Beat;
  index: number;
  kind: "title" | "sub";
  exitDir: number;
  depth: number;
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

  const wordY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < EXIT_START) return 0;
    const local = (t - EXIT_START) / EXIT_LEN;
    const start = delay;
    const e = Math.min(1, Math.max(0, (local - start) / 0.32));
    const drift = (hashSeed(`${beat.id}-y-${index}`) - 0.5) * 28;
    return -e * (18 + drift);
  });

  const blur = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < EXIT_START) return 0;
    const local = (t - EXIT_START) / EXIT_LEN;
    // Delay word blur until late in exit
    if (local < 0.4) return 0;
    const start = delay;
    const e = Math.min(1, Math.max(0, (local - 0.4 - start * 0.5) / 0.35));
    return e * 8;
  });
  const filter = useTransform(blur, (b) => (b < 0.05 ? "none" : `blur(${b}px)`));

  // Depth floats with the prism; tilt only during enter/exit (flat at rest)
  const wordZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    let boost = 1;
    if (t < ENTER_END) boost = 0.45 + 0.55 * smoothstep(t / ENTER_END);
    else if (t > EXIT_START) {
      boost = 1 + smoothstep((t - EXIT_START) / EXIT_LEN) * 1.8;
    }
    const base = kind === "title" ? 18 + depth * 8 : 10 + depth * 4;
    return base * boost;
  });

  const wordRx = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END) return (1 - smoothstep(t / ENTER_END)) * 14;
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    return -e * 52;
  });

  const wordRy = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END) return exitDir * (1 - smoothstep(t / ENTER_END)) * 18;
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    return exitDir * e * 72;
  });

  const wordTransform = useMotionTemplate`translate3d(0px, ${wordY}px, ${wordZ}px) rotateX(${wordRx}deg) rotateY(${wordRy}deg)`;

  const textShadow = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    let rx = 0;
    let ry = 0;
    if (t < ENTER_END) {
      rx = (1 - smoothstep(t / ENTER_END)) * 14;
      ry = exitDir * (1 - smoothstep(t / ENTER_END)) * 18;
    } else if (t > EXIT_START) {
      const e = smoothstep((t - EXIT_START) / EXIT_LEN);
      rx = -e * 52;
      ry = exitDir * e * 72;
    }
    // At rest: tight depth shadow only (no gold glow spill)
    if (t >= ENTER_END && t <= EXIT_START) {
      return emph
        ? "0 6px 14px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.08)"
        : "0 5px 12px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.08)";
    }
    const sx = -Math.sin((ry * Math.PI) / 180) * 8;
    const sy = 5 + Math.sin((rx * Math.PI) / 180) * 6;
    return `${sx}px ${sy}px 12px rgba(0,0,0,0.45)`;
  });

  if (kind === "sub") {
    return (
      <motion.span
        style={{
          opacity,
          filter,
          transform: wordTransform,
          textShadow,
          transformStyle: "preserve-3d",
        }}
        className="inline-block py-0.5"
      >
        {emph ? <span className="text-[#c4a574]">{text}</span> : text}
      </motion.span>
    );
  }

  return (
    <motion.span
      style={{
        opacity,
        filter,
        transform: wordTransform,
        textShadow,
        transformStyle: "preserve-3d",
      }}
      className={`inline-block overflow-visible ${
        emph
          ? "px-[0.08em] pe-[0.38em] pt-[0.06em] pb-[0.14em]"
          : "pe-[0.08em] pb-[0.1em]"
      }`}
    >
      <span
        className={
          emph
            ? "inline-block overflow-visible bg-gradient-to-br from-[#f0e2c4] via-[#c4a574] to-[#8a7350] bg-clip-text font-serif italic text-transparent"
            : undefined
        }
      >
        {text}
      </span>
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
  const orbitScale = isMobile ? 0.42 : 1;
  const tiltScale = isMobile ? 0.55 : 1;
  const T = Math.max(22, isMobile ? Math.round(v.thickness * 0.72) : v.thickness);
  const halfT = T / 2;
  const restTop = isMobile ? v.topMobile : v.top;

  const enterY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (p < beat.start) return "110vh";
    if (p >= beat.end) return "-40vh";
    if (t < ENTER_END) {
      const eased = smoothstep(t / ENTER_END);
      return `${110 - 110 * eased}vh`;
    }
    return "0vh";
  });

  const opacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.45) return t / (ENTER_END * 0.45);
    if (t > 0.92) return Math.max(0, (1 - t) / 0.08);
    return 1;
  });

  const blur = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 18;
    const t = beatT(p, beat);
    // Unblur quickly on enter (clear by ~45% of enter window)
    if (t < ENTER_END) {
      const clearBy = ENTER_END * 0.42;
      if (t >= clearBy) return 0;
      return 18 * (1 - smoothstep(t / clearBy));
    }
    // Soft exit dissolve — keep small so it doesn’t bloom past the card
    const blurStart = EXIT_START + EXIT_LEN * 0.42;
    if (t <= blurStart) return 0;
    return 6 * smoothstep((t - blurStart) / (1 - blurStart));
  });
  // blur(0) still creates a filter containing block that clips glyph overhangs
  const filter = useTransform(blur, (b) => (b < 0.05 ? "none" : `blur(${b}px)`));

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

  // At rest: left panes aim right across the hero; right panes aim left (subtle).
  const restY =
    beat.side === "left" ? (isMobile ? 16 : 22) : isMobile ? -16 : -22;
  const restX = isMobile ? 3 : 5;
  const twistAmp = (isMobile ? 22 : 30) * tiltScale;

  const orbitX = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.92;
    return exitDir * v.orbitR * orbitScale * Math.sin(theta);
  });

  const orbitY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.92;
    return -v.orbitR * orbitScale * (1 - Math.cos(theta)) - e * (isMobile ? 160 : 340);
  });

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

  const orbitTransform = useMotionTemplate`translate3d(${orbitX}px, ${orbitY}px, ${orbitZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;

  // Content floats forward of the glass slab; extra extrude only on exit
  const layerBoost = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END) return 0.55 + 0.45 * smoothstep(t / ENTER_END);
    if (t <= EXIT_START) return 1;
    return 1 + smoothstep((t - EXIT_START) / EXIT_LEN) * 1.35;
  });

  const shimmerZ = useTransform(layerBoost, (b) => halfT + 6 * b);
  const shimmerLayerTransform = useMotionTemplate`translateZ(${shimmerZ}px)`;

  const contentZ = useTransform(layerBoost, (b) => halfT + (isMobile ? 22 : 38) * b);
  const contentRx = useTransform(rotateX, (rx) => rx * 0.18);
  const contentRy = useTransform(rotateY, (ry) => ry * 0.22);
  const contentTransform = useMotionTemplate`translateZ(${contentZ}px) rotateX(${contentRx}deg) rotateY(${contentRy}deg)`;

  const lineZ = useTransform(layerBoost, (b) => halfT + (isMobile ? 30 : 48) * b);
  const lineRx = useTransform(rotateX, (rx) => rx * 0.25);
  const lineRy = useTransform(rotateY, (ry) => ry * 0.18);
  const lineTransform = useMotionTemplate`translateZ(${lineZ}px) rotateX(${lineRx}deg) rotateY(${lineRy}deg)`;

  const shadowOpacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.55) return 0.28 * smoothstep(t / (ENTER_END * 0.55));
    if (t > EXIT_START) return 0.42 * (1 - smoothstep((t - EXIT_START) / EXIT_LEN));
    return 0.42;
  });

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
    if (t < ENTER_END * 0.45) return (t - 0.05) / Math.max(0.01, ENTER_END * 0.45 - 0.05);
    if (t < ENTER_END) return 0.85;
    if (t < shimmerEnd) return 0.85 * (1 - (t - ENTER_END) / (shimmerEnd - ENTER_END));
    return 0;
  });

  // Wide metallic specular band
  const shimmerBackground = useMotionTemplate`linear-gradient(${v.shimmerAngle}deg,
      transparent 0%,
      transparent ${shimmerPos}%,
      rgba(255,255,255,0.05) calc(${shimmerPos}% + 3%),
      rgba(255,252,245,0.55) calc(${shimmerPos}% + 10%),
      rgba(240,226,196,0.42) calc(${shimmerPos}% + 16%),
      rgba(196,165,116,0.28) calc(${shimmerPos}% + 22%),
      rgba(255,255,255,0.12) calc(${shimmerPos}% + 28%),
      transparent calc(${shimmerPos}% + 38%),
      transparent 100%)`;

  const sideClass = isMobile
    ? "left-1/2 origin-center"
    : beat.side === "left"
      ? "left-4 origin-center md:left-10 lg:left-16"
      : "right-4 origin-center md:right-10 lg:right-16";

  const radius = isMobile ? "1.05rem" : v.radius;
  // Meet the faces tightly so depth reads as one prism
  const edgeInset = isMobile ? 1 : 2;
  // Side walls: solid chrome at the front lip → continuous body → soft dissolve at rear
  const metalRight = `linear-gradient(90deg,
    rgba(255,252,245,1) 0%,
    rgba(236,220,180,1) 6%,
    ${v.depthTint} 16%,
    ${v.edgeGlow} 28%,
    rgba(120,100,70,1) 42%,
    rgba(48,44,40,1) 58%,
    rgba(22,22,26,0.92) 72%,
    rgba(12,12,14,0.45) 88%,
    rgba(8,8,10,0) 100%)`;
  const metalLeft = `linear-gradient(270deg,
    rgba(255,250,240,1) 0%,
    ${v.depthTint} 12%,
    rgba(150,128,88,1) 30%,
    rgba(56,50,42,1) 50%,
    rgba(24,24,28,0.9) 70%,
    rgba(12,12,14,0.4) 88%,
    rgba(8,8,10,0) 100%)`;
  const metalTop = `linear-gradient(0deg,
    rgba(255,255,250,1) 0%,
    rgba(245,235,210,1) 8%,
    ${v.depthTint} 20%,
    ${v.edgeGlow} 34%,
    rgba(90,78,56,1) 52%,
    rgba(28,28,32,0.92) 70%,
    rgba(12,12,14,0.4) 88%,
    rgba(8,8,10,0) 100%)`;
  const metalBottom = `linear-gradient(180deg,
    rgba(255,248,230,0.7) 0%,
    rgba(90,78,58,1) 18%,
    rgba(36,34,38,1) 42%,
    rgba(18,18,22,0.9) 68%,
    rgba(10,10,12,0.35) 88%,
    rgba(8,8,10,0) 100%)`;

  // Soft dissolve on walls toward the rear lip
  const wallFadeRight =
    "linear-gradient(90deg, #000 0%, #000 52%, rgba(0,0,0,0.7) 74%, transparent 100%)";
  const wallFadeLeft =
    "linear-gradient(270deg, #000 0%, #000 52%, rgba(0,0,0,0.7) 74%, transparent 100%)";
  const wallFadeTop =
    "linear-gradient(0deg, #000 0%, #000 52%, rgba(0,0,0,0.7) 74%, transparent 100%)";
  const wallFadeBottom =
    "linear-gradient(180deg, #000 0%, #000 52%, rgba(0,0,0,0.7) 74%, transparent 100%)";

  // Front face: solid brushed metal (steel body + gold specular bands)
  const faceMetal = `
    linear-gradient(118deg,
      transparent 0%,
      rgba(255,255,255,0.18) 12%,
      transparent 22%,
      transparent 48%,
      rgba(240,226,196,0.14) 61%,
      transparent 74%),
    linear-gradient(155deg,
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

  // Side walls: origin on the card edge, shifted so thickness spans −halfT…+halfT
  const sideWallBase: CSSProperties = {
    position: "absolute",
    width: T,
    top: edgeInset,
    bottom: edgeInset,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  return (
    <motion.div
      className={`pointer-events-auto absolute z-20 max-w-[min(84vw,19.5rem)] -translate-y-1/2 will-change-transform md:max-w-[min(94vw,36rem)] ${sideClass}`}
      style={{
        top: restTop,
        x: isMobile ? "-50%" : 0,
        opacity,
        y: enterY,
        filter,
        scale,
        perspective: isMobile ? 980 : 1500,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative"
        style={{ transform: orbitTransform, transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="relative"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        >
        {/* Tight contact shadow — no soft glow halo */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-[14%] right-[14%] top-[98%] h-6 rounded-[100%]"
          style={{
            opacity: shadowOpacity,
            transform: `translateZ(${-halfT - 48}px) rotateX(88deg)`,
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 48%, transparent 72%)",
          }}
        />

        <div className="relative" style={{ transformStyle: "preserve-3d" }}>
          {/* Back plate — present but soft-edged; less descriptive than the front */}
          <div
            aria-hidden
            className="absolute inset-[2px]"
            style={{
              ...faceStyle,
              background: `radial-gradient(ellipse 78% 72% at 50% 45%,
                rgba(56,58,66,0.92) 0%,
                rgba(28,30,36,0.78) 42%,
                rgba(12,13,16,0.45) 72%,
                rgba(8,9,11,0.15) 100%)`,
              boxShadow: "inset 0 0 48px rgba(0,0,0,0.55)",
              filter: "blur(1.4px)",
              opacity: 0.82,
              transform: `translateZ(${-halfT}px)`,
            }}
          />

          {/* Depth bridge slabs — solid prism core that eases toward the rear */}
          {(
            [
              [0.42, 0.95, "0px"],
              [0.12, 0.78, "1px"],
              [-0.22, 0.5, "2px"],
              [-0.52, 0.28, "3px"],
            ] as const
          ).map(([zFrac, alpha, inset]) => (
            <div
              key={zFrac}
              aria-hidden
              className="absolute"
              style={{
                inset,
                borderRadius: radius,
                background: `linear-gradient(180deg,
                  ${v.depthTint.replace(/[\d.]+\)$/, `${0.18 * alpha})`)} 0%,
                  rgba(28,30,36,${0.95 * alpha}) 40%,
                  rgba(10,11,14,${0.75 * alpha}) 100%)`,
                transform: `translateZ(${halfT * zFrac}px)`,
                backfaceVisibility: "hidden",
              }}
            />
          ))}

          {/* Right wall — solid front connection, soft fade at rear */}
          <div
            aria-hidden
            style={{
              ...sideWallBase,
              right: 0,
              transformOrigin: "right center",
              transform: `translateZ(${-halfT}px) rotateY(-90deg)`,
              borderRadius: 1,
              background: metalRight,
              boxShadow: "inset 0 0 8px rgba(255,252,240,0.16)",
              maskImage: wallFadeRight,
              WebkitMaskImage: wallFadeRight,
            }}
          />

          {/* Left wall */}
          <div
            aria-hidden
            style={{
              ...sideWallBase,
              left: 0,
              transformOrigin: "left center",
              transform: `translateZ(${-halfT}px) rotateY(90deg)`,
              borderRadius: 1,
              background: metalLeft,
              boxShadow: "inset 0 0 6px rgba(255,255,255,0.08)",
              maskImage: wallFadeLeft,
              WebkitMaskImage: wallFadeLeft,
            }}
          />

          {/* Top wall */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              height: T,
              top: 0,
              left: edgeInset,
              right: edgeInset,
              transformOrigin: "center top",
              transform: `translateZ(${-halfT}px) rotateX(90deg)`,
              borderRadius: 1,
              background: metalTop,
              boxShadow: "inset 0 0 8px rgba(255,252,240,0.16)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              maskImage: wallFadeTop,
              WebkitMaskImage: wallFadeTop,
            }}
          />

          {/* Bottom wall */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              height: T,
              bottom: 0,
              left: edgeInset,
              right: edgeInset,
              transformOrigin: "center bottom",
              transform: `translateZ(${-halfT}px) rotateX(-90deg)`,
              borderRadius: 1,
              background: metalBottom,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              maskImage: wallFadeBottom,
              WebkitMaskImage: wallFadeBottom,
            }}
          />

          <div
            className="relative"
            style={{
              transform: `translateZ(${halfT}px)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Front face — brushed metal slab */}
            <div
              aria-hidden
              className="absolute inset-0 overflow-hidden"
              style={{
                ...faceStyle,
                background: faceMetal,
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.32),
                  inset 0 -1px 0 rgba(0,0,0,0.5),
                  inset 18px 0 28px -18px rgba(255,248,230,0.08),
                  inset -18px 0 28px -18px rgba(0,0,0,0.35),
                  0 0 0 1px ${v.rim},
                  0 18px 36px rgba(0,0,0,0.4)
                `,
              }}
            />

            {/* Resting metallic specular wash — clipped to face */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{
                borderRadius: radius,
                background: faceMetalSheen,
                opacity: 0.7,
              }}
            />

            {/* Chrome rim — inset only, no outer glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: radius,
                boxShadow: `
                  inset 0 0 0 1px rgba(255,248,230,0.4),
                  inset 0 0 0 2px rgba(0,0,0,0.3)
                `,
              }}
            />

            {/* Traveling specular sheen — clipped, no blur spill */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{
                opacity: shimmerOpacity,
                borderRadius: radius,
                background: shimmerBackground,
                transform: shimmerLayerTransform,
                transformStyle: "preserve-3d",
              }}
            />

            <motion.div
              className={`relative px-5 py-5 sm:px-8 sm:py-7 md:px-16 md:py-12 ${
                beat.side === "left" ? "md:pe-[4.5rem]" : "md:ps-[4.5rem]"
              }`}
              style={{
                transform: contentTransform,
                transformStyle: "preserve-3d",
              }}
            >
              <p
                className="overflow-visible text-center font-serif text-[1.35rem] leading-[1.35] tracking-normal text-white whitespace-normal sm:text-left sm:text-3xl sm:leading-[1.45] md:whitespace-nowrap md:text-[2.75rem] md:leading-[1.42]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {beat.words.map((w, i) => (
                  <span
                    key={`${w.t}-${i}`}
                    className="inline overflow-visible"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {i > 0 ? (isMobile ? " " : "\u00A0") : null}
                    <AsyncWord
                      text={isMobile ? w.t : w.t.replace(/ /g, "\u00A0")}
                      emph={w.emph}
                      progress={progress}
                      beat={beat}
                      index={i}
                      kind="title"
                      exitDir={exitDir}
                      depth={i}
                    />
                  </span>
                ))}
              </p>
              <p
                className="mt-3 overflow-visible text-center text-[0.65rem] tracking-[0.1em] text-white/60 uppercase sm:mt-5 sm:text-left sm:text-sm sm:tracking-[0.12em] md:mt-7 md:text-[0.95rem] md:leading-relaxed md:tracking-[0.14em]"
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
                      exitDir={exitDir}
                      depth={i % 4}
                    />
                  );
                })}
              </p>

              {/* Gold underline — clean line, no glow bloom */}
              <motion.div
                className="relative mt-4 h-[2px] w-full overflow-hidden sm:mt-6 md:mt-7"
                style={{
                  transform: lineTransform,
                  transformStyle: "preserve-3d",
                }}
              >
                <motion.span
                  className="absolute inset-0 block origin-left rounded-full bg-gradient-to-r from-transparent via-[#c4a574] to-[#f0e2c4]"
                  animate={{
                    scaleX: [0.12, 1, 0.12],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
        </motion.div>
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
  const leftPct = useMotionTemplate`${left}%`;
  const topPct = useMotionTemplate`${top}%`;
  const anchorX = useTransform(scrollProgress, [0, 0.16], [-50, -100]);
  const anchorY = useTransform(scrollProgress, [0, 0.16], [-50, -100]);
  const scale = useTransform(scrollProgress, [0, 0.16], isMobile ? [1.12, 0.85] : [1.35, 1]);
  const cueTransform = useMotionTemplate`translate(${anchorX}%, ${anchorY}%) scale(${scale})`;

  return (
    <motion.div
      className="pointer-events-none absolute z-40"
      style={{
        left: leftPct,
        top: topPct,
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
            animate={{
              borderColor: [
                "rgba(196,165,116,0.55)",
                "rgba(240,226,196,0.95)",
                "rgba(196,165,116,0.55)",
              ],
              boxShadow: [
                "0 0 22px rgba(196,165,116,0.35), inset 0 0 14px rgba(196,165,116,0.1)",
                "0 0 36px rgba(196,165,116,0.7), inset 0 0 20px rgba(240,226,196,0.18)",
                "0 0 22px rgba(196,165,116,0.35), inset 0 0 14px rgba(196,165,116,0.1)",
              ],
            }}
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
  const videoSrc = isMobile ? "/videos/hero-kling-mobile.mp4" : "/videos/hero-kling.mp4";

  const { scrollYProgress } = useScroll({
    target: scrubRef,
    offset: ["start start", "end end"],
  });

  // Layout polish only — keep this off the video path so frames aren't lagged/bunched
  const sprungProgress = useSpring(scrollYProgress, {
    stiffness: isMobile ? 260 : 200,
    damping: isMobile ? 38 : 34,
    mass: isMobile ? 0.12 : 0.14,
    restDelta: 0.00005,
    restSpeed: 0.00005,
  });
  const driveProgress = sprungProgress;

  // Video scrub tracks scroll 1:1 (Lenis already eases the page). No second spring —
  // that was skipping/bunching frames and reading as jumps.
  const videoProgress = useTransform(scrollYProgress, (p) => {
    if (p <= SCRUB_HANDOFF_START) {
      return (p / SCRUB_HANDOFF_START) * VIDEO_HANDOFF;
    }
    const handoff = (p - SCRUB_HANDOFF_START) / (1 - SCRUB_HANDOFF_START);
    return VIDEO_HANDOFF + handoff * (1 - VIDEO_HANDOFF);
  });

  // Hero lifts only ~halfway — remaining lower frame stays visible under contact
  const stickyLift = useTransform(
    driveProgress,
    [SCRUB_HANDOFF_START, SCRUB_HANDOFF_START + 0.12, 1],
    ["0%", "-28%", "-50%"],
  );
  // Dark join wash — delayed + long ramp so it arrives with contact, not ahead of it
  const featherOpacity = useTransform(
    driveProgress,
    [
      SCRUB_HANDOFF_START,
      SCRUB_HANDOFF_START + 0.08,
      SCRUB_HANDOFF_START + 0.16,
      0.96,
      1,
    ],
    [0, 0.12, 0.32, 0.5, 0.55],
  );
  // Mask stays fully solid until contact begins, then dissolves the bottom gradually
  const heroMask = useTransform(
    driveProgress,
    [
      0,
      SCRUB_HANDOFF_START,
      SCRUB_HANDOFF_START + 0.1,
      SCRUB_HANDOFF_START + 0.18,
      1,
    ],
    [
      "linear-gradient(to bottom, #000 0%, #000 100%, #000 100%, #000 100%, #000 100%, #000 100%)",
      "linear-gradient(to bottom, #000 0%, #000 100%, #000 100%, #000 100%, #000 100%, #000 100%)",
      "linear-gradient(to bottom, #000 0%, #000 72%, rgba(0,0,0,0.92) 84%, rgba(0,0,0,0.55) 93%, rgba(0,0,0,0.18) 98%, transparent 100%)",
      "linear-gradient(to bottom, #000 0%, #000 52%, rgba(0,0,0,0.88) 68%, rgba(0,0,0,0.5) 82%, rgba(0,0,0,0.15) 93%, transparent 100%)",
      "linear-gradient(to bottom, #000 0%, #000 42%, rgba(0,0,0,0.85) 58%, rgba(0,0,0,0.45) 74%, rgba(0,0,0,0.12) 88%, transparent 100%)",
    ],
  );
  const videoFade = useTransform(
    driveProgress,
    [SCRUB_HANDOFF_START + 0.04, SCRUB_HANDOFF_START + 0.18, 1],
    [1, 0.88, 0.72],
  );
  // Contact parallax: rises into the lower half only (never into the upper hero band)
  const contactParallax = useTransform(
    driveProgress,
    [SCRUB_HANDOFF_START, SCRUB_HANDOFF_START + 0.14, 1],
    ["42vh", "10vh", "0vh"],
  );
  const contactOpacity = useTransform(
    driveProgress,
    [SCRUB_HANDOFF_START, SCRUB_HANDOFF_START + 0.1, SCRUB_HANDOFF_START + 0.18, 1],
    [0, 0.55, 1, 1],
  );

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
    try {
      video.disableRemotePlayback = true;
    } catch {
      /* ignore */
    }

    /**
     * Both desktop + mobile assets are 24fps all-intra H.264 — every frame is a
     * keyframe, so we can seek every frame index directly. Avoid seeked-queueing
     * (drops intermediate frames) and avoid coarse time thresholds (skips frames).
     */
    const applyTime = (t: number) => {
      const v = videoRef.current;
      if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return;

      const fps = fpsRef.current;
      const maxFrame = Math.max(0, Math.round(v.duration * fps) - 1);
      const frameIndex = Math.min(maxFrame, Math.max(0, Math.round(t * fps)));
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
  }, [videoProgress, videoSrc]);

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
            className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#08090b] will-change-transform"
            style={{
              y: stickyLift,
              // Bottom feather only during contact handoff (see heroMask)
              maskImage: heroMask,
              WebkitMaskImage: heroMask,
            }}
          >
            <motion.video
              key={videoSrc}
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-center will-change-[opacity]"
              src={videoSrc}
              muted
              playsInline
              preload="auto"
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

            {/* Soft darkening toward the join — eases in with contact */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[42%] md:h-[44%]"
              style={{
                opacity: featherOpacity,
                background:
                  "linear-gradient(to bottom, transparent 0%, transparent 18%, rgba(8,9,11,0.08) 42%, rgba(8,9,11,0.28) 70%, rgba(8,9,11,0.5) 100%)",
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
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex max-h-[62dvh] flex-col justify-end px-5 pb-8 md:max-h-[58dvh] md:px-6 md:pb-12"
            style={{ y: contactParallax, opacity: contactOpacity }}
          >
            {/* Background only fades in from top — text below stays fully opaque */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 top-0"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, transparent 8%, rgba(8,9,11,0.15) 28%, rgba(8,9,11,0.55) 48%, rgba(8,9,11,0.88) 68%, #08090b 85%, #08090b 100%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-full"
              style={{
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
