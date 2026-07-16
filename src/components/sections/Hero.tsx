"use client";

import { HeroCanvas } from "@/components/three/HeroCanvas";
import { SITE } from "@/lib/seo";
import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-[calc(var(--nav-height)+1rem)] md:pb-24">
      <div className="absolute inset-0">
        <HeroCanvas />
        {/* Soft left grade for copy — match reference low-key lighting */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent md:w-[58%]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
      </div>

      <div className="container-shell relative z-10">
        <div className="max-w-xl space-y-6 md:space-y-7">
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/#services"
              className="inline-block border-b border-white/70 pb-0.5 text-sm tracking-wide text-white transition-colors hover:border-white hover:text-white"
            >
              View our work
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
