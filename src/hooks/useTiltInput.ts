"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TiltInput = {
  x: number;
  y: number;
};

type OrientationWithPermission = DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

function isIOSDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function useTiltInput() {
  const input = useRef<TiltInput>({ x: 0, y: 0 });
  const baseline = useRef<{ beta: number; gamma: number } | null>(null);
  const orientHandler = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const [isCoarse, setIsCoarse] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);

  const stopOrientation = useCallback(() => {
    if (orientHandler.current) {
      window.removeEventListener("deviceorientation", orientHandler.current);
      window.removeEventListener(
        "deviceorientationabsolute",
        orientHandler.current as EventListener,
      );
      orientHandler.current = null;
    }
  }, []);

  const startOrientation = useCallback(() => {
    stopOrientation();
    baseline.current = null;

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;

      if (!baseline.current) {
        baseline.current = { beta: e.beta, gamma: e.gamma };
      }

      const dx = e.gamma - baseline.current.gamma;
      const dy = e.beta - baseline.current.beta;
      input.current.x = clamp(dx / 28, -1, 1);
      input.current.y = clamp(dy / 28, -1, 1);
    };

    orientHandler.current = onOrient;
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    window.addEventListener("deviceorientationabsolute", onOrient as EventListener, {
      passive: true,
    });
    setMotionEnabled(true);
    setNeedsPermission(false);
  }, [stopOrientation]);

  const requestMotion = useCallback(async () => {
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") {
      return false;
    }

    const Orientation = DeviceOrientationEvent as unknown as OrientationWithPermission;
    if (typeof Orientation.requestPermission === "function") {
      try {
        const state = await Orientation.requestPermission();
        if (state !== "granted") return false;
        startOrientation();
        return true;
      } catch {
        return false;
      }
    }

    startOrientation();
    return true;
  }, [startOrientation]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setIsCoarse(coarse);

    if (!coarse) {
      const onMove = (e: PointerEvent) => {
        input.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        input.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    }

    if (typeof DeviceOrientationEvent === "undefined") return;

    const Orientation = DeviceOrientationEvent as unknown as OrientationWithPermission;
    if (isIOSDevice() && typeof Orientation.requestPermission === "function") {
      setNeedsPermission(true);
      return;
    }

    startOrientation();
    return stopOrientation;
  }, [startOrientation, stopOrientation]);

  useEffect(() => {
    if (!isCoarse || motionEnabled) return;

    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      input.current.x = (touch.clientX / window.innerWidth) * 2 - 1;
      input.current.y = (touch.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => window.removeEventListener("touchmove", onTouch);
  }, [isCoarse, motionEnabled]);

  useEffect(() => () => stopOrientation(), [stopOrientation]);

  return {
    input,
    isCoarse,
    needsPermission,
    motionEnabled,
    requestMotion,
  };
}
