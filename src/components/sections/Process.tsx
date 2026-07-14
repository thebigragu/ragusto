"use client";

import { processSteps } from "@/content/process";
import { motion } from "framer-motion";

export function Process() {
  return (
    <section id="process" className="section-pad scroll-mt-24">
      <div className="container-shell">
        <div className="mb-14 max-w-3xl space-y-4">
          <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Process</p>
          <h2 className="font-display text-4xl tracking-tight md:text-6xl">
            From discovery to durable software
          </h2>
          <p className="text-fg-muted leading-relaxed">
            A disciplined timeline that keeps strategy, design, and engineering in lockstep.
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-0 bottom-0 left-[1.15rem] w-px bg-border md:left-1/2" />
          <ol className="space-y-8">
            {processSteps.map((step, i) => {
              const left = i % 2 === 0;
              return (
                <motion.li
                  key={step.id}
                  className="relative grid gap-4 md:grid-cols-2"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className={`md:pr-12 ${left ? "md:text-right md:col-start-1" : "md:col-start-2 md:pl-12 md:pr-0"}`}
                  >
                    <div
                      className={`rounded-3xl border border-border bg-bg-elevated/60 p-6 ${
                        left ? "md:ml-auto" : ""
                      } max-w-md`}
                    >
                      <p className="mb-2 font-mono text-xs text-accent-blue">{step.phase}</p>
                      <h3 className="font-display text-2xl tracking-tight">{step.title}</h3>
                      <p className="mt-2 text-sm text-fg-muted leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <span className="absolute top-7 left-3 h-3 w-3 rounded-full border-2 border-accent-blue bg-bg md:left-1/2 md:-translate-x-1/2" />
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
