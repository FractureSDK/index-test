import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SplitText, Line, FadeUp } from "./Reveal";

const groups = [
  {
    title: "Frontend",
    icon: "◈",
    items: ["React / Next.js", "TypeScript", "Vue / Nuxt", "Tailwind CSS", "Vite", "Web Components"],
  },
  {
    title: "Motion & 3D",
    icon: "◉",
    items: ["Three.js / R3F", "GLSL Shaders", "GSAP / Framer Motion", "WebGPU", "Lottie", "Canvas 2D"],
  },
  {
    title: "Design",
    icon: "◇",
    items: ["Figma", "Blender", "Design Systems", "Typography", "Prototyping", "Art Direction"],
  },
  {
    title: "Backend & Ops",
    icon: "◆",
    items: ["Node.js", "PostgreSQL", "Edge Functions", "GraphQL", "Netlify / Vercel", "CI/CD"],
  },
];

const tools = ["React", "TypeScript", "Three.js", "GLSL", "GSAP", "Framer Motion", "Next.js", "Tailwind", "Blender", "Figma", "Node.js", "WebGPU", "Vite", "Lenis", "PostgreSQL", "Docker"];

export default function Skills() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);

  return (
    <section id="skills" ref={ref} className="relative overflow-hidden py-28 md:py-44">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-deep/10 blur-[160px]" />

      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="mb-10 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.3em] text-bone/40">
          <span className="text-accent">03</span>
          <span>Capabilities</span>
          <Line className="flex-1" />
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SplitText
              as="h2"
              text="技术栈是画笔，体验才是画作。"
              className="font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl"
            />
            <FadeUp delay={0.2} className="mt-8 max-w-md text-bone/60">
              从像素级 UI 到 GPU 级渲染，我跨越设计与工程的全链路——这让我能在原型阶段就预见性能边界，也能在代码里保留设计的温度。
            </FadeUp>
            <FadeUp delay={0.3} className="mt-10 flex flex-wrap gap-2">
              {tools.slice(0, 8).map((t) => (
                <span key={t} className="rounded-full border border-bone/15 px-3 py-1.5 font-mono text-[11px] text-bone/60 transition-colors hover:border-accent hover:text-accent">
                  {t}
                </span>
              ))}
            </FadeUp>
          </div>

          <div className="lg:col-span-7">
            <div className="flex flex-col" onMouseLeave={() => setActive(null)}>
              {groups.map((g, i) => (
                <FadeUp key={g.title} delay={i * 0.08}>
                  <div
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(active === i ? null : i)}
                    data-cursor="Expand"
                    className="group relative cursor-pointer border-t border-bone/10 py-6 md:py-8"
                  >
                    <motion.div
                      className="absolute inset-0 -mx-4 rounded-2xl bg-bone/[0.04]"
                      initial={false}
                      animate={{ opacity: active === i ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <span className="font-mono text-xs text-bone/30">0{i + 1}</span>
                        <h3 className="font-display text-2xl font-medium tracking-tight md:text-4xl">{g.title}</h3>
                      </div>
                      <motion.span
                        animate={{ rotate: active === i ? 45 : 0, color: active === i ? "#c8ff3d" : "#f4f1ea" }}
                        className="text-2xl md:text-3xl"
                      >
                        +
                      </motion.span>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{ height: active === i ? "auto" : 0, opacity: active === i ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="relative overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 pt-5 pl-9 md:pl-11">
                        {g.items.map((it, j) => (
                          <motion.span
                            key={it}
                            initial={{ opacity: 0, y: 8 }}
                            animate={active === i ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                            transition={{ delay: j * 0.04 }}
                            className="rounded-full bg-bone/[0.06] px-4 py-2 text-sm text-bone/80"
                          >
                            {it}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </FadeUp>
              ))}
              <div className="border-t border-bone/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Parallax tool rows */}
      <div className="mt-24 space-y-4 md:mt-36">
        <motion.div style={{ x: x1 }} className="flex w-max gap-4">
          {[...tools, ...tools].map((t, i) => (
            <span key={i} className="whitespace-nowrap rounded-full border border-bone/10 px-6 py-3 font-display text-lg text-bone/50 md:text-2xl">
              {t}
            </span>
          ))}
        </motion.div>
        <motion.div style={{ x: x2 }} className="flex w-max gap-4">
          {[...tools].reverse().concat([...tools].reverse()).map((t, i) => (
            <span key={i} className="whitespace-nowrap rounded-full bg-bone/[0.04] px-6 py-3 font-display text-lg text-bone/50 md:text-2xl">
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
