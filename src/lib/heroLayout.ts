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

/** Desk-planted MacBook — right-weighted so hero copy stays clear. */
export function getHeroLayout(width: number): HeroLayout {
  const mobile = width < 768;

  if (mobile) {
    return {
      mobile: true,
      focusX: 0.35,
      focusY: 0.02,
      lookAtX: 0.05,
      lookAtY: 0.02,
      laptopScale: 0.026,
      laptopBaseY: -0.1,
      laptopBaseZ: 0.05,
      laptopRotX: 0.08,
      laptopRotY: 0.2,
      cameraPosition: [0.05, 0.42, 3.5],
      cameraFov: 42,
      shadowX: 0.35,
    };
  }

  return {
    mobile: false,
    focusX: 1.35,
    focusY: 0.0,
    lookAtX: 0.28,
    lookAtY: 0.05,
    laptopScale: 0.04,
    laptopBaseY: -0.26,
    laptopBaseZ: 0.05,
    laptopRotX: 0.06,
    laptopRotY: 0.38,
    cameraPosition: [0.05, 0.48, 3.25],
    cameraFov: 36,
    shadowX: 1.35,
  };
}
