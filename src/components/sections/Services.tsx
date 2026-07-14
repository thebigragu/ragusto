"use client";

import { services } from "@/content/services";
import { motion } from "framer-motion";
import Link from "next/link";

export function Services() {
  return (
    <section id="services" className="section-pad scroll-mt-24">
      <div className="container-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Capabilities</p>
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">
            Four practices.
            <br />
            One standard.
          </h2>
          <p className="max-w-sm text-fg-muted leading-relaxed">
            Strategy, design, and engineering as a single practice — not a stack of vendors.
          </p>
          <Link
            href="/contact"
            className="inline-flex text-sm text-fg underline-offset-4 transition hover:underline"
          >
            Discuss your project →
          </Link>
        </div>

        <ul className="divide-y divide-border border-y border-border">
          {services.map((service, i) => (
            <motion.li
              key={service.id}
              className="group grid gap-3 py-8 md:grid-cols-[4rem_1fr] md:gap-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-mono text-xs text-fg-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="space-y-2">
                <h3 className="font-display text-2xl tracking-tight transition-colors group-hover:text-accent-blue md:text-3xl">
                  {service.title}
                </h3>
                <p className="max-w-xl text-fg-muted leading-relaxed">{service.summary}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
