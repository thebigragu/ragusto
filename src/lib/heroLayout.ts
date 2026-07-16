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

/** Desk-planted MacBook — framed over cinematic video plate (concept-01). */
export function getHeroLayout(width: number): HeroLayout {
  const mobile = width < 768;

  if (mobile) {
    return {
      mobile: true,
      focusX: 0.05,
      focusY: 0.06,
      laptopScale: 0.0295,
      laptopBaseY: -0.08,
      laptopBaseZ: 0.06,
      laptopRotX: 0.1,
      laptopRotY: 0.12,
      cameraPosition: [0.05, 0.42, 3.45],
      cameraFov: 44,
      shadowX: 0.05,
    };
  }

  return {
    mobile: false,
    focusX: 0.72,
    focusY: 0.12,
    laptopScale: 0.042,
    laptopBaseY: -0.22,
    laptopBaseZ: 0.1,
    laptopRotX: 0.12,
    laptopRotY: 0.32,
    cameraPosition: [0.2, 0.48, 3.15],
    cameraFov: 38,
    shadowX: 0.72,
  };
}
