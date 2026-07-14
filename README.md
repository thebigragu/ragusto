# Arcform

Premium AI & software studio website — cinematic homepage with Blender-authored 3D.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Framer Motion + Lenis
- Three.js / React Three Fiber / Drei
- **Blender 5.2** (headless) → GLB models in `public/models/`
- next-themes (dark / light)
- Vercel

## 3D models

Regenerate GLBs (requires Blender on PATH):

```bash
npm run models
```

Scripts live in `blender/`:
- `build_studio_hero.py` → `public/models/studio-hero.glb` (desk, monitors, boards, orb)
- `build_pavilion.py` → `public/models/studio-pavilion.glb` (pavilion + landscape rocks)

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```
