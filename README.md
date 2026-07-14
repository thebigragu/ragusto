# Arcform

Premium AI & software studio website — cinematic homepage, interactive WebGL, and conversion-focused contact.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Framer Motion + Lenis
- Three.js / React Three Fiber / Drei
- next-themes (dark / light)
- Vercel

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

## Structure

- `src/app` — routes, SEO (`sitemap`, `robots`)
- `src/components/sections` — homepage sections
- `src/components/three` — WebGL scenes (dynamic imports)
- `src/content` — typed copy modules
- `src/lib` — SEO helpers + utilities
