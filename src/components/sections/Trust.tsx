"use client";

import { trustLogos } from "@/content/site";
import { motion } from "framer-motion";

export function Trust() {
  return (
    <section className="border-y border-border py-10">
      <div className="container-shell">
        <p className="mb-8 text-center text-xs tracking-[0.3em] text-fg-muted uppercase">
          Trusted by product teams shipping serious software
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16">
          {trustLogos.map((logo, i) => (
            <motion.span
              key={logo}
              className="font-display text-xl tracking-tight text-fg/35 transition-colors hover:text-fg/70 md:text-2xl"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              {logo}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
