"use client";

import { usePointerField } from "@/hooks/usePointerField";
import { createContext, useContext, type ReactNode } from "react";

type PointerFieldContextValue = ReturnType<typeof usePointerField>;

const PointerFieldContext = createContext<PointerFieldContextValue | null>(null);

export function PointerFieldProvider({ children }: { children: ReactNode }) {
  const value = usePointerField();
  return (
    <PointerFieldContext.Provider value={value}>{children}</PointerFieldContext.Provider>
  );
}

export function usePointerFieldContext() {
  const ctx = useContext(PointerFieldContext);
  if (!ctx) {
    throw new Error("usePointerFieldContext must be used within PointerFieldProvider");
  }
  return ctx;
}

/** @deprecated Use PointerFieldProvider */
export const TiltInputProvider = PointerFieldProvider;
/** @deprecated Use usePointerFieldContext */
export const useTiltInputContext = usePointerFieldContext;
