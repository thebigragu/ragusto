# Arcform

Luxury digital studio — cinematic single-page site with Blender-authored 3D lounge hero.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- React Three Fiber / Drei / postprocessing
- Framer Motion + Lenis
- Blender headless model pipeline

## 3D pipeline

```bash
npm run models:lounge
```

Builds `public/models/arcform-lounge.glb` (room, table, holographic screen frames). The Poly Haven armchair loads separately in the hero. Screen meshes named `Screen_A/B/C` get live canvas UI textures in R3F (waveforms, logs, bars).

## Develop

```bash
npm install
npm run dev
```
