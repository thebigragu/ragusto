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
import { useCallback, useEffect, useRef, useState } from "react";

type BeatVariant = {
  /** Resting 3D pose */
  holdRX: number;
  holdRY: number;
  holdRZ: number;
  /** Exit tip + come-forward */
  exitRX: number;
  exitRY: number;
  exitRZ: number;
  exitZ: number;
  enterZ: number;
  radius: string;
  glass: string;
  rim: string;
  edgeGlow: string;
  shimmerAngle: number;
  shimmerFrom: string;
  top: string;
  magnetic: number;
  depthPlate: string;
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
 * Each card: rise from below → hold crystal clear → levitate out the top.
 * Variants keep the same glass language with different 3D attitudes.
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
      holdRX: 6,
      holdRY: 14,
      holdRZ: -1.5,
      exitRX: -18,
      exitRY: 28,
      exitRZ: -8,
      exitZ: 90,
      enterZ: -40,
      radius: "1.35rem",
      glass: "rgba(255,255,255,0.055)",
      rim: "rgba(255,255,255,0.16)",
      edgeGlow: "rgba(196,165,116,0.22)",
      shimmerAngle: 118,
      shimmerFrom: "-130%",
      top: "58%",
      magnetic: 0.22,
      depthPlate: "translate3d(10px, 14px, -28px) rotateY(18deg) rotateX(8deg)",
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
      holdRX: 4,
      holdRY: -16,
      holdRZ: 2,
      exitRX: -22,
      exitRY: -32,
      exitRZ: 10,
      exitZ: 110,
      enterZ: -55,
      radius: "1.1rem",
      glass: "rgba(180,210,220,0.05)",
      rim: "rgba(220,235,245,0.18)",
      edgeGlow: "rgba(140,190,200,0.2)",
      shimmerAngle: 62,
      shimmerFrom: "130%",
      top: "52%",
      magnetic: 0.18,
      depthPlate: "translate3d(-12px, 16px, -34px) rotateY(-20deg) rotateX(6deg)",
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
      holdRX: 8,
      holdRY: 11,
      holdRZ: -3,
      exitRX: -14,
      exitRY: 22,
      exitRZ: -14,
      exitZ: 75,
      enterZ: -30,
      radius: "1.75rem",
      glass: "rgba(255,248,235,0.06)",
      rim: "rgba(196,165,116,0.28)",
      edgeGlow: "rgba(196,165,116,0.35)",
      shimmerAngle: 105,
      shimmerFrom: "-140%",
      top: "56%",
      magnetic: 0.26,
      depthPlate: "translate3d(14px, 10px, -22px) rotateY(14deg) rotateX(10deg)",
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
      holdRX: 5,
      holdRY: -12,
      holdRZ: 1.5,
      exitRX: -28,
      exitRY: -24,
      exitRZ: 12,
      exitZ: 130,
      enterZ: -48,
      radius: "0.95rem",
      glass: "rgba(255,255,255,0.07)",
      rim: "rgba(255,255,255,0.2)",
      edgeGlow: "rgba(240,226,196,0.28)",
      shimmerAngle: 48,
      shimmerFrom: "125%",
      top: "54%",
      magnetic: 0.2,
      depthPlate: "translate3d(-16px, 12px, -40px) rotateY(-16deg) rotateX(9deg)",
    },
  },
];

function EmphLine({
  words,
  className,
}: {
  words: { t: string; emph?: boolean }[];
  className?: string;
}) {
  return (
    <p className={className}>
      {words.map((w, i) => (
        <span key={`${w.t}-${i}`}>
          {i > 0 ? " " : null}
          <span
            className={
              w.emph
                ? "bg-gradient-to-br from-[#f0e2c4] via-[#c4a574] to-[#8a7350] bg-clip-text font-serif italic text-transparent"
                : undefined
            }
          >
            {w.t}
          </span>
        </span>
      ))}
    </p>
  );
}

function EmphSub({ text, emph = [] }: { text: string; emph?: string[] }) {
  const parts = text.split(/(\s+)/);
  return (
    <p className="mt-3 text-sm tracking-[0.18em] text-white/55 uppercase md:text-[0.95rem]">
      {parts.map((part, i) => {
        const clean = part.replace(/[.—,]/g, "");
        const hit = emph.some((e) => clean.toLowerCase() === e.toLowerCase());
        if (!hit || /^\s+$/.test(part)) return <span key={i}>{part}</span>;
        return (
          <span key={i} className="text-[#c4a574]">
            {part}
          </span>
        );
      })}
    </p>
  );
}

function beatT(p: number, beat: Beat) {
  if (p < beat.start) return 0;
  if (p >= beat.end) return 1;
  return (p - beat.start) / (beat.end - beat.start);
}

