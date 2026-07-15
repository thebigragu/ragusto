export type HeroLayout = {
  mobile: boolean;
  focusX: number;
  focusY: number;
  laptopScale: number;
  laptopBaseY: number;
  laptopBaseZ: number;
  cameraPosition: [number, number, number];
  cameraFov: number;
  shadowX: number;
};

export function getHeroLayout(width: number): HeroLayout {
  const mobile = width < 768;

  if (mobile) {
    return {
      mobile: true,
      focusX: 0,
      focusY: 0.08,
      laptopScale: 0.031,
      laptopBaseY: -0.02,
      laptopBaseZ: 0.08,
      cameraPosition: [0, 0.48, 3.55],
      cameraFov: 44,
      shadowX: 0,
    };
  }

  return {
    mobile: false,
    focusX: 0.7,
    focusY: 0.15,
    laptopScale: 0.0442,
    laptopBaseY: -0.15,
    laptopBaseZ: 0.12,
    cameraPosition: [0.15, 0.55, 3.2],
    cameraFov: 38,
    shadowX: 0.72,
  };
}
