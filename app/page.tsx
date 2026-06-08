"use client";

import { useRef, useState } from "react";
import CardShuffle from "@/components/CardShuffle";
import PageLoader from "@/components/PageLoader";
import HorizontalScroll from "@/components/HorizontalScroll";
import IntroSection from "@/components/IntroSection";
import WorksSection from "@/components/WorksSection";

export default function Home() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [animateCards, setAnimateCards] = useState(false);

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

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <h1
                ref={headingRef}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(5rem, 10vw, 11rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.02em",
                  color: "#888",
                  userSelect: "none",
                }}
              >
                Hey,
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

      {/* PageLoader sits outside the scroll track so it overlays everything */}
      <PageLoader onComplete={() => setAnimateCards(true)} />
    </>
  );
}
