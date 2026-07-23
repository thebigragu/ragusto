"use client";

import {
  PRELOAD_MAX_CONCURRENT,
  PRELOAD_WINDOW,
} from "@/lib/hero-sequence/config";
import {
  frameUrl,
  type HeroSequenceManifest,
} from "@/lib/hero-sequence/types";
import { useEffect, useRef, useState, type RefObject } from "react";

type PreloadState = {
  images: (HTMLImageElement | undefined)[];
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

function releaseImage(img: HTMLImageElement | undefined) {
  if (!img) return;
  img.onload = null;
  img.onerror = null;
  img.src = "";
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
    const images: (HTMLImageElement | undefined)[] = new Array(count);
    const inFlight = new Map<string, Promise<void>>();
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
      releaseImage(images[index]);
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

    const loadOne = (index: number) => {
      if (aborted || index < 0 || index >= count) return;
      if (images[index]?.complete && images[index]!.naturalWidth > 0) return;

      const url = frameUrl(manifest, index);
      if (inFlight.has(url)) return;

      const promise = new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          inFlight.delete(url);
          activeLoads = Math.max(0, activeLoads - 1);
          if (aborted) {
            releaseImage(img);
            pump();
            resolve();
            return;
          }
          const c = playheadRef.current ?? 0;
          const lo = Math.max(0, c - PRELOAD_WINDOW);
          const hi = Math.min(count - 1, c + PRELOAD_WINDOW);
          if (index < lo || index > hi) {
            releaseImage(img);
          } else {
            images[index] = img;
            bumpInitial(index);
          }
          pump();
          resolve();
        };
        img.onerror = () => {
          inFlight.delete(url);
          activeLoads = Math.max(0, activeLoads - 1);
          if (!aborted && !readyPublished) {
            // Fail-open: don't block the site on a single bad frame.
            readyPublished = true;
            publish(true, `Failed to load ${url}`);
          }
          pump();
          resolve();
        };
        img.src = url;
      });

      inFlight.set(url, promise);
      activeLoads += 1;
    };

    const pump = () => {
      while (activeLoads < maxConcurrent && queue.length > 0) {
        const next = queue.shift()!;
        if (images[next]?.complete && images[next]!.naturalWidth > 0) continue;
        if (inFlight.has(frameUrl(manifest, next))) continue;
        loadOne(next);
      }
    };

    const enqueue = (indices: number[]) => {
      for (const i of indices) {
        if (images[i]?.complete && images[i]!.naturalWidth > 0) continue;
        if (inFlight.has(frameUrl(manifest, i))) continue;
        if (!queue.includes(i)) queue.push(i);
      }
      pump();
    };

    const ensureWindow = (center: number) => {
      const c = Math.min(count - 1, Math.max(0, center | 0));
      if (c !== lastCenter) {
        if (lastCenter >= 0) lastScrollDir = c >= lastCenter ? 1 : -1;
        lastCenter = c;
      }

      const lo = Math.max(0, c - PRELOAD_WINDOW);
      const hi = Math.min(count - 1, c + PRELOAD_WINDOW);

      for (let i = 0; i < count; i++) {
        if (i < lo || i > hi) release(i);
      }

      // Prefer loading in scroll direction, then opposite.
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
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (aborted) {
          releaseImage(img);
          return;
        }
        images[0] = img;
        readyPublished = true;
        publish(true);
      };
      img.onerror = () => {
        if (!aborted) {
          readyPublished = true;
          publish(true, `Failed to load ${frameUrl(manifest, 0)}`);
        }
      };
      img.src = frameUrl(manifest, 0);
      return () => {
        aborted = true;
        releaseImage(img);
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
