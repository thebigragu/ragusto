"use client";

import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { heroUiFocus } from "@/lib/heroUiFocus";
import { SITE } from "@/lib/seo";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-[calc(var(--nav-height)+1rem)] md:pb-24">
      <div className="absolute inset-0">
        <HeroCanvas />
        {/* Soft left grade for copy ? match reference low-key lighting */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent md:w-[58%]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
      </div>

      <div className="container-shell relative z-10">
        <div
          className="max-w-xl space-y-6 md:space-y-7"
          onMouseEnter={() => {
            heroUiFocus.copy = 1;
          }}
          onMouseLeave={() => {
            heroUiFocus.copy = 0;
          }}
        >
          <motion.h1
            className="font-serif text-5xl leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {SITE.name.toUpperCase()}
          </motion.h1>

          <motion.p
            className="max-w-md text-base leading-relaxed text-white/75 md:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Digital experiences, crafted with clarity and purpose.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Magnetic>
              <Button href="/contact">Start a project</Button>
            </Magnetic>
            <Magnetic>
              <Button
                href="/#services"
                variant="secondary"
                className="border-white/25 text-white hover:bg-white/10"
              >
                View services
              </Button>
            </Magnetic>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
