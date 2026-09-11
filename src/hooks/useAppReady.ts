"use client";

import { createContext, useContext } from "react";

/** True once the Preloader has finished (or was skipped for reduced-motion). */
export const AppReadyContext = createContext(false);

export function useAppReady() {
  return useContext(AppReadyContext);
}
