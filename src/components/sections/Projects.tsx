"use client";

import { projects } from "@/content/projects";
import { motion } from "framer-motion";

export function Projects() {
  return (
    <section id="work" className="section-pad scroll-mt-24">
      <div className="container-shell">
        <div className="mb-14 max-w-2xl space-y-4">
          <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Selected work</p>
          <h2 className="font-display text-4xl tracking-tight md:text-6xl">
            Products that feel inevitable
          </h2>
          <p className="max-w-lg text-fg-muted">
            Portals, SaaS, AI desks, and internal platforms — the caliber of systems we ship.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map((project, i) => (
            <motion.article
              key={project.id}
              className="group overflow-hidden rounded-[2rem] border border-border bg-bg-elevated"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="relative aspect-[16/10] overflow-hidden"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${project.accent}55, transparent 55%), linear-gradient(160deg, #16161a, #0a0a0b)`,
                }}
              >
                <DeviceMockup accent={project.accent} label={project.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated via-transparent to-transparent" />
              </div>
              <div className="space-y-4 p-7 md:p-8">
                <p className="text-xs tracking-[0.25em] text-fg-muted uppercase">
                  {project.category}
                </p>
                <h3 className="font-display text-3xl tracking-tight">{project.name}</h3>
                <p className="text-fg-muted leading-relaxed">{project.description}</p>
                <ul className="flex flex-wrap gap-2 pt-1">
                  {project.outcomes.map((o) => (
                    <li
                      key={o}
                      className="rounded-full border border-border px-3 py-1 text-xs text-fg-muted"
                    >
                      {o}
                    </li>
                  ))}
                </ul>
                <p className="pt-2 font-mono text-xs text-fg-muted">
                  {project.stack.join(" · ")}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeviceMockup({ accent, label }: { accent: string; label: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-3 shadow-2xl backdrop-blur-md transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-[1.02]"
        style={{ boxShadow: `0 30px 80px ${accent}33` }}
      >
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/25" />
          <span className="h-2 w-2 rounded-full bg-white/25" />
          <span className="h-2 w-2 rounded-full bg-white/25" />
          <span className="ml-3 flex-1 rounded-full bg-white/10 px-3 py-1 text-[10px] text-white/40">
            {label.toLowerCase().replace(/\s+/g, "")}.app
          </span>
        </div>
        <div className="grid gap-2 rounded-xl bg-white/5 p-4">
          <div className="h-3 w-1/3 rounded bg-white/20" />
          <div className="h-24 rounded-lg" style={{ background: `${accent}33` }} />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-12 rounded-lg bg-white/10" />
            <div className="h-12 rounded-lg bg-white/10" />
            <div className="h-12 rounded-lg bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
