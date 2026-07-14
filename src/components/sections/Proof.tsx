"use client";

import { testimonials } from "@/content/site";
import { motion } from "framer-motion";

export function Proof() {
  return (
    <section className="section-pad border-t border-border">
      <div className="container-shell">
        <div className="mb-14 max-w-lg space-y-4">
          <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Clients</p>
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">
            Built for teams who refuse average
          </h2>
        </div>

        <div className="grid gap-12 lg:grid-cols-3 lg:gap-10">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              className="space-y-6 border-t border-border pt-8"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <p className="text-lg leading-relaxed text-fg md:text-xl">“{t.quote}”</p>
              <footer>
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
