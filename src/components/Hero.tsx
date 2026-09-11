"use client";

import { site } from "@/config/site";
import { SplitReveal, FadeUp } from "./Reveal";
import Magnetic from "./Magnetic";
import HeroBackground from "./HeroBackground";
import { useAppReady } from "@/hooks/useAppReady";

export default function Hero() {
  const ready = useAppReady();

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-6 pt-28 pb-10 md:px-10"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
        <HeroBackground />
      </div>

      <div className="text-bone/40 flex items-center justify-between font-mono text-[11px] tracking-[0.3em] uppercase">
        <p>Portfolio — {new Date().getFullYear()}</p>
        <p className="text-accent">● {site.availableForWork ? "Available for work" : "Currently booked"}</p>
      </div>

      <div>
        <h1 className="font-display text-hero font-medium tracking-tight">
          <SplitReveal as="span" text={site.name} className="block" play={ready} />
        </h1>
        <FadeUp delay={0.3} className="text-body-lg text-bone/60 mt-6 max-w-xl" play={ready}>
          {site.tagline}
        </FadeUp>
        <FadeUp delay={0.45} className="mt-8" play={ready}>
          <Magnetic strength={0.5}>
            <a
              href="#work"
              data-cursor="Scroll"
              className="border-bone/20 hover:border-bone/50 inline-flex items-center gap-3 rounded-full border px-6 py-3 text-sm transition-all hover:shadow-[0_0_30px_-6px_var(--color-accent)]"
            >
              查看作品 / View Work
            </a>
          </Magnetic>
        </FadeUp>
      </div>

      <div className="text-bone/30 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[11px] tracking-[0.2em] uppercase">
        {[
          "Creative Developer",
          "Interaction Design",
          "Three.js & GSAP",
          `Based in ${site.location.city}`,
        ].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </section>
  );
}
