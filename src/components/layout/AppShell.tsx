"use client";

import { Loader } from "@/components/ui/Loader";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState, type ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const complete = useCallback(() => setLoading(false), []);

  // Hard failsafe — never leave the site invisible
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 2200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>{loading && <Loader onComplete={complete} />}</AnimatePresence>
      <div
        className={
          loading
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-500"
        }
      >
        {children}
      </div>
    </>
  );
}
