/**
 * Single source of truth for breakpoints. Previously these were duplicated
 * as raw "768px"/"1024px"/"1279px" strings inline in Cursor.tsx,
 * Magnetic.tsx, HeroBackground.tsx, and BlackHoleScene.tsx — change one of
 * them here instead of hunting through components.
 */
export const BREAKPOINTS = {
  /** Below this: mobile. Cursor/magnetic/black-hole all disable here. */
  tabletMin: 768,
  /** Below this: HeroBackground uses the lighter wireframe model. */
  desktopMin: 1024,
  /** Below this (but >= desktopMin): BlackHoleScene runs its "compact" tier. */
  desktopFull: 1280,
} as const;

export const MQ = {
  pointerFine: "(pointer: fine)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
  tabletUp: `(min-width: ${BREAKPOINTS.tabletMin}px)`,
  desktopUp: `(min-width: ${BREAKPOINTS.desktopMin}px)`,
  desktopFullUp: `(min-width: ${BREAKPOINTS.desktopFull}px)`,
} as const;
