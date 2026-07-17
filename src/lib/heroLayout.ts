export type HeroLayout = {
  mobile: boolean;
  /** World X of the MacBook on the desk */
  focusX: number;
  focusY: number;
  /** Camera look-at X — left of the laptop so copy stays clear on the left */
  lookAtX: number;
  lookAtY: number;
  laptopScale: number;
  laptopBaseY: number;
  laptopBaseZ: number;
  laptopRotX: number;
  laptopRotY: number;
  cameraPosition: [number, number, number];
  cameraFov: number;
  shadowX: number;
};

/**
 * World-Y offsets from laptopBaseY — lights/shadow track the laptop.
 * Camera stays fixed so lowering baseY actually moves the MacBook down in frame.
 */
export const HERO_Y_FROM_BASE = {
  directional: 3.78,
  point: 1.08,
  keyLight: 2.63,
  keyLightTarget: 2.48,
  shadow: -0.18,
} as const;

/**
 * Desk-planted MacBook — screen toward copy, base perfectly level (no roll).
 */
export function getHeroLayout(width: number): HeroLayout {
  const mobile = width < 768;

  if (mobile) {
    return {
      mobile: true,
      focusX: 0.28,
      focusY: 0.02,
      lookAtX: 0.0,
      lookAtY: 0.02,
      laptopScale: 0.028,
      // Low in frame — camera stays put so this shift is visible
      laptopBaseY: -0.32,
      laptopBaseZ: 0.05,
      laptopRotX: 0.2,
      laptopRotY: -0.4,
      cameraPosition: [0.05, 0.42, 3.45],
      cameraFov: 42,
      shadowX: 0.28,
    };
  }

  return {
    mobile: false,
    focusX: 1.15,
    focusY: 0.02,
    lookAtX: 0.28,
    lookAtY: 0.02,
    laptopScale: 0.046,
    // Centered in the hero — camera fixed; lights still follow baseY
    laptopBaseY: -0.58,
    laptopBaseZ: 0.05,
    laptopRotX: 0.22,
    laptopRotY: -0.42,
    cameraPosition: [0.15, 0.48, 3.2],
    cameraFov: 36,
    shadowX: 1.15,
  };
}
