"use client";

import { useEffect, useRef } from "react";

/**
 * Floating dust / light glimmer over the cinematic video plate.
 * Keeps the hero feeling alive even when camera motion is subtle.
 */
export function AmbientGlimmer({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    type Speck = {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      a: number;
      tw: number;
      phase: number;
    };

    const specks: Speck[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (specks.length === 0) {
        const count = Math.floor((w * h) / 18000);
        for (let i = 0; i < count; i++) {
          specks.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.6 + Math.random() * 1.8,
            vx: -0.15 + Math.random() * 0.3,
            vy: -0.25 + Math.random() * -0.15,
            a: 0.15 + Math.random() * 0.55,
            tw: 0.8 + Math.random() * 1.8,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const tick = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);

      // Soft light shaft shimmer (upper-left, matching Rembrandt key)
      const pulse = 0.08 + 0.05 * Math.sin(t * 0.7);
      const g = ctx.createLinearGradient(0, 0, w * 0.55, h * 0.7);
      g.addColorStop(0, `rgba(255, 210, 160, ${pulse})`);
      g.addColorStop(0.45, `rgba(255, 180, 120, ${pulse * 0.35})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Warm rim glimmer sweep
      const sweep = ((t * 0.08) % 1.4) - 0.2;
      const sg = ctx.createLinearGradient(w * sweep, 0, w * (sweep + 0.25), h * 0.5);
      sg.addColorStop(0, "rgba(255,255,255,0)");
      sg.addColorStop(0.5, "rgba(255, 230, 190, 0.06)");
      sg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, w, h);

      for (const s of specks) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.y < -10) {
          s.y = h + 10;
          s.x = Math.random() * w;
        }
        if (s.x < -10) s.x = w + 10;
        if (s.x > w + 10) s.x = -10;

        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.tw + s.phase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 236, 210, ${s.a * twinkle})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={className}
      aria-hidden
      style={{ pointerEvents: "none", mixBlendMode: "screen" }}
    />
  );
}
