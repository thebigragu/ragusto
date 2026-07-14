"use client";

import { stats, testimonials, trustLogos } from "@/content/site";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

function AnimatedStat({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
    });
    return () => unsub();
  }, [spring, suffix]);

  return (
    <span ref={ref} className="font-display text-4xl tracking-tight md:text-5xl">
      0{suffix}
    </span>
  );
}

/** Trust + stats + testimonials — one proof block, no repeats */
export function Proof() {
  return (
    <section className="section-pad border-y border-border">
      <div className="container-shell space-y-16">
        <div className="space-y-6">
          <p className="text-center text-xs tracking-[0.3em] text-fg-muted uppercase">
            Trusted by product teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {trustLogos.map((logo) => (
              <span
                key={logo}
                className="font-display text-xl tracking-tight text-fg/30 md:text-2xl"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-3xl border border-border bg-bg-elevated/40 p-5 md:p-6"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
            >
              <AnimatedStat value={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm text-fg-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              className="rounded-[1.75rem] border border-border p-7"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <p className="leading-relaxed text-fg">“{t.quote}”</p>
              <footer className="mt-6">
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-fg-muted">{t.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
