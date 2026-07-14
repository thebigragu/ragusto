"use client";

import { projects } from "@/content/projects";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/** Full-bleed stacked case studies — no cards, seamless scroll flow */
export function Projects() {
  return (
    <section id="work" className="scroll-mt-24">
      <div className="container-shell section-pad pb-8 md:pb-12">
        <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Selected work</p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl tracking-tight md:text-6xl lg:text-7xl">
          Products that feel inevitable
        </h2>
      </div>

      <div className="space-y-0">
        {projects.map((project, i) => (
          <ProjectBand key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}

function ProjectBand({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.35, 1, 1, 0.4]);

  return (
    <article
      ref={ref}
      className="relative flex min-h-[85vh] items-end overflow-hidden border-t border-border md:min-h-[100svh]"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          y,
          background: `
            radial-gradient(ellipse at ${index % 2 === 0 ? "75%" : "20%"} 40%, ${project.accent}33, transparent 55%),
            linear-gradient(160deg, color-mix(in oklab, var(--bg-elevated) 80%, ${project.accent}), var(--bg))
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-20" />

      <motion.div
        className="container-shell relative z-10 grid w-full gap-8 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-end md:py-28"
        style={{ opacity }}
      >
        <div className="space-y-5">
          <p className="text-xs tracking-[0.25em] text-fg-muted uppercase">
            {String(index + 1).padStart(2, "0")} — {project.category}
          </p>
          <h3 className="font-display text-4xl tracking-tight md:text-6xl">{project.name}</h3>
          <p className="max-w-xl text-fg-muted leading-relaxed md:text-lg">
            {project.description}
          </p>
          <p className="font-mono text-xs text-fg-muted">{project.stack.join(" · ")}</p>
        </div>

        <ul className="space-y-3 md:justify-self-end md:text-right">
          {project.outcomes.map((o) => (
            <li key={o} className="text-sm text-fg-muted md:text-base">
              {o}
            </li>
          ))}
        </ul>
      </motion.div>
    </article>
  );
}
