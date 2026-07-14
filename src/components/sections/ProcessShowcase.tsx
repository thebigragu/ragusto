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

/** Process + product assembly in one section — no separate Technology block */
export function ProcessShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

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

  const active = Math.min(
    processSteps.length - 1,
    Math.floor(progress * processSteps.length),
  );

  return (
    <section id="process" ref={sectionRef} className="relative h-[240vh] scroll-mt-24">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden border-y border-border">
        <div className="container-shell grid w-full items-center gap-10 lg:grid-cols-2">
          <div className="relative z-10 space-y-6">
            <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Experience</p>
            <h2 className="font-display max-w-xl text-4xl tracking-tight md:text-6xl">
              Spaces built for ambition
            </h2>
            <p className="max-w-md text-fg-muted leading-relaxed">
              Scroll through an immersive studio landscape — architecture, light,
              and atmosphere composing the way we build for modern brands.
            </p>
            <ol className="space-y-3 pt-2">
              {processSteps.map((step, i) => (
                <li
                  key={step.id}
                  className={`rounded-2xl border px-4 py-3 transition-colors duration-500 ${
                    i === active
                      ? "border-accent-blue/40 bg-accent-blue/10"
                      : "border-border text-fg-muted"
                  }`}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-accent-blue">{step.phase}</span>
                    <span className="font-display text-lg tracking-tight text-fg">
                      {step.title}
                    </span>
                  </div>
                  {i === active && (
                    <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="relative h-[42vh] min-h-[280px] w-full lg:h-[62vh]">
            {reduced || !visible ? (
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at 40% 40%, color-mix(in oklab, var(--accent-blue) 20%, transparent), transparent 60%), var(--bg-elevated)",
                }}
              />
            ) : (
              <SceneCanvas className="absolute inset-0 overflow-hidden rounded-3xl">
                <ShowcaseScene progress={progress} />
              </SceneCanvas>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-border" />
          </div>
        </div>
      </div>
    </section>
  );
}
