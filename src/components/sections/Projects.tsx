"use client";

import {
  AtriumHoloOverlay,
  BenchHoloOverlay,
  HeroHoloOverlay,
} from "@/components/ui/HoloOverlay";
import { InteractiveMedia } from "@/components/ui/InteractiveMedia";
import { projects } from "@/content/projects";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const visuals: { src: string; overlay: ReactNode }[] = [
  { src: "/images/studio-bench.jpg", overlay: <BenchHoloOverlay /> },
  { src: "/images/hero-studio.jpg", overlay: <HeroHoloOverlay /> },
  { src: "/images/studio-atrium.jpg", overlay: <AtriumHoloOverlay /> },
];

export function Projects() {
  return (
    <section id="work" className="section-pad scroll-mt-24">
      <div className="container-shell">
        <div className="mb-16 max-w-xl space-y-4">
          <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Selected work</p>
          <h2 className="font-display text-4xl tracking-tight md:text-6xl">
            Products that feel inevitable
          </h2>
        </div>

        <div className="space-y-20 md:space-y-28">
          {projects.map((project, i) => {
            const visual = visuals[i % visuals.length];
            return (
              <motion.article
                key={project.id}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <InteractiveMedia
                  src={visual.src}
                  alt={project.name}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  intensity={0.85}
                  className={`aspect-[5/4] ${i % 2 === 1 ? "lg:order-2" : ""}`}
                  overlay={visual.overlay}
                  grade={<div className="absolute inset-0 bg-black/10" />}
                />

                <div className={`space-y-5 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <p className="text-xs tracking-[0.25em] text-fg-muted uppercase">
                    {project.category}
                  </p>
                  <h3 className="font-display text-3xl tracking-tight md:text-5xl">
                    {project.name}
                  </h3>
                  <p className="max-w-md text-fg-muted leading-relaxed md:text-lg">
                    {project.description}
                  </p>
                  <p className="font-mono text-xs text-fg-muted">
                    {project.stack.join(" · ")}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
