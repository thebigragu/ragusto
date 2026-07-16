export type HeroLayout = {
  mobile: boolean;
  focusX: number;
  focusY: number;
  laptopScale: number;
  laptopBaseY: number;
  laptopBaseZ: number;
  laptopRotX: number;
  laptopRotY: number;
  cameraPosition: [number, number, number];
  cameraFov: number;
  shadowX: number;
};

/** Desk-planted MacBook framed like the cinematic reference (right-weighted). */
export function getHeroLayout(width: number): HeroLayout {
  const mobile = width < 768;

  if (mobile) {
    return {
      mobile: true,
      focusX: 0.08,
      focusY: 0.02,
      laptopScale: 0.028,
      laptopBaseY: -0.12,
      laptopBaseZ: 0.05,
      laptopRotX: 0.08,
      laptopRotY: 0.22,
      cameraPosition: [0.1, 0.4, 3.4],
      cameraFov: 42,
      shadowX: 0.08,
    };
  }

  return {
    mobile: false,
    focusX: 0.85,
    focusY: 0.02,
    laptopScale: 0.046,
    laptopBaseY: -0.28,
    laptopBaseZ: 0.05,
    laptopRotX: 0.06,
    laptopRotY: 0.42,
    cameraPosition: [0.35, 0.42, 3.05],
    cameraFov: 36,
    shadowX: 0.85,
  };
}
