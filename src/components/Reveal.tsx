"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Splits `text` into words, each clipped by an overflow-hidden wrapper, and
 * animates them up into place with a stagger when the element scrolls into
 * view. This is the "逐字/逐行浮现" headline treatment.
 *
 * Reduced motion: renders the plain text with no wrappers, no animation.
 */
export function SplitReveal({
  text,
  as: Tag = "span",
  className = "",
  stagger = 0.035,
  start = "top 85%",
}: {
  text: string;
  as?: ElementType;
  className?: string;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>("[data-word-inner]");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger,
          scrollTrigger: { trigger: el, start },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [reducedMotion, stagger, start]);

  if (reducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag ref={ref} className={className}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span data-word-inner className="inline-block will-change-transform">
            {word}
            {i < text.split(" ").length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Simple fade + rise on scroll-into-view, for non-headline content. */
export function FadeUp({
  children,
  className = "",
  delay = 0,
  y = 32,
  start = "top 88%",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        { opacity: 1, y: 0, duration: 0.9, delay, ease: "power3.out", scrollTrigger: { trigger: el, start } }
      );
    }, el);
    return () => ctx.revert();
  }, [reducedMotion, delay, y, start]);

  return (
    <div ref={ref} className={className} style={reducedMotion ? undefined : { opacity: 0 }}>
      {children}
    </div>
  );
}

/** A line that draws itself left-to-right on scroll-into-view. */
export function DrawLine({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: "power3.out",
          transformOrigin: "left",
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [reducedMotion]);

  return <div ref={ref} className={`bg-bone/15 h-px w-full ${className}`} />;
}

/**
 * Image reveal: a clip-path mask that wipes open on scroll-into-view,
 * paired with a slight parallax on the image itself. Reduced motion just
 * shows the finished state immediately.
 */
export function ImageReveal({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrap,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1.1,
          ease: "power4.inOut",
          scrollTrigger: { trigger: wrap, start: "top 85%" },
        }
      );
      gsap.fromTo(
        img,
        { yPercent: -12, scale: 1.15 },
        {
          yPercent: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: 0.6 },
        }
      );
    }, wrap);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full scale-110 object-cover"
      />
    </div>
  );
}
