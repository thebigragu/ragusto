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

/** Map 0-based frame index to FFmpeg's 1-based frame-%05d.webp filenames. */
export function frameUrl(manifest: HeroSequenceManifest, index: number) {
  const padded = String(index + 1).padStart(5, "0");
  return manifest.pattern.replace("%05d", padded);
}
