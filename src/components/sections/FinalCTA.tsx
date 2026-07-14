"use client";

import { Button } from "@/components/ui/Button";
import { BenchHoloOverlay } from "@/components/ui/HoloOverlay";
import { InteractiveMedia } from "@/components/ui/InteractiveMedia";
import { Magnetic } from "@/components/ui/Magnetic";
import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[70vh] md:min-h-[80vh]">
        <InteractiveMedia
          src="/images/studio-bench.jpg"
          alt=""
          sizes="100vw"
          intensity={0.9}
          className="absolute inset-0"
          overlay={<BenchHoloOverlay />}
          grade={<div className="absolute inset-0 bg-black/65" />}
        />
        <div className="container-shell relative z-10 flex min-h-[70vh] flex-col items-center justify-center py-24 text-center md:min-h-[80vh]">
          <motion.div
            className="max-w-2xl space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-display text-4xl tracking-tight text-white md:text-6xl">
              Ready when you are
            </h2>
            <p className="text-white/65 md:text-lg">
              Tell us what you’re building. We’ll reply with a clear path forward.
            </p>
            <Magnetic className="justify-center">
              <Button href="/contact">Start a project</Button>
            </Magnetic>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
