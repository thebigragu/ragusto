"use client";

import { Button } from "@/components/ui/Button";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { SITE } from "@/lib/seo";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden pb-16 pt-[calc(var(--nav-height)+2rem)] md:items-center md:pb-24">
      <div className="absolute inset-0">
        <HeroCanvas />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/40 to-transparent md:w-[72%]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-bg/20" />
      </div>

      <div className="container-shell relative z-10 grid w-full gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="max-w-4xl space-y-8">
          <motion.p
            className="font-display text-5xl leading-[0.95] tracking-tight text-fg sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7.5rem]"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {SITE.name}
          </motion.p>

          <motion.h1
            className="max-w-3xl text-2xl leading-tight tracking-tight text-fg-muted md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-fg">{SITE.heroLine}</span>
          </motion.h1>

          <motion.p
            className="max-w-xl text-base leading-relaxed text-fg-muted md:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {SITE.tagline} Premium AI, applications, and web experiences engineered
            for companies that refuse to look ordinary.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button href="/contact">Start a project</Button>
            <Button href="/#services" variant="secondary">
              View services
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="hidden justify-self-end lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.8 }}
        >
          <p className="mb-3 text-xs tracking-[0.3em] text-fg-muted uppercase">Scroll</p>
          <div className="h-24 w-px bg-gradient-to-b from-fg/50 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
