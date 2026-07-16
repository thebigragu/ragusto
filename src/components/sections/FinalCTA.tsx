"use client";

import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { CinematicVideo } from "@/components/ui/CinematicVideo";
import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden section-pad">
      <CinematicVideo
        srcBase="/videos/cta-atmosphere-loop"
        poster="/videos/cta-atmosphere-loop-poster.jpg"
        opacity={0.28}
        alt=""
        videoClassName="object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-bg via-bg/85 to-bg" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-accent-teal/10 via-transparent to-accent-blue/8" />
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-25" />
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
            We&apos;ll respond with a clear path forward.
          </p>
          <Magnetic className="justify-center">
            <Button href="/contact">Start a project</Button>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
