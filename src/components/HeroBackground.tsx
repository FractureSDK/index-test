"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MQ } from "@/config/breakpoints";
import { features } from "@/config/features";

const BlackHoleScene = dynamic(() => import("./BlackHoleScene"), { ssr: false });
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/**
 * The black hole (a per-pixel ray-marched shader, see BlackHoleScene.tsx)
 * is the heavier of the two scenes — desktop only, and only when
 * NEXT_PUBLIC_FEATURE_BLACKHOLE isn't disabled. Mobile/tablet, and any
 * deploy with the feature off, get the lighter wireframe model instead,
 * consistent with the project's "cut 3D complexity below the desktop
 * breakpoint" rule. (BlackHoleScene further tapers its own step count/
 * render resolution at the smaller end of "desktop" — see
 * src/config/breakpoints.ts's `desktopFull`.)
 */
export default function HeroBackground({ className = "" }: { className?: string }) {
  const isDesktop = useMediaQuery(MQ.desktopUp);

  if (!isDesktop || !features.blackHole) return <HeroScene className={className} />;

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
