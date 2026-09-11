"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const BlackHoleScene = dynamic(() => import("./BlackHoleScene"), { ssr: false });
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/**
 * The black hole is the heavier of the two scenes (9k-particle disk,
 * continuous per-frame position updates) — desktop only. Mobile/tablet
 * keep the lighter wireframe model, consistent with the project's existing
 * "cut 3D complexity below the desktop breakpoint" rule.
 */
export default function HeroBackground({ className = "" }: { className?: string }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return isDesktop ? <BlackHoleScene className={className} /> : <HeroScene className={className} />;
}
