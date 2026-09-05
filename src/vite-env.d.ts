/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
  readonly VITE_CONTACT_EMAIL: string;
  readonly VITE_LOCATION_CITY: string;
  readonly VITE_LOCATION_COUNTRY: string;
  readonly VITE_LOCATION_TIMEZONE: string;
  readonly VITE_LOCATION_LAT: string;
  readonly VITE_LOCATION_LNG: string;
  readonly VITE_SOCIAL_GITHUB: string;
  readonly VITE_SOCIAL_TWITTER: string;
  readonly VITE_SOCIAL_LINKEDIN: string;
  readonly VITE_SOCIAL_DRIBBBLE: string;
  readonly VITE_AVAILABLE_FOR_WORK: string;
  readonly VITE_PORTFOLIO_YEAR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
