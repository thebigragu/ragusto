"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const SceneCanvas = dynamic(
  () => import("@/components/three/SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);

const ShowcaseScene = dynamic(
  () => import("@/components/three/ShowcaseScene").then((m) => m.ShowcaseScene),
  { ssr: false },
);

export function ShowcaseCanvas() {
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

  const stages = ["Discover", "Design", "Build", "Ship"];
  const active = Math.min(stages.length - 1, Math.floor(progress * stages.length));

  return (
    <div ref={sectionRef} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="container-shell grid w-full items-center gap-10 lg:grid-cols-2">
          <div className="relative z-10 space-y-6">
            <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Technology</p>
            <h2 className="font-display max-w-xl text-4xl tracking-tight md:text-6xl">
              Software forged in layers
            </h2>
            <p className="max-w-md text-fg-muted leading-relaxed">
              Scroll to assemble the pipeline — from discovery through deployment —
              as modular systems come online.
            </p>
            <ul className="flex flex-wrap gap-3 pt-2">
              {stages.map((stage, i) => (
                <li
                  key={stage}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors duration-500 ${
                    i <= active
                      ? "border-accent-blue/50 bg-accent-blue/10 text-fg"
                      : "border-border text-fg-muted"
                  }`}
                >
                  {stage}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-[42vh] min-h-[280px] w-full lg:h-[60vh]">
            {reduced || !visible ? (
              <div className="absolute inset-0 rounded-3xl ambient-grid opacity-60" />
            ) : (
              <SceneCanvas className="absolute inset-0 rounded-3xl overflow-hidden">
                <ShowcaseScene progress={progress} />
              </SceneCanvas>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-border" />
          </div>
        </div>
      </div>
    </div>
  );
}
