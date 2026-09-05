import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { SplitText, Line, FadeUp } from "./Reveal";

const projects = [
  {
    n: "01",
    title: "Liquid Chrome",
    tag: "WebGL · Brand Experience",
    year: "2025",
    desc: "为一家新锐科技品牌打造的沉浸式官网。基于自定义 GLSL 着色器的流体金属材质，随鼠标实时形变，配合音频响应式动效。",
    img: "/images/p1.jpg",
    color: "#6d4bff",
  },
  {
    n: "02",
    title: "Nova Finance",
    tag: "Product Design · React",
    year: "2024",
    desc: "面向下一代投资者的金融看板。实时数据可视化、微交互驱动的信息层级，把复杂决策变得轻盈直观。",
    img: "/images/p2.jpg",
    color: "#c8ff3d",
  },
  {
    n: "03",
    title: "Particle Symphony",
    tag: "Generative Art · Three.js",
    year: "2024",
    desc: "一场由 200 万粒子组成的实时视觉交响。GPU 计算驱动的粒子系统，在浏览器中演绎数据与音乐的共舞。",
    img: "/images/p3.jpg",
    color: "#ff6b9d",
  },
  {
    n: "04",
    title: "Maison Éditorial",
    tag: "E-Commerce · Motion",
    year: "2023",
    desc: "高定时装品牌的数字旗舰店。以杂志般的编排节奏、页面转场与滚动叙事，重塑奢侈品线上购物的仪式感。",
    img: "/images/p4.jpg",
    color: "#f4f1ea",
  },
];

function Card({ p, i, total, progress }: { p: (typeof projects)[0]; i: number; total: number; progress: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const start = i / total;
  const end = (i + 1) / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i) * 0.04]);
  const brightness = useTransform(progress, [end, 1], [1, 0.5]);
  const filter = useTransform(brightness, (b) => `brightness(${b})`);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 20 });
  const glowX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);
  const glow = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(600px circle at ${x} ${y}, ${p.color}22, transparent 45%)`
  );

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div className="sticky top-0 flex h-[100svh] items-center justify-center px-4 md:px-10" style={{ top: `${i * 10 + 60}px` }}>
      <motion.div
        ref={ref}
        style={{ scale, filter, rotateX: rx, rotateY: ry, transformPerspective: 1400 }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        data-cursor="Open"
        className="group relative grid w-full max-w-[1400px] overflow-hidden rounded-3xl border border-bone/10 bg-[#0c0c12] md:grid-cols-2"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: glow }}
        />
        <div className="relative flex flex-col justify-between p-7 md:p-12 lg:p-16">
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-bone/40">
            <span>
              <span style={{ color: p.color }}>{p.n}</span> / 0{total}
            </span>
            <span>{p.year}</span>
          </div>
          <div className="my-10 md:my-0">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: p.color }}>
              {p.tag}
            </p>
            <h3 className="font-display text-4xl font-semibold tracking-tight md:text-5xl lg:text-7xl">{p.title}</h3>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-bone/60 md:text-base">{p.desc}</p>
          </div>
          <a href="#contact" className="inline-flex w-fit items-center gap-3 text-sm font-medium">
            <span className="relative overflow-hidden">
              <span className="block transition-transform duration-500 group-hover:-translate-y-full">查看案例</span>
              <span className="absolute left-0 top-full block transition-transform duration-500 group-hover:-translate-y-full" style={{ color: p.color }}>
                查看案例
              </span>
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/20 transition-all duration-500 group-hover:rotate-45 group-hover:border-bone/60">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </span>
          </a>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[520px]">
          <motion.img
            src={p.img}
            alt={p.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c12] via-transparent to-transparent md:block" />
          <div className="absolute bottom-5 right-5 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] glass">
            Case Study
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Work() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="work" className="relative">
      <div className="mx-auto max-w-[1600px] px-5 pt-28 md:px-10 md:pt-44">
        <div className="mb-10 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.3em] text-bone/40">
          <span className="text-accent">02</span>
          <span>Selected Work</span>
          <Line className="flex-1" />
        </div>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SplitText
            as="h2"
            text="精选作品"
            className="font-display text-6xl font-semibold tracking-tight md:text-8xl lg:text-9xl"
          />
          <FadeUp className="max-w-sm text-bone/60 md:pb-4">
            每一个项目都是一次关于「体验能走多远」的实验。以下是几件我引以为傲的作品。
          </FadeUp>
        </div>
      </div>

      <div ref={ref} className="relative mt-8 perspective">
        {projects.map((p, i) => (
          <Card key={p.n} p={p} i={i} total={projects.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
