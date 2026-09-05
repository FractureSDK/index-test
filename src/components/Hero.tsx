import { lazy, Suspense, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import Magnetic from "./Magnetic";

const CosmicCanvas = lazy(() => import("./CosmicCanvas"));

const ease = [0.16, 1, 0.3, 1] as const;

function BigWord({ text, delay, start, className = "" }: { text: string; delay: number; start: boolean; className?: string }) {
  return (
    <span className={`block overflow-hidden leading-[0.86] ${className}`}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          initial={{ y: "115%", rotate: 6 }}
          animate={start ? { y: "0%", rotate: 0 } : {}}
          transition={{ duration: 1.1, ease, delay: delay + i * 0.035 }}
          className="inline-block origin-bottom-left will-change-transform"
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero({ start }: { start: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 80, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 80, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const d = 0.3;

  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={onMove}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <CosmicCanvas planet />
        </Suspense>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,7,0.55)_70%,#050507_100%)]" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

      {/* Floating orbs */}
      <motion.div
        style={{ rotateX: rx, rotateY: ry }}
        className="pointer-events-none absolute right-[8%] top-[18%] hidden md:block"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={start ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: d + 1.2, duration: 1.4, ease }}
          className="relative h-56 w-56 lg:h-80 lg:w-80"
        >
          <div className="absolute inset-0 rounded-full border border-bone/10" />
          <div className="absolute inset-6 rounded-full border border-dashed border-bone/15 animate-spin-slow" />
          <div className="absolute inset-14 rounded-full bg-[radial-gradient(circle_at_30%_30%,#8b6cff,#2a1a6b_60%,transparent_75%)] blur-[2px] animate-float" />
          <div className="absolute inset-0 rounded-full bg-violet-deep/20 blur-3xl" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="absolute inset-0"
          >
            <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_20px_#c8ff3d]" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Top-left meta */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={start ? { opacity: 1 } : {}}
        transition={{ delay: d + 1, duration: 1 }}
        className="absolute left-5 top-28 font-mono text-[11px] uppercase tracking-[0.3em] text-bone/40 md:left-10 md:top-36"
      >
        <p>Portfolio — 2026</p>
        <p className="mt-1 text-accent">● Available for work</p>
      </motion.div>

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 mx-auto w-full max-w-[1600px] px-5 pb-10 md:px-10 md:pb-16"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="font-display font-semibold uppercase tracking-[-0.04em] text-[clamp(3.4rem,13vw,13.5rem)]">
            <BigWord text="Chu" delay={d} start={start} />
            <BigWord text="Yuewei" delay={d + 0.15} start={start} className="text-stroke" />
          </h1>

          <div className="flex max-w-md flex-col gap-6 lg:pb-6">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={start ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: d + 0.9, duration: 1, ease }}
              className="text-base leading-relaxed text-bone/70 md:text-lg"
            >
              创意开发者 / 数字工匠。在设计与代码的交汇处，构建令人沉浸的数字体验——让每一个像素都带着呼吸感。
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={start ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: d + 1.05, duration: 1, ease }}
              className="flex flex-wrap items-center gap-4"
            >
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
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={start ? { scaleX: 1 } : {}}
          transition={{ delay: d + 1.2, duration: 1.6, ease }}
          className="mt-10 h-px w-full origin-left bg-bone/15 md:mt-14"
        />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/40">
          {["Creative Developer", "Interaction Design", "WebGL & Motion", "Based in Shanghai"].map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, y: 10 }}
              animate={start ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: d + 1.4 + i * 0.1, duration: 0.8 }}
              className={i > 1 ? "hidden md:inline" : ""}
            >
              {t}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0 }}
            animate={start ? { opacity: 1 } : {}}
            transition={{ delay: d + 1.9 }}
            className="flex items-center gap-2"
          >
            Scroll
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="inline-block"
            >
              ↓
            </motion.span>
          </motion.span>
        </div>
      </motion.div>
    </section>
  );
}
