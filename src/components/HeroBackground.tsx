"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const BlackHoleScene = dynamic(() => import("./BlackHoleScene"), { ssr: false });
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/**
 * The black hole is the heavier of the two scenes (13k-particle disk +
 * bloom post-processing, continuous per-frame position/color updates) —
 * desktop only. Mobile/tablet keep the lighter wireframe model, consistent
 * with the project's existing "cut 3D complexity below the desktop
 * breakpoint" rule. (BlackHoleScene further tapers its own particle count
 * at the 1024–1279px end of "desktop".)
 */
export default function HeroBackground({ className = "" }: { className?: string }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (!isDesktop) return <HeroScene className={className} />;

  return (
    <div className={`relative h-full w-full ${className}`}>
      <BlackHoleScene />
      {/* Cheap stand-in for a shader VignettePass — darkens the edges so
          the eye settles on the black hole rather than the canvas bounds. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, var(--color-ink) 100%)" }}
      />
    </div>
  );
}
