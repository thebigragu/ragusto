"use client";

import { processSteps } from "@/content/process";
import { AtriumHoloOverlay } from "@/components/ui/HoloOverlay";
import { CinematicVideo } from "@/components/ui/CinematicVideo";
import { useEffect, useRef, useState } from "react";

/** Sticky process narrative over cinematic atrium loop */
export function ProcessShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const active = Math.min(
    processSteps.length - 1,
    Math.floor(progress * processSteps.length),
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(total > 0 ? scrolled / total : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="process" ref={sectionRef} className="relative h-[280vh] scroll-mt-24">
      <div className="sticky top-0 flex min-h-[100svh] items-center overflow-hidden">
        <CinematicVideo
          srcBase="/videos/process-atrium-loop"
          poster="/videos/process-atrium-loop-poster.jpg"
          opacity={0.42}
          alt=""
          videoClassName="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <AtriumHoloOverlay />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg via-bg/70 to-bg" />

        <div className="container-shell relative z-10 grid w-full gap-12 py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Approach</p>
            <h2 className="font-display text-4xl tracking-tight md:text-6xl">
              From intent to shipped product
            </h2>
            <p className="max-w-md text-fg-muted leading-relaxed">
              A continuous arc — not a handoff between vendors.
            </p>
          </div>

          <ol className="space-y-0">
            {processSteps.map((step, i) => {
              const on = i === active;
              return (
                <li
                  key={step.id}
                  className="border-t border-border py-6 transition-opacity duration-500"
                  style={{ opacity: on ? 1 : 0.35 }}
                >
                  <p className="font-mono text-xs text-accent-teal">{step.phase}</p>
                  <h3 className="mt-2 font-display text-2xl tracking-tight md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm text-fg-muted leading-relaxed md:text-base">
                    {step.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
