export type HeroSequenceVariant = "desktop" | "mobile";

export type HeroSequenceManifest = {
  id: HeroSequenceVariant;
  source: string;
  frameCount: number;
  width: number;
  height: number;
  fps: number;
  pattern: string;
};

/** Decoded scrub slot — ImageBitmap when downscaled; else HTMLImageElement. */
export type ScrubFrame = HTMLImageElement | ImageBitmap;

/** Map 0-based frame index to FFmpeg's 1-based frame-%05d.webp filenames. */
export function frameUrl(manifest: HeroSequenceManifest, index: number) {
  const padded = String(index + 1).padStart(5, "0");
  return manifest.pattern.replace("%05d", padded);
}

export function isScrubFrameReady(
  frame: ScrubFrame | undefined,
): frame is ScrubFrame {
  if (!frame) return false;
  if (typeof ImageBitmap !== "undefined" && frame instanceof ImageBitmap) {
    return frame.width > 0 && frame.height > 0;
  }
  const img = frame as HTMLImageElement;
  return img.complete && img.naturalWidth > 0;
}

export function scrubFrameSize(frame: ScrubFrame): { w: number; h: number } {
  if (typeof ImageBitmap !== "undefined" && frame instanceof ImageBitmap) {
    return { w: frame.width, h: frame.height };
  }
  const img = frame as HTMLImageElement;
  return { w: img.naturalWidth, h: img.naturalHeight };
}

export function releaseScrubFrame(frame: ScrubFrame | undefined) {
  if (!frame) return;
  if (typeof ImageBitmap !== "undefined" && frame instanceof ImageBitmap) {
    frame.close();
    return;
  }
  const img = frame as HTMLImageElement;
  img.onload = null;
  img.onerror = null;
  img.src = "";
}