function BeatCard({
  beat,
  progress,
}: {
  beat: Beat;
  progress: MotionValue<number>;
}) {
  const v = beat.variant;

  // Rise from below hero → long clear hold → exit out the top
  const y = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (p < beat.start) return "110vh";
    if (p >= beat.end) return "-110vh";
    if (t < 0.14) return `${110 - 110 * (t / 0.14)}vh`;
    if (t > 0.78) return `${0 - 110 * ((t - 0.78) / 0.22)}vh`;
    return "0vh";
  });

  const opacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < 0.08) return t / 0.08;
    if (t > 0.9) return Math.max(0, (1 - t) / 0.1);
    return 1;
  });

  const blur = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 16;
    const t = beatT(p, beat);
    if (t < 0.08) return 16 * (1 - t / 0.08);
    if (t > 0.9) return 12 * ((t - 0.9) / 0.1);
    return 0;
  });
  const filter = useMotionTemplate`blur(${blur}px)`;

  const scale = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0.92;
    const t = beatT(p, beat);
    if (t < 0.14) return 0.92 + 0.08 * (t / 0.14);
    if (t > 0.78) return 1 + 0.08 * ((t - 0.78) / 0.22); // swell toward camera on exit
    return 1;
  });

  // Dimensional tilt — settle into pose, then tip + come forward on exit
  const rotateX = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (p < beat.start) return v.holdRX + 12;
    if (t < 0.14) return v.holdRX + 12 * (1 - t / 0.14);
    if (t > 0.78) return v.holdRX + (v.exitRX - v.holdRX) * ((t - 0.78) / 0.22);
    return v.holdRX;
  });
  const rotateY = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (p < beat.start) return v.holdRY * 1.35;
    if (t < 0.14) return v.holdRY * (1.35 - 0.35 * (t / 0.14));
    if (t > 0.78) return v.holdRY + (v.exitRY - v.holdRY) * ((t - 0.78) / 0.22);
    return v.holdRY;
  });
  const rotateZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < 0.14) return v.holdRZ * (t / 0.14);
    if (t > 0.78) return v.holdRZ + (v.exitRZ - v.holdRZ) * ((t - 0.78) / 0.22);
    return v.holdRZ;
  });
  const translateZ = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (p < beat.start) return v.enterZ;
    if (t < 0.14) return v.enterZ + (0 - v.enterZ) * (t / 0.14);
    if (t > 0.78) return v.exitZ * ((t - 0.78) / 0.22);
    return 0;
  });

  const faceTransform = useMotionTemplate`translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;

  // Mirror sheen glides as the card becomes legible
  const shimmerX = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    const from = parseFloat(v.shimmerFrom);
    if (t < 0.04 || t > 0.32) return from;
    const e = (t - 0.04) / 0.28;
    return from + (0 - from) * e + (from < 0 ? 160 : -160) * e;
  });
  const shimmerOpacity = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < 0.05) return 0;
    if (t < 0.12) return (t - 0.05) / 0.07;
    if (t < 0.22) return 1;
    if (t < 0.32) return 1 - (t - 0.22) / 0.1;
    return 0;
  });
  const shimmerXPct = useMotionTemplate`${shimmerX}%`;

  // Soft secondary sheen on exit tip
  const exitSheen = useTransform(progress, (p) => {
    const t = beatT(p, beat);
    if (t < 0.8) return 0;
    if (t > 0.95) return 0;
    return Math.sin(((t - 0.8) / 0.15) * Math.PI) * 0.55;
  });

  const depthOpacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = beatT(p, beat);
    if (t < 0.1) return 0.35 * (t / 0.1);
    if (t > 0.82) return 0.35 * (1 - (t - 0.82) / 0.18);
    return 0.45;
  });

  const sideClass =
    beat.side === "left"
      ? "left-4 origin-left md:left-10 lg:left-16"
      : "right-4 origin-right md:right-10 lg:right-16";

  return (
    <motion.div
      className={`pointer-events-auto absolute z-20 max-w-[min(92vw,28rem)] -translate-y-1/2 ${sideClass}`}
      style={{
        top: v.top,
        opacity,
        y,
        filter,
        scale,
        perspective: 1600,
        transformStyle: "preserve-3d",
      }}
    >
      <Magnetic strength={v.magnetic} className="block w-full [transform-style:preserve-3d]">
        <div className="relative [transform-style:preserve-3d]" style={{ perspective: 1600 }}>
          {/* Depth plate — ghost face behind the glass */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: depthOpacity,
              borderRadius: v.radius,
              background: "linear-gradient(145deg, rgba(0,0,0,0.55), rgba(20,24,32,0.35))",
              border: `1px solid ${v.rim}`,
              boxShadow: `0 24px 60px rgba(0,0,0,0.45)`,
              transform: v.depthPlate,
              transformStyle: "preserve-3d",
            }}
          />

          <motion.div
            className="group relative cursor-default overflow-hidden p-6 shadow-[0_36px_90px_rgba(0,0,0,0.58),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl md:p-8"
            style={{
              borderRadius: v.radius,
              background: v.glass,
              border: `1px solid ${v.rim}`,
              boxShadow: `0 0 40px -12px ${v.edgeGlow}, 0 28px 70px rgba(0,0,0,0.5)`,
              transform: faceTransform,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Specular rim */}
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                borderRadius: v.radius,
                background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 38%, transparent 62%, ${v.edgeGlow} 100%)`,
                transform: "translateZ(2px)",
              }}
            />

            {/* Enter mirror shimmer */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-[-20%] w-[42%]"
              style={{
                x: shimmerXPct,
                opacity: shimmerOpacity,
                rotate: v.shimmerAngle,
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 28%, rgba(255,255,255,0.55) 48%, rgba(240,226,196,0.35) 52%, rgba(255,255,255,0.08) 68%, transparent 100%)",
                mixBlendMode: "screen",
                filter: "blur(1px)",
                transform: "translateZ(36px)",
              }}
            />

            {/* Exit tip highlight */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: exitSheen,
                borderRadius: v.radius,
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.28) 0%, transparent 40%, transparent 70%, rgba(196,165,116,0.18) 100%)",
                mixBlendMode: "soft-light",
                transform: "translateZ(8px)",
              }}
            />

            <div className="relative" style={{ transform: "translateZ(40px)" }}>
              <EmphLine
                words={beat.words}
                className="font-serif text-3xl leading-[1.1] tracking-tight text-white sm:text-4xl md:text-[2.75rem]"
              />
              <EmphSub text={beat.sub} emph={beat.subEmph} />
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

