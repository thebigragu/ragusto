"use client";

import { Button } from "@/components/ui/Button";
import { ContactModal } from "@/components/ui/ContactModal";
import { Magnetic } from "@/components/ui/Magnetic";
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
      glass: "rgba(255,255,255,0.1)",
      rim: "rgba(255,255,255,0.22)",
      edgeGlow: "rgba(196,165,116,0.3)",
      shimmerAngle: 118,
      top: "58%",
      thickness: 34,
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
      glass: "rgba(210,230,240,0.09)",
      rim: "rgba(230,245,255,0.2)",
      edgeGlow: "rgba(150,200,210,0.28)",
      shimmerAngle: 64,
      top: "52%",
      thickness: 36,
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
      glass: "rgba(255,248,235,0.1)",
      rim: "rgba(196,165,116,0.24)",
      edgeGlow: "rgba(196,165,116,0.38)",
      shimmerAngle: 108,
      top: "56%",
      thickness: 32,
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
      glass: "rgba(255,255,255,0.11)",
      rim: "rgba(255,255,255,0.22)",
      edgeGlow: "rgba(240,226,196,0.32)",
      shimmerAngle: 52,
      top: "54%",
      thickness: 38,
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

  const y = useTransform(progress, (p) => {
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
    const start = delay;
    const e = Math.min(1, Math.max(0, (local - start) / 0.3));
    return e * 8;
  });
  const filter = useTransform(blur, (b) => (b < 0.05 ? "none" : `blur(${b}px)`));

  if (kind === "sub") {
    return (
      <motion.span style={{ opacity, y, filter }} className="inline-block py-0.5">
        {emph ? <span className="text-[#c4a574]">{text}</span> : text}
      </motion.span>
    );
  }

  // Italic + bg-clip-text paints inside the glyph box; Cormorant overhangs need pad
  // so letters like g/p/d and the italic lean aren't cut by neighbors or the pane.
  return (
    <motion.span
      style={{ opacity, y, filter }}
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
}: {
  beat: Beat;
  progress: MotionValue<number>;
}) {
  const v = beat.variant;
  // Left panes exit up/right; right panes exit up/left (diagonally opposite)
  const exitDir = beat.side === "left" ? 1 : -1;
  const subTokens = useMemo(() => beat.sub.split(/(\s+)/), [beat.sub]);
  const T = Math.max(10, v.thickness);

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
    if (t < ENTER_END) return 18 * (1 - smoothstep(t / ENTER_END));
    if (t > EXIT_START) return 16 * smoothstep((t - EXIT_START) / EXIT_LEN);
    return 0;
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

  // Resting tilt so prism depth reads while held; keep mild so type stays clear of folds
  const restY = -exitDir * 10;
  const restX = 5;

  // Diagonal opposite orbit: left → up/right, right → up/left
  const orbitX = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.92;
    return exitDir * v.orbitR * Math.sin(theta);
  });

  const orbitY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.92;
    return -v.orbitR * (1 - Math.cos(theta)) - e * 340;
  });

  const orbitZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 40;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.92;
    return 40 - v.orbitR * Math.sin(theta) * 1.05;
  });

  const rotateX = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END) {
      return restX + (1 - smoothstep(t / ENTER_END)) * 18;
    }
    if (t <= EXIT_START) return restX;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    // Flip back as it climbs the arc
    return restX - e * 78;
  });

  const rotateY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END) {
      return restY + exitDir * (1 - smoothstep(t / ENTER_END)) * 28;
    }
    if (t <= EXIT_START) return restY;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    // Twist toward exit direction — nearly edge-on mid-flight
    return restY + exitDir * e * 118;
  });

  const rotateZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return exitDir * -3;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    return exitDir * (-3 + e * 42);
  });

  const orbitTransform = useMotionTemplate`translate3d(${orbitX}px, ${orbitY}px, ${orbitZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;

  const shadowOpacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.55) return 0.2 * smoothstep(t / (ENTER_END * 0.55));
    if (t > EXIT_START) return 0.28 * (1 - smoothstep((t - EXIT_START) / EXIT_LEN));
    return 0.28;
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

  const sideClass =
    beat.side === "left"
      ? "left-4 origin-center md:left-10 lg:left-16"
      : "right-4 origin-center md:right-10 lg:right-16";

  const faceStyle: CSSProperties = {
    borderRadius: v.radius,
    background: `linear-gradient(145deg, ${v.glass} 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.03) 100%)`,
    border: "none",
    outline: "none",
  };

  return (
    <motion.div
      className={`pointer-events-auto absolute z-20 max-w-[min(92vw,30rem)] -translate-y-1/2 ${sideClass}`}
      style={{
        top: v.top,
        opacity,
        y: enterY,
        filter,
        scale,
        perspective: 1600,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative"
        style={{ transform: orbitTransform, transformStyle: "preserve-3d" }}
      >
        {/* Soft ground shadow */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-[8%] right-[8%] top-[92%] h-10 rounded-[100%]"
          style={{
            opacity: shadowOpacity,
            transform: `translateZ(${-T - 28}px) rotateX(82deg)`,
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 50%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />

        {/* Thick glass prism — soft edges only, no hairline borders */}
        <div className="relative" style={{ transformStyle: "preserve-3d" }}>
          {/* Back face */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              ...faceStyle,
              background:
                "linear-gradient(160deg, rgba(36,40,50,0.96), rgba(6,8,12,0.99))",
              boxShadow: `inset 0 0 40px rgba(0,0,0,0.45), 0 0 24px rgba(0,0,0,0.25)`,
              transform: `translateZ(${-T}px)`,
            }}
          />

          {/* Right prism face — lit edge */}
          <div
            aria-hidden
            className="absolute top-0 bottom-0"
            style={{
              width: T,
              right: 0,
              transformOrigin: "right center",
              transform: "rotateY(90deg) translateZ(0px)",
              borderRadius: `0 ${v.radius} ${v.radius} 0`,
              background: `linear-gradient(180deg,
                rgba(255,255,255,0.38) 0%,
                ${v.edgeGlow} 28%,
                rgba(255,255,255,0.12) 55%,
                rgba(0,0,0,0.55) 100%)`,
              boxShadow: `inset -2px 0 12px rgba(255,255,255,0.15)`,
            }}
          />

          {/* Left prism face — shadowed volume */}
          <div
            aria-hidden
            className="absolute top-0 bottom-0"
            style={{
              width: T,
              left: 0,
              transformOrigin: "left center",
              transform: "rotateY(-90deg) translateZ(0px)",
              borderRadius: `${v.radius} 0 0 ${v.radius}`,
              background: `linear-gradient(180deg,
                rgba(255,255,255,0.14) 0%,
                rgba(40,44,54,0.55) 40%,
                rgba(0,0,0,0.65) 100%)`,
            }}
          />

          {/* Top prism face — bright bevel */}
          <div
            aria-hidden
            className="absolute inset-x-0"
            style={{
              height: T,
              top: 0,
              transformOrigin: "center top",
              transform: "rotateX(-90deg) translateZ(0px)",
              borderRadius: `${v.radius} ${v.radius} 0 0`,
              background: `linear-gradient(90deg,
                rgba(255,255,255,0.06),
                rgba(255,255,255,0.42),
                ${v.edgeGlow},
                rgba(255,255,255,0.42),
                rgba(255,255,255,0.06))`,
            }}
          />

          {/* Bottom prism face */}
          <div
            aria-hidden
            className="absolute inset-x-0"
            style={{
              height: T,
              bottom: 0,
              transformOrigin: "center bottom",
              transform: "rotateX(90deg) translateZ(0px)",
              borderRadius: `0 0 ${v.radius} ${v.radius}`,
              background: `linear-gradient(90deg,
                rgba(0,0,0,0.55),
                rgba(20,22,28,0.7),
                rgba(0,0,0,0.55))`,
            }}
          />

          {/* Front plate: glass layer separate from type so backdrop-filter
              + radius cannot clip italic overhangs / descenders */}
          <div
            className="relative"
            style={{
              transform: "translateZ(0px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                ...faceStyle,
                backdropFilter: "blur(28px) saturate(1.2)",
                WebkitBackdropFilter: "blur(28px) saturate(1.2)",
                boxShadow: `
                  inset 0 18px 36px rgba(255,255,255,0.07),
                  inset 0 -24px 40px rgba(0,0,0,0.18),
                  0 22px 56px rgba(0,0,0,0.38),
                  0 0 48px ${v.edgeGlow}
                `,
              }}
            />

            <div
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: v.radius,
                background:
                  "linear-gradient(125deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 28%, transparent 52%)",
              }}
            />

            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: shimmerOpacity,
                borderRadius: v.radius,
                background: shimmerBackground,
                mixBlendMode: "screen",
                filter: "blur(4px)",
              }}
            />

            <div
              className={`relative overflow-visible py-8 md:py-10 ${
                beat.side === "left"
                  ? "ps-7 pe-11 md:ps-10 md:pe-14"
                  : "ps-11 pe-7 md:ps-14 md:pe-10"
              }`}
              style={{ transform: `translateZ(${T * 0.45}px)` }}
            >
              <p className="overflow-visible font-serif text-3xl leading-[1.4] tracking-normal text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.38]">
                {beat.words.map((w, i) => (
                  <span key={`${w.t}-${i}`} className="inline overflow-visible">
                    {i > 0 ? "\u00A0" : null}
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
              <p className="mt-4 overflow-visible text-sm tracking-[0.16em] text-white/60 uppercase md:text-[0.95rem] md:leading-relaxed">
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

              {/* Gold underline — pulses and sweeps across the pane */}
              <div className="relative mt-5 h-px w-full overflow-hidden">
                <motion.span
                  className="absolute top-0 left-0 block h-px origin-left bg-gradient-to-r from-transparent via-[#c4a574] to-[#f0e2c4]"
                  style={{ width: "100%", boxShadow: `0 0 10px ${v.edgeGlow}` }}
                  animate={{
                    scaleX: [0.12, 1, 0.12],
                    opacity: [0.35, 1, 0.35],
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ScrollCue({
  progress,
  scrollProgress,
}: {
  progress: MotionValue<number>;
  scrollProgress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [0, 0.82, 0.95, 1], [1, 1, 0.4, 0.12]);

  // Right-middle (larger) → bottom-right (smaller)
  const left = useTransform(scrollProgress, [0, 0.16], [91, 94]);
  const top = useTransform(scrollProgress, [0, 0.16], [48, 90]);
  const leftPct = useMotionTemplate`${left}%`;
  const topPct = useMotionTemplate`${top}%`;
  const anchorX = useTransform(scrollProgress, [0, 0.16], [-50, -100]);
  const anchorY = useTransform(scrollProgress, [0, 0.16], [-50, -100]);
  const scale = useTransform(scrollProgress, [0, 0.16], [1.35, 1]);
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
        className="flex flex-col items-center gap-3"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[11px] font-medium tracking-[0.42em] text-[#e8d5b0] uppercase drop-shadow-[0_0_12px_rgba(196,165,116,0.55)] md:text-xs">
          Scroll
        </span>

        <div className="relative">
          <motion.div
            className="absolute -inset-3 rounded-full bg-[#c4a574]/25 blur-md"
            animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.92, 1.08, 0.92] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative flex h-16 w-9 items-start justify-center rounded-full border-2 border-[#c4a574]/70 bg-black/45 p-2 shadow-[0_0_28px_rgba(196,165,116,0.45),inset_0_0_18px_rgba(196,165,116,0.12)] backdrop-blur-md md:h-[4.5rem] md:w-10"
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
              className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#f0e2c4] shadow-[0_0_16px_rgba(240,226,196,0.95)] md:h-3 md:w-3"
              animate={{ y: [0, 26, 0], opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        <motion.div
          className="flex flex-col items-center gap-0.5 text-[#c4a574]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
            <path
              d="M1 1.5L7 7.5L13 1.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            width="14"
            height="10"
            viewBox="0 0 14 10"
            fill="none"
            className="-mt-1.5 opacity-55"
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

  // Lift sticky so contact enters during the last second of video (not after it ends)
  const stickyLift = useTransform(scrollYProgress, [SCRUB_HANDOFF_START, 1], ["0%", "-58%"]);
  const featherOpacity = useTransform(
    scrollYProgress,
    [SCRUB_HANDOFF_START - 0.04, SCRUB_HANDOFF_START + 0.06, 1],
    [0, 0.55, 1],
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
  }, [videoProgress]);

  return (
    <>
      <div className="pointer-events-auto fixed top-10 left-10 z-50 md:top-14 md:left-14">
        <div className="relative inline-flex items-center justify-center">
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-[140%] w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(ellipse 55% 50% at 50% 45%, rgba(196,165,116,0.45) 0%, rgba(196,165,116,0.18) 38%, rgba(240,226,196,0.06) 58%, transparent 72%)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[40%] -z-10 h-[100%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-xl"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(240,226,196,0.35) 0%, rgba(196,165,116,0.12) 45%, transparent 68%)",
            }}
          />
          <Image
            src="/brand/ragusto-logo.png"
            alt="Ragusto"
            width={220}
            height={260}
            priority
            className="relative h-16 w-auto opacity-95 transition duration-500 hover:brightness-125 md:h-[4.75rem] lg:h-20"
          />
        </div>
      </div>

      <section ref={scrubRef} className="relative h-[680vh] bg-[#08090b]">
        <div className="sticky top-0 z-20 h-[100svh] w-full overflow-hidden">
          <motion.div className="relative h-full w-full" style={{ y: stickyLift }}>
            <div className="relative h-[100svh] w-full overflow-hidden bg-black">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover object-center"
                src="/videos/hero-kling.mp4"
                muted
                playsInline
                preload="auto"
                aria-hidden
              />

              {BEATS.map((beat) => (
                <BeatCard key={beat.id} beat={beat} progress={videoProgress} />
              ))}

              <ScrollCue progress={videoProgress} scrollProgress={scrollYProgress} />

              {/* Deep feather into contact during last-second handoff */}
              <motion.div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[70%]"
                style={{
                  opacity: featherOpacity,
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(8,9,11,0.2) 22%, rgba(8,9,11,0.55) 48%, rgba(8,9,11,0.88) 72%, #08090b 100%)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overlaps handoff so contact appears as last second plays — continuous blend, no hard break */}
      <section
        id="contact"
        className="relative z-10 -mt-[58vh] bg-[#08090b] px-6 pt-[18vh] pb-16 md:pb-20"
      >
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 h-48"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(8,9,11,0.35) 35%, #08090b 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,165,116,0.1),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 ambient-grid opacity-15" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-[11.5pt] tracking-[0.28em] text-[#c4a574]/90 uppercase md:text-[13pt]">
            Begin
          </p>
          <h2 className="mt-5 font-serif text-4xl tracking-tight text-white md:text-6xl lg:text-7xl">
            Ready to build something{" "}
            <span className="inline-block bg-gradient-to-br from-[#f0e2c4] via-[#c4a574] to-[#8a7350] bg-clip-text pe-[0.28em] pb-[0.08em] italic text-transparent">
              exceptional
            </span>
            ?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
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

          <div className="mt-10 flex justify-center">
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
