"use client";

import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="section-pad pt-0">
      <div className="container-shell">
        <motion.div
          className="relative overflow-hidden rounded-[2.5rem] border border-border px-8 py-16 md:px-16 md:py-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 20% 50%, color-mix(in oklab, var(--accent-blue) 25%, transparent), transparent 50%), radial-gradient(ellipse at 80% 40%, color-mix(in oklab, var(--accent-violet) 22%, transparent), transparent 55%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-3xl space-y-8 text-center">
            <h2 className="font-display text-4xl tracking-tight md:text-6xl">
              Ready to build something exceptional?
            </h2>
            <p className="text-fg-muted md:text-lg">
              Tell us about the product, platform, or experience you need.
              We’ll respond with a clear path forward.
            </p>
            <Magnetic className="justify-center">
              <Button href="/contact">Start a project</Button>
            </Magnetic>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
