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

export function frameUrl(manifest: HeroSequenceManifest, index: number) {
  const padded = String(index).padStart(5, "0");
  return manifest.pattern.replace("%05d", padded);
}
