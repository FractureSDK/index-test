import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.role}`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#050507",
    theme_color: "#050507",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon", sizes: "512x512", type: "image/png" },
    ],
  };
}
