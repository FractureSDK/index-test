/**
 * Color tokens. The CSS custom properties in globals.css (--color-ink etc.)
 * are the source for Tailwind classes; these are the same values in a form
 * WebGL/Canvas code can consume directly (THREE.Color and canvas fillStyle
 * both accept a hex string, but neither can read a CSS custom property).
 * Keep the two in sync by hand when changing the palette — there's no
 * automatic bridge between a CSS variable and a WebGL uniform.
 */
export const theme = {
  colors: {
    ink: "#050507",
    bone: "#f4f1ea",
    accent: "#c8ff3d",
    violet: "#6d4bff",
  },
} as const;
