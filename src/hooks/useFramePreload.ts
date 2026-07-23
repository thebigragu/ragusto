"use client";

import { PRELOAD_BATCH_SIZE } from "@/lib/hero-sequence/config";
import {
  frameUrl,
  type HeroSequenceManifest,
} from "@/lib/hero-sequence/types";
import { useEffect, useRef, useState } from "react";

type PreloadState = {
  images: (HTMLImageElement | undefined)[];
  progress: number;
  ready: boolean;
  error: string | null;
};

const EMPTY: PreloadState = {
  images: [],
  progress: 0,
  ready: false,
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

    img.onload = async () => {
      signal.removeEventListener("abort", onAbort);
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      try {
        if (typeof img.decode === "function") await img.decode();
      } catch {
        /* decode optional */
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
export function useFramePreload(
  manifest: HeroSequenceManifest | null,
  options?: { batchSize?: number; enabled?: boolean },
) {
  const batchSize = options?.batchSize ?? PRELOAD_BATCH_SIZE;
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

    const bump = () => {
      loaded += 1;
      setState({
        images: [...images],
        progress: loaded / count,
        ready: loaded >= count,
        error: null,
      });
    };

    const run = async () => {
      setState({ images: [], progress: 0, ready: false, error: null });

      // Reduced motion: first frame only
      if (reducedRef.current) {
        try {
          const img = await loadImage(frameUrl(manifest, 0), signal);
          images[0] = img;
          setState({
            images: [...images],
            progress: 1,
            ready: true,
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
        for (let start = 0; start < count; start += batchSize) {
          if (signal.aborted) return;
          const end = Math.min(count, start + batchSize);
          const batch = [];
          for (let i = start; i < end; i++) {
            batch.push(
              loadImage(frameUrl(manifest, i), signal).then((img) => {
                images[i] = img;
                bump();
              }),
            );
          }
          await Promise.all(batch);
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setState((s) => ({ ...s, error: String(e), ready: false }));
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [manifest, batchSize, enabled]);

  return state;
}
