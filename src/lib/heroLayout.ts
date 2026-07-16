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
 * Desk-planted MacBook — base flat on the desk, screen facing the viewer / copy.
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
      // Face copy; tip screen slightly more toward viewer
      laptopRotX: 0.16,
      laptopRotY: -0.28,
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
    laptopBaseY: -0.28,
    laptopBaseZ: 0.05,
    // Face Arcform copy more; tip down/toward viewer a bit more
    laptopRotX: 0.18,
    laptopRotY: -0.32,
    cameraPosition: [0.15, 0.48, 3.2],
    cameraFov: 36,
    shadowX: 1.15,
  };
}
