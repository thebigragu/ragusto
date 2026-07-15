"use client";

import { useTiltInput } from "@/hooks/useTiltInput";
import { createContext, useContext, type ReactNode } from "react";

type TiltInputContextValue = ReturnType<typeof useTiltInput>;

const TiltInputContext = createContext<TiltInputContextValue | null>(null);

export function TiltInputProvider({ children }: { children: ReactNode }) {
  const value = useTiltInput();
  return <TiltInputContext.Provider value={value}>{children}</TiltInputContext.Provider>;
}

export function useTiltInputContext() {
  const ctx = useContext(TiltInputContext);
  if (!ctx) {
    throw new Error("useTiltInputContext must be used within TiltInputProvider");
  }
  return ctx;
}
