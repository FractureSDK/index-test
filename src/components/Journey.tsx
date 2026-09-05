import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SplitText, Line, FadeUp } from "./Reveal";

const steps = [
  {
    year: "2024 — Now",
    role: "Lead Creative Developer",
    org: "Independent Studio",
    desc: "以独立工作室的形式与全球品牌合作，主导从概念到上线的沉浸式 Web 体验，专注 WebGL、动效系统与性能工程。",
  },
  {
    year: "2021 — 2024",
    role: "Senior Frontend Engineer",
    org: "Digital Agency · Shanghai",
    desc: "负责多个 Awwwards 级别项目的前端架构与交互实现，建立团队动效规范，将平均 LCP 优化 40%。",
  },
  {
    year: "2019 — 2021",
    role: "Frontend Developer",
    org: "Tech Startup",
    desc: "从 0 到 1 搭建产品前端与设计系统，深度参与产品设计决策，理解商业与体验的平衡艺术。",
  },
  {
    year: "2015 — 2019",
    role: "B.Eng. Digital Media Technology",
    org: "University",
    desc: "系统学习计算机图形学、交互设计与视觉传达，在毕业设计中首次尝试将 Shader 艺术带入 Web。",
  },
];

export default function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const h = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="journey" className="relative py-28 md:py-44">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="mb-10 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.3em] text-bone/40">
          <span className="text-accent">04</span>
          <span>Journey</span>
          <Line className="flex-1" />
        </div>

        <div className="mb-20 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SplitText
            as="h2"
            text="一路走来"
            className="font-display text-6xl font-semibold tracking-tight md:text-8xl"
          />
          <FadeUp className="max-w-sm text-bone/60 md:pb-3">
            每一段经历都在打磨同一件事：如何让技术更有温度。
          </FadeUp>
        </div>

        <div ref={ref} className="relative">
          <div className="absolute left-[7px] top-0 h-full w-px bg-bone/10 md:left-1/2" />
          <motion.div style={{ height: h }} className="absolute left-[7px] top-0 w-px bg-accent md:left-1/2" />

          <div className="flex flex-col gap-16 md:gap-24">
            {steps.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <div key={s.year} className={`relative grid gap-6 pl-10 md:grid-cols-2 md:gap-20 md:pl-0`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-20% 0px" }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="absolute left-0 top-2 flex h-[15px] w-[15px] items-center justify-center md:left-1/2 md:-translate-x-1/2"
                  >
                    <span className="absolute h-full w-full rounded-full bg-accent/40 animate-pulse-ring" />
                    <span className="h-[15px] w-[15px] rounded-full border-[3px] border-ink bg-accent" />
                  </motion.div>

                  <FadeUp className={`${left ? "md:order-1 md:text-right" : "md:order-2"}`}>
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{s.year}</p>
                    <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-4xl">{s.role}</h3>
                    <p className="mt-1 text-bone/50">{s.org}</p>
                  </FadeUp>
                  <FadeUp delay={0.15} className={`${left ? "md:order-2" : "md:order-1 md:text-right"}`}>
                    <p className="max-w-md leading-relaxed text-bone/65 md:inline-block">{s.desc}</p>
                  </FadeUp>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
