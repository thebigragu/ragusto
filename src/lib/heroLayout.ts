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
 * World-Y offsets from laptopBaseY — captured when lighting was tuned at
 * desktop baseY -0.28 so every light tracks the laptop 1:1.
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
    // Camera/look offsets from original mobile baseY -0.12
    const laptopBaseY = -0.42;
    const lookAtY = laptopBaseY + 0.14;
    return {
      mobile: true,
      focusX: 0.28,
      focusY: lookAtY,
      lookAtX: 0.0,
      lookAtY,
      laptopScale: 0.028,
      laptopBaseY,
      laptopBaseZ: 0.05,
      laptopRotX: 0.2,
      laptopRotY: -0.4,
      cameraPosition: [0.05, laptopBaseY + 0.54, 3.45],
      cameraFov: 42,
      shadowX: 0.28,
    };
  }

  // Camera/look offsets from original desktop baseY -0.28
  const laptopBaseY = -0.64;
  const lookAtY = laptopBaseY + 0.3;
  return {
    mobile: false,
    focusX: 1.15,
    focusY: lookAtY,
    lookAtX: 0.28,
    lookAtY,
    laptopScale: 0.046,
    laptopBaseY,
    laptopBaseZ: 0.05,
    laptopRotX: 0.22,
    laptopRotY: -0.42,
    cameraPosition: [0.15, laptopBaseY + 0.76, 3.2],
    cameraFov: 36,
    shadowX: 1.15,
  };
}
