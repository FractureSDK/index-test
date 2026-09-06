/**
 * Plain default values for site identity/metadata — this is the actual
 * single source of truth. `src/config/site.ts` layers environment
 * variables on top of these at runtime/build time (via
 * `process.env.NEXT_PUBLIC_*`), and `src/app/layout.tsx` /
 * `src/app/manifest.ts` read the same resolved values for
 * metadata/OG/PWA — so a rebrand or new domain touches one file.
 */
export const siteDefaults = {
  NEXT_PUBLIC_SITE_NAME: "Chu Yuewei",
  NEXT_PUBLIC_SITE_ROLE: "Creative Developer",
  NEXT_PUBLIC_SITE_DESCRIPTION:
    "Chu Yuewei — Creative Developer & Digital Craftsman. Building immersive digital experiences at the intersection of design and code.",
  NEXT_PUBLIC_SITE_URL: "https://chuyuewei.com",
  NEXT_PUBLIC_CONTACT_EMAIL: "hello@chuyuewei.com",
  NEXT_PUBLIC_SITE_CITY: "Shanghai",
  NEXT_PUBLIC_SITE_COUNTRY: "CN",
  NEXT_PUBLIC_SITE_TIMEZONE: "Asia/Shanghai",
  NEXT_PUBLIC_SOCIAL_GITHUB: "https://github.com/chuyuewei",
  NEXT_PUBLIC_SOCIAL_X: "https://x.com",
  NEXT_PUBLIC_SOCIAL_LINKEDIN: "https://linkedin.com",
  NEXT_PUBLIC_SOCIAL_DRIBBBLE: "https://dribbble.com",
} as const;

export type SiteDefaults = typeof siteDefaults;
