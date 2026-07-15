/** Frame-rate-independent exponential smoothing toward a target. */
export function expSmooth(current: number, target: number, lambda: number, dt: number) {
  const t = 1 - Math.exp(-lambda * dt);
  return current + (target - current) * t;
}

/** Soft deadzone — removes micro-jitter without a hard step. */
export function deadzone(value: number, zone: number) {
  if (Math.abs(value) <= zone) return 0;
  const sign = Math.sign(value);
  return sign * ((Math.abs(value) - zone) / (1 - zone));
}
