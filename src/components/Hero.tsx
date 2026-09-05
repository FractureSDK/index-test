import { lazy, Suspense, useRef } from "react";
import Magnetic from "./Magnetic";

const EpicHeroScene = lazy(() => import("./EpicHeroScene"));

export default function Hero({ start }: { start: boolean }) {
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      {/* Epic Three.js cosmic scene */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <EpicHeroScene />
        </Suspense>
      </div>
      
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,7,0.4)_70%,#050507_100%)]" />

      {/* Content overlay */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 pb-10 md:px-10 md:pb-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="font-display font-semibold uppercase tracking-[-0.04em] text-[clamp(3.4rem,13vw,13.5rem)]">
            <span className="block overflow-hidden leading-[0.86]">
              {start && (
                <span className="inline-block animate-fade-up origin-bottom-left">Chu</span>
              )}
            </span>
            <span className="block overflow-hidden leading-[0.86]">
              {start && (
                <span className="inline-block animate-fade-up origin-bottom-left text-stroke" style={{ animationDelay: "0.15s" }}>Yuewei</span>
              )}
            </span>
          </h1>

          <div className="flex max-w-md flex-col gap-6 lg:pb-6">
            <p className={`text-base leading-relaxed text-bone/70 md:text-lg transition-opacity duration-1000 ${start ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "0.9s" }}>
              创意开发者 / 数字工匠。在设计与代码的交汇处，构建令人沉浸的数字体验——让每一个像素都带着呼吸感。
            </p>
            <div className={`flex flex-wrap items-center gap-4 transition-opacity duration-1000 ${start ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "1.05s" }}>
              <Magnetic>
                <a
                  href="#work"
                  data-cursor="View"
                  className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full bg-accent px-7 font-medium text-ink"
                >
                  <span className="absolute inset-0 translate-y-full bg-bone transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0" />
                  <span className="relative">查看作品</span>
                  <svg className="relative h-4 w-4 transition-transform duration-500 group-hover:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href="#about"
                  className="group inline-flex h-14 items-center gap-3 rounded-full border border-bone/20 px-7 font-medium text-bone transition-colors hover:border-bone/60"
                >
                  关于我
                  <span className="h-1.5 w-1.5 rounded-full bg-bone/50 transition-all group-hover:w-6 group-hover:bg-accent" />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        <div className={`mt-10 h-px w-full origin-left bg-bone/15 transition-transform duration-1000 md:mt-14 ${start ? "scale-x-100" : "scale-x-0"}`} style={{ transitionDelay: "1.2s" }} />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/40">
          {["Creative Developer", "Interaction Design", "WebGL & Motion", "Based in Shanghai"].map((t, i) => (
            <span
              key={t}
              className={`transition-opacity duration-800 ${start ? "opacity-100" : "opacity-0"} ${i > 1 ? "hidden md:inline" : ""}`}
              style={{ transitionDelay: `${1.4 + i * 0.1}s` }}
            >
              {t}
            </span>
          ))}
          <span className={`flex items-center gap-2 transition-opacity duration-800 ${start ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "1.9s" }}>
            Scroll
            <span className="inline-block animate-bounce-slow">↓</span>
          </span>
        </div>
      </div>
    </section>
  );
}
