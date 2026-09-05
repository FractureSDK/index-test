import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 400, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 400, damping: 40, mass: 0.5 });
  const [hover, setHover] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;
    setVisible(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as HTMLElement).closest("a, button, [data-cursor]") as HTMLElement | null;
      setHover(!!el);
      setLabel(el?.dataset.cursor ?? null);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y, reducedMotion]);

  if (!visible) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          animate={{
            width: label ? 88 : hover ? 56 : 14,
            height: label ? 88 : hover ? 56 : 14,
            backgroundColor: hover ? "rgba(244,241,234,1)" : "rgba(244,241,234,1)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex items-center justify-center rounded-full"
        >
          {label && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black">
              {label}
            </span>
          )}
        </motion.div>
      </motion.div>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[99] h-10 w-10 rounded-full border border-bone/30"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: hover ? 0 : 1, opacity: hover ? 0 : 1 }}
        transition={{ duration: 0.25 }}
      />
    </>
  );
}
