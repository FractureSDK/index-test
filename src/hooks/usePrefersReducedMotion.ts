import { useEffect, useState } from "react";

/**
 * Tracks the user's `prefers-reduced-motion` OS setting.
 * The CSS rule in index.css already shortens transition/animation
 * durations, but Framer Motion drives its animations in JS and ignores
 * that CSS — components with large/attention-grabbing motion (custom
 * cursor, preloader, parallax) should check this and back off.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
