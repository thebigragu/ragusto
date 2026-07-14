"use client";

import { Loader } from "@/components/ui/Loader";
import { AnimatePresence } from "framer-motion";
import { useCallback, useState, type ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const complete = useCallback(() => setLoading(false), []);

  return (
    <>
      <AnimatePresence>{loading && <Loader onComplete={complete} />}</AnimatePresence>
      <div className={loading ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>
        {children}
      </div>
    </>
  );
}
