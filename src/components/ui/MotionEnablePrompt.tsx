"use client";

import { usePointerFieldContext } from "@/context/PointerFieldContext";

export function MotionEnablePrompt() {
  const { isCoarse, needsPermission, motionEnabled, requestMotion } = usePointerFieldContext();

  if (!isCoarse || !needsPermission || motionEnabled) return null;

  return (
    <div className="pointer-events-auto absolute inset-x-0 top-[calc(var(--nav-height)+0.75rem)] z-20 flex justify-center px-4 md:hidden">
      <button
        type="button"
        onClick={() => void requestMotion()}
        className="rounded-full border border-white/25 bg-black/55 px-4 py-2 text-xs tracking-wide text-white/90 backdrop-blur-md transition-colors hover:bg-black/70"
      >
        Enable motion
      </button>
    </div>
  );
}
