"use client";

import { industries } from "@/content/site";
import { motion } from "framer-motion";

export function Industries() {
  return (
    <section className="section-pad pt-0">
      <div className="container-shell">
        <div className="mb-10 max-w-2xl space-y-4">
          <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Industries</p>
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">
            Built across domains that demand precision
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {industries.map((item, i) => (
            <motion.span
              key={item}
              className="rounded-full border border-border px-5 py-3 text-sm text-fg-muted transition-colors hover:border-fg/30 hover:text-fg"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
            >
              {item}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
