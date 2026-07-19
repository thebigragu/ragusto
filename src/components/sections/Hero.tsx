"use client";

import { Button } from "@/components/ui/Button";
import { ContactModal } from "@/components/ui/ContactModal";
import { Magnetic } from "@/components/ui/Magnetic";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { SITE } from "@/lib/seo";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

export function Hero() {
  const [contactOpen, setContactOpen] = useState(false);
  const closeContact = useCallback(() => setContactOpen(false), []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("hero-lock");
    body.classList.add("hero-lock");
    return () => {
      html.classList.remove("hero-lock");
      body.classList.remove("hero-lock");
    };
  }, []);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <HeroCanvas />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent md:w-[58%]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
      </div>

      <div className="container-shell relative z-10 flex h-full items-center pb-16 pt-16 md:pb-20">
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
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Magnetic>
              <Button type="button" onClick={() => setContactOpen(true)}>
                Get in touch
              </Button>
            </Magnetic>
          </motion.div>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={closeContact} />
    </section>
  );
}
