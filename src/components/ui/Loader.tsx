"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      onComplete();
      return;
    }

    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      setProgress((p) => {
        const next = Math.min(100, p + (frame < 12 ? 7 : 3));
        if (next >= 100) {
          window.clearInterval(id);
          window.setTimeout(onComplete, 280);
        }
        return next;
      });
    }, 40);

    return () => window.clearInterval(id);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-8 px-6">
        <motion.p
          className="font-display text-3xl tracking-tight"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Arcform
        </motion.p>
        <div className="h-px w-full overflow-hidden bg-border">
          <motion.div
            className="h-full bg-fg"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <p className="font-mono text-xs tracking-[0.3em] text-fg-muted">
          {String(progress).padStart(3, "0")}%
        </p>
      </div>
    </motion.div>
  );
}
