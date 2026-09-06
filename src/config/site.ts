import { siteDefaults } from "./site.defaults";

export interface SocialLink {
  label: string;
  href: string;
}

export interface SiteLocation {
  city: string;
  country: string;
  /** IANA timezone, used to render the live clock in the nav bar. */
  timezone: string;
  lat: number;
  lng: number;
}

export interface SiteConfig {
  name: string;
  role: string;
  tagline: string;
  description: string;
  /** Canonical URL, used for metadata/OG/Twitter and the PWA manifest. */
  url: string;
  email: string;
  location: SiteLocation;
  availableForWork: boolean;
  acceptingFrom: string;
  social: SocialLink[];
}

const env = process.env;
const d = siteDefaults;

export const site: SiteConfig = {
  name: env.NEXT_PUBLIC_SITE_NAME ?? d.NEXT_PUBLIC_SITE_NAME,
  role: env.NEXT_PUBLIC_SITE_ROLE ?? d.NEXT_PUBLIC_SITE_ROLE,
  tagline: "创意开发者 / 数字工匠。在设计与代码的交汇处，构建令人沉浸的数字体验——让每一个像素都带着呼吸感。",
  description: env.NEXT_PUBLIC_SITE_DESCRIPTION ?? d.NEXT_PUBLIC_SITE_DESCRIPTION,
  url: env.NEXT_PUBLIC_SITE_URL ?? d.NEXT_PUBLIC_SITE_URL,
  email: env.NEXT_PUBLIC_CONTACT_EMAIL ?? d.NEXT_PUBLIC_CONTACT_EMAIL,
  location: {
    city: env.NEXT_PUBLIC_SITE_CITY ?? d.NEXT_PUBLIC_SITE_CITY,
    country: env.NEXT_PUBLIC_SITE_COUNTRY ?? d.NEXT_PUBLIC_SITE_COUNTRY,
    timezone: env.NEXT_PUBLIC_SITE_TIMEZONE ?? d.NEXT_PUBLIC_SITE_TIMEZONE,
    lat: 31.2304,
    lng: 121.4737,
  },
  availableForWork: true,
  acceptingFrom: "2026 Q3",
  social: [
    { label: "GitHub", href: env.NEXT_PUBLIC_SOCIAL_GITHUB ?? d.NEXT_PUBLIC_SOCIAL_GITHUB },
    { label: "Twitter / X", href: env.NEXT_PUBLIC_SOCIAL_X ?? d.NEXT_PUBLIC_SOCIAL_X },
    { label: "LinkedIn", href: env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? d.NEXT_PUBLIC_SOCIAL_LINKEDIN },
    { label: "Dribbble", href: env.NEXT_PUBLIC_SOCIAL_DRIBBBLE ?? d.NEXT_PUBLIC_SOCIAL_DRIBBBLE },
  ],
};
