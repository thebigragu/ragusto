"use client";

import { Button } from "@/components/ui/Button";
import { TechBackdrop } from "@/components/ui/TechBackdrop";
import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden section-pad">
      <TechBackdrop variant="section" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-bg/30 to-bg/80" />
      <div className="container-shell relative z-10">
        <motion.div
          className="mx-auto max-w-3xl space-y-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-display text-4xl tracking-tight md:text-6xl lg:text-7xl">
            Ready to build something exceptional?
          </h2>
          <p className="text-fg-muted md:text-lg">
            Tell us about the product, platform, or experience you need.
            We’ll respond with a clear path forward.
          </p>
          <Button href="/contact">Start a project</Button>
        </motion.div>
      </div>
    </section>
  );
}
