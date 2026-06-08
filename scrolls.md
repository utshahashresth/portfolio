# Fix: Horizontal Scroll — Panels Must Move as One Strip

## The Problem

Right now the page has two separate scroll contexts fighting each other:

1. `page.tsx` renders a `<main>` with `overflow-hidden` and `h-screen` — a fully isolated, viewport-locked hero.
2. `HorizontalScroll` wraps only `IntroSection` and `WorksSection` as its children.

So when the user scrolls, the hero doesn't move at all — it just gets replaced by the horizontal track snapping in. It feels like a page swap, not a continuous scroll.

## The Fix

**All three panels (Hero, IntroSection, WorksSection) must be direct `flex` children of the same `HorizontalScroll` track.** GSAP then translates the entire strip as one unit — scrolling pulls panel 1 left while panel 2 slides in from the right, like a physical ribbon.

---

## Exact Changes Required

### 1. `src/app/page.tsx` — Rewrite entirely

Replace the entire file with this:

```tsx
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
          {/* Scattered photo cards (GSAP animated) */}
          <CardShuffle headingRef={headingRef} shouldAnimate={animateCards} />

          {/* Nav + Heading + Footer overlay */}
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
```

---

### 2. `src/components/HorizontalScroll.tsx` — Add `id` to ScrollTrigger, bump scrub

Only two things change:
- Add `id: "hscroll"` to the ScrollTrigger config (so IntroSection can hook `containerAnimation` into it)
- Change `scrub: 1` → `scrub: 1.2` (slightly smoother follow)

```tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;

    const ctx = gsap.context(() => {
      const scrollDist = () => track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -scrollDist(),
        ease: "none",
        scrollTrigger: {
          id: "hscroll",          // ← NEW: lets child components find this trigger
          trigger: wrap,
          start: "top top",
          end: () => `+=${scrollDist()}`,
          scrub: 1.2,             // ← was 1
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} style={{ overflow: "hidden" }}>
      <div
        ref={trackRef}
        style={{
          display: "flex",
          flexWrap: "nowrap",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

---

### 3. `src/components/IntroSection.tsx` — Scroll-triggered entrance animation (optional but already written)

If IntroSection already has the `useLayoutEffect` + `containerAnimation` GSAP code from the previous session, leave it as-is. If it was reverted to the static version, use this:

```tsx
"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function IntroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const els = [labelRef.current, headingRef.current, bodyRef.current].filter(Boolean) as HTMLElement[];
    if (!section || !els.length) return;

    // Wait for HorizontalScroll's ScrollTrigger to register first
    const timeout = setTimeout(() => {
      const hscroll = ScrollTrigger.getById("hscroll");
      if (!hscroll) return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          els,
          { x: 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
              containerAnimation: hscroll,
              trigger: section,
              start: "left 75%",
              end: "left 25%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        width: "100vw",
        height: "100vh",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: "0 10vw",
        background: "#F8F3F4",
      }}
    >
      <div style={{ maxWidth: 600 }}>
        <p
          ref={labelRef}
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
            color: "#888",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
            opacity: 0,
          }}
        >
          About
        </p>
        <h2
          ref={headingRef}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#1a1a1a",
            marginBottom: "2rem",
            opacity: 0,
          }}
        >
          Frontend developer crafting thoughtful digital experiences.
        </h2>
        <p
          ref={bodyRef}
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)",
            color: "#555",
            lineHeight: 1.7,
            maxWidth: 480,
            opacity: 0,
          }}
        >
          Based in Kathmandu. I build interfaces that balance craft with function —
          clean code, considered motion, and details that matter.
        </p>
      </div>
    </section>
  );
}
```

---

## Why This Works

| Before | After |
|--------|-------|
| Hero is an isolated `<main overflow-hidden>` outside `HorizontalScroll` | Hero is a `flexShrink:0` panel **inside** `HorizontalScroll` |
| GSAP only translates IntroSection + WorksSection | GSAP translates **all 3 panels** as one strip |
| Scroll = hero disappears, track snaps in | Scroll = hero slides left, panel 2 follows naturally |
| `PageLoader` was inside the scroll track | `PageLoader` is outside, overlays everything correctly |

## Do Not Change

- `CardShuffle.tsx` — no changes needed
- `PageLoader.tsx` — no changes needed  
- `PageLoaderProvider.tsx` — no changes needed
- `layout.tsx` — no changes needed
- `WorksSection.tsx` — no changes needed