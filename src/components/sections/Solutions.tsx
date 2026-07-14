"use client";

import { motion } from "framer-motion";

const solutions = [
  {
    title: "AI Solutions",
    copy: "Copilots, retrieval systems, automation agents, and intelligent features embedded into products your users already trust.",
    points: ["Grounded RAG", "Workflow agents", "Eval & guardrails"],
  },
  {
    title: "Website Solutions",
    copy: "Brand-defining digital experiences with cinematic motion, sharp conversion paths, and engineering that scores high on Lighthouse.",
    points: ["Immersive storytelling", "SEO foundations", "Motion systems"],
  },
  {
    title: "Application Solutions",
    copy: "SaaS products, dashboards, portals, and internal software designed for clarity, speed, and years of iteration.",
    points: ["Multi-tenant SaaS", "Ops platforms", "Customer portals"],
  },
];

export function Solutions() {
  return (
    <section id="solutions" className="section-pad scroll-mt-24">
      <div className="container-shell">
        <div className="mb-14 max-w-3xl space-y-4">
          <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Solutions</p>
          <h2 className="font-display text-4xl tracking-tight md:text-6xl">
            Three paths. One standard of craft.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {solutions.map((item, i) => (
            <motion.div
              key={item.title}
              className="rounded-[2rem] border border-border bg-gradient-to-b from-bg-elevated to-transparent p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="font-display text-3xl tracking-tight">{item.title}</h3>
              <p className="mt-4 text-fg-muted leading-relaxed">{item.copy}</p>
              <ul className="mt-8 space-y-3">
                {item.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-teal" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
