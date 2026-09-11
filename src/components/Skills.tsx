"use client";

import { skillGroups, tools } from "@/content/skills";
import { SplitReveal, FadeUp } from "./Reveal";

export default function Skills() {
  return (
    <section id="skills" className="relative px-6 py-28 md:px-10 md:py-40">
      <div className="section-mask" />
      <p className="text-bone/40 font-mono text-xs tracking-[0.3em] uppercase">03 / Skills</p>
      <h2 className="font-display text-display mt-6 font-medium">
        <SplitReveal text="能力矩阵" />
      </h2>

      <div className="bg-bone/10 mt-16 grid gap-px overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4">
        {skillGroups.map((g, i) => (
          <FadeUp key={g.title} delay={i * 0.06} className="bg-ink p-8">
            <span className="text-accent text-2xl">{g.icon}</span>
            <h3 className="font-display mt-4 text-lg font-medium">{g.title}</h3>
            <ul className="text-bone/55 mt-4 space-y-2 text-sm">
              {g.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </FadeUp>
        ))}
      </div>

      <div className="border-bone/10 mt-16 overflow-hidden border-y py-6">
        <div className="marquee font-display text-bone/20 flex w-max gap-10 text-3xl hover:[animation-play-state:paused] md:text-5xl">
          {[...tools, ...tools].map((t, i) => (
            <span key={i} className="whitespace-nowrap">
              {t} <span className="text-accent">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
