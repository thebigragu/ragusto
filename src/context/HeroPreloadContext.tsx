"use client";

import { useFramePreload } from "@/hooks/useFramePreload";
import { useHeroMobileVideo } from "@/hooks/useIsMobile";
import { HERO_SEQUENCE_PATHS } from "@/lib/hero-sequence/config";
import type { HeroSequenceManifest } from "@/lib/hero-sequence/types";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type HeroPreloadContextValue = {
  progress: number;
  ready: boolean;
  error: string | null;
  images: (HTMLImageElement | undefined)[];
  manifest: HeroSequenceManifest | null;
  variant: "desktop" | "mobile" | null;
  heroRequired: boolean;
};

const HeroPreloadContext = createContext<HeroPreloadContextValue | null>(null);

export function HeroPreloadProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const heroRequired = pathname === "/";
  const useMobile = useHeroMobileVideo();
  const [manifest, setManifest] = useState<HeroSequenceManifest | null>(null);
  const [variant, setVariant] = useState<"desktop" | "mobile" | null>(null);

  const basePath = useMobile ? HERO_SEQUENCE_PATHS.mobile : HERO_SEQUENCE_PATHS.desktop;
  const nextVariant = useMobile ? "mobile" : "desktop";

  useEffect(() => {
    if (!heroRequired) {
      setManifest(null);
      setVariant(null);
      return;
    }

    // Hint the browser to fetch manifests + first frames before React finishes hydrating.
    const hints: HTMLLinkElement[] = [];
    for (const path of Object.values(HERO_SEQUENCE_PATHS)) {
      const manifestLink = document.createElement("link");
      manifestLink.rel = "preload";
      manifestLink.as = "fetch";
      manifestLink.href = `${path}/manifest.json`;
      manifestLink.crossOrigin = "anonymous";
      document.head.appendChild(manifestLink);
      hints.push(manifestLink);

      const frameLink = document.createElement("link");
      frameLink.rel = "preload";
      frameLink.as = "image";
      frameLink.href = `${path}/frame-00001.webp`;
      document.head.appendChild(frameLink);
      hints.push(frameLink);
    }

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${basePath}/manifest.json`);
        if (!res.ok) throw new Error(`manifest ${res.status}`);
        const data = (await res.json()) as HeroSequenceManifest;
        if (!cancelled) {
          setManifest(data);
          setVariant(nextVariant);
        }
      } catch (e) {
        if (!cancelled) {
          setManifest(null);
          setVariant(null);
          console.error(e);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
      for (const link of hints) link.remove();
    };
  }, [heroRequired, basePath, nextVariant]);

  const preload = useFramePreload(manifest, { enabled: heroRequired && !!manifest });

  const value = useMemo<HeroPreloadContextValue>(
    () => ({
      progress: heroRequired ? preload.progress : 1,
      ready: heroRequired ? preload.ready : true,
      error: preload.error,
      images: preload.images,
      manifest,
      variant,
      heroRequired,
    }),
    [heroRequired, preload, manifest, variant],
  );

  return (
    <HeroPreloadContext.Provider value={value}>{children}</HeroPreloadContext.Provider>
  );
}

export function useHeroPreload() {
  const ctx = useContext(HeroPreloadContext);
  if (!ctx) {
    throw new Error("useHeroPreload must be used within HeroPreloadProvider");
  }
  return ctx;
}

export function useHeroPreloadOptional() {
  return useContext(HeroPreloadContext);
}
