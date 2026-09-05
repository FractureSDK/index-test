import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const words = ["你好", "Hello", "Bonjour", "こんにちは", "Hola", "Ciao", "Chu Yuewei"];

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [exit, setExit] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setExit(true);
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || idx >= words.length - 1) return;
    const t = setTimeout(() => setIdx((i) => i + 1), idx === 0 ? 700 : 180);
    return () => clearTimeout(t);
  }, [idx]);

  useEffect(() => {
    if (reducedMotion) return;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = "";
    };
  }, [reducedMotion]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (reducedMotion) return;
    const start = performance.now();
    const dur = 2100;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          document.body.style.overflow = "";
          setExit(true);
          onDone();
        }, 250);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink"
          initial={{ clipPath: "inset(0 0 0 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
        >
          <div className="absolute inset-0 grid-bg opacity-60" />
          <div className="relative flex flex-col items-center">
            <div className="flex items-center gap-4">
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="h-2.5 w-2.5 rounded-full bg-accent"
              />
              <AnimatePresence mode="wait">
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                  transition={{ duration: 0.28 }}
                  className="font-display text-4xl font-medium tracking-tight md:text-6xl"
                >
                  {words[idx]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between md:bottom-12 md:left-12 md:right-12">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-bone/40">
              Loading Experience
            </span>
            <span className="font-display text-7xl font-light leading-none tabular-nums md:text-[10rem]">
              {count}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-bone/10">
            <motion.div className="h-full bg-accent" style={{ width: `${count}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
