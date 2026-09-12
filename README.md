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
- **Three.js** — two hero backgrounds, picked by breakpoint (see
  `HeroBackground.tsx`): a ray-marched black hole shader on desktop
  (`BlackHoleScene.tsx` — per-pixel bent-geodesic integration, not a
  particle/mesh trick) and a lighter wireframe distortion model on mobile/
  tablet (`HeroScene.tsx`). Both lazy-loaded (`next/dynamic`, `ssr:false`)
  so neither blocks first paint of the actual (indexable) headline text
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
  components/     UI + the reveal/cursor/scroll/3D primitives
  config/
    site.ts          identity: name/email/social/location (env-overridable)
    theme.ts          color tokens shared with Three.js/canvas code
    breakpoints.ts    the one place viewport widths & their media queries live
    features.ts       env-driven on/off flags for whole pieces (see below)
    blackhole.ts      every tunable number in BlackHoleScene.tsx
    hero-scene.ts     every tunable number in the mobile HeroScene.tsx
  content/        typed content arrays (projects, skills, journey, stats, nav)
  hooks/          usePrefersReducedMotion, useMediaQuery (SSR-safe, no
                  setState-in-effect — built on useSyncExternalStore),
                  useAppReady (preloader-finished context)
  lib/gsap.ts     one place GSAP + ScrollTrigger get registered
```

## Configuring the project

Three different things live in three different places on purpose — don't
reach for an env var when a config file is the right tool, or vice versa:

- **Identity/branding** (name, email, socials, domain) → `.env.local`, see
  `.env.example`. `src/config/site.ts` reads these with fallbacks in
  `site.defaults.ts`.
- **Turning a whole feature on/off** → `.env.local`, see the
  `NEXT_PUBLIC_FEATURE_*` vars in `.env.example` and `src/config/features.ts`.
  Useful for a fork or a lower-powered client deploy — e.g. set
  `NEXT_PUBLIC_FEATURE_BLACKHOLE=false` to always use the lighter wireframe
  model, or `NEXT_PUBLIC_FEATURE_CURSOR=false` to drop the custom cursor/
  magnetic hover entirely.
- **Fine-tuning how a feature looks/behaves** (colors, particle/step counts,
  camera distance, bloom strength...) → edit the relevant
  `src/config/*.ts` file directly (`blackhole.ts`, `hero-scene.ts`,
  `theme.ts`). These are read at module-load time, not runtime — changing
  them requires a rebuild, same as any other source change. They're plain
  typed objects specifically so this is a five-second edit instead of
  hunting through a component body for a magic number.

Rebranding (new name/domain/email) only touches `.env.local` — not the
components.

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

- Breakpoints: mobile ≤767px, tablet 768–1279px, desktop ≥1280px — all
  defined once in `src/config/breakpoints.ts` (Tailwind `md`/`lg` defaults
  line up with this).
- Custom cursor and magnetic hover are **only** active on
  `(pointer: fine) and (min-width: 768px)`, and only when
  `NEXT_PUBLIC_FEATURE_CURSOR` isn't disabled — mobile always gets the
  native cursor and no magnetic offset, per spec.
- `HeroBackground.tsx` swaps in the black hole shader at ≥1024px (desktop);
  below that, and whenever `NEXT_PUBLIC_FEATURE_BLACKHOLE=false`, it's the
  lighter wireframe model. The black hole itself further steps its ray-march
  count and internal render resolution down between 1024–1279px vs. ≥1280px
  (`desktopFull` in `breakpoints.ts`) — still real geodesic integration at
  that size, just fewer steps/pixels.
- Everything animated (GSAP reveals, cursor, magnetic, marquee, both Three.js
  render loops) checks `prefers-reduced-motion` and degrades to an instant/
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
