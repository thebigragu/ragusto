"use client";

import { services } from "@/content/services";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const accentMap = {
  blue: "from-accent-blue/20 to-transparent",
  teal: "from-accent-teal/20 to-transparent",
  violet: "from-accent-violet/20 to-transparent",
};

export function Services() {
  const [active, setActive] = useState<string | null>(services[0]?.id ?? null);

  return (
    <section id="services" className="section-pad scroll-mt-24">
      <div className="container-shell">
        <div className="mb-14 max-w-3xl space-y-4">
          <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Services</p>
          <h2 className="font-display text-4xl tracking-tight md:text-6xl">
            Capabilities built for modern product teams
          </h2>
          <p className="text-fg-muted leading-relaxed">
            AI, custom software, and premium web — delivered as one coherent engineering practice.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const open = active === service.id;
            return (
              <motion.button
                key={service.id}
                type="button"
                data-cursor="hover"
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-border p-7 text-left transition-colors",
                  open ? "bg-bg-elevated" : "bg-transparent hover:bg-bg-muted/40",
                )}
                onClick={() => setActive(open ? null : service.id)}
                onMouseEnter={() => setActive(service.id)}
                layout
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    accentMap[service.accent],
                  )}
                />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl tracking-tight">{service.title}</h3>
                    <span
                      className={cn(
                        "mt-1 text-lg transition-transform duration-500",
                        open && "rotate-45",
                      )}
                    >
                      +
                    </span>
                  </div>
                  <p className="text-sm text-fg-muted leading-relaxed">{service.summary}</p>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden text-sm leading-relaxed text-fg"
                      >
                        {service.details}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
