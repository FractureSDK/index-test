"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MQ } from "@/config/breakpoints";
import { features } from "@/config/features";

/**
 * Desktop-only custom cursor. Disabled entirely (never mounts its DOM,
 * never attaches listeners) when:
 *  - NEXT_PUBLIC_FEATURE_CURSOR is off,
 *  - the device doesn't have a fine pointer (touch/stylus),
 *  - the viewport is below the tablet breakpoint — per spec, mobile keeps
 *    the native cursor even on the rare fine-pointer phone,
 *  - the user prefers reduced motion.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useMediaQuery(MQ.pointerFine);
  const wideViewport = useMediaQuery(MQ.tabletUp);
  const active = features.customCursor && finePointer && wideViewport && !reducedMotion;

  useEffect(() => {
    if (!active) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const dotX = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>("[data-cursor]");
      setLabel(el?.dataset.cursor || (el ? "" : null));
      gsap.to(ring, {
        scale: el ? 2.2 : 1,
        duration: 0.35,
        ease: "power3.out",
      });
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference" aria-hidden>
      <div
        ref={ringRef}
        className="border-bone/70 absolute top-0 left-0 -mt-4 -ml-4 flex h-8 w-8 items-center justify-center rounded-full border"
      >
        {label && <span className="text-bone text-[9px] font-medium tracking-wide uppercase">{label}</span>}
      </div>
      <div
        ref={dotRef}
        className="bg-bone absolute top-0 left-0 -mt-[3px] -ml-[3px] h-1.5 w-1.5 rounded-full"
      />
    </div>
  );
}
