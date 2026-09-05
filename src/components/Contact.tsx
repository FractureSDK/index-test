import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SplitText, Line, FadeUp } from "./Reveal";
import Magnetic from "./Magnetic";
import { siteConfig } from "@/config/site";
import { lazy, Suspense } from "react";

const CosmicCanvas = lazy(() => import("./CosmicCanvas"));

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <section id="contact" ref={ref} className="relative overflow-hidden pt-28 md:pt-44">
      <div className="absolute inset-0 opacity-60">
        <Suspense fallback={null}>
          <CosmicCanvas />
        </Suspense>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/60 to-ink" />

      <div className="relative mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="mb-14 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.3em] text-bone/40">
          <span className="text-accent">05</span>
          <span>Contact</span>
          <Line className="flex-1" />
        </div>

        <motion.div style={{ y, scale }} className="flex flex-col items-start">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-bone/50">有想法？</p>
          <h2 className="font-display font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-[clamp(3rem,11vw,11rem)]">
            <SplitText text="Let's build" stagger={0.08} />
            <br />
            <SplitText text="something" stagger={0.08} delay={0.15} className="text-stroke" />
            <br />
            <span className="inline-flex flex-wrap items-center gap-4 md:gap-8">
              <SplitText text="epic." stagger={0.08} delay={0.3} className="shimmer-text" />
              <Magnetic strength={0.5}>
                <a
                  href={`mailto:${siteConfig.email}`}
                  data-cursor="Email"
                  className="group relative flex h-[0.9em] w-[0.9em] items-center justify-center rounded-full bg-accent text-ink"
                >
                  <span className="absolute inset-0 rounded-full bg-accent/50 animate-pulse-ring" />
                  <svg className="relative h-[0.35em] w-[0.35em] transition-transform duration-500 group-hover:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </Magnetic>
            </span>
          </h2>
        </motion.div>

        <div className="mt-20 grid gap-10 border-t border-bone/10 pt-12 md:grid-cols-12 md:gap-6">
          <FadeUp className="md:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">Email</p>
            <a href={`mailto:${siteConfig.email}`} className="group mt-3 inline-block font-display text-2xl font-medium md:text-4xl">
              <span className="relative">
                {siteConfig.email}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
              </span>
            </a>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-bone/50">
              目前接受 2026 Q3 起的新项目合作。无论是品牌官网、产品体验，还是一次纯粹的实验，都欢迎聊聊。
            </p>
          </FadeUp>

          <FadeUp delay={0.1} className="md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">Socials</p>
            <ul className="mt-3 flex flex-col gap-2">
              {siteConfig.socials.map((s) => (
                <li key={s.platform}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-bone/70 transition-colors hover:text-bone">
                    <span className="h-px w-0 bg-accent transition-all duration-300 group-hover:w-4" />
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          </FadeUp>

          <FadeUp delay={0.2} className="md:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">Location</p>
            <p className="mt-3 text-bone/70">{siteConfig.city}, {siteConfig.country}</p>
            <p className="text-bone/50">{siteConfig.coordinates.lat}° N, {siteConfig.coordinates.lng}° E</p>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">Status</p>
            <p className="mt-3 inline-flex items-center gap-2 text-bone/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {siteConfig.availableForWork ? "Open to opportunities" : "Currently unavailable"}
            </p>
          </FadeUp>
        </div>

        <footer className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-bone/10 py-8 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/40 md:flex-row md:items-center">
          <span>© {siteConfig.portfolioYear} {siteConfig.name}. All rights reserved.</span>
          <span className="hidden md:inline">Designed & built with obsession</span>
          <a href="#top" className="group inline-flex items-center gap-2 transition-colors hover:text-bone">
            Back to top
            <span className="inline-block transition-transform duration-500 group-hover:-translate-y-1">↑</span>
          </a>
        </footer>
      </div>
    </section>
  );
}
