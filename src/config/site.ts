/**
 * Site configuration - single source of truth for identity & contact info.
 * Values can be overridden via environment variables (see .env.example).
 */

export interface SocialLink {
  platform: string;
  url: string;
  label?: string;
}

export interface SiteConfig {
  // Identity
  name: string;
  title: string;
  description: string;
  url: string;
  email: string;

  // Location
  city: string;
  country: string;
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };

  // Social links
  socials: SocialLink[];

  // Meta
  availableForWork: boolean;
  portfolioYear: number;
}

// Default configuration
const defaultConfig: SiteConfig = {
  name: "Chu Yuewei",
  title: "Creative Developer",
  description: "创意开发者 / 数字工匠。在设计与代码的交汇处，构建令人沉浸的数字体验——让每一个像素都带着呼吸感。",
  url: import.meta.env.VITE_SITE_URL || "https://chuyuewei.com/",
  email: import.meta.env.VITE_CONTACT_EMAIL || "hello@chuyuewei.com",
  city: import.meta.env.VITE_LOCATION_CITY || "Shanghai",
  country: import.meta.env.VITE_LOCATION_COUNTRY || "China",
  timezone: import.meta.env.VITE_LOCATION_TIMEZONE || "Asia/Shanghai",
  coordinates: {
    lat: parseFloat(import.meta.env.VITE_LOCATION_LAT || "31.2304"),
    lng: parseFloat(import.meta.env.VITE_LOCATION_LNG || "121.4737"),
  },
  socials: [
    {
      platform: "GitHub",
      url: import.meta.env.VITE_SOCIAL_GITHUB || "https://github.com/chuyuewei",
    },
    {
      platform: "Twitter / X",
      url: import.meta.env.VITE_SOCIAL_TWITTER || "https://x.com",
    },
    {
      platform: "LinkedIn",
      url: import.meta.env.VITE_SOCIAL_LINKEDIN || "https://linkedin.com",
    },
    {
      platform: "Dribbble",
      url: import.meta.env.VITE_SOCIAL_DRIBBBLE || "https://dribbble.com",
    },
  ],
  availableForWork: import.meta.env.VITE_AVAILABLE_FOR_WORK !== "false",
  portfolioYear: parseInt(import.meta.env.VITE_PORTFOLIO_YEAR || "2026", 10),
};

export const siteConfig: SiteConfig = defaultConfig;

// Export individual values for convenience
export const {
  name,
  title,
  description,
  url,
  email,
  city,
  country,
  timezone,
  coordinates,
  socials,
  availableForWork,
  portfolioYear,
} = siteConfig;
