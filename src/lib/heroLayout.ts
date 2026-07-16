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
 * Desk-planted MacBook — planted flat like the ab87bd5 sit,
 * yawed toward hero copy (not away / not tilted).
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
      laptopBaseY: -0.12,
      laptopBaseZ: 0.05,
      laptopRotX: 0.02,
      laptopRotY: -0.32,
      cameraPosition: [0.05, 0.42, 3.45],
      cameraFov: 42,
      shadowX: 0.28,
    };
  }

  return {
    mobile: false,
    focusX: 1.2,
    focusY: 0.02,
    lookAtX: 0.25,
    lookAtY: 0.04,
    laptopScale: 0.046,
    laptopBaseY: -0.28,
    laptopBaseZ: 0.05,
    // Flat on desk (no pitch slant); face left toward ARCFORM copy
    laptopRotX: 0.02,
    laptopRotY: -0.4,
    cameraPosition: [0.12, 0.44, 3.15],
    cameraFov: 36,
    shadowX: 1.2,
  };
}
