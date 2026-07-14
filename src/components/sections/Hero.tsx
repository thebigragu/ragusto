"use client";

import { Button } from "@/components/ui/Button";
import { HeroHoloOverlay } from "@/components/ui/HoloOverlay";
import { InteractiveMedia } from "@/components/ui/InteractiveMedia";
import { Magnetic } from "@/components/ui/Magnetic";
import { SITE } from "@/lib/seo";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden pb-16 md:pb-24">
      <InteractiveMedia
        src="/images/hero-studio.jpg"
        alt="Arcform luxury design studio"
        priority
        sizes="100vw"
        intensity={1.15}
        className="absolute inset-0"
        imageClassName="object-[62%_center]"
        overlay={<HeroHoloOverlay />}
        grade={
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />
          </>
        }
      />

      <div className="container-shell relative z-10 w-full pt-[calc(var(--nav-height)+3rem)]">
        <div className="max-w-2xl space-y-7">
          <motion.p
            className="font-display text-5xl leading-[0.92] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[6.5rem]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {SITE.name}
          </motion.p>

          <motion.h1
            className="max-w-md text-lg leading-relaxed text-white/70 md:text-xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            Luxury digital products — AI, applications, and cinematic web —
            engineered with atelier-level craft.
          </motion.h1>

          <motion.div
            className="flex flex-wrap gap-3 pt-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Magnetic>
              <Button href="/contact">Start a project</Button>
            </Magnetic>
            <Magnetic>
              <Button
                href="/#work"
                variant="secondary"
                className="border-white/25 text-white hover:bg-white/10"
              >
                Selected work
              </Button>
            </Magnetic>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
