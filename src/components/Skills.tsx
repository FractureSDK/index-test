import { useRef, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { SplitText, Line, FadeUp } from "./Reveal";
import { skillGroups, tools } from "@/content/skills";
import CosmicParticles from "./CosmicParticles";
import CosmicVortex from "./CosmicVortex";
import { Canvas } from "@react-three/fiber";

const CosmicVortex3D = lazy(() => import("./CosmicVortex"));
const CosmicParticles3D = lazy(() => import("./CosmicParticles"));

export default function Skills() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="skills" ref={ref} className="relative overflow-hidden py-28 md:py-44">
      {/* Three.js cosmic particle background */}
      <Suspense fallback={null}>
        <CosmicParticles3D density="medium" />
      </Suspense>
      
      {/* Central cosmic vortex for visual impact */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Suspense fallback={null}>
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-40">
            <Canvas
              camera={{ position: [0, 0, 60], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 2]}
            >
              <CosmicVortex3D particleCount={1200} radius={40} speed={0.2} color="#c8ff3d" />
            </Canvas>
          </div>
        </Suspense>
      </div>
      
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
              {skillGroups.map((g, i) => (
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

      {/* Cosmic tool rings - replacing parallax rows with 3D-inspired floating elements */}
      <div className="mt-24 flex items-center justify-center md:mt-36">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          className="relative h-64 w-64 md:h-96 md:w-96"
        >
          <div className="absolute inset-0 rounded-full border border-dashed border-bone/10" />
          <div className="absolute inset-8 rounded-full border border-bone/15" />
          
          {/* Orbiting tool badges */}
          {tools.slice(0, 6).map((tool, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 45; // percentage
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            return (
              <motion.div
                key={tool}
                animate={{ 
                  x: [`${x}%`, `${50 + (radius + 5) * Math.cos(angle + 0.3)}%`, `${x}%`],
                  y: [`${y}%`, `${50 + (radius + 5) * Math.sin(angle + 0.3)}%`, `${y}%`],
                }}
                transition={{ 
                  duration: 8 + i * 2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 0.5 
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span className="whitespace-nowrap rounded-full bg-bone/[0.06] px-4 py-2 text-sm font-medium text-bone/70 backdrop-blur-sm">
                  {tool}
                </span>
              </motion.div>
            );
          })}
          
          {/* Center glow */}
          <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-xl" />
        </motion.div>
      </div>
    </section>
  );
}
