"use client";

import { testimonials } from "@/content/site";
import { motion } from "framer-motion";

export function Testimonials() {
  return (
    <section className="section-pad">
      <div className="container-shell">
        <div className="mb-14 max-w-2xl space-y-4">
          <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Testimonials</p>
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">
            What partners say after ship
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              className="flex h-full flex-col justify-between rounded-[2rem] border border-border p-8"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
            >
              <p className="text-lg leading-relaxed text-fg">“{t.quote}”</p>
              <footer className="mt-8">
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-fg-muted">{t.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
