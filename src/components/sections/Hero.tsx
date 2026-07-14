"use client";

import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { SITE } from "@/lib/seo";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-end overflow-hidden pb-16 md:pb-24"
    >
      <motion.div className="absolute inset-0" style={{ y, opacity }}>
        <Image
          src="/images/hero-studio.jpg"
          alt="Arcform luxury design studio"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </motion.div>

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
              <Button href="/#work" variant="secondary" className="border-white/25 text-white hover:bg-white/10">
                Selected work
              </Button>
            </Magnetic>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
