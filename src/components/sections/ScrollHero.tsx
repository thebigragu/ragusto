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
  exitRX: number;
  exitRY: number;
  exitRZ: number;
  exitZ: number;
  orbitX: number;
  radius: string;
  glass: string;
  rim: string;
  edgeGlow: string;
  shimmerAngle: number;
  top: string;
  magnetic: number;
  depthOffset: string;
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
 * Flat glass on hold → orbit forward / enlarge / tip only on exit.
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
      exitRX: -22,
      exitRY: 32,
      exitRZ: -10,
      exitZ: 160,
      orbitX: 48,
      radius: "1.4rem",
      glass: "rgba(255,255,255,0.08)",
      rim: "rgba(255,255,255,0.28)",
      edgeGlow: "rgba(196,165,116,0.28)",
      shimmerAngle: 118,
      top: "58%",
      magnetic: 0.2,
      depthOffset: "translate3d(12px, 16px, -36px)",
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
      exitRX: -26,
      exitRY: -36,
      exitRZ: 12,
      exitZ: 190,
      orbitX: -56,
      radius: "1.15rem",
      glass: "rgba(210,230,240,0.07)",
      rim: "rgba(230,245,255,0.3)",
      edgeGlow: "rgba(150,200,210,0.26)",
      shimmerAngle: 64,
      top: "52%",
      magnetic: 0.17,
      depthOffset: "translate3d(-14px, 18px, -42px)",
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
      exitRX: -18,
      exitRY: 26,
      exitRZ: -14,
      exitZ: 145,
      orbitX: 40,
      radius: "1.7rem",
      glass: "rgba(255,248,235,0.09)",
      rim: "rgba(196,165,116,0.38)",
      edgeGlow: "rgba(196,165,116,0.4)",
      shimmerAngle: 108,
      top: "56%",
      magnetic: 0.24,
      depthOffset: "translate3d(16px, 12px, -30px)",
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
      exitRX: -30,
      exitRY: -28,
      exitRZ: 14,
      exitZ: 210,
      orbitX: -62,
      radius: "1rem",
      glass: "rgba(255,255,255,0.1)",
      rim: "rgba(255,255,255,0.32)",
      edgeGlow: "rgba(240,226,196,0.34)",
      shimmerAngle: 52,
      top: "54%",
      magnetic: 0.19,
      depthOffset: "translate3d(-18px, 14px, -48px)",
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
    // Hold clear; scatter-out on exit with per-word delay
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
  const subTokens = useMemo(() => beat.sub.split(/(\s+)/), [beat.sub]);

  // Rise from below → hold flat → orbit up / out / toward camera
  const y = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (p < beat.start) return "110vh";
    if (p >= beat.end) return "-120vh";
    if (t < ENTER_END) {
      const e = t / ENTER_END;
      const eased = e * e * (3 - 2 * e);
      return `${110 - 110 * eased}vh`;
    }
    if (t > EXIT_START) {
      const e = (t - EXIT_START) / EXIT_LEN;
      const eased = e * e * (3 - 2 * e);
      return `${0 - 120 * eased}vh`;
    }
    return "0vh";
  });

  const x = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    const e = (t - EXIT_START) / EXIT_LEN;
    const eased = e * e * (3 - 2 * e);
    return v.orbitX * Math.sin(eased * Math.PI * 0.85);
  });

  const opacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.5) return t / (ENTER_END * 0.5);
    if (t > 0.94) return Math.max(0, (1 - t) / 0.06);
    return 1;
  });

  // Depth-of-field: soft on approach, sharp on hold, soft again as they orbit out
  const blur = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 22;
    const t = beatT(p, beat);
    if (t < ENTER_END) {
      const e = t / ENTER_END;
      const smooth = e * e * (3 - 2 * e);
      return 22 * (1 - smooth);
    }
    if (t > EXIT_START) {
      const e = (t - EXIT_START) / EXIT_LEN;
      const smooth = e * e * (3 - 2 * e);
      return 20 * smooth;
    }
    return 0;
  });
  const filter = useMotionTemplate`blur(${blur}px)`;

  // Flat until exit — then swell toward camera (orbit pop)
  const scale = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0.96;
    const t = beatT(p, beat);
    if (t < ENTER_END) {
      const e = t / ENTER_END;
      return 0.96 + 0.04 * (e * e * (3 - 2 * e));
    }
    if (t > EXIT_START) {
      const e = (t - EXIT_START) / EXIT_LEN;
      return 1 + 0.42 * (e * e * (3 - 2 * e));
    }
    return 1;
  });

  // Zero angle on enter/hold — tilt only on exit
  const rotateX = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    return v.exitRX * ((t - EXIT_START) / EXIT_LEN);
  });
  const rotateY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    return v.exitRY * ((t - EXIT_START) / EXIT_LEN);
  });
  const rotateZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t <= EXIT_START) return 0;
    return v.exitRZ * ((t - EXIT_START) / EXIT_LEN);
  });
  const translateZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < ENTER_END) return -24 + 24 * (t / ENTER_END);
    if (t > EXIT_START) return v.exitZ * ((t - EXIT_START) / EXIT_LEN);
    return 0;
  });

  const faceTransform = useMotionTemplate`translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;

  // Soft diagonal light sweep — full-pane specular, not a hard rectangle
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
      rgba(255,255,255,0.22) calc(${shimmerPos}% + 9%),
      rgba(255,255,255,0.55) calc(${shimmerPos}% + 12%),
      rgba(240,226,196,0.28) calc(${shimmerPos}% + 14%),
      rgba(255,255,255,0.12) calc(${shimmerPos}% + 17%),
      transparent calc(${shimmerPos}% + 24%),
      transparent 100%)`;

  const exitSheen = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < EXIT_START + 0.02) return 0;
    if (t > 0.96) return 0;
    return Math.sin(((t - EXIT_START - 0.02) / (EXIT_LEN - 0.02)) * Math.PI) * 0.5;
  });

  const depthOpacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.7) return 0.4 * (t / (ENTER_END * 0.7));
    if (t > EXIT_START) return 0.55 * (1 - (t - EXIT_START) / EXIT_LEN);
    return 0.5;
  });

  const paneOpacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < ENTER_END * 0.45) return t / (ENTER_END * 0.45);
    if (t > EXIT_START + EXIT_LEN * 0.55) {
      const e = (t - (EXIT_START + EXIT_LEN * 0.55)) / (EXIT_LEN * 0.45);
      return Math.max(0.15, 1 - e * 0.85);
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
        x,
        y,
        filter,
        scale,
        perspective: 1800,
        transformStyle: "preserve-3d",
      }}
    >
      <Magnetic strength={v.magnetic} className="block w-full [transform-style:preserve-3d]">
        <div className="relative [transform-style:preserve-3d]" style={{ perspective: 1800 }}>
          {/* Depth plate for glass thickness */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: depthOpacity,
              borderRadius: v.radius,
              background:
                "linear-gradient(155deg, rgba(255,255,255,0.06), rgba(0,0,0,0.45) 55%, rgba(10,12,16,0.55))",
              border: `1px solid ${v.rim}`,
              boxShadow: "0 28px 70px rgba(0,0,0,0.5)",
              transform: `${v.depthOffset} scale(0.985)`,
              transformStyle: "preserve-3d",
            }}
          />

          <motion.div
            className="group relative cursor-default overflow-hidden p-6 backdrop-blur-2xl md:p-8"
            style={{
              opacity: paneOpacity,
              borderRadius: v.radius,
              background: `linear-gradient(145deg, ${v.glass}, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06))`,
              border: `1px solid ${v.rim}`,
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.06) inset,
                0 1px 0 0 rgba(255,255,255,0.22) inset,
                0 -1px 0 0 rgba(0,0,0,0.25) inset,
                0 0 50px -10px ${v.edgeGlow},
                0 32px 80px rgba(0,0,0,0.55)
              `,
              transform: faceTransform,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Glass face refraction */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: v.radius,
                background:
                  "linear-gradient(125deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 22%, transparent 42%, transparent 68%, rgba(255,255,255,0.05) 100%)",
                mixBlendMode: "soft-light",
              }}
            />

            {/* Soft edge caustic */}
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                borderRadius: v.radius,
                boxShadow: `inset 0 0 40px ${v.edgeGlow}`,
              }}
            />

            {/* Believable specular sweep across the full pane */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: shimmerOpacity,
                borderRadius: v.radius,
                background: shimmerBackground,
                mixBlendMode: "screen",
                filter: "blur(6px)",
              }}
            />

            {/* Exit light catch as it tips toward camera */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: exitSheen,
                borderRadius: v.radius,
                background:
                  "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(255,255,255,0.35), transparent 55%)",
                mixBlendMode: "soft-light",
              }}
            />

            <div className="relative" style={{ transform: "translateZ(48px)" }}>
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
                style={{ boxShadow: `0 0 12px ${v.edgeGlow}` }}
              />
            </div>
          </motion.div>
        </div>
      </Magnetic>
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
  // Softens near the end of the video timeline
  const opacity = useTransform(progress, [0, 0.82, 0.95, 1], [1, 1, 0.45, 0.15]);

  // Glide from laptop-screen center → bottom-right with early scroll wheel travel
  const left = useTransform(scrollProgress, [0, 0.14], [47, 94]);
  const top = useTransform(scrollProgress, [0, 0.14], [40, 91]);
  const leftPct = useMotionTemplate`${left}%`;
  const topPct = useMotionTemplate`${top}%`;
  const anchorX = useTransform(scrollProgress, [0, 0.14], [-50, -100]);
  const anchorY = useTransform(scrollProgress, [0, 0.14], [-50, -100]);

  // Match open MacBook lid (yaw left, pitch back) — flatten as it parks in the corner
  const rotateX = useTransform(scrollProgress, [0, 0.14], [16, 0]);
  const rotateY = useTransform(scrollProgress, [0, 0.14], [-26, 0]);
  const rotateZ = useTransform(scrollProgress, [0, 0.14], [-4, 0]);
  const scale = useTransform(scrollProgress, [0, 0.14], [0.86, 1]);
  const cueTransform = useMotionTemplate`translate(${anchorX}%, ${anchorY}%) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;

  return (
    <motion.div
      className="pointer-events-none absolute z-40"
      style={{
        left: leftPct,
        top: topPct,
        opacity,
        transform: cueTransform,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
      aria-hidden
    >
      <motion.div
        className="flex flex-col items-center gap-3"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <span className="text-[11px] font-medium tracking-[0.42em] text-[#e8d5b0] uppercase drop-shadow-[0_0_12px_rgba(196,165,116,0.55)] md:text-xs">
          Scroll
        </span>

        <div className="relative" style={{ transform: "translateZ(12px)" }}>
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

/** First ~9s of the ~10s clip play in the sticky scrub; last second shares scroll with contact entry. */
const VIDEO_HANDOFF = 0.9;
/** Portion of scrub scroll reserved for that last second + contact reveal */
const SCRUB_HANDOFF_START = 0.8;

export function ScrollHero() {
  const scrubRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bleedRef = useRef<HTMLVideoElement>(null);
  const targetTime = useRef(0);
  const rafRef = useRef(0);
  const [contactOpen, setContactOpen] = useState(false);
  const closeContact = useCallback(() => setContactOpen(false), []);

  const { scrollYProgress } = useScroll({
    target: scrubRef,
    offset: ["start start", "end end"],
  });

  // Map scroll so contact can enter while the final second of video still scrubs
  const videoProgress = useTransform(scrollYProgress, (p) => {
    if (p <= SCRUB_HANDOFF_START) {
      return (p / SCRUB_HANDOFF_START) * VIDEO_HANDOFF;
    }
    const handoff = (p - SCRUB_HANDOFF_START) / (1 - SCRUB_HANDOFF_START);
    return VIDEO_HANDOFF + handoff * (1 - VIDEO_HANDOFF);
  });

  useMotionValueEvent(videoProgress, "change", (p) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    targetTime.current = Math.min(video.duration - 0.001, Math.max(0, p) * video.duration);
    // Keep bleed plate in sync during the handoff so the join never freezes early
    const bleed = bleedRef.current;
    if (bleed && Number.isFinite(bleed.duration) && bleed.duration > 0) {
      const t = Math.min(bleed.duration - 0.001, Math.max(0, p) * bleed.duration);
      if (Math.abs(bleed.currentTime - t) > 0.04) {
        try {
          bleed.currentTime = t;
        } catch {
          /* ignore */
        }
      }
    }
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.playsInline = true;

    const syncBleed = () => {
      const bleed = bleedRef.current;
      if (!bleed || !Number.isFinite(video.duration) || video.duration <= 0) return;
      bleed.pause();
      try {
        bleed.currentTime = Math.min(
          video.duration - 0.001,
          Math.max(0, videoProgress.get()) * video.duration,
        );
      } catch {
        /* ignore */
      }
    };

    const onMeta = () => {
      targetTime.current = Math.min(
        video.duration - 0.001,
        Math.max(0, videoProgress.get()) * video.duration,
      );
      syncBleed();
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);
    const bleed = bleedRef.current;
    bleed?.addEventListener("loadedmetadata", syncBleed);

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
      bleed?.removeEventListener("loadedmetadata", syncBleed);
      cancelAnimationFrame(rafRef.current);
    };
  }, [videoProgress]);

  return (
    <>
      {/* Extra length on the handoff so last second + contact entry share scroll room */}
      <section ref={scrubRef} className="relative h-[620vh] bg-black">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-center"
            src="/videos/hero-kling.mp4"
            muted
            playsInline
            preload="auto"
            aria-hidden
          />

          <div className="absolute top-10 left-10 z-30 md:top-14 md:left-14">
            <Image
              src="/brand/ragusto-logo.png"
              alt="Ragusto"
              width={220}
              height={260}
              priority
              className="h-16 w-auto opacity-95 transition duration-500 hover:brightness-125 md:h-[4.75rem] lg:h-20"
            />
          </div>

          {BEATS.map((beat) => (
            <BeatCard key={beat.id} beat={beat} progress={videoProgress} />
          ))}

          <ScrollCue progress={videoProgress} scrollProgress={scrollYProgress} />
        </div>
      </section>

      {/* Pull contact in earlier so it meets the last second of scrub */}
      <section
        id="contact"
        className="relative -mt-[72vh] overflow-hidden px-6 pb-28 pt-[52vh] md:-mt-[78vh] md:pb-36 md:pt-[58vh]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[78vh] overflow-hidden">
          <video
            ref={bleedRef}
            className="absolute inset-0 h-full w-full scale-[1.04] object-cover object-center"
            src="/videos/hero-kling.mp4"
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(8,9,11,0) 0%, rgba(8,9,11,0.12) 28%, rgba(8,9,11,0.55) 58%, rgba(8,9,11,0.88) 78%, #08090b 100%)",
            }}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 top-[55%] bg-[#08090b]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,165,116,0.1),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 ambient-grid opacity-20" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-base tracking-[0.28em] text-[#c4a574]/90 uppercase md:text-lg">
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
                className="bg-[#c4a574] text-[#0c0c0e] hover:bg-[#d4b888] hover:text-[#0c0c0e]"
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
