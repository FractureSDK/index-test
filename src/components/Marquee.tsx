import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useVelocity } from "framer-motion";

const items = ["Creative Development", "Motion Design", "WebGL", "Interaction", "Brand Experience", "3D", "Product Design"];

export default function Marquee({ reverse = false, outline = false }: { reverse?: boolean; outline?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const skew = useSpring(useTransform(velocity, [-2000, 2000], [-6, 6]), { stiffness: 200, damping: 30 });

  return (
    <div ref={ref} className="relative overflow-hidden border-y border-bone/10 py-5 md:py-7">
      <motion.div style={{ skewX: skew }} className="flex w-max">
        <div className={`flex shrink-0 items-center gap-10 pr-10 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
          {[...items, ...items].map((t, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className={`whitespace-nowrap font-display text-4xl font-semibold uppercase tracking-tight md:text-6xl ${outline ? "text-stroke" : ""}`}>
                {t}
              </span>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent md:h-3.5 md:w-3.5" />
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
