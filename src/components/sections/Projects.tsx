"use client";

import {
  AtriumHoloOverlay,
  BenchHoloOverlay,
  HeroHoloOverlay,
} from "@/components/ui/HoloOverlay";
import { projects } from "@/content/projects";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

const visuals: { src: string; overlay: ReactNode; position: string }[] = [
  { src: "/images/studio-bench.jpg", overlay: <BenchHoloOverlay />, position: "object-center" },
  { src: "/images/hero-studio.jpg", overlay: <HeroHoloOverlay />, position: "object-[62%_center]" },
  { src: "/images/studio-atrium.jpg", overlay: <AtriumHoloOverlay />, position: "object-center" },
  { src: "/images/studio-bench.jpg", overlay: <BenchHoloOverlay />, position: "object-[40%_center]" },
];

/** Full-bleed case studies — images edge-to-edge, no cards */
export function Projects() {
  return (
    <section id="work" className="scroll-mt-24">
      <div className="container-shell section-pad pb-8 md:pb-12">
        <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Selected work</p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl tracking-tight md:text-6xl lg:text-7xl">
          Products that feel inevitable
        </h2>
      </div>

      <div>
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
  const visual = visuals[index % visuals.length];
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.55]);

  return (
    <article
      ref={ref}
      className="relative flex min-h-[90vh] items-end overflow-hidden md:min-h-[100svh]"
    >
      <motion.div className="absolute inset-[-8%]" style={{ y }}>
        <Image
          src={visual.src}
          alt=""
          fill
          sizes="100vw"
          className={`object-cover ${visual.position}`}
        />
        <div className="absolute inset-0">{visual.overlay}</div>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />

      <motion.div
        className="container-shell relative z-10 grid w-full gap-8 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-end md:py-28"
        style={{ opacity: overlayOpacity }}
      >
        <div className="space-y-5">
          <p className="text-xs tracking-[0.25em] text-white/50 uppercase">
            {String(index + 1).padStart(2, "0")} — {project.category}
          </p>
          <h3 className="font-display text-4xl tracking-tight text-white md:text-6xl">
            {project.name}
          </h3>
          <p className="max-w-xl text-white/65 leading-relaxed md:text-lg">
            {project.description}
          </p>
          <p className="font-mono text-xs text-white/45">{project.stack.join(" · ")}</p>
        </div>

        <ul className="space-y-3 md:justify-self-end md:text-right">
          {project.outcomes.map((o) => (
            <li key={o} className="text-sm text-white/55 md:text-base">
              {o}
            </li>
          ))}
        </ul>
      </motion.div>
    </article>
  );
}
