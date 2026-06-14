"use client";

import { createContext, useContext } from "react";

export const PageLoaderContext = createContext<{ done: boolean }>({ done: false });

export function usePageLoader() {
  return useContext(PageLoaderContext);
}
