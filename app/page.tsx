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
          className="panel-h"
          style={{
            position: "relative",
            width: "100vw",
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
              padding: "20px",
              pointerEvents: "none",
              boxSizing: "border-box",
            }}
          >
            <div
              className="hero-heading-wrap panel-h"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div ref={headingRef} style={{ userSelect: "none", color: "#888" }} className="ml-32">
                {/* "UTSHAHA'S" small label above */}
                <p style={{
                  fontFamily: "var(--font-roboto-mono)",
                  fontSize: "clamp(0.55rem, 1.1vw, 0.85rem)",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  color: "inherit",
                  marginBottom: "0.15em",
                  opacity: 0.7,
                  textAlign: "left",
                }}>UTSHAHA&apos;S</p>

                {/* PORT + 2026 row */}
                <div style={{ position: "relative", display: "flex", alignItems: "flex-end" }}>
                  <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(3.5rem, 14vw, 10rem)",
                    lineHeight: 0.88,
                    letterSpacing: "-0.02em",
                    color: "inherit",
                    fontWeight: 700,
                    margin: 0,
                  }}>PORT</h1>
                  <span style={{
                    fontFamily: "var(--font-roboto-mono)",
                    fontSize: "clamp(0.6rem, 1.3vw, 1rem)",
                    fontWeight: 400,
                    letterSpacing: "0.04em",
                    color: "inherit",
                    opacity: 0.7,
                    marginLeft: "0.4em",
                    marginBottom: "0.3em",
                  }}>2026</span>
                </div>

                {/* FOLIO row */}
                <h1 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3.5rem, 14vw, 10rem)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.02em",
                  color: "inherit",
                  fontWeight: 700,
                  margin: 0,
                }}>FOLIO</h1>
              </div>
            </div>
            <div
              className="hero-meta"
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