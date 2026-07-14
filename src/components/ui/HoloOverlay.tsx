"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const LINES = [
  "ARC · telemetry sync",
  "latency 12ms · packet ok",
  "inference · batch 04",
  "render pass · 60fps",
  "vector mesh · stable",
  "auth · session live",
  "queue depth · 0.18",
  "edge cache · warm",
];

function Waveform({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 56" className={cn("h-full w-full", className)} preserveAspectRatio="none">
      <motion.path
        d="M0 28 C18 8, 36 48, 54 28 S90 8, 108 28 S144 48, 162 28 S198 8, 220 28"
        fill="none"
        stroke="rgba(94,234,212,0.95)"
        strokeWidth="1.4"
        initial={{ pathLength: 0.2, opacity: 0.55 }}
        animate={{
          d: [
            "M0 28 C18 8, 36 48, 54 28 S90 8, 108 28 S144 48, 162 28 S198 8, 220 28",
            "M0 28 C18 48, 36 8, 54 28 S90 48, 108 28 S144 8, 162 28 S198 48, 220 28",
            "M0 28 C18 12, 36 44, 54 28 S90 14, 108 28 S144 42, 162 28 S198 16, 220 28",
            "M0 28 C18 8, 36 48, 54 28 S90 8, 108 28 S144 48, 162 28 S198 8, 220 28",
          ],
          opacity: [0.55, 0.95, 0.7, 0.55],
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M0 34 C22 20, 44 48, 66 34 S110 20, 132 34 S176 48, 198 34 S220 22, 240 34"
        fill="none"
        stroke="rgba(56,189,248,0.55)"
        strokeWidth="1"
        animate={{
          d: [
            "M0 34 C22 20, 44 48, 66 34 S110 20, 132 34 S176 48, 198 34",
            "M0 34 C22 48, 44 20, 66 34 S110 48, 132 34 S176 20, 198 34",
            "M0 34 C22 20, 44 48, 66 34 S110 20, 132 34 S176 48, 198 34",
          ],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

function Bars({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full items-end gap-[3px]", className)}>
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-full rounded-[1px] bg-teal-300/80"
          animate={{ height: ["22%", "88%", "40%", "70%", "22%"] }}
          transition={{
            duration: 1.6 + (i % 5) * 0.18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.07,
          }}
        />
      ))}
    </div>
  );
}

function ScrollLog({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden font-mono text-[7px] leading-[1.55] text-teal-200/85 md:text-[8px]", className)}>
      <motion.div
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        {[...LINES, ...LINES].map((line, i) => (
          <p key={`${line}-${i}`} className="truncate opacity-90">
            <span className="text-sky-300/70">{`0${(i % 8) + 1}`}</span> {line}
          </p>
        ))}
      </motion.div>
    </div>
  );
}

function GridPulse({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(45,212,191,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.35) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
      <motion.div
        className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-teal-300/35 to-transparent"
        animate={{ top: ["-20%", "110%"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function PanelShell({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn(
        "absolute overflow-hidden rounded-[2px] border border-teal-300/35 bg-[rgba(4,18,22,0.55)] shadow-[0_0_24px_rgba(20,184,166,0.22)] backdrop-blur-[1px]",
        className,
      )}
      initial={{ opacity: 0.55 }}
      animate={{ opacity: [0.62, 0.92, 0.7, 0.62], boxShadow: [
        "0 0 18px rgba(20,184,166,0.18)",
        "0 0 28px rgba(56,189,248,0.28)",
        "0 0 18px rgba(20,184,166,0.18)",
      ] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="flex items-center justify-between border-b border-teal-300/25 px-1.5 py-0.5 font-mono text-[6px] tracking-wider text-teal-200/70 uppercase md:text-[7px]">
        <span>live</span>
        <motion.span
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="size-1 rounded-full bg-teal-300"
        />
      </div>
      <div className="p-1.5">{children}</div>
    </motion.div>
  );
}

/** Animated FUI layers for the hero lounge screens (behind chair). */
export function HeroHoloOverlay() {
  return (
    <div className="absolute inset-0 mix-blend-screen">
      <PanelShell
        className="top-[18%] left-[46%] h-[32%] w-[14%] -rotate-[4deg] md:left-[48%] md:w-[12%]"
        delay={0}
      >
        <Waveform className="h-[42%]" />
        <Bars className="mt-1 h-[38%]" />
      </PanelShell>

      <PanelShell
        className="top-[15%] left-[58%] h-[36%] w-[13%] rotate-[2deg] md:left-[59%] md:w-[11%]"
        delay={0.35}
      >
        <GridPulse className="mb-1 h-[36%]" />
        <ScrollLog className="h-[48%]" />
      </PanelShell>

      <PanelShell
        className="top-[28%] left-[68%] h-[30%] w-[14%] rotate-[5deg] md:left-[69%] md:w-[12%]"
        delay={0.7}
      >
        <div className="mb-1 flex justify-between font-mono text-[6px] text-sky-200/80">
          <span>SIGNAL</span>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          >
            ONLINE
          </motion.span>
        </div>
        <Waveform className="h-[55%]" />
      </PanelShell>
    </div>
  );
}

/** Wall-scale panels for atrium scene (cyan glass on right). */
export function AtriumHoloOverlay() {
  return (
    <div className="absolute inset-0 mix-blend-screen">
      <PanelShell className="top-[16%] right-[4%] h-[62%] w-[10%] rotate-[0.5deg]" delay={0.1}>
        <ScrollLog className="h-[72%]" />
        <Bars className="mt-2 h-[16%]" />
      </PanelShell>
      <PanelShell className="top-[18%] right-[15%] h-[58%] w-[10%]" delay={0.35}>
        <GridPulse className="h-[42%]" />
        <Waveform className="mt-2 h-[32%]" />
      </PanelShell>
      <PanelShell className="top-[20%] right-[26%] h-[54%] w-[9%]" delay={0.55}>
        <Bars className="h-[40%]" />
        <ScrollLog className="mt-2 h-[42%]" />
      </PanelShell>
      <PanelShell className="top-[22%] right-[36%] h-[50%] w-[9%] -rotate-[0.5deg]" delay={0.75}>
        <Waveform className="h-[36%]" />
        <GridPulse className="mt-2 h-[44%]" />
      </PanelShell>
    </div>
  );
}

/** Single floating sheet above the workbench. */
export function BenchHoloOverlay() {
  return (
    <div className="absolute inset-0 mix-blend-screen">
      <PanelShell
        className="top-[20%] left-[30%] h-[34%] w-[36%] rotate-[-0.5deg] md:left-[32%] md:w-[34%]"
        delay={0.15}
      >
        <div className="mb-1 flex gap-3 font-mono text-[6px] text-teal-100/80 md:text-[7px]">
          <span>WORKBENCH · CAD</span>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          >
            COMPILING
          </motion.span>
        </div>
        <Waveform className="h-[28%]" />
        <div className="mt-1 grid grid-cols-2 gap-1">
          <Bars className="h-10" />
          <ScrollLog className="h-10" />
        </div>
      </PanelShell>
    </div>
  );
}
