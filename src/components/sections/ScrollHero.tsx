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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
      orbitR: 340,
      radius: "1.4rem",
      glass: "rgba(255,255,255,0.1)",
      rim: "rgba(255,255,255,0.35)",
      edgeGlow: "rgba(196,165,116,0.3)",
      shimmerAngle: 118,
      top: "58%",
      thickness: 14,
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
      orbitR: 380,
      radius: "1.15rem",
      glass: "rgba(210,230,240,0.09)",
      rim: "rgba(230,245,255,0.36)",
      edgeGlow: "rgba(150,200,210,0.28)",
      shimmerAngle: 64,
      top: "52%",
      thickness: 16,
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
      orbitR: 320,
      radius: "1.7rem",
      glass: "rgba(255,248,235,0.1)",
      rim: "rgba(196,165,116,0.42)",
      edgeGlow: "rgba(196,165,116,0.38)",
      shimmerAngle: 108,
      top: "56%",
      thickness: 12,
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
      orbitR: 400,
      radius: "1rem",
      glass: "rgba(255,255,255,0.11)",
      rim: "rgba(255,255,255,0.38)",
      edgeGlow: "rgba(240,226,196,0.32)",
      shimmerAngle: 52,
      top: "54%",
      thickness: 18,
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
  const filter = useMotionTemplate`blur(${blur}px)`;

  if (kind === "sub") {
    return (
      <motion.span style={{ opacity, y, filter }} className="inline-block">
        {emph ? <span className="text-[#c4a574]">{text}</span> : text}
      </motion.span>
    );
  }

  return (
    <motion.span style={{ opacity, y, filter }} className="inline-block">
      <span
        className={
          emph
            ? "bg-gradient-to-br from-[#f0e2c4] via-[#c4a574] to-[#8a7350] bg-clip-text font-serif italic text-transparent"
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
  const dir = beat.side === "left" ? -1 : 1;
  const subTokens = useMemo(() => beat.sub.split(/(\s+)/), [beat.sub]);

  // Rise from below → hold flat → orbital exit
  const enterY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (p < beat.start) return "110vh";
    if (p >= beat.end) return "-30vh";
    if (t < ENTER_END) {
      const eased = smoothstep(t / ENTER_END);
      return `${110 - 110 * eased}vh`;
    }
    return "0vh";
  });

  const opacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.5) return t / (ENTER_END * 0.5);
    if (t > 0.94) return Math.max(0, (1 - t) / 0.06);
    return 1;
  });

  const blur = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 22;
    const t = beatT(p, beat);
    if (t < ENTER_END) {
      const smooth = smoothstep(t / ENTER_END);
      return 22 * (1 - smooth);
    }
    if (t > EXIT_START) {
      const smooth = smoothstep((t - EXIT_START) / EXIT_LEN);
      return 20 * smooth;
    }
    return 0;
  });
  const filter = useMotionTemplate`blur(${blur}px)`;

  const scale = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0.96;
    const t = beatT(p, beat);
    if (t < ENTER_END) {
      const eased = smoothstep(t / ENTER_END);
      return 0.96 + 0.04 * eased;
    }
    if (t > EXIT_START) {
      const eased = smoothstep((t - EXIT_START) / EXIT_LEN);
      return 1 + 0.18 * eased;
    }
    return 1;
  });

  // True circular orbit on exit — flat on hold
  const orbitX = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.72;
    return dir * v.orbitR * Math.sin(theta);
  });

  const orbitY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.72;
    return -v.orbitR * (1 - Math.cos(theta)) - e * 220;
  });

  const orbitZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.72;
    return -v.orbitR * Math.sin(theta) * 0.95;
  });

  const rotateX = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.72;
    const dydtheta = -v.orbitR * Math.sin(theta);
    const dzdtheta = -v.orbitR * 0.95 * Math.cos(theta);
    const dxdtheta = dir * v.orbitR * Math.cos(theta);
    const horiz = Math.sqrt(dxdtheta * dxdtheta + dzdtheta * dzdtheta);
    return Math.atan2(-dydtheta, horiz) * (180 / Math.PI);
  });

  const rotateY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    const theta = e * Math.PI * 0.72;
    const dzdtheta = -v.orbitR * 0.95 * Math.cos(theta);
    const dxdtheta = dir * v.orbitR * Math.cos(theta);
    return Math.atan2(dxdtheta, -dzdtheta) * (180 / Math.PI);
  });

  const rotateZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    return dir * 2.5 * e;
  });

  const orbitTransform = useMotionTemplate`translate3d(${orbitX}px, ${orbitY}px, ${orbitZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;

  const shadowOpacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.6) return 0.12 * smoothstep(t / (ENTER_END * 0.6));
    if (t > EXIT_START) return 0.38 * (1 - smoothstep((t - EXIT_START) / EXIT_LEN));
    return 0.32;
  });

  const shadowScale = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 1;
    const e = smoothstep((t - EXIT_START) / EXIT_LEN);
    return 1 + e * 0.35;
  });

  const shimmerPos = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    const shimmerEnd = ENTER_END + 0.12;
    if (t < 0.06) return 120;
    if (t > shimmerEnd) return -40;
    return 120 - ((t - 0.06) / (shimmerEnd - 0.06)) * 160;
  });

  const shimmerOpacity = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    const shimmerEnd = ENTER_END + 0.12;
    if (t < 0.06) return 0;
    if (t < ENTER_END * 0.45) return (t - 0.06) / (ENTER_END * 0.45 - 0.06);
    if (t < ENTER_END + 0.04) return 1;
    if (t < shimmerEnd) return 1 - (t - (ENTER_END + 0.04)) / (shimmerEnd - ENTER_END - 0.04);
    return 0;
  });

  const shimmerBackground = useMotionTemplate`linear-gradient(${v.shimmerAngle}deg,
      transparent 0%,
      transparent ${shimmerPos}%,
      rgba(255,255,255,0.02) calc(${shimmerPos}% + 4%),
      rgba(255,255,255,0.18) calc(${shimmerPos}% + 9%),
      rgba(255,255,255,0.42) calc(${shimmerPos}% + 12%),
      rgba(240,226,196,0.2) calc(${shimmerPos}% + 14%),
      rgba(255,255,255,0.08) calc(${shimmerPos}% + 17%),
      transparent calc(${shimmerPos}% + 24%),
      transparent 100%)`;

  const paneOpacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.45) return t / (ENTER_END * 0.45);
    if (t > EXIT_START + EXIT_LEN * 0.55) {
      const e = (t - (EXIT_START + EXIT_LEN * 0.55)) / (EXIT_LEN * 0.45);
      return Math.max(0.12, 1 - e * 0.88);
    }
    return 1;
  });

  const sideClass =
    beat.side === "left"
      ? "left-4 origin-center md:left-10 lg:left-16"
      : "right-4 origin-center md:right-10 lg:right-16";

  return (
    <motion.div
      className={`pointer-events-auto absolute z-20 max-w-[min(92vw,28rem)] -translate-y-1/2 ${sideClass}`}
      style={{
        top: v.top,
        opacity,
        y: enterY,
        filter,
        scale,
        perspective: 1800,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative [transform-style:preserve-3d]"
        style={{ transform: orbitTransform, transformStyle: "preserve-3d" }}
      >
        {/* Soft elliptical shadow — separate plane, not CSS drop-shadow on glass */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-full h-16 w-[115%] -translate-x-1/2 md:h-20"
          style={{
            opacity: shadowOpacity,
            scale: shadowScale,
            transform: "translateZ(-48px) rotateX(78deg)",
            transformStyle: "preserve-3d",
            background:
              "radial-gradient(ellipse 72% 48% at 50% 42%, rgba(0,0,0,0.55), rgba(0,0,0,0.22) 52%, transparent 72%)",
            filter: "blur(10px)",
          }}
        />

        <div
          className="relative [transform-style:preserve-3d]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Back plate */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: v.radius,
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(0,0,0,0.5) 60%, rgba(8,10,14,0.65))",
              border: `1px solid rgba(255,255,255,0.08)`,
              transform: `translateZ(-${v.thickness}px)`,
              transformStyle: "preserve-3d",
            }}
          />

          {/* Side edge — glass thickness */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 h-full"
            style={{
              width: `${v.thickness}px`,
              borderRadius: `0 ${v.radius} ${v.radius} 0`,
              background: `linear-gradient(180deg, ${v.glass}, rgba(0,0,0,0.35))`,
              borderRight: `1px solid ${v.rim}`,
              transform: `rotateY(90deg) translateZ(-${v.thickness / 2}px)`,
              transformOrigin: "right center",
              transformStyle: "preserve-3d",
            }}
          />

          {/* Front glass face */}
          <motion.div
            className="group relative cursor-default overflow-hidden p-6 backdrop-blur-2xl md:p-8"
            style={{
              opacity: paneOpacity,
              borderRadius: v.radius,
              background: `linear-gradient(148deg, ${v.glass}, rgba(255,255,255,0.02) 48%, rgba(255,255,255,0.05))`,
              border: `1px solid ${v.rim}`,
              boxShadow: "0 1px 0 0 rgba(255,255,255,0.18) inset",
              transform: "translateZ(0)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Subtle top-edge highlight only */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.35) 70%, transparent)",
              }}
            />

            {/* Soft shimmer sweep on enter */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: shimmerOpacity,
                borderRadius: v.radius,
                background: shimmerBackground,
                mixBlendMode: "screen",
                filter: "blur(5px)",
              }}
            />

            <div className="relative" style={{ transform: "translateZ(2px)" }}>
              <p className="font-serif text-3xl leading-[1.15] tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
                {beat.words.map((w, i) => (
                  <span key={`${w.t}-${i}`}>
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
              <p className="mt-3 text-sm tracking-[0.18em] text-white/55 uppercase md:text-[0.95rem]">
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
              <span
                className="mt-5 block h-px w-12 bg-gradient-to-r from-[#c4a574] to-transparent transition-all duration-500 group-hover:w-28"
                style={{ boxShadow: `0 0 10px ${v.edgeGlow}` }}
              />
            </div>
          </motion.div>
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
  const opacity = useTransform(progress, [0, 0.82, 0.95, 1], [1, 1, 0.45, 0.15]);

  // Center of the black LCD in frame 0 (laptop sits slightly left; screen is mid-upper)
  const left = useTransform(scrollProgress, [0, 0.14], [46.5, 93]);
  const top = useTransform(scrollProgress, [0, 0.14], [34.5, 90]);
  const leftPct = useMotionTemplate`${left}%`;
  const topPct = useMotionTemplate`${top}%`;
  const anchorX = useTransform(scrollProgress, [0, 0.14], [-50, -100]);
  const anchorY = useTransform(scrollProgress, [0, 0.14], [-50, -100]);

  // Match open lid plane: strong pitch (screen reclined), yaw kept in the lean direction user liked,
  // foreshortened scale so it sits IN the screen rather than floating flat on top of it
  const rotateX = useTransform(scrollProgress, [0, 0.14], [34, 0]);
  const rotateY = useTransform(scrollProgress, [0, 0.14], [16, 0]);
  const rotateZ = useTransform(scrollProgress, [0, 0.14], [5, 0]);
  const scaleX = useTransform(scrollProgress, [0, 0.14], [0.94, 1]);
  const scaleY = useTransform(scrollProgress, [0, 0.14], [0.72, 1]);
  const cueTransform = useMotionTemplate`translate(${anchorX}%, ${anchorY}%) perspective(480px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scaleX}, ${scaleY})`;

  return (
    <motion.div
      className="pointer-events-none absolute z-40"
      style={{
        left: leftPct,
        top: topPct,
        opacity,
        transform: cueTransform,
        transformStyle: "preserve-3d",
      }}
      aria-hidden
    >
      <motion.div
        className="flex flex-col items-center gap-2.5"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d", transform: "translateZ(8px)" }}
      >
        <span className="text-[10px] font-medium tracking-[0.42em] text-[#e8d5b0] uppercase drop-shadow-[0_0_12px_rgba(196,165,116,0.55)] md:text-[11px]">
          Scroll
        </span>

        <div className="relative" style={{ transform: "translateZ(10px)" }}>
          <motion.div
            className="absolute -inset-3 rounded-full bg-[#c4a574]/25 blur-md"
            animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.92, 1.08, 0.92] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative flex h-14 w-8 items-start justify-center rounded-full border-2 border-[#c4a574]/70 bg-black/45 p-1.5 shadow-[0_0_28px_rgba(196,165,116,0.45),inset_0_0_18px_rgba(196,165,116,0.12)] backdrop-blur-md md:h-16 md:w-9"
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
              className="mt-0.5 h-2 w-2 rounded-full bg-[#f0e2c4] shadow-[0_0_16px_rgba(240,226,196,0.95)] md:h-2.5 md:w-2.5"
              animate={{ y: [0, 22, 0], opacity: [1, 0.35, 1] }}
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

/** First ~9s play in sticky scrub; last second shares scroll as contact feathers in. */
const VIDEO_HANDOFF = 0.9;
const SCRUB_HANDOFF_START = 0.85;

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

  // Soft dissolve into contact — no sticky lift (that created the black void)
  const featherOpacity = useTransform(scrollYProgress, [0.82, 0.92, 1], [0, 0.65, 1]);

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
        <Image
          src="/brand/ragusto-logo.png"
          alt="Ragusto"
          width={220}
          height={260}
          priority
          className="h-16 w-auto opacity-95 transition duration-500 hover:brightness-125 md:h-[4.75rem] lg:h-20"
        />
      </div>

      <section ref={scrubRef} className="relative h-[620vh] bg-[#08090b]">
        <div className="sticky top-0 z-20 h-[100svh] w-full overflow-hidden bg-black">
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

          {/* Feather hero → contact as the last second plays out */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[48%]"
            style={{
              opacity: featherOpacity,
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(8,9,11,0.25) 35%, rgba(8,9,11,0.72) 68%, #08090b 100%)",
            }}
          />
        </div>
      </section>

      <section
        id="contact"
        className="relative z-10 -mt-8 bg-[#08090b] px-6 pt-10 pb-16 md:-mt-12 md:pt-14 md:pb-20"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            background:
              "linear-gradient(to bottom, #08090b 0%, rgba(8,9,11,0.5) 40%, transparent 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,165,116,0.08),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 ambient-grid opacity-15" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-[11.5pt] tracking-[0.28em] text-[#c4a574]/90 uppercase md:text-[13pt]">
            Begin
          </p>
          <h2 className="mt-5 font-serif text-4xl tracking-tight text-white md:text-6xl lg:text-7xl">
            Ready to build something{" "}
            <span className="inline-block bg-gradient-to-br from-[#f0e2c4] via-[#c4a574] to-[#8a7350] bg-clip-text pe-[0.18em] italic text-transparent">
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
