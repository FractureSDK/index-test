"use client";

import { projects } from "@/content/projects";
import { SplitReveal, FadeUp, ImageReveal } from "./Reveal";
import Magnetic from "./Magnetic";

export default function Work() {
  return (
    <section id="work" className="relative px-6 py-28 md:px-10 md:py-40">
      <div className="section-mask" />
      <p className="text-bone/40 font-mono text-xs tracking-[0.3em] uppercase">02 / Selected Work</p>
      <h2 className="font-display text-display mt-6 font-medium">
        <SplitReveal text="精选项目" />
      </h2>

      <div className="mt-20 flex flex-col">
        {projects.map((p, i) => (
          <div key={p.n} className="group border-bone/10 border-t py-10 last:border-b md:py-14">
            <div className="grid items-center gap-8 md:grid-cols-12">
              <div className="md:col-span-1">
                <span className="text-bone/30 font-mono text-sm">{p.n}</span>
              </div>

              <FadeUp className="md:col-span-5" delay={0.05}>
                <Magnetic strength={0.15}>
                  <h3
                    className="font-display group-hover:text-accent text-3xl font-medium transition-all group-hover:drop-shadow-[0_0_16px_var(--color-accent)] md:text-4xl"
                    data-cursor="View"
                  >
                    {p.title}
                  </h3>
                </Magnetic>
                <p className="text-bone/45 mt-2 text-sm">
                  {p.tag} · {p.year}
                </p>
                <p className="text-bone/55 mt-4 max-w-md text-sm leading-relaxed">{p.desc}</p>
              </FadeUp>

              <div className="md:col-span-6">
                <ImageReveal
                  src={p.img}
                  alt={p.title}
                  eager={i === 0}
                  className="aspect-[4/3] w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
