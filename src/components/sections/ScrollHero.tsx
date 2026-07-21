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
  shimmerAngle: number;
  top: string;
  /** Vertical rest on small screens (safer band, less extreme) */
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
      glass: "rgba(255,255,255,0.08)",
      rim: "rgba(255,255,255,0.18)",
      edgeGlow: "rgba(196,165,116,0.38)",
      shimmerAngle: 118,
      top: "68%",
      topMobile: "58%",
      thickness: 82,
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
      glass: "rgba(210,230,240,0.07)",
      rim: "rgba(230,245,255,0.16)",
      edgeGlow: "rgba(150,200,210,0.35)",
      shimmerAngle: 64,
      top: "34%",
      topMobile: "40%",
      thickness: 88,
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
      glass: "rgba(255,248,235,0.08)",
      rim: "rgba(196,165,116,0.2)",
      edgeGlow: "rgba(196,165,116,0.42)",
      shimmerAngle: 108,
      top: "50%",
      topMobile: "50%",
      thickness: 78,
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
      glass: "rgba(255,255,255,0.09)",
      rim: "rgba(255,255,255,0.18)",
      edgeGlow: "rgba(240,226,196,0.4)",
      shimmerAngle: 52,
      top: "60%",
      topMobile: "56%",
      thickness: 90,
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

