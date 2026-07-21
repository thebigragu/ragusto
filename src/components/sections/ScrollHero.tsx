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

type Beat = {
  id: string;
  words: { t: string; emph?: boolean }[];
  sub: string;
  subEmph?: string[];
  side: "left" | "right";
  start: number;
  end: number;
};

/**
 * Timed across full scrub so the video finishes before the CTA.
 * Each card: rise from below → hold crystal clear → levitate out the top.
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

function BeatCard({
  beat,
  progress,
}: {
  beat: Beat;
  progress: MotionValue<number>;
}) {
  // Rise from below hero → long clear hold → exit out the top
  const y = useTransform(progress, (p) => {
    if (p < beat.start) return "110vh";
    if (p >= beat.end) return "-110vh";
    const t = (p - beat.start) / (beat.end - beat.start);
    if (t < 0.14) {
      const e = t / 0.14;
      return `${110 - 110 * e}vh`; // 110vh → 0 (hold band)
    }
    if (t > 0.78) {
      const e = (t - 0.78) / 0.22;
      return `${0 - 110 * e}vh`; // 0 → -110vh
    }
    return "0vh";
  });

  const opacity = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = (p - beat.start) / (beat.end - beat.start);
    if (t < 0.08) return t / 0.08;
    if (t > 0.9) return Math.max(0, (1 - t) / 0.1);
    return 1;
  });

  // Short blur in/out — crystal clear for most of the hold
  const blur = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 16;
    const t = (p - beat.start) / (beat.end - beat.start);
    if (t < 0.08) return 16 * (1 - t / 0.08);
    if (t > 0.9) return 12 * ((t - 0.9) / 0.1);
    return 0;
  });
  const filter = useMotionTemplate`blur(${blur}px)`;
  const scale = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0.94;
    const t = (p - beat.start) / (beat.end - beat.start);
    if (t < 0.14) return 0.94 + 0.06 * (t / 0.14);
    if (t > 0.78) return 1 - 0.04 * ((t - 0.78) / 0.22);
    return 1;
  });
  const rotateY = beat.side === "left" ? 9 : -9;

  const sideClass =
    beat.side === "left"
      ? "left-4 origin-left md:left-10 lg:left-16"
      : "right-4 origin-right md:right-10 lg:right-16";

  return (
    <motion.div
      className={`pointer-events-auto absolute top-[58%] z-20 max-w-[min(92vw,28rem)] -translate-y-1/2 md:top-[55%] ${sideClass}`}
      style={{
        opacity,
        y,
        filter,
        scale,
        perspective: 1400,
      }}
    >
      <Magnetic strength={0.2} className="block w-full">
        <div
          className="group relative cursor-default rounded-2xl border border-white/15 bg-white/[0.06] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition duration-500 hover:border-[#c4a574]/35 hover:bg-white/[0.09] md:p-8"
          style={{
            transform: `rotateY(${rotateY}deg) rotateX(4deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-60"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 42%, transparent 58%, rgba(196,165,116,0.08) 100%)",
              transform: "translateZ(1px)",
            }}
          />
          <div className="relative" style={{ transform: "translateZ(28px)" }}>
            <EmphLine
              words={beat.words}
              className="font-serif text-3xl leading-[1.1] tracking-tight text-white sm:text-4xl md:text-[2.75rem]"
            />
            <EmphSub text={beat.sub} emph={beat.subEmph} />
            <span className="mt-5 block h-px w-12 bg-gradient-to-r from-[#c4a574] to-transparent transition-all duration-500 group-hover:w-28" />
          </div>
        </div>
      </Magnetic>
    </motion.div>
  );
}

function ScrollCue({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.05, 0.9, 1], [0, 1, 0.85, 0.2]);

  return (
    <motion.div
      className="pointer-events-none absolute right-5 bottom-6 z-30 md:right-8 md:bottom-8"
      style={{ opacity }}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.35em] text-white/50 uppercase">Scroll</span>
        <motion.div
          className="flex h-12 w-7 items-start justify-center rounded-full border border-white/25 bg-black/30 p-1.5 backdrop-blur-sm"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-[#c4a574] shadow-[0_0_12px_rgba(196,165,116,0.75)]"
            animate={{ y: [0, 16, 0], opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

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

    const onMeta = () => {
      targetTime.current = Math.min(
        video.duration - 0.001,
        Math.max(0, scrollYProgress.get()) * video.duration,
      );
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

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

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute top-0 right-0 z-30 p-5 md:p-8">
            <Magnetic strength={0.16}>
              <Image
                src="/brand/ragusto-logo.png"
                alt="Ragusto"
                width={320}
                height={380}
                priority
                className="h-24 w-auto opacity-50 transition duration-500 hover:opacity-80 md:h-32 lg:h-40"
              />
            </Magnetic>
          </div>

          {BEATS.map((beat) => (
            <BeatCard key={beat.id} beat={beat} progress={scrollYProgress} />
          ))}

          <ScrollCue progress={scrollYProgress} />
        </div>
      </section>

      <section
        id="contact"
        className="relative overflow-hidden border-t border-white/10 bg-[#08090b] px-6 py-28 md:py-36"
      >
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
