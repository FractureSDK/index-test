import { useSyncExternalStore } from "react";

function subscribe(query: string) {
  return (callback: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
  };
}

/** SSR-safe media query subscription (no setState-in-effect, no hydration flash). */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false
  );
}
