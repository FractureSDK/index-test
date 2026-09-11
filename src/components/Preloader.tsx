"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { AppReadyContext } from "@/hooks/useAppReady";
import { site } from "@/config/site";

/**
 * Full-screen loader shown once on initial page load: a counting
 * percentage plus a thin progress line, then a curtain-wipe exit that
 * reveals the page underneath. Provides `AppReadyContext` so the Hero can
 * time its own entrance to start exactly as the curtain lifts, instead of
 * animating in (unseen) underneath the overlay.
 *
 * The count is decorative (fixed ~1.8s ease) but the exit won't fire until
 * `document.readyState === "complete"` too, so slow connections don't get
 * dumped into a half-loaded page — capped at 4s so a stalled load event
 * can't hang the loader forever.
 *
 * Reduced motion: never renders, marks the app ready immediately.
 */
export default function Preloader({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [readyState, setReadyState] = useState(false);
  const [mountedState, setMountedState] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Derived rather than set-in-effect: reduced motion is known synchronously
  // (usePrefersReducedMotion is itself useSyncExternalStore-backed), so it
  // can just short-circuit these at render time instead of the effect
  // needing to call setState to react to it.
  const ready = reducedMotion || readyState;
  const mounted = !reducedMotion && mountedState;

  useEffect(() => {
    if (reducedMotion) return;

    document.body.style.overflow = "hidden";
    const counter = { v: 0 };

    const countDone = new Promise<void>((resolve) => {
      gsap.to(counter, {
        v: 100,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => setProgress(Math.round(counter.v)),
        onComplete: () => resolve(),
      });
    });

    const pageDone =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener("load", () => resolve(), { once: true });
            setTimeout(resolve, 4000);
          });

    Promise.all([countDone, pageDone]).then(() => {
      gsap.delayedCall(0.25, playExit);
    });

    function playExit() {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setMountedState(false);
        },
      });
      tl.to([counterRef.current, barRef.current], {
        opacity: 0,
        y: -16,
        duration: 0.4,
        ease: "power2.in",
        stagger: 0.05,
      })
        .call(() => setReadyState(true))
        .to(overlayRef.current, { yPercent: -100, duration: 1, ease: "power4.inOut" }, "+=0.05");
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [reducedMotion]);

  return (
    <AppReadyContext.Provider value={ready}>
      {mounted && (
        <div
          ref={overlayRef}
          className="bg-ink fixed inset-0 z-[999] flex flex-col justify-between px-6 py-6 md:px-10 md:py-10"
          aria-hidden
        >
          <div className="text-bone/40 flex items-center justify-between font-mono text-[11px] tracking-[0.3em] uppercase">
            <span>{site.name}</span>
            <span>Loading</span>
          </div>

          <div
            ref={counterRef}
            className="font-display text-[20vw] leading-none font-medium tracking-tight md:text-[14vw]"
          >
            {progress}
            <span className="text-accent">%</span>
          </div>

          <div ref={barRef} className="bg-bone/10 h-px w-full">
            <div
              className="bg-accent h-full transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {children}
    </AppReadyContext.Provider>
  );
}
