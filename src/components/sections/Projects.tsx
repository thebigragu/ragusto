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
  const host = `app.${label.toLowerCase().replace(/\s+/g, "")}.io / overview`;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-[1.25rem] border border-white/12 bg-[#0c0c10] shadow-2xl transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-[1.02]"
        style={{
          boxShadow: `0 40px 100px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        <div className="flex items-center gap-2 border-b border-white/8 bg-[#14141a] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="ml-3 flex-1 rounded-md bg-white/6 px-3 py-1 font-mono text-[10px] tracking-wide text-white/35">
            {host}
          </span>
        </div>

        <div className="grid grid-cols-[72px_1fr]">
          <div className="space-y-2 border-r border-white/6 bg-[#101016] p-3">
            {[0.9, 0.55, 0.55, 0.4, 0.4].map((o, i) => (
              <div
                key={i}
                className="h-2 rounded-full"
                style={{
                  width: `${o * 100}%`,
                  background: i === 0 ? accent : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>

          <div className="space-y-3 p-4">
            <div className="grid grid-cols-3 gap-2">
              {["94.2%", "2.4k", "12ms"].map((v, i) => (
                <div
                  key={v}
                  className="rounded-lg border border-white/8 bg-white/[0.03] p-2.5"
                >
                  <div
                    className="mb-2 h-0.5 w-full rounded-full"
                    style={{ background: accent, opacity: 0.7 - i * 0.1 }}
                  />
                  <p className="font-mono text-sm text-white/90">{v}</p>
                  <p className="text-[9px] tracking-wider text-white/30 uppercase">
                    {["uptime", "events", "p95"][i]}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex h-24 items-end gap-1.5 rounded-lg border border-white/8 bg-[#0a0a0e] px-3 py-2">
              {[40, 65, 48, 82, 58, 90, 70, 78, 55, 88, 72, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: `linear-gradient(180deg, ${accent}, ${accent}55)`,
                    opacity: 0.55 + (i % 4) * 0.1,
                  }}
                />
              ))}
            </div>

            <div className="space-y-1.5">
              {[0.85, 0.7, 0.55].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: accent, opacity: 1 - i * 0.25 }}
                  />
                  <div
                    className="h-1.5 rounded-full bg-white/10"
                    style={{ width: `${w * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
