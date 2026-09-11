import type { Metadata, Viewport } from "next";
import { site } from "@/config/site";
import PwaRegister from "@/components/PwaRegister";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Preloader from "@/components/Preloader";
import ScrollProgress from "@/components/ScrollProgress";

// Self-hosted (via @fontsource) rather than next/font/google: no runtime
// or build-time dependency on fonts.googleapis.com, which matters here
// since that domain is blocked in mainland China — self-hosting also
// means one fewer third-party request on every page load either way.
// Swap for @fontsource/syne if you want something more editorial than
// Space Grotesk for the display face.
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description: site.description,
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
    url: "/",
    locale: "zh_CN",
    images: [{ url: "/images/portrait.jpg", width: 1200, height: 1200, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
    images: ["/images/portrait.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    url: site.url,
    image: `${site.url}/images/portrait.jpg`,
    sameAs: site.social.map((s) => s.href),
  };

  return (
    <html lang="zh-CN" className="h-full">
      <body className="bg-ink font-body text-bone min-h-full antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <PwaRegister />
        <Cursor />
        <ScrollProgress />
        <Preloader>
          <SmoothScroll>{children}</SmoothScroll>
        </Preloader>
      </body>
    </html>
  );
}
