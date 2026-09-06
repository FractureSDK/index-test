# Chu Yuewei — Portfolio

A lusion.co-inspired personal site: dark base, oversized display type,
GSAP-driven scroll reveals, a Three.js wireframe model, magnetic cursor
interactions, Lenis smooth scroll.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** — design tokens (colors, fluid `clamp()` type scale)
  live in `src/app/globals.css` under `@theme`
- **GSAP + ScrollTrigger** — all scroll-triggered reveals (`src/components/Reveal.tsx`)
- **Lenis** — smooth scroll, synced to GSAP's ticker so the two don't fight
  (`src/components/SmoothScroll.tsx`)
- **Three.js** — the abstract wireframe model behind the hero headline
  (`src/components/HeroScene.tsx`); lazy-loaded (`next/dynamic`, `ssr:false`)
  so it never blocks first paint of the actual (indexable) text
- Self-hosted fonts via `@fontsource` (Space Grotesk + Inter) — deliberately
  **not** `next/font/google`, since `fonts.googleapis.com` is blocked in
  mainland China and this avoids a third-party request either way
- PWA: `src/app/manifest.ts` (Next's file convention — auto-links itself),
  `public/sw.js` (minimal app-shell offline cache), dynamically generated
  icons via `next/og` (`src/app/icon.tsx`, `apple-icon.tsx`)

## Project structure

```
src/
  app/            routes, layout, metadata, manifest, PWA icons
  components/     UI + the reveal/cursor/scroll primitives
  config/site.ts  single source of truth for name/email/social/location
  content/        typed content arrays (projects, skills, journey, stats, nav)
  hooks/          usePrefersReducedMotion, useMediaQuery (SSR-safe, no
                  setState-in-effect — built on useSyncExternalStore)
  lib/gsap.ts     one place GSAP + ScrollTrigger get registered
```

Rebranding (new name/domain/email) touches `.env.local` — see `.env.example`
— not the components.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — defaults work out of the box
npm run dev
```

- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint (flat config, ships with create-next-app)
- `npm run format` / `format:check` — Prettier (with `prettier-plugin-tailwindcss`)

CI (`.github/workflows/ci.yml`) runs all four plus a build on every push/PR.

## Responsive / accessibility behavior

- Breakpoints: mobile ≤767px, tablet 768–1279px, desktop ≥1280px (Tailwind
  `md`/`lg` defaults line up with this).
- Custom cursor and magnetic hover are **only** active on
  `(pointer: fine) and (min-width: 768px)` — mobile always gets the native
  cursor and no magnetic offset, per spec.
- The Three.js model drops its orbiting fragment layer and polygon count on
  screens ≤767px.
- Everything animated (GSAP reveals, cursor, magnetic, marquee, Three.js
  render loop) checks `prefers-reduced-motion` and degrades to an instant/
  static state — see `usePrefersReducedMotion`.
- Headline/body text uses `clamp()`-based fluid sizes (`text-hero`,
  `text-display`, etc. in `globals.css`) instead of fixed breakpoint jumps.

## Deployment notes

- Any platform that runs Next.js works (Vercel is the reference target;
  Netlify needs the `@netlify/plugin-nextjs` build plugin).
- **HTTP/3** isn't something to add in application code — it's a transport-
  layer feature of the CDN/edge network in front of the app. Vercel,
  Netlify, and Cloudflare all serve over HTTP/3 automatically; nothing to
  configure here.
- Env vars (all optional, see `.env.example`) must be set with the
  `NEXT_PUBLIC_` prefix to be readable client-side, and injected at build
  time on whichever platform you deploy to.

## Content

Copy is still placeholder (fictional projects, generic social links) —
swap `src/content/*.ts` and `.env.local` for the real thing before shipping.