/** Longer enter/exit windows = slower rise & leave relative to scroll */
const ENTER_END = 0.24;
const EXIT_START = 0.68;
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
    // At rest: soft forward extrusion shadow (depth without tilt)
    if (t >= ENTER_END && t <= EXIT_START) {
      return emph
        ? "0 10px 22px rgba(0,0,0,0.45), 0 2px 0 rgba(255,255,255,0.08), 0 0 24px rgba(196,165,116,0.28)"
        : "0 8px 18px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.1)";
    }
    const sx = -Math.sin((ry * Math.PI) / 180) * 10;
    const sy = 6 + Math.sin((rx * Math.PI) / 180) * 8;
    const glow = emph
      ? `${-sx * 0.3}px ${-sy * 0.2}px 16px rgba(196,165,116,0.4)`
      : `${-sx * 0.2}px ${-sy * 0.15}px 12px rgba(255,255,255,0.1)`;
    return `${sx}px ${sy}px 16px rgba(0,0,0,0.5), ${glow}`;
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
  const T = Math.max(16, isMobile ? Math.round(v.thickness * 0.62) : v.thickness);
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
    // Delay exit blur — stay sharp until late in the leave
    const blurStart = EXIT_START + EXIT_LEN * 0.42;
    if (t <= blurStart) return 0;
    return 16 * smoothstep((t - blurStart) / (1 - blurStart));
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

  // Subtle prism pose at rest so depth edges read; stronger angles only on enter/exit
  const restY = -exitDir * (isMobile ? 7 : 11);
  const restX = isMobile ? 3 : 5;
  const twistAmp = (isMobile ? 28 : 40) * tiltScale;

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
    const restZ = isMobile ? 36 : 72;
    if (t < ENTER_END) {
      // Brief push toward camera during the depth-reveal twist
      const u = t / ENTER_END;
      if (u > 0.55 && u < 1) {
        const twistU = (u - 0.55) / 0.45;
        const bump = Math.sin(Math.min(1, twistU) * Math.PI) * (isMobile ? 18 : 28);
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
      const startX = restX + 20 * tiltScale;
      if (u < 0.55) {
        return startX + (restX - startX) * smoothstep(u / 0.55);
      }
      // Lift slightly during horizontal twist so the top bevel reads
      const twistU = (u - 0.55) / 0.45;
      const lift = Math.sin(Math.min(1, twistU) * Math.PI) * (isMobile ? 6 : 9);
      if (u < 0.78) {
        const e = smoothstep((u - 0.55) / 0.23);
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
      const startY = restY + exitDir * 28 * tiltScale;
      // Opposite-side peak: reveals the elongated prism edge, then springs to rest
      const peakY = restY + exitDir * twistAmp;
      if (u < 0.55) {
        return startY + (restY - startY) * smoothstep(u / 0.55);
      }
      if (u < 0.78) {
        const e = smoothstep((u - 0.55) / 0.23);
        return restY + (peakY - restY) * e;
      }
      // Spring back — slight ease past then settle
      const e = smoothstep((u - 0.78) / 0.22);
      const overshoot = Math.sin(e * Math.PI) * exitDir * -3;
      return peakY + (restY - peakY) * e + overshoot * (1 - e);
    }
    if (t <= EXIT_START) return restY;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    return restY + exitDir * e * 118 * tiltScale;
  });

  const rotateZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END) {
      const u = t / ENTER_END;
      const startZ = exitDir * -10 * tiltScale;
      if (u < 0.55) return startZ * (1 - smoothstep(u / 0.55));
      // Counter-roll with the yaw twist
      const twistU = (u - 0.55) / 0.45;
      return exitDir * Math.sin(Math.min(1, twistU) * Math.PI) * (isMobile ? 5 : 8);
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

  const shimmerZ = useTransform(layerBoost, (b) => halfT + 8 * b);
  const shimmerLayerTransform = useMotionTemplate`translateZ(${shimmerZ}px)`;

  const contentZ = useTransform(layerBoost, (b) => halfT + (isMobile ? 18 : 30) * b);
  const contentRx = useTransform(rotateX, (rx) => rx * 0.18);
  const contentRy = useTransform(rotateY, (ry) => ry * 0.22);
  const contentTransform = useMotionTemplate`translateZ(${contentZ}px) rotateX(${contentRx}deg) rotateY(${contentRy}deg)`;

  const lineZ = useTransform(layerBoost, (b) => halfT + (isMobile ? 26 : 40) * b);
  const lineRx = useTransform(rotateX, (rx) => rx * 0.25);
  const lineRy = useTransform(rotateY, (ry) => ry * 0.18);
  const lineTransform = useMotionTemplate`translateZ(${lineZ}px) rotateX(${lineRx}deg) rotateY(${lineRy}deg)`;

  const shadowOpacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.55) return 0.25 * smoothstep(t / (ENTER_END * 0.55));
    if (t > EXIT_START) return 0.35 * (1 - smoothstep((t - EXIT_START) / EXIT_LEN));
    return 0.35;
  });

  const shimmerPos = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    const shimmerEnd = ENTER_END + 0.1;
    if (t < 0.05) return 120;
    if (t > shimmerEnd) return -40;
    return 120 - ((t - 0.05) / (shimmerEnd - 0.05)) * 160;
  });

  const shimmerOpacity = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    const shimmerEnd = ENTER_END + 0.1;
    if (t < 0.05) return 0;
    if (t < ENTER_END * 0.4) return (t - 0.05) / Math.max(0.01, ENTER_END * 0.4 - 0.05);
    if (t < ENTER_END) return 1;
    if (t < shimmerEnd) return 1 - (t - ENTER_END) / (shimmerEnd - ENTER_END);
    return 0;
  });

  const shimmerBackground = useMotionTemplate`linear-gradient(${v.shimmerAngle}deg,
      transparent 0%,
      transparent ${shimmerPos}%,
      rgba(255,255,255,0.05) calc(${shimmerPos}% + 6%),
      rgba(255,255,255,0.4) calc(${shimmerPos}% + 12%),
      rgba(240,226,196,0.22) calc(${shimmerPos}% + 14%),
      transparent calc(${shimmerPos}% + 22%),
      transparent 100%)`;

  const sideClass = isMobile
    ? "left-1/2 origin-center"
    : beat.side === "left"
      ? "left-4 origin-center md:left-10 lg:left-16"
      : "right-4 origin-center md:right-10 lg:right-16";

  const radius = isMobile ? "1rem" : v.radius;

  const faceStyle: CSSProperties = {
    borderRadius: radius,
    background: `linear-gradient(145deg, ${v.glass} 0%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.02) 100%)`,
    border: "none",
    outline: "none",
  };

  return (
    <motion.div
      className={`pointer-events-auto absolute z-20 max-w-[min(84vw,19.5rem)] -translate-y-1/2 md:max-w-[min(94vw,36rem)] ${sideClass}`}
      style={{
        top: restTop,
        x: isMobile ? "-50%" : 0,
        opacity,
        y: enterY,
        filter,
        scale,
        perspective: isMobile ? 1100 : 1800,
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
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-[6%] right-[6%] top-[96%] h-12 rounded-[100%]"
          style={{
            opacity: shadowOpacity,
            transform: `translateZ(${-halfT - 36}px) rotateX(88deg)`,
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.22) 45%, transparent 72%)",
            filter: "blur(12px)",
          }}
        />

        <div className="relative" style={{ transformStyle: "preserve-3d" }}>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              ...faceStyle,
              background:
                "linear-gradient(165deg, rgba(28,32,40,0.98), rgba(4,6,10,1))",
              boxShadow: "inset 0 0 48px rgba(0,0,0,0.55)",
              transform: `translateZ(${-halfT}px)`,
            }}
          />

          <div
            aria-hidden
            className="absolute inset-[3px]"
            style={{
              borderRadius: radius,
              background: `linear-gradient(145deg, ${v.glass}, rgba(255,255,255,0.03) 50%, transparent)`,
              transform: "translateZ(0px)",
              boxShadow: `inset 0 0 40px ${v.edgeGlow}`,
              opacity: 0.55,
            }}
          />

          <div
            aria-hidden
            className="absolute"
            style={{
              width: T,
              right: 0,
              top: 8,
              bottom: 8,
              transformOrigin: "right center",
              transform: "rotateY(-90deg) translateZ(0)",
              borderRadius: `0 ${radius} ${radius} 0`,
              background: `linear-gradient(180deg,
                rgba(255,255,255,0.48) 0%,
                ${v.edgeGlow} 16%,
                rgba(255,255,255,0.14) 40%,
                rgba(40,44,54,0.35) 68%,
                rgba(0,0,0,0.55) 100%)`,
            }}
          />

          <div
            aria-hidden
            className="absolute"
            style={{
              width: T,
              left: 0,
              top: 8,
              bottom: 8,
              transformOrigin: "left center",
              transform: "rotateY(90deg) translateZ(0)",
              borderRadius: `${radius} 0 0 ${radius}`,
              background: `linear-gradient(180deg,
                rgba(255,255,255,0.1) 0%,
                rgba(30,34,42,0.75) 40%,
                rgba(0,0,0,0.7) 100%)`,
            }}
          />

          <div
            aria-hidden
            className="absolute"
            style={{
              height: T,
              top: 0,
              left: 8,
              right: 8,
              transformOrigin: "center top",
              transform: "rotateX(90deg) translateZ(0)",
              borderRadius: `${radius} ${radius} 0 0`,
              background: `linear-gradient(90deg,
                rgba(255,255,255,0.04),
                rgba(255,255,255,0.32),
                ${v.edgeGlow},
                rgba(255,255,255,0.32),
                rgba(255,255,255,0.04))`,
            }}
          />

          <div
            aria-hidden
            className="absolute"
            style={{
              height: T,
              bottom: 0,
              left: 8,
              right: 8,
              transformOrigin: "center bottom",
              transform: "rotateX(-90deg) translateZ(0)",
              borderRadius: `0 0 ${radius} ${radius}`,
              background: `linear-gradient(90deg,
                rgba(0,0,0,0.6),
                rgba(18,20,26,0.75),
                rgba(0,0,0,0.6))`,
            }}
          />

          <div
            className="relative"
            style={{
              transform: `translateZ(${halfT}px)`,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                ...faceStyle,
                background: `linear-gradient(155deg,
                  rgba(255,255,255,0.14) 0%,
                  ${v.glass} 28%,
                  rgba(255,255,255,0.04) 62%,
                  rgba(8,10,14,0.25) 100%)`,
                backdropFilter: isMobile
                  ? "blur(20px) saturate(1.25) brightness(1.05)"
                  : "blur(34px) saturate(1.35) brightness(1.08)",
                WebkitBackdropFilter: isMobile
                  ? "blur(20px) saturate(1.25) brightness(1.05)"
                  : "blur(34px) saturate(1.35) brightness(1.08)",
                boxShadow: `
                  inset 0 18px 42px rgba(255,255,255,0.1),
                  inset 0 -28px 48px rgba(0,0,0,0.22),
                  0 32px 72px rgba(0,0,0,0.48),
                  0 0 64px ${v.edgeGlow}
                `,
              }}
            />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: radius,
                background:
                  "linear-gradient(125deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 22%, transparent 48%)",
              }}
            />

            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: shimmerOpacity,
                borderRadius: radius,
                background: shimmerBackground,
                mixBlendMode: "screen",
                filter: "blur(4px)",
                transform: shimmerLayerTransform,
                transformStyle: "preserve-3d",
              }}
            />

            <motion.div
              className={`relative overflow-visible px-5 py-5 sm:px-8 sm:py-7 md:px-16 md:py-12 ${
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

              {/* Gold underline — floats ahead of type, tilts with the prism */}
              <motion.div
                className="relative mt-4 h-3 w-full overflow-visible sm:mt-6 md:mt-7"
                style={{
                  transform: lineTransform,
                  transformStyle: "preserve-3d",
                }}
              >
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-0 h-3 w-full -translate-y-1/2 origin-left rounded-full bg-[#c4a574]/55 blur-md"
                  style={{ width: "100%" }}
                  animate={{
                    scaleX: [0.12, 1, 0.12],
                    opacity: [0.25, 0.85, 0.25],
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-0 h-5 w-full -translate-y-1/2 origin-left rounded-full bg-[#f0e2c4]/35 blur-xl"
                  style={{ width: "100%" }}
                  animate={{
                    scaleX: [0.12, 1, 0.12],
                    opacity: [0.15, 0.7, 0.15],
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.span
                  className="absolute top-1/2 left-0 block h-[2px] w-full -translate-y-1/2 origin-left rounded-full bg-gradient-to-r from-transparent via-[#c4a574] to-[#f0e2c4]"
                  style={{
                    width: "100%",
                    boxShadow: `0 0 8px ${v.edgeGlow}, 0 0 18px rgba(196,165,116,0.75), 0 0 32px rgba(240,226,196,0.45)`,
                  }}
                  animate={{
                    scaleX: [0.12, 1, 0.12],
                    opacity: [0.45, 1, 0.45],
                    boxShadow: [
                      `0 0 6px ${v.edgeGlow}, 0 0 12px rgba(196,165,116,0.4), 0 0 20px rgba(240,226,196,0.2)`,
                      `0 0 10px ${v.edgeGlow}, 0 0 24px rgba(196,165,116,0.9), 0 0 40px rgba(240,226,196,0.65)`,
                      `0 0 6px ${v.edgeGlow}, 0 0 12px rgba(196,165,116,0.4), 0 0 20px rgba(240,226,196,0.2)`,
                    ],
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

  // Desktop: mid-right → bottom-right. Mobile: center-right → bottom-right.
  const left = useTransform(scrollProgress, [0, 0.16], isMobile ? [88, 92] : [91, 94]);
  const top = useTransform(scrollProgress, [0, 0.16], isMobile ? [50, 88] : [48, 90]);
  const leftPct = useMotionTemplate`${left}%`;
  const topPct = useMotionTemplate`${top}%`;
  const anchorX = useTransform(scrollProgress, [0, 0.16], [-50, -100]);
  const anchorY = useTransform(scrollProgress, [0, 0.16], [-50, -100]);
  const scale = useTransform(scrollProgress, [0, 0.16], isMobile ? [1.05, 0.85] : [1.35, 1]);
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
  const [contactOpen, setContactOpen] = useState(false);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const isMobile = useIsMobile();
  const videoSrc = isMobile ? "/videos/hero-kling-mobile.mp4" : "/videos/hero-kling.mp4";

  const { scrollYProgress } = useScroll({
    target: scrubRef,
    offset: ["start start", "end end"],
  });

  const videoProgress = useTransform(scrollYProgress, (p) => {
    if (p <= SCRUB_HANDOFF_START) {
      return (p / SCRUB_HANDOFF_START) * VIDEO_HANDOFF;
    }
    const handoff = (p - SCRUB_HANDOFF_START) / (1 - SCRUB_HANDOFF_START);
    return VIDEO_HANDOFF + handoff * (1 - VIDEO_HANDOFF);
  });

  // Hero lifts out as the last second begins; contact feathers in over it
  const stickyLift = useTransform(
    scrollYProgress,
    [SCRUB_HANDOFF_START, SCRUB_HANDOFF_START + 0.1, 1],
    ["0%", "-42%", "-110%"],
  );
  const featherOpacity = useTransform(
    scrollYProgress,
    [SCRUB_HANDOFF_START - 0.08, SCRUB_HANDOFF_START, SCRUB_HANDOFF_START + 0.1, 1],
    [0, 0.4, 0.8, 1],
  );
  const videoFade = useTransform(
    scrollYProgress,
    [SCRUB_HANDOFF_START, SCRUB_HANDOFF_START + 0.12, 1],
    [1, 0.45, 0.12],
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

    const onMeta = () => {
      targetTime.current = Math.min(
        video.duration - 0.001,
        Math.max(0, videoProgress.get()) * video.duration,
      );
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

    let seeking = false;
    const tick = () => {
      const v = videoRef.current;
      if (v && Number.isFinite(v.duration) && v.duration > 0 && !seeking) {
        const next = targetTime.current;
        if (Math.abs(v.currentTime - next) > 0.0005) {
          seeking = true;
          const onSeeked = () => {
            seeking = false;
            v.removeEventListener("seeked", onSeeked);
          };
          v.addEventListener("seeked", onSeeked);
          try {
            v.currentTime = next;
          } catch {
            seeking = false;
            v.removeEventListener("seeked", onSeeked);
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      cancelAnimationFrame(rafRef.current);
    };
  }, [videoProgress, videoSrc]);

  return (
    <>
      <div className="pointer-events-auto fixed top-5 left-5 z-50 sm:top-8 sm:left-8 md:top-14 md:left-14">
        <div className="relative inline-flex items-center justify-center">
          {/* Outer breath — soft gold bloom */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-[170%] w-[190%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl md:h-[200%] md:w-[220%] md:blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse 58% 52% at 50% 45%, rgba(196,165,116,0.7) 0%, rgba(196,165,116,0.35) 32%, rgba(240,226,196,0.14) 52%, transparent 72%)",
            }}
            animate={{
              opacity: [0.55, 1, 0.55],
              scale: [0.92, 1.12, 0.92],
            }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Mid breath — warmer core */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[40%] -z-10 h-[130%] w-[145%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl md:h-[150%] md:w-[165%] md:blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(240,226,196,0.65) 0%, rgba(196,165,116,0.35) 38%, rgba(196,165,116,0.1) 62%, transparent 76%)",
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
                "radial-gradient(circle at 50% 40%, rgba(255,240,210,0.55) 0%, rgba(196,165,116,0.28) 45%, transparent 70%)",
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
            className="relative h-11 w-auto opacity-95 transition duration-500 hover:brightness-125 sm:h-14 md:h-[4.75rem] lg:h-20"
          />
        </div>
      </div>

      <section ref={scrubRef} className="relative h-[440vh] bg-transparent md:h-[680vh]">
        <div className="sticky top-0 z-20 h-[100svh] w-full overflow-hidden bg-transparent">
          <motion.div
            className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-[#08090b]"
            style={{ y: stickyLift }}
          >
            <motion.video
              key={videoSrc}
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-center"
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
              scrollProgress={scrollYProgress}
              isMobile={isMobile}
            />

            {/* Continuous veil into contact — soft, tall, no hard band */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[85%] md:h-[90%]"
              style={{
                opacity: featherOpacity,
                background:
                  "linear-gradient(to bottom, transparent 0%, rgba(8,9,11,0.08) 18%, rgba(8,9,11,0.28) 38%, rgba(8,9,11,0.55) 55%, rgba(8,9,11,0.82) 72%, rgba(8,9,11,0.96) 88%, #08090b 100%)",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Overlaps hero; tight Begin spacing; soft gold wash without a hard seam */}
      <section
        id="contact"
        className="relative z-30 -mt-[82vh] bg-transparent px-5 pt-[10vh] pb-14 md:-mt-[96vh] md:px-6 md:pt-[12vh] md:pb-20"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[38vh] md:h-[42vh]"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(196,165,116,0.035) 10%, rgba(196,165,116,0.06) 22%, rgba(8,9,11,0.28) 40%, rgba(8,9,11,0.7) 68%, rgba(8,9,11,0.94) 88%, #08090b 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-[28vh] bottom-0 bg-[#08090b] md:top-[32vh]" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[55vh]"
          style={{
            background:
              "radial-gradient(ellipse 95% 60% at 50% 12%, rgba(196,165,116,0.1) 0%, rgba(196,165,116,0.04) 38%, transparent 72%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-[18vh] bottom-0 ambient-grid opacity-10"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 28%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 28%)",
          }}
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-[10.5pt] tracking-[0.28em] text-[#c4a574]/90 uppercase md:text-[13pt]">
            Begin
          </p>
          <h2 className="mt-4 font-serif text-[2rem] leading-tight tracking-tight text-white sm:text-4xl md:mt-5 md:text-6xl lg:text-7xl">
            Ready to build something{" "}
            <span className="inline-block bg-gradient-to-br from-[#f0e2c4] via-[#c4a574] to-[#8a7350] bg-clip-text pe-[0.28em] pb-[0.08em] italic text-transparent">
              exceptional
            </span>
            ?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/60 md:mt-6 md:text-lg">
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

          <div className="mt-8 flex justify-center md:mt-10">
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
      </section>

      <ContactModal open={contactOpen} onClose={closeContact} />
    </>
  );
}
