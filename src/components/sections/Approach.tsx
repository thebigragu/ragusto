"use client";

import { processSteps } from "@/content/process";
import { motion } from "framer-motion";
import Image from "next/image";

export function Approach() {
  return (
    <section id="process" className="scroll-mt-24">
      <div className="relative min-h-[70vh] overflow-hidden md:min-h-[85vh]">
        <Image
          src="/images/pavilion-night.jpg"
          alt="Immersive Arcform studio landscape"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        <div className="container-shell relative z-10 flex min-h-[70vh] flex-col justify-end py-16 md:min-h-[85vh] md:py-24">
          <motion.div
            className="max-w-2xl space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs tracking-[0.3em] text-white/50 uppercase">Approach</p>
            <h2 className="font-display text-4xl tracking-tight text-white md:text-6xl">
              From intent to shipped product
            </h2>
            <p className="max-w-lg text-white/65 leading-relaxed">
              A disciplined arc — discovery through launch — with senior craft at every step.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-shell section-pad grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {processSteps.map((step, i) => (
          <motion.div
            key={step.id}
            className="space-y-3 border-t border-border pt-6"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
          >
            <p className="font-mono text-xs text-accent-blue">{step.phase}</p>
            <h3 className="font-display text-2xl tracking-tight">{step.title}</h3>
            <p className="text-sm text-fg-muted leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
