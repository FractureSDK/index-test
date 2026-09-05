import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import Magnetic from "./Magnetic";

const links = [
  { label: "About", href: "#about", n: "01" },
  { label: "Work", href: "#work", n: "02" },
  { label: "Skills", href: "#skills", n: "03" },
  { label: "Journey", href: "#journey", n: "04" },
  { label: "Contact", href: "#contact", n: "05" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState("");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Shanghai",
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("lenis-stopped", open);
  }, [open]);

  return (
    <>
      <motion.div
        className="fixed left-0 top-0 z-[80] h-[2px] w-full origin-left bg-accent"
        style={{ scaleX: progress }}
      />
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className={`fixed left-0 top-0 z-[70] w-full transition-all duration-500 ${
          scrolled ? "py-3" : "py-5 md:py-7"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 md:px-10">
          <a href="#top" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-bone/20">
              <span className="font-display text-sm font-bold transition-transform duration-500 group-hover:-translate-y-8">
                C
              </span>
              <span className="absolute translate-y-8 font-display text-sm font-bold text-accent transition-transform duration-500 group-hover:translate-y-0">
                Y
              </span>
            </div>
            <div className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-sm font-semibold tracking-tight">Chu Yuewei</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone/40">
                Creative Dev
              </span>
            </div>
          </a>

          <nav className="hidden items-center gap-1 rounded-full px-2 py-1.5 glass lg:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative overflow-hidden rounded-full px-4 py-2 text-sm text-bone/70 transition-colors hover:text-ink"
              >
                <span className="absolute inset-0 scale-0 rounded-full bg-accent transition-transform duration-400 ease-out group-hover:scale-100" />
                <span className="relative flex items-center gap-2">
                  <span className="font-mono text-[9px] opacity-50">{l.n}</span>
                  {l.label}
                </span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 font-mono text-[11px] text-bone/50 md:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              SHANGHAI {time}
            </div>
            <Magnetic>
              <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/20 glass lg:hidden"
              >
                <div className="relative h-3 w-5">
                  <motion.span
                    animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                    className="absolute left-0 top-0 h-px w-full bg-bone"
                  />
                  <motion.span
                    animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                    className="absolute bottom-0 left-0 h-px w-full bg-bone"
                  />
                </div>
              </button>
            </Magnetic>
            <Magnetic className="hidden lg:block">
              <a
                href="#contact"
                className="group relative inline-flex h-11 items-center overflow-hidden rounded-full bg-bone px-6 text-sm font-medium text-ink"
              >
                <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0" />
                <span className="relative">Let's talk</span>
              </a>
            </Magnetic>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[65] flex flex-col justify-between bg-[#0b0b10] px-6 pb-10 pt-28"
          >
            <nav className="flex flex-col gap-2">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline gap-4 border-b border-bone/10 py-4 font-display text-5xl font-medium tracking-tight"
                >
                  <span className="font-mono text-xs text-accent">{l.n}</span>
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-between font-mono text-xs uppercase tracking-widest text-bone/40"
            >
              <span>Shanghai, CN</span>
              <span>{time}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
