"use client";

import { useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import PageLoader from "./PageLoader";
import { PageLoaderContext } from "./PageLoaderContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function PageLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [done, setDone] = useState(false);

  return (
    <PageLoaderContext.Provider value={{ done }}>
      {!done && (
        <PageLoader
          fontClassName={cormorant.className}
          onComplete={() => setDone(true)}
        />
      )}
      {children}
    </PageLoaderContext.Provider>
  );
}