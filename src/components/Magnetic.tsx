"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function Magnetic({
  children,
  strength = 0.4,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const supported =
      window.matchMedia("(pointer: fine)").matches && window.matchMedia("(min-width: 768px)").matches;
    if (reducedMotion || !supported) return;

    const x = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      x(relX * strength);
      y(relY * strength);
    };
    const leave = () => {
      x(0);
      y(0);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [reducedMotion, strength]);

  return (
    <div ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </div>
  );
}