function ScrollCue({ progress }: { progress: MotionValue<number> }) {
  // Visible from first paint; only softens near the end of the scrub
  const opacity = useTransform(progress, [0, 0.82, 0.95, 1], [1, 1, 0.45, 0.15]);

  return (
    <motion.div
      className="pointer-events-none absolute right-5 bottom-7 z-40 md:right-10 md:bottom-10"
      style={{ opacity }}
      initial={{ y: 14 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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
          {/* Soft gold halo */}
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
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="-mt-1.5 opacity-55" aria-hidden>
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

  // Soften sticky bottom veil near the end so the last frame can bleed through
  const bottomVeilOpacity = useTransform(scrollYProgress, [0.7, 0.92, 1], [0.9, 0.35, 0.05]);

  // Direct scroll → time (no spring lag that feels like pausing)
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    targetTime.current = Math.min(video.duration - 0.001, Math.max(0, p) * video.duration);
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
        bleed.currentTime = Math.max(0, video.duration - 0.04);
      } catch {
        /* ignore */
      }
    };

    const onMeta = () => {
      targetTime.current = Math.min(
        video.duration - 0.001,
        Math.max(0, scrollYProgress.get()) * video.duration,
      );
      syncBleed();
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

    const bleed = bleedRef.current;
    bleed?.addEventListener("loadedmetadata", syncBleed);

    // rAF seek loop: every display frame maps to the scroll-driven target
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
  }, [scrollYProgress]);

  return (
    <>
      <section ref={scrubRef} className="relative h-[560vh] bg-black">
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

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/35" />
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/55 to-transparent"
            style={{ opacity: bottomVeilOpacity }}
          />

          <div className="absolute top-0 left-0 z-30 p-4 md:p-6">
            <Magnetic strength={0.14}>
              <Image
                src="/brand/ragusto-logo.png"
                alt="Ragusto"
                width={200}
                height={240}
                priority
                className="h-14 w-auto opacity-45 transition duration-500 hover:opacity-75 md:h-16 lg:h-[4.5rem]"
              />
            </Magnetic>
          </div>

          {BEATS.map((beat) => (
            <BeatCard key={beat.id} beat={beat} progress={scrollYProgress} />
          ))}

          <ScrollCue progress={scrollYProgress} />
        </div>
      </section>

      {/* Last-frame bleed into contact */}
      <section aria-hidden className="relative -mt-[30vh] h-[min(78vh,700px)] overflow-hidden">
        <video
          ref={bleedRef}
          className="absolute inset-0 h-full w-full scale-[1.12] object-cover object-center blur-2xl brightness-[0.82] saturate-[1.08]"
          src="/videos/hero-kling.mp4"
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
        />
        <div className="absolute inset-0 bg-black/15 backdrop-blur-2xl" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(8,9,11,0.2) 25%, rgba(8,9,11,0.58) 55%, rgba(8,9,11,0.9) 78%, #08090b 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 95% 65% at 50% 18%, rgba(196,165,116,0.16), transparent 62%)",
            maskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
          }}
        />
      </section>

      <section
        id="contact"
        className="relative -mt-28 overflow-hidden bg-[#08090b] px-6 pt-6 pb-28 md:-mt-36 md:pt-8 md:pb-36"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-transparent via-[#08090b]/65 to-[#08090b]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,165,116,0.12),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 ambient-grid opacity-20" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs tracking-[0.35em] text-[#c4a574]/80 uppercase">Begin</p>
          <h2 className="mt-5 font-serif text-4xl tracking-tight text-white md:text-6xl lg:text-7xl">
            Ready to build something{" "}
            <span className="bg-gradient-to-br from-[#f0e2c4] via-[#c4a574] to-[#8a7350] bg-clip-text italic text-transparent">
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
