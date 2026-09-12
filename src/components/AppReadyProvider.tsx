"use client";

import type { ReactNode } from "react";
import { AppReadyContext } from "@/hooks/useAppReady";

/**
 * Used only when NEXT_PUBLIC_FEATURE_PRELOADER is off, as the "ready is
 * always true" stand-in for <Preloader>. Needs to be its own Client
 * Component: rendering `<AppReadyContext.Provider>` directly inside
 * layout.tsx (a Server Component) fails even though AppReadyContext is
 * itself defined in a "use client" module — Next's RSC boundary requires
 * the Provider JSX itself to be written inside client code, not just
 * imported into server code.
 */
export default function AppReadyProvider({ children }: { children: ReactNode }) {
  return <AppReadyContext.Provider value={true}>{children}</AppReadyContext.Provider>;
}
