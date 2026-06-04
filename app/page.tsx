"use client";

import { useState } from "react";
import CardShuffle from "@/components/CardShuffle";
import PageLoader from "@/components/PageLoader";

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#F8F3F4]">
      {/* cards start immediately in the background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <CardShuffle />
      </div>

      {/* text above cards */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center pointer-events-none">
        <h1 className="font-bold text-3xl  tracking-widest text-black">
          Hey,
        </h1>
      </div>

      {/* loader sits on top of everything, fades out on its own */}
      <PageLoader />
    </main>
  );
}