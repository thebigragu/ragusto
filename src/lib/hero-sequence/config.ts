/** Tunable hero scroll-scrub settings */

export const SCROLL_HEIGHT_MOBILE = "340vh";
export const SCROLL_HEIGHT_DESKTOP = "740vh";

/** First 90% of scrub maps to frames; last 10% shares scroll with contact reveal */
export const VIDEO_HANDOFF = 0.9;
export const SCRUB_HANDOFF_START = 0.78;

/**
 * Half-width of the decoded sliding window around the playhead.
 * Peak decoded ≈ 2 * PRELOAD_WINDOW + 1 (~65).
 */
export const PRELOAD_WINDOW = 32;

/** Parallel in-flight frame fetches (same local + production path). */
export const PRELOAD_MAX_CONCURRENT = 8;

/** Cap retina backing store */
export const CANVAS_MAX_DPR = 2;

/** Subtle scroll-linked canvas tilt (degrees) */
export const CANVAS_ROTATE_MAX = 1.5;

/** Subtle depth zoom across full scrub */
export const CANVAS_SCALE_DEPTH = 0.02;

export const HERO_SEQUENCE_PATHS = {
  desktop: "/hero-sequences/desktop",
  mobile: "/hero-sequences/mobile",
} as const;
