"use client";

import {
  PRELOAD_MAX_CONCURRENT,
  PRELOAD_READY_FRAMES,
} from "@/lib/hero-sequence/config";
import {
  frameUrl,
  type HeroSequenceManifest,
} from "@/lib/hero-sequence/types";
import { useEffect, useRef, useState } from "react";

type PreloadState = {
  images: (HTMLImageElement | undefined)[];
  progress: number;
  /** Enough frames to show the hero and start scrubbing. */
  ready: boolean;
  /** Every frame in the sequence is loaded. */
  complete: boolean;
  error: string | null;
};

const EMPTY: PreloadState = {
  images: [],
  progress: 0,
  ready: false,
  complete: false,
  error: null,
};

function loadImage(src: string, signal: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const img = new Image();
    img.decoding = "async";

    const onAbort = () => {
      img.src = "";
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });

    img.onload = () => {
      signal.removeEventListener("abort", onAbort);
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      resolve(img);
    };
    img.onerror = () => {
      signal.removeEventListener("abort", onAbort);
      reject(new Error(`Failed to load ${src}`));
    };
    img.src = src;
  });
}

/**
 * Batch-preload every WebP frame for a hero sequence variant.
 * Returns decoded Image objects ready for canvas drawImage.
 */
async function runConcurrent<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
  signal: AbortSignal,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;

  const worker = async () => {
    while (next < tasks.length) {
      if (signal.aborted) return;
      const i = next++;
      results[i] = await tasks[i]();
    }
  };

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

export function useFramePreload(
  manifest: HeroSequenceManifest | null,
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

    const controller = new AbortController();
    const { signal } = controller;
    const count = manifest.frameCount;
    const images: (HTMLImageElement | undefined)[] = new Array(count);
    let loaded = 0;

    const readyThreshold = Math.min(
      count,
      Math.max(1, PRELOAD_READY_FRAMES),
    );

    const bump = () => {
      loaded += 1;
      setState({
        images: [...images],
        progress: loaded / count,
        ready: loaded >= readyThreshold,
        complete: loaded >= count,
        error: null,
      });
    };

    const run = async () => {
      setState({
        images: [],
        progress: 0,
        ready: false,
        complete: false,
        error: null,
      });

      // Reduced motion: first frame only
      if (reducedRef.current) {
        try {
          const img = await loadImage(frameUrl(manifest, 0), signal);
          images[0] = img;
          setState({
            images: [...images],
            progress: 1,
            ready: true,
            complete: true,
            error: null,
          });
        } catch (e) {
          if ((e as Error).name !== "AbortError") {
            setState((s) => ({ ...s, error: String(e), ready: false }));
          }
        }
        return;
      }

      try {
        // Front-load early scrub frames, then fill the rest in parallel.
        const order: number[] = [];
        for (let i = 0; i < readyThreshold; i++) order.push(i);
        for (let i = readyThreshold; i < count; i++) order.push(i);

        const tasks = order.map(
          (i) => () =>
            loadImage(frameUrl(manifest, i), signal).then((img) => {
              images[i] = img;
              bump();
              return img;
            }),
        );

        await runConcurrent(tasks, maxConcurrent, signal);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setState((s) => ({ ...s, error: String(e), ready: false }));
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [manifest, maxConcurrent, enabled]);

  return state;
}
