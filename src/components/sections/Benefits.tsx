"use client";

import { benefits, stats } from "@/content/site";
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
    <span ref={ref} className="font-display text-5xl tracking-tight md:text-6xl">
      0{suffix}
    </span>
  );
}

export function Benefits() {
  return (
    <section className="section-pad border-y border-border">
      <div className="container-shell grid gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">Why Arcform</p>
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">
            Client benefits that compound
          </h2>
          <div className="grid gap-6 pt-6 sm:grid-cols-2">
            {benefits.map((b) => (
              <div key={b.title} className="space-y-2">
                <h3 className="font-display text-xl tracking-tight">{b.title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-3xl border border-border bg-bg-elevated/50 p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <AnimatedStat value={stat.value} suffix={stat.suffix} />
              <p className="mt-3 text-sm text-fg-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
