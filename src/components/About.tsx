import { useRef } from "react";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { SplitText, FadeUp, Line } from "./Reveal";
import { stats as statsData } from "@/content/stats";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mv = useMotionValue(0);
  const sp = useSpring(mv, { stiffness: 50, damping: 20 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, mv, to]);
  useEffect(() => sp.on("change", (v) => setVal(Math.round(v))), [sp]);
  return (
    <span ref={ref} className="tabular-nums">
      {val}
      {suffix}
    </span>
  );
}

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const rot = useTransform(scrollYProgress, [0, 1], [-4, 4]);
  const yBig = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section id="about" ref={ref} className="relative overflow-hidden py-28 md:py-44">
      <motion.span
        style={{ y: yBig }}
        className="pointer-events-none absolute -right-8 top-10 select-none font-display text-[26vw] font-bold leading-none text-bone/[0.03]"
      >
        ABOUT
      </motion.span>

      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="mb-14 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.3em] text-bone/40">
          <span className="text-accent">01</span>
          <span>About Me</span>
          <Line className="flex-1" />
        </div>

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <SplitText
              as="h2"
              text="我相信最好的界面，是那些让人忘记自己正在使用界面的作品。"
              className="font-display text-3xl font-medium leading-[1.15] tracking-tight md:text-5xl lg:text-6xl"
            />
            <FadeUp delay={0.3} className="mt-10 grid gap-8 md:grid-cols-2">
              <p className="text-base leading-relaxed text-bone/65 md:text-lg">
                我是 <span className="text-bone">chuyuewei</span>，一名专注于沉浸式 Web 体验的创意开发者。
                过去六年，我游走于品牌、产品与技术之间，用 WebGL、动效与精密的交互逻辑，把抽象的概念雕琢成可触摸的数字物件。
              </p>
              <p className="text-base leading-relaxed text-bone/65 md:text-lg">
                我痴迷于细节——60fps 的流畅、贝塞尔曲线的微妙、留白的呼吸感。
                我相信技术是手段，情感才是目的。每一个项目都是一次讲故事的机会。
              </p>
            </FadeUp>

            <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-bone/10 bg-bone/10 md:grid-cols-4">
              {statsData.map((s, i) => (
                <FadeUp key={s.l} delay={0.1 * i} className="bg-ink p-6 md:p-8">
                  <div className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
                    <Counter to={s.v} suffix={s.s} />
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">{s.l}</div>
                </FadeUp>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <motion.div style={{ y: yImg, rotate: rot }} className="relative mx-auto max-w-sm lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-bone/10">
                <img
                  src="/images/portrait.jpg"
                  alt="Chu Yuewei"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div>
                    <p className="font-display text-xl font-semibold">Chu Yuewei</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone/60">Creative Developer</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-bone/30 glass">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="absolute -left-8 -top-8 hidden h-28 w-28 md:block"
              >
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <defs>
                    <path id="circ" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                  </defs>
                  <text className="fill-bone/60 font-mono text-[9px] uppercase tracking-[0.35em]">
                    <textPath href="#circ">Design · Code · Motion · Craft · </textPath>
                  </text>
                </svg>
              </motion.div>
              <div className="absolute -bottom-6 -right-4 rounded-2xl px-5 py-4 glass md:-right-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">Currently</p>
                <p className="mt-1 text-sm font-medium">Exploring generative art & R3F</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
