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
            <nav
              className="hero-nav"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                fontFamily: "var(--font-geist-sans)",
                fontSize: "11px",
                letterSpacing: "0.01em",
                color: "#1a1a1a",
                pointerEvents: "auto",
              }}
            >
              <span style={{ fontWeight: 500 }}>Utshaha Shrestha</span>
              <span style={{ color: "#888", fontWeight: 400 }}>Frontend Developer</span>
              <span style={{ fontWeight: 400 }}>Work, Archive</span>
            </nav>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
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

                <span>utshaha.</span>

              </h1>
            </div>
            <div style={{ pointerEvents: "auto" }}>
              <div
                style={{
                  fontFamily: "var(--font-geist-sans)",
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
