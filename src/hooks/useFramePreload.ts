"use client";

import {
  DECODE_MAX_WIDTH,
  PRELOAD_MAX_CONCURRENT,
  PRELOAD_WINDOW,
} from "@/lib/hero-sequence/config";
import {
  frameUrl,
  isScrubFrameReady,
  releaseScrubFrame,
  type HeroSequenceManifest,
  type ScrubFrame,
} from "@/lib/hero-sequence/types";
import { useEffect, useRef, useState, type RefObject } from "react";

type PreloadState = {
  images: (ScrubFrame | undefined)[];
  progress: number;
  /** First window around frame 0 is warm — safe to dismiss loader. */
  ready: boolean;
  error: string | null;
};

const EMPTY: PreloadState = {
  images: [],
  progress: 0,
  ready: false,
  error: null,
};

function decodeSize(manifest: HeroSequenceManifest) {
  const srcW = Math.max(1, manifest.width);
  const srcH = Math.max(1, manifest.height);
  if (srcW <= DECODE_MAX_WIDTH) {
    return { w: srcW, h: srcH, resize: false as const };
  }
  const scale = DECODE_MAX_WIDTH / srcW;
  return {
    w: DECODE_MAX_WIDTH,
    h: Math.max(1, Math.round(srcH * scale)),
    resize: true as const,
  };
}

/**
 * Sliding-window frame cache: keep ~±PRELOAD_WINDOW decoded around the
 * playhead. Same path locally and on Vercel — full scrub density, bounded RAM.
 */
export function useFramePreload(
  manifest: HeroSequenceManifest | null,
  playheadRef: RefObject<number>,
  options?: { maxConcurrent?: number; enabled?: boolean },
) {
  const maxConcurrent = options?.maxConcurrent ?? PRELOAD_MAX_CONCURRENT;
  const enabled = options?.enabled ?? true;
  const [state, setState] = useState<PreloadState>(EMPTY);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!manifest || !enabled) {
      setState(EMPTY);
      return;
    }

    const count = manifest.frameCount;
    const images: (ScrubFrame | undefined)[] = new Array(count);
    const inFlight = new Map<string, Promise<void>>();
    const targetSize = decodeSize(manifest);
    let aborted = false;
    let readyPublished = false;
    let lastCenter = -1;
    let lastScrollDir = 1;
    let activeLoads = 0;
    const queue: number[] = [];

    const initialHi = Math.min(count - 1, PRELOAD_WINDOW);
    const initialWindowSize = initialHi + 1;
    let initialLoaded = 0;

    const publish = (ready: boolean, error: string | null = null) => {
      if (aborted) return;
      setState({
        images,
        progress: ready
          ? 1
          : initialWindowSize > 0
            ? initialLoaded / initialWindowSize
            : 0,
        ready,
        error,
      });
    };

    const release = (index: number) => {
      releaseScrubFrame(images[index]);
      images[index] = undefined;
    };

    const bumpInitial = (index: number) => {
      if (index <= initialHi) {
        initialLoaded += 1;
        if (!readyPublished && initialLoaded >= initialWindowSize) {
          readyPublished = true;
          publish(true);
        } else if (!readyPublished) {
          publish(false);
        }
      }
    };

    const storeFrame = (index: number, frame: ScrubFrame) => {
      const c = playheadRef.current ?? 0;
      const lo = Math.max(0, c - PRELOAD_WINDOW);
      const hi = Math.min(count - 1, c + PRELOAD_WINDOW);
      if (index < lo || index > hi) {
        releaseScrubFrame(frame);
        return;
      }
      releaseScrubFrame(images[index]);
      images[index] = frame;
      bumpInitial(index);
    };

    const loadViaImage = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`img ${url}`));
        img.src = url;
      });

    const loadViaBitmap = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`frame ${res.status}`);
      const blob = await res.blob();
      return createImageBitmap(blob, {
        resizeWidth: targetSize.w,
        resizeHeight: targetSize.h,
        resizeQuality: "high",
      });
    };

    const loadOne = (index: number) => {
      if (aborted || index < 0 || index >= count) return;
      if (isScrubFrameReady(images[index])) return;

      const url = frameUrl(manifest, index);
      if (inFlight.has(url)) return;

      const promise = (async () => {
        activeLoads += 1;
        try {
          const frame: ScrubFrame = targetSize.resize
            ? await loadViaBitmap(url)
            : await loadViaImage(url);
          if (aborted) {
            releaseScrubFrame(frame);
            return;
          }
          storeFrame(index, frame);
        } catch {
          if (!aborted && !readyPublished) {
            readyPublished = true;
            publish(true, `Failed to load ${url}`);
          }
        } finally {
          inFlight.delete(url);
          activeLoads = Math.max(0, activeLoads - 1);
          pump();
        }
      })();

      inFlight.set(url, promise);
    };

    const pump = () => {
      while (activeLoads < maxConcurrent && queue.length > 0) {
        const next = queue.shift()!;
        if (isScrubFrameReady(images[next])) continue;
        if (inFlight.has(frameUrl(manifest, next))) continue;
        loadOne(next);
      }
    };

    const enqueue = (indices: number[]) => {
      for (const i of indices) {
        if (isScrubFrameReady(images[i])) continue;
        if (inFlight.has(frameUrl(manifest, i))) continue;
        if (!queue.includes(i)) queue.push(i);
      }
      pump();
    };

    const ensureWindow = (center: number) => {
      const c = Math.min(count - 1, Math.max(0, center | 0));
      // Only rebuild the window when the playhead moves — avoids queue thrash.
      if (c === lastCenter) {
        pump();
        return;
      }
      if (lastCenter >= 0) lastScrollDir = c >= lastCenter ? 1 : -1;
      lastCenter = c;

      const lo = Math.max(0, c - PRELOAD_WINDOW);
      const hi = Math.min(count - 1, c + PRELOAD_WINDOW);

      for (let i = 0; i < count; i++) {
        if (i < lo || i > hi) release(i);
      }

      const forward: number[] = [];
      const backward: number[] = [];
      for (let i = lo; i <= hi; i++) {
        if (lastScrollDir >= 0) {
          if (i >= c) forward.push(i);
          else backward.push(i);
        } else if (i <= c) {
          forward.push(i);
        } else {
          backward.push(i);
        }
      }
      if (lastScrollDir >= 0) backward.reverse();
      else forward.reverse();

      queue.length = 0;
      enqueue([...forward, ...backward]);
    };

    publish(false);

    if (reducedRef.current) {
      const url = frameUrl(manifest, 0);
      void (async () => {
        try {
          const frame: ScrubFrame = targetSize.resize
            ? await loadViaBitmap(url)
            : await loadViaImage(url);
          if (aborted) {
            releaseScrubFrame(frame);
            return;
          }
          images[0] = frame;
          readyPublished = true;
          publish(true);
        } catch {
          if (!aborted) {
            readyPublished = true;
            publish(true, `Failed to load ${url}`);
          }
        }
      })();
      return () => {
        aborted = true;
        for (let i = 0; i < count; i++) release(i);
        setState(EMPTY);
      };
    }

    ensureWindow(playheadRef.current ?? 0);

    let raf = 0;
    const tick = () => {
      ensureWindow(playheadRef.current ?? 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      aborted = true;
      cancelAnimationFrame(raf);
      queue.length = 0;
      for (let i = 0; i < count; i++) release(i);
      inFlight.clear();
      setState(EMPTY);
    };
  }, [manifest, maxConcurrent, enabled, playheadRef]);

  return state;
}
