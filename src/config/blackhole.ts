/**
 * Every number in BlackHoleScene.tsx worth tuning without digging through
 * the GLSL template string. Radii are in units of the Schwarzschild
 * radius (Rs = 1) — see the component's top comment for why.
 */
export const blackHoleConfig = {
  disk: {
    innerRadius: 2.6,
    outerRadius: 9.2,
  },
  camera: {
    distance: 17,
    azimuth: -0.35,
    elevation: 0.28,
    /** How much closer the camera dollies in as the page scrolls past the first viewport (0–1 progress). */
    scrollDollyDistance: 4,
    fovDegrees: 55,
  },
  bloom: {
    strength: 0.5,
    radius: 0.35,
    threshold: 0.55,
  },
  /** Ray-march step count / internal render resolution scale, by viewport tier. */
  tiers: {
    compact: { maxSteps: 170, renderScale: 0.55 },
    full: { maxSteps: 280, renderScale: 0.8 },
  },
  /** Disk temperature ramp: cool (outer) → mid → hot (inner edge). */
  colors: {
    cool: "#612014",
    mid: "#ff8f33",
    hot: "#fff7e6",
    photonRing: "#ffdba3",
  },
} as const;
