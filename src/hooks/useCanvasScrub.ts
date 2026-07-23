"use client";

import { CANVAS_MAX_DPR } from "@/lib/hero-sequence/config";
import { useEffect, useRef } from "react";

type CoverRect = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
};

/** object-cover math: crop source, center in dest */
function coverRect(
  imgW: number,
  imgH: number,
  destW: number,
  destH: number,
): CoverRect {
  const imgAspect = imgW / imgH;
  const destAspect = destW / destH;
  let sw = imgW;
  let sh = imgH;
  let sx = 0;
  let sy = 0;

  if (imgAspect > destAspect) {
    sw = imgH * destAspect;
    sx = (imgW - sw) / 2;
  } else {
    sh = imgW / destAspect;
    sy = (imgH - sh) / 2;
  }

  return { sx, sy, sw, sh, dx: 0, dy: 0, dw: destW, dh: destH };
}

type UseCanvasScrubOptions = {
  images: (HTMLImageElement | undefined)[];
  targetFrameIndex: React.RefObject<number>;
  enabled?: boolean;
};

/**
 * RAF render loop: draw current frame to canvas only when index changes.
 * Scroll handlers must never call draw — they only update targetFrameIndex.
 */
export function useCanvasScrub(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  { images, targetFrameIndex, enabled = true }: UseCanvasScrubOptions,
) {
  const lastDrawn = useRef(-1);
  const layoutRef = useRef({ cssW: 0, cssH: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;
      const dpr = Math.min(CANVAS_MAX_DPR, window.devicePixelRatio || 1);
      layoutRef.current = { cssW, cssH, dpr };
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawn.current = -1;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement ?? canvas);

    let raf = 0;
    const tick = () => {
      const idx = targetFrameIndex.current;
      if (idx !== lastDrawn.current) {
        const img = images[idx];
        if (img?.complete && img.naturalWidth > 0) {
          const { cssW, cssH } = layoutRef.current;
          const rect = coverRect(img.naturalWidth, img.naturalHeight, cssW, cssH);
          ctx.fillStyle = "#08090b";
          ctx.fillRect(0, 0, cssW, cssH);
          ctx.drawImage(
            img,
            rect.sx,
            rect.sy,
            rect.sw,
            rect.sh,
            rect.dx,
            rect.dy,
            rect.dw,
            rect.dh,
          );
          lastDrawn.current = idx;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [canvasRef, images, targetFrameIndex, enabled]);
}
