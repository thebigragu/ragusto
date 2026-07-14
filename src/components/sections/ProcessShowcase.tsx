"use client";

import dynamic from "next/dynamic";
import { processSteps } from "@/content/process";
import { useEffect, useRef, useState } from "react";

const SceneCanvas = dynamic(
  () => import("@/components/three/SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);

const ShowcaseScene = dynamic(
  () => import("@/components/three/ShowcaseScene").then((m) => m.ShowcaseScene),
  { ssr: false },
);

/** Sticky process narrative + live 3D assembly — fluid, no boxed media */
export function ProcessShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const active = Math.min(
    processSteps.length - 1,
    Math.floor(progress * processSteps.length),
  );

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(total > 0 ? scrolled / total : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section id="process" ref={sectionRef} className="relative h-[280vh] scroll-mt-24">
      <div className="sticky top-0 flex min-h-[100svh] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg" />
        {!reduced && visible ? (
          <div className="absolute inset-0 opacity-90">
            <SceneCanvas className="h-full w-full" camera={{ position: [0, 0.2, 4.5], fov: 40 }}>
              <ShowcaseScene progress={progress} />
            </SceneCanvas>
          </div>
        ) : null}

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
