/**
 * On/off switches for pieces of the site that a fork or a client deploy
 * might want to disable without editing components: NEXT_PUBLIC_FEATURE_*
 * env vars, all optional, all default to enabled. Numeric/visual tuning
 * (colors, particle counts, camera params, bloom strength...) belongs in
 * the dedicated config files instead (blackhole.ts, hero-scene.ts,
 * theme.ts) — env vars are for on/off and identity, not fine-tuning.
 */
function flag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

const env = process.env;

export const features = {
  /** The counting-percentage curtain-wipe intro. */
  preloader: flag(env.NEXT_PUBLIC_FEATURE_PRELOADER, true),
  /** Custom cursor + magnetic hover (desktop-only regardless). */
  customCursor: flag(env.NEXT_PUBLIC_FEATURE_CURSOR, true),
  /** The ray-marched black hole on desktop; off falls back to the lighter wireframe model everywhere. */
  blackHole: flag(env.NEXT_PUBLIC_FEATURE_BLACKHOLE, true),
  /** Manifest + service worker registration. */
  pwa: flag(env.NEXT_PUBLIC_FEATURE_PWA, true),
  /** Thin scroll-position bar pinned to the top of the viewport. */
  scrollProgress: flag(env.NEXT_PUBLIC_FEATURE_SCROLL_PROGRESS, true),
} as const;
