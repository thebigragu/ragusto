"use client";

import { useMemo } from "react";
import * as THREE from "three";

function makeCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx, size };
}

function noise(ctx: CanvasRenderingContext2D, size: number, alpha: number) {
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = alpha;
  }
  ctx.putImageData(img, 0, 0);
}

/** Photoreal FR4 + copper + silkscreen PCB map (RefractWeb-class surface density) */
export function createPcbTexture(size = 1024) {
  const { canvas, ctx } = makeCanvas(size);

  // Solder mask base
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, "#06140f");
  g.addColorStop(0.45, "#0c241a");
  g.addColorStop(1, "#081810");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // Substrate grain
  ctx.globalAlpha = 0.18;
  noise(ctx, size, 40);
  ctx.globalAlpha = 1;

  // Copper pour zones
  ctx.fillStyle = "#8a5a1a";
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillRect(x, y, 40 + Math.random() * 120, 20 + Math.random() * 80);
  }
  ctx.globalAlpha = 1;

  // Trace network
  ctx.strokeStyle = "#c9882a";
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < 90; i++) {
    const x = (i % 15) * (size / 15) + 20;
    const y = Math.floor(i / 15) * (size / 6) + 40;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 30 + (i % 5) * 18, y);
    ctx.lineTo(x + 30 + (i % 5) * 18, y + 40 + (i % 3) * 25);
    ctx.stroke();
  }
  // Vertical buses
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#d4a03a";
  for (let i = 0; i < 18; i++) {
    const x = 48 + i * 54;
    ctx.beginPath();
    ctx.moveTo(x, 60);
    ctx.lineTo(x, size - 60);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Via dots
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + Math.random() * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.5 ? "#e0b35a" : "#1a1a1a";
    ctx.fill();
  }

  // Gold pad grid (BGA footprint outline)
  const padStart = size * 0.22;
  const padEnd = size * 0.78;
  const cols = 16;
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < cols; y++) {
      if (x > 5 && x < 10 && y > 5 && y < 10) continue;
      const px = padStart + (x / (cols - 1)) * (padEnd - padStart);
      const py = padStart + (y / (cols - 1)) * (padEnd - padStart);
      ctx.fillStyle = "#e6c35c";
      ctx.fillRect(px - 5, py - 5, 10, 10);
      ctx.strokeStyle = "#8a6a20";
      ctx.lineWidth = 1;
      ctx.strokeRect(px - 5, py - 5, 10, 10);
    }
  }

  // Silkscreen
  ctx.fillStyle = "rgba(230,230,220,0.55)";
  ctx.font = "600 28px ui-monospace, monospace";
  ctx.fillText("ARCFORM", size * 0.08, size * 0.1);
  ctx.font = "500 16px ui-monospace, monospace";
  ctx.fillText("AF-AI-01  REV C", size * 0.08, size * 0.14);
  ctx.fillText("U1", size * 0.46, size * 0.48);
  ctx.fillText("C12", size * 0.72, size * 0.22);
  ctx.fillText("R7", size * 0.18, size * 0.78);

  // Fiducials
  [[0.08, 0.92], [0.92, 0.08], [0.92, 0.92]].forEach(([fx, fy]) => {
    ctx.beginPath();
    ctx.arc(size * fx, size * fy, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * fx, size * fy, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Silicon die photomask — iridescent circuit density */
export function createDieTexture(size = 512) {
  const { canvas, ctx } = makeCanvas(size);
  ctx.fillStyle = "#1a2233";
  ctx.fillRect(0, 0, size, size);

  const cell = 10;
  for (let x = 0; x < size; x += cell) {
    for (let y = 0; y < size; y += cell) {
      const v = ((x * 13 + y * 7) % 40) / 40;
      ctx.fillStyle =
        v > 0.7
          ? "#5b8def"
          : v > 0.45
            ? "#2a3d5c"
            : v > 0.25
              ? "#7aa2ff"
              : "#121820";
      ctx.fillRect(x, y, cell - 1, cell - 1);
    }
  }

  // Macro blocks
  ctx.strokeStyle = "rgba(180,210,255,0.55)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.strokeRect(20 + i * 12, 20, size - 40 - i * 24, size - 40 - i * 24);
  }

  // Power rails
  ctx.fillStyle = "rgba(120,180,255,0.35)";
  for (let i = 0; i < 20; i++) {
    ctx.fillRect(i * 26, 0, 2, size);
    ctx.fillRect(0, i * 26, size, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Brushed metal for machined craft (Galvanite-level surface craft) */
export function createBrushedMetalTexture(size = 512) {
  const { canvas, ctx } = makeCanvas(size);
  ctx.fillStyle = "#8a9098";
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    const a = 0.08 + Math.random() * 0.12;
    ctx.fillStyle = `rgba(${200 + Math.random() * 40},${205 + Math.random() * 35},${210 + Math.random() * 30},${a})`;
    ctx.fillRect(0, y, size, 1);
  }
  // Panel seams
  ctx.strokeStyle = "rgba(30,30,35,0.35)";
  ctx.lineWidth = 2;
  for (let i = 1; i < 6; i++) {
    const y = (i / 6) * size;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 4);
  return tex;
}

/** Live dashboard screen for devices */
export function createDashboardTexture(accent = "#3b82f6", size = 512) {
  const { canvas, ctx } = makeCanvas(size);
  ctx.fillStyle = "#0a0a10";
  ctx.fillRect(0, 0, size, size);

  // Title bar
  ctx.fillStyle = "#14141c";
  ctx.fillRect(0, 0, size, 36);
  ["#ef4444", "#eab308", "#22c55e"].forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(18 + i * 16, 18, 5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });
  ctx.fillStyle = "#2a2a34";
  ctx.fillRect(80, 10, size * 0.55, 16);

  // Sidebar
  ctx.fillStyle = "#101018";
  ctx.fillRect(0, 36, 72, size - 36);

  // KPI cards
  for (let i = 0; i < 3; i++) {
    const x = 90 + i * 130;
    ctx.fillStyle = "#161622";
    ctx.fillRect(x, 56, 118, 64);
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(x, 56, 118, 3);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#e8e8ef";
    ctx.font = "600 22px system-ui";
    ctx.fillText(["94%", "2.4k", "12ms"][i], x + 14, 96);
  }

  // Chart
  ctx.fillStyle = "#12121a";
  ctx.fillRect(90, 140, 390, 200);
  const bars = [0.4, 0.7, 0.55, 0.9, 0.65, 0.8, 0.5, 0.75];
  bars.forEach((h, i) => {
    const bh = h * 150;
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.75 + (i % 3) * 0.08;
    ctx.fillRect(110 + i * 44, 320 - bh, 28, bh);
  });
  ctx.globalAlpha = 1;

  // Table rows
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 ? "#101018" : "#14141e";
    ctx.fillRect(90, 360 + i * 28, 390, 26);
    ctx.fillStyle = "#666";
    ctx.font = "12px system-ui";
    ctx.fillText(`pipeline · stage ${i + 1}`, 104, 378 + i * 28);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function usePcbTextures() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    return {
      pcb: createPcbTexture(1024),
      die: createDieTexture(512),
      metal: createBrushedMetalTexture(512),
      dashBlue: createDashboardTexture("#3b82f6"),
      dashTeal: createDashboardTexture("#14b8a6"),
      dashViolet: createDashboardTexture("#7c6cf0"),
    };
  }, []);
}
