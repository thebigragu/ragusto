"use client";

import { Button } from "@/components/ui/Button";
import { ContactModal } from "@/components/ui/ContactModal";
import { Magnetic } from "@/components/ui/Magnetic";
import { SITE } from "@/lib/seo";
import { cn } from "@/lib/utils";
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
import { useCallback, useEffect, useRef, useState } from "react";

type Beat = {
  id: string;
  text: string;
  sub?: string;
  /** Inclusive start of visibility on scrub progress 0–1 */
  start: number;
  /** Exclusive end */
  end: number;
};

/** Timed to Kling hero beats: desk → levitate/UI → orbit → approach */
const BEATS: Beat[] = [
  {
    id: "spark",
    text: "Intelligence, composed",
    sub: "Where craft meets computation",
    start: 0.04,
    end: 0.22,
  },
  {
    id: "design",
    text: "AI web design",
    sub: "Interfaces that feel inevitable",
    start: 0.24,
    end: 0.42,
  },
  {
    id: "apps",
    text: "Apps, engineered",
    sub: "Products built to ship — and endure",
    start: 0.44,
    end: 0.62,
  },
  {
    id: "arc",
    text: "From spark to shipped",
    sub: "One atelier. End to end.",
    start: 0.64,
    end: 0.84,
  },
];

function BeatLine({
  beat,
  progress,
}: {
  beat: Beat;
  progress: MotionValue<number>;
}) {
  const local = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = (p - beat.start) / (beat.end - beat.start);
    // Rise in, hold, evaporate up
    if (t < 0.18) return t / 0.18;
    if (t > 0.78) return (1 - t) / 0.22;
    return 1;
  });

  const y = useTransform(local, [0, 1], [56, 0]);
  const exitY = useTransform(progress, (p) => {
    if (p < beat.start || p >= beat.end) return 0;
    const t = (p - beat.start) / (beat.end - beat.start);
    if (t > 0.78) return -((t - 0.78) / 0.22) * 48;
    return 0;
  });
  const combinedY = useTransform([y, exitY], ([a, b]) => (a as number) + (b as number));
  const opacity = local;
  const blur = useTransform(local, [0, 0.35, 1], [10, 0, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const scale = useTransform(local, [0, 1], [0.96, 1]);

  return (
    <motion.div
      className="pointer-events-auto absolute inset-x-0 bottom-[18%] z-20 flex justify-center px-6 md:bottom-[20%]"
      style={{ opacity, y: combinedY, filter, scale }}
    >
      <Magnetic strength={0.22} className="max-w-3xl text-center">
        <div className="group cursor-default">
          <p className="font-serif text-3xl tracking-tight text-white transition duration-500 group-hover:text-[#e8d5b0] sm:text-4xl md:text-5xl lg:text-6xl">
            {beat.text}
          </p>
          {beat.sub && (
            <p className="mt-3 text-sm tracking-[0.22em] text-white/55 uppercase transition duration-500 group-hover:text-white/80 md:text-base">
              {beat.sub}
            </p>
          )}
          <span className="mx-auto mt-5 block h-px w-0 bg-gradient-to-r from-transparent via-[#c4a574] to-transparent transition-all duration-500 group-hover:w-40" />
        </div>
      </Magnetic>
    </motion.div>
  );
}

function ScrollCue({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.08, 0.88, 1], [0, 1, 1, 0.15]);

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
  const [contactOpen, setContactOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const closeContact = useCallback(() => setContactOpen(false), []);

  const { scrollYProgress } = useScroll({
    target: scrubRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.35,
  });

  useMotionValueEvent(smoothProgress, "change", (p) => {
    const video = videoRef.current;
    if (!video || !ready || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const t = Math.min(0.999, Math.max(0, p)) * video.duration;
    if (Math.abs(video.currentTime - t) > 0.025) {
      try {
        video.currentTime = t;
      } catch {
        /* ignore seek abort */
      }
    }
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onMeta = () => setReady(true);
    if (video.readyState >= 1) setReady(true);
    video.addEventListener("loadedmetadata", onMeta);
    return () => video.removeEventListener("loadedmetadata", onMeta);
  }, []);

  return (
    <>
      <section ref={scrubRef} className="relative h-[320vh] bg-black">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/hero-kling.mp4"
            muted
            playsInline
            preload="auto"
            aria-hidden
          />

          {/* Readability + hide Kling watermark corner */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/45" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-24 w-40 bg-gradient-to-tl from-black via-black/90 to-transparent" />

          <div className="absolute top-0 left-0 z-30 p-5 md:p-8">
            <Magnetic strength={0.18}>
              <Image
                src="/brand/ragusto-logo.png"
                alt="Ragusto"
                width={200}
                height={240}
                priority
                className="h-14 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] md:h-[4.5rem]"
              />
            </Magnetic>
          </div>

          {BEATS.map((beat) => (
            <BeatLine key={beat.id} beat={beat} progress={smoothProgress} />
          ))}

          <ScrollCue progress={smoothProgress} />
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
            Ready to build something exceptional?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
            {SITE.description}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <Button
                type="button"
                onClick={() => setContactOpen(true)}
                className="bg-[#c4a574] text-[#0c0c0e] hover:bg-[#d4b888] hover:text-[#0c0c0e]"
              >
                Get in touch
              </Button>
            </Magnetic>
            <Magnetic>
              <a
                href={`mailto:${SITE.email}`}
                className={cn(
                  "inline-flex rounded-full border border-white/20 px-7 py-3.5 text-sm tracking-wide text-white/80 transition hover:border-white/40 hover:text-white",
                )}
              >
                {SITE.email}
              </a>
            </Magnetic>
          </div>
        </div>
      </section>

      <ContactModal open={contactOpen} onClose={closeContact} />
    </>
  );
}
