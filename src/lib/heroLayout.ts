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

/** Desk-planted MacBook — same planted sit as before, gently facing hero copy. */
export function getHeroLayout(width: number): HeroLayout {
  const mobile = width < 768;

  if (mobile) {
    return {
      mobile: true,
      focusX: 0.32,
      focusY: 0.02,
      lookAtX: 0.02,
      lookAtY: 0.02,
      laptopScale: 0.028,
      laptopBaseY: -0.12,
      laptopBaseZ: 0.05,
      laptopRotX: 0.08,
      laptopRotY: -0.16,
      cameraPosition: [0.05, 0.4, 3.45],
      cameraFov: 42,
      shadowX: 0.32,
    };
  }

  return {
    mobile: false,
    focusX: 1.28,
    focusY: 0.02,
    lookAtX: 0.28,
    lookAtY: 0.04,
    laptopScale: 0.046,
    laptopBaseY: -0.28,
    laptopBaseZ: 0.05,
    // Same planted pitch as the prior desk pose; mild yaw toward left copy (was +0.42 away)
    laptopRotX: 0.06,
    laptopRotY: -0.22,
    cameraPosition: [0.15, 0.44, 3.15],
    cameraFov: 36,
    shadowX: 1.28,
  };
}
