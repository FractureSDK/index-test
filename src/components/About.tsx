"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SplitReveal, FadeUp, ImageReveal, DrawLine } from "./Reveal";
import { stats } from "@/content/stats";
import { site } from "@/config/site";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion) {
      el.textContent = String(value);
      return;
    }
    const counter = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        v: value,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: () => {
          el.textContent = String(Math.round(counter.v));
        },
      });
    }, el);
    return () => ctx.revert();
  }, [value, reducedMotion]);

  return (
    <span className="font-display text-display font-medium">
      <span ref={ref}>0</span>
      {suffix}
    </span>
  );
}

export default function About() {
  return (
    <section id="about" className="relative px-6 py-28 md:px-10 md:py-40">
      <div className="section-mask" />
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-bone/40 font-mono text-xs tracking-[0.3em] uppercase">01 / About</p>
          <h2 className="font-display text-display mt-6 leading-tight font-medium">
            <SplitReveal text={`我是 ${site.name}，一名专注于沉浸式`} />
            <br />
            <SplitReveal text="Web 体验的创意开发者。" />
          </h2>
          <FadeUp className="text-body-lg text-bone/55 mt-8 max-w-xl" delay={0.1}>
            六年多来专注于设计与工程的交界处——用代码实现设计的意图，也用设计的直觉约束代码的边界。相信最好的数字体验是感觉不到技术存在的体验。
          </FadeUp>

          <DrawLine className="my-12" />

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l}>
                <Counter value={s.v} suffix={s.s} />
                <p className="text-bone/40 mt-2 text-xs">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-5">
          <ImageReveal src="/images/portrait.jpg" alt={site.name} className="aspect-[4/5] w-full" />
          <FadeUp
            className="text-bone/40 mt-4 flex items-center justify-between font-mono text-xs"
            delay={0.2}
          >
            <span className="font-display text-bone text-sm font-semibold">{site.name}</span>
            <span>
              {site.location.city}, {site.location.country}
            </span>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
