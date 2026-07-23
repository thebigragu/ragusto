# Hero scroll sequence

Apple-style scroll-scrub hero: MP4 → WebP frames → canvas renderer.

## Prerequisites

- [FFmpeg](https://ffmpeg.org/) with `libwebp` (included in full builds)
- Source videos in `public/videos/`:
  - `hero-kling.mp4` — desktop / landscape
  - `hero-kling-mobile.mp4` — mobile / portrait

## Generate frames

```bash
npm run hero:frames
```

This runs [`scripts/extract-hero-frames.cjs`](../scripts/extract-hero-frames.cjs) and writes:

```
public/hero-sequences/
  desktop/
    manifest.json
    frame-00000.webp … frame-00239.webp
  mobile/
    manifest.json
    frame-00000.webp … frame-00239.webp
```

### Manual FFmpeg commands

**Desktop** (1920w, 240 frames @ 24fps):

```bash
ffmpeg -y -i public/videos/hero-kling.mp4 \
  -vf "fps=24,scale=1920:-2:flags=lanczos" \
  -frames:v 240 \
  -c:v libwebp -quality 82 -compression_level 6 -preset picture \
  public/hero-sequences/desktop/frame-%05d.webp
```

**Mobile** (1080w, 240 frames @ 24fps):

```bash
ffmpeg -y -i public/videos/hero-kling-mobile.mp4 \
  -vf "fps=24,scale=1080:-2:flags=lanczos" \
  -frames:v 240 \
  -c:v libwebp -quality 82 -compression_level 6 -preset picture \
  public/hero-sequences/mobile/frame-%05d.webp
```

Commit the generated `public/hero-sequences/` folder after running.

## How it works

1. **Preload** — [`HeroPreloadContext`](../src/context/HeroPreloadContext.tsx) fetches the manifest and batch-loads WebP frames on the home route. The global loader shows real progress.
2. **Scroll** — [`ScrollHero`](../src/components/sections/ScrollHero.tsx) maps scroll position to frame index via [`useScrollFrameIndex`](../src/hooks/useScrollFrameIndex.ts). No `<video>` element.
3. **Render** — [`ScrollScrubCanvas`](../src/components/hero/ScrollScrubCanvas.tsx) draws the current frame in a RAF loop ([`useCanvasScrub`](../src/hooks/useCanvasScrub.ts)). Scroll handlers never draw to the canvas.
4. **Overlays** — Bubbles, contact CTA, logo, and masks remain DOM layers animated by Framer Motion.

## Replace the animation

1. Drop new MP4s into `public/videos/` (keep filenames or update `scripts/extract-hero-frames.cjs`).
2. Run `npm run hero:frames`.
3. Commit updated `public/hero-sequences/`.
4. Adjust frame count in the script if duration changes (target 180–240 frames).

## Tuning

Edit [`src/lib/hero-sequence/config.ts`](../src/lib/hero-sequence/config.ts):

| Constant | Effect |
|---|---|
| `SCROLL_HEIGHT_MOBILE` / `SCROLL_HEIGHT_DESKTOP` | Total scroll distance (must match Tailwind classes on the scrub section in `ScrollHero`) |
| `VIDEO_HANDOFF` / `SCRUB_HANDOFF_START` | How much of scroll maps to frames vs contact reveal |
| `PRELOAD_MAX_CONCURRENT` | Parallel frame fetches |
| `PRELOAD_READY_FRAMES` | Dismiss loader after this many frames (rest load in background) |
| `CANVAS_MAX_DPR` | Retina backing-store cap |
| `CANVAS_ROTATE_MAX` / `CANVAS_SCALE_DEPTH` | Subtle scroll-linked canvas polish |

## Deploy notes

- Frame sequences are ~25–30 MB total (240 frames × 2 variants). They are committed to `public/` for simple Vercel static hosting.
- First visit preloads the first ~40 frames, then reveals the hero while the rest load in the background.
- `prefers-reduced-motion` loads only frame 0.
