"use client";

import { usePointerField } from "@/hooks/usePointerField";

/** Backward-compatible re-export — prefer @/hooks/usePointerField */
export { usePointerField as useTiltInput } from "@/hooks/usePointerField";
export type { PointerField as TiltInput } from "@/hooks/usePointerField";

export function useTiltInputLegacy() {
  return usePointerField();
}
