"use client";

import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { SITE } from "@/lib/seo";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden pb-16 pt-[calc(var(--nav-height)+2rem)] md:items-center md:pb-24">
      <div className="pointer-events-none absolute inset-0">
        <HeroCanvas />
        {/* Keep product sculpture readable — light vignette only */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/55 to-transparent md:via-bg/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/30" />
      </div>

      <div className="container-shell relative z-10 w-full">
        <div className="max-w-2xl space-y-8 lg:max-w-xl">
          <motion.p
            className="font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {SITE.name}
          </motion.p>

          <motion.h1
            className="text-2xl leading-tight tracking-tight md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            {SITE.heroLine}
          </motion.h1>

          <motion.p
            className="max-w-md text-base leading-relaxed text-fg-muted md:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {SITE.tagline}
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Magnetic>
              <Button href="/contact">Start a project</Button>
            </Magnetic>
            <Magnetic>
              <Button href="/#work" variant="secondary">
                View work
              </Button>
            </Magnetic>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
