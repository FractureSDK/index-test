"use client";

import { journeySteps } from "@/content/journey";
import { SplitReveal, FadeUp } from "./Reveal";

export default function Journey() {
  return (
    <section id="journey" className="relative px-6 py-28 md:px-10 md:py-40">
      <div className="section-mask" />
      <p className="text-bone/40 font-mono text-xs tracking-[0.3em] uppercase">04 / Journey</p>
      <h2 className="font-display text-display mt-6 font-medium">
        <SplitReveal text="成长轨迹" />
      </h2>

      <div className="border-bone/10 relative mt-16 border-l pl-8 md:pl-12">
        {journeySteps.map((s, i) => (
          <FadeUp key={s.year} delay={i * 0.05} className="relative pb-14 last:pb-0">
            <span className="bg-accent absolute top-1.5 -left-[calc(2rem+4px)] h-2 w-2 rounded-full md:-left-[calc(3rem+4px)]" />
            <p className="text-bone/40 font-mono text-xs tracking-[0.2em] uppercase">{s.year}</p>
            <h3 className="font-display mt-2 text-2xl font-medium md:text-3xl">{s.role}</h3>
            <p className="text-bone/45 mt-1 text-sm">{s.org}</p>
            <p className="text-bone/55 mt-3 max-w-xl text-sm leading-relaxed">{s.desc}</p>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
