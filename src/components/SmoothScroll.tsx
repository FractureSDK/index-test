"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Drives smooth scrolling for the whole app and keeps GSAP's ScrollTrigger
 * in sync with it. Two libraries independently listening to `scroll` is
 * the classic way to get janky, out-of-phase reveal animations — instead
 * we let Lenis own the raf loop (via `gsap.ticker`) and tell ScrollTrigger
 * to recompute on every Lenis frame.
 *
 * Reduced-motion: Lenis is never instantiated, so the browser's native
 * (instant) scroll takes over and ScrollTrigger still works off native
 * scroll events.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
