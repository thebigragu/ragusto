"use client";

import { deadzone, expSmooth } from "@/lib/smoothTilt";
import { useCallback, useEffect, useRef, useState } from "react";

export type PointerField = {
  x: number;
  y: number;
};

type OrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

const GYRO_DIVISOR = 15;
const GYRO_DEADZONE_DEG = 0.35;
const BASELINE_SAMPLES = 14;
const GYRO_SMOOTH_LAMBDA = 42;
const TOUCH_SMOOTH_LAMBDA = 36;

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

/** Pointer / gyro field in [-1, 1] for plate parallax, lights, and holo — not laptop orbit. */
export function usePointerField() {
  const target = useRef<PointerField>({ x: 0, y: 0 });
  const input = useRef<PointerField>({ x: 0, y: 0 });
  const baseline = useRef<{ beta: number; gamma: number } | null>(null);
  const baselineSamples = useRef<{ beta: number; gamma: number }[]>([]);
  const orientHandler = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const rafId = useRef<number | null>(null);
  const [isCoarse, setIsCoarse] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);

  const stopOrientation = useCallback(() => {
    if (orientHandler.current) {
      window.removeEventListener("deviceorientation", orientHandler.current);
      orientHandler.current = null;
    }
  }, []);

  const startOrientation = useCallback(() => {
    stopOrientation();
    baseline.current = null;
    baselineSamples.current = [];
    target.current = { x: 0, y: 0 };

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;

      if (!baseline.current) {
        baselineSamples.current.push({ beta: e.beta, gamma: e.gamma });
        if (baselineSamples.current.length < BASELINE_SAMPLES) return;

        const n = baselineSamples.current.length;
        let betaSum = 0;
        let gammaSum = 0;
        for (const sample of baselineSamples.current) {
          betaSum += sample.beta;
          gammaSum += sample.gamma;
        }
        baseline.current = { beta: betaSum / n, gamma: gammaSum / n };
      }

      const dx = e.gamma - baseline.current.gamma;
      const dy = e.beta - baseline.current.beta;
      const ndx = Math.abs(dx) < GYRO_DEADZONE_DEG ? 0 : dx;
      const ndy = Math.abs(dy) < GYRO_DEADZONE_DEG ? 0 : dy;

      target.current.x = deadzone(clamp(ndx / GYRO_DIVISOR, -1, 1), 0.02);
      target.current.y = deadzone(clamp(ndy / GYRO_DIVISOR, -1, 1), 0.02);
    };

    orientHandler.current = onOrient;
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    setMotionEnabled(true);
    setNeedsPermission(false);
  }, [stopOrientation]);

  const requestMotion = useCallback(async () => {
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") {
      return false;
    }

    const Orientation = DeviceOrientationEvent as OrientationWithPermission;
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
        target.current.x = input.current.x;
        target.current.y = input.current.y;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    }

    if (typeof DeviceOrientationEvent === "undefined") return;

    const Orientation = DeviceOrientationEvent as OrientationWithPermission;
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
      target.current.x = (touch.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (touch.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => window.removeEventListener("touchmove", onTouch);
  }, [isCoarse, motionEnabled]);

  useEffect(() => {
    if (!isCoarse) return;

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const lambda = motionEnabled ? GYRO_SMOOTH_LAMBDA : TOUCH_SMOOTH_LAMBDA;

      input.current.x = expSmooth(input.current.x, target.current.x, lambda, dt);
      input.current.y = expSmooth(input.current.y, target.current.y, lambda, dt);
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
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

/** @deprecated Use usePointerField — kept as alias for gradual migration */
export const useTiltInput = usePointerField;
export type TiltInput = PointerField;
