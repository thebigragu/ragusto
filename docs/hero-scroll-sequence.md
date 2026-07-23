# Hero scroll sequence

Apple-style scroll-scrub hero: MP4 → WebP frames → canvas renderer. Never uses `<video>` seek for scrubbing.

## Prerequisites

- [FFmpeg](https://ffmpeg.org/) with `libwebp` (included in full builds)
- Source videos in `public/videos/`:
  - `hero-kling.mp4` — desktop / landscape
  - `hero-kling-mobile.mp4` — mobile / portrait

## Generate frames

```bash
npm run hero:frames
```

This runs [`scripts/extract-hero-frames.cjs`](../scripts/extract-hero-frames.cjs):

1. Probes each MP4 (`avg_frame_rate`, `duration`, `nb_frames`, size)
2. Extracts **every native frame** as WebP (quality 90), capped at **900** via even fps sample if needed
3. Scales down only — desktop `min(sourceW, 1920)`, mobile `min(sourceW, 1080)`
4. Writes `manifest.json` from files on disk (FFmpeg `frame-%05d.webp` is **1-based**)

```
public/hero-sequences/
  desktop/
    manifest.json
    frame-00001.webp … frame-{N}.webp
  mobile/
    manifest.json
    frame-00001.webp … frame-{N}.webp
```

There is **no** `frame-00000.webp`. URL helpers map `0-based index → index + 1`.

Commit the generated `public/hero-sequences/` folder after running.

## How it works

1. **Variant** — Resolve desktop vs mobile once after viewport measure (no mobile→desktop double preload).
2. **Sliding window** — [`useFramePreload`](../src/hooks/useFramePreload.ts) keeps ~±32 decoded frames around the playhead (`PRELOAD_WINDOW`), concurrency 8. Evicts outside the window (`img.src = ""`). Same path locally and on Vercel.
3. **Loader** — Dismisses when the **first window** (`0 .. PRELOAD_WINDOW`) is warm — not when all N frames are decoded.
4. **Scroll** — [`ScrollHero`](../src/components/sections/ScrollHero.tsx) writes frame index into a shared playhead ref via [`useScrollFrameIndex`](../src/hooks/useScrollFrameIndex.ts). No spring on the frame index.
5. **Render** — [`ScrollScrubCanvas`](../src/components/hero/ScrollScrubCanvas.tsx) draws in a RAF loop ([`useCanvasScrub`](../src/hooks/useCanvasScrub.ts)). Scroll handlers never call `drawImage`.
6. **Overlays** — Bubbles, contact CTA, logo, and masks remain DOM layers animated by Framer Motion.

## Replace the animation

1. Drop new MP4s into `public/videos/` (keep filenames or update `scripts/extract-hero-frames.cjs`).
2. Run `npm run hero:frames`.
3. Commit updated `public/hero-sequences/`.

Scroll duration stays at **`340vh` mobile / `740vh` desktop** regardless of frame count — more frames only add finer in-betweens.

## Tuning

Edit [`src/lib/hero-sequence/config.ts`](../src/lib/hero-sequence/config.ts):

| Constant | Effect |
|---|---|
| `SCROLL_HEIGHT_MOBILE` / `SCROLL_HEIGHT_DESKTOP` | Total scroll distance (must match Tailwind classes on the scrub section in `ScrollHero`) |
| `VIDEO_HANDOFF` / `SCRUB_HANDOFF_START` | How much of scroll maps to frames vs contact reveal |
| `PRELOAD_WINDOW` | Half-width of decoded cache around playhead (~65 max) |
| `PRELOAD_MAX_CONCURRENT` | Parallel in-flight frame fetches (6–8) |
| `CANVAS_MAX_DPR` | Retina backing-store cap |
| `CANVAS_ROTATE_MAX` / `CANVAS_SCALE_DEPTH` | Subtle scroll-linked canvas polish |

## Deploy notes

- Frame sequences live under `public/hero-sequences/` for Vercel static hosting.
- Peak decoded RAM is bounded by the sliding window, not total frame count.
- `prefers-reduced-motion` loads only frame 0.
- Optional: `npm run dev:webpack` if Turbopack Node RAM is high (does not change frame quality).
