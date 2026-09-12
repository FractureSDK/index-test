/**
 * Every number in HeroScene.tsx (the mobile/tablet wireframe model) worth
 * tuning without digging through the shader/component body.
 */
export const heroSceneConfig = {
  form: {
    radius: 11,
    segmentsDesktop: 5,
    segmentsMobile: 3,
    distortionBase: 0.6,
    /** How much extra distortion amplitude the first-viewport scroll adds, at progress = 1. */
    distortionScrollGain: 1.6,
  },
  fragments: {
    countDesktop: 36,
    countMobile: 0,
    size: 0.55,
    orbitRadiusMin: 16,
    orbitRadiusRange: 10,
  },
  camera: {
    distance: 34,
    fovDegrees: 50,
  },
} as const;
