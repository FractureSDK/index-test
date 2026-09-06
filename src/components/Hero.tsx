"use client";

import dynamic from "next/dynamic";
import { site } from "@/config/site";
import { SplitReveal, FadeUp } from "./Reveal";
import Magnetic from "./Magnetic";

// Three.js touches window/WebGL — never render on the server, and don't
// block first paint of the (real, indexable) headline text on it.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-6 pt-28 pb-10 md:px-10"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
        <HeroScene />
      </div>

      <div className="text-bone/40 flex items-center justify-between font-mono text-[11px] tracking-[0.3em] uppercase">
        <p>Portfolio — {new Date().getFullYear()}</p>
        <p className="text-accent">● {site.availableForWork ? "Available for work" : "Currently booked"}</p>
      </div>

      <div>
        <h1 className="font-display text-hero font-medium tracking-tight">
          <SplitReveal as="span" text={site.name} className="block" />
        </h1>
        <FadeUp delay={0.3} className="text-body-lg text-bone/60 mt-6 max-w-xl">
          {site.tagline}
        </FadeUp>
        <FadeUp delay={0.45} className="mt-8">
          <Magnetic strength={0.5}>
            <a
              href="#work"
              data-cursor="Scroll"
              className="border-bone/20 hover:border-bone/50 inline-flex items-center gap-3 rounded-full border px-6 py-3 text-sm transition-colors"
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
