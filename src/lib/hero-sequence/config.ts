/** Tunable hero scroll-scrub settings */

export const HERO_FRAME_COUNT = 240;

export const SCROLL_HEIGHT_MOBILE = "340vh";
export const SCROLL_HEIGHT_DESKTOP = "740vh";

/** First 90% of scrub maps to frames; last 10% shares scroll with contact reveal */
export const VIDEO_HANDOFF = 0.9;
export const SCRUB_HANDOFF_START = 0.78;

/** Max parallel frame fetches (HTTP/2 multiplexes on one origin). */
export const PRELOAD_MAX_CONCURRENT = 28;

/** Dismiss loader once this many frames are decoded — rest load in background. */
export const PRELOAD_READY_FRAMES = 40;

/** Cap retina backing store to avoid 4× fill cost on mobile */
export const CANVAS_MAX_DPR = 2;

/** Subtle scroll-linked canvas tilt (degrees) */
export const CANVAS_ROTATE_MAX = 1.5;

/** Subtle depth zoom across full scrub */
export const CANVAS_SCALE_DEPTH = 0.02;

export const HERO_SEQUENCE_PATHS = {
  desktop: "/hero-sequences/desktop",
  mobile: "/hero-sequences/mobile",
} as const;
