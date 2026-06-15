"use client";

import { useRef } from "react";
import CardShuffle from "@/components/CardShuffle";
import HorizontalScroll from "@/components/HorizontalScroll";
import IntroSection from "@/components/IntroSection";
import WorksSection from "@/components/WorksSection";
import { usePageLoader } from "@/components/PageLoaderContext";

export default function Home() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { done: animateCards } = usePageLoader();

  return (
    <>
      <HorizontalScroll>

        {/* ── Panel 1: Hero ── */}
        <section
          style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
            flexShrink: 0,
            background: "#F8F3F4",
            overflow: "hidden",
          }}
        >
          <CardShuffle headingRef={headingRef} shouldAnimate={animateCards} />

          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "28px 32px",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                marginLeft: "40px"
              }}
            >
              <h1
                ref={headingRef}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.5rem, 10vw, 6rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.02em",
                  color: "#888",
                  userSelect: "none",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontFamily: "var(--font-roboto-mono)" }}>utshaha.</span>
              </h1>
            </div>
            <div
              style={{
                position: "fixed",
                bottom: "20px",
                left: "20px",
                pointerEvents: "auto",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-roboto-mono)",
                  fontSize: "11px",
                  lineHeight: 1.5,
                  color: "#1a1a1a",
                }}
              >
                <p>Portfolio</p>
                <p>2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Panel 2: About ── */}
        <IntroSection />

        {/* ── Panel 3: Work ── */}
        <WorksSection />

      </HorizontalScroll>
    </>
  );
}
