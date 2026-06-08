markdown# Ingmar Coenen — Hero Intro Stack & Shuffle Animation
## Analysis + Next.js / GSAP Implementation Guide

---

## 1. What the Animation Does (Frame-by-Frame)

### Phase 0 — Initial state (before animation runs)
- Page background is white.
- Large serif heading **"Hey,"** (Tiempos Headline) is visible but rendered in a **dark grey / desaturated** color (`color: #999` or similar).
- All portfolio images are **hidden below the viewport** (`y: "100vh"` or similar large positive Y offset, `opacity: 0`).
- The images are stacked **on top of each other** — same X/Y position, same z-index stacking order — effectively invisible under the fold.

### Phase 1 — Stack rise (0s → ~0.6s)
- All images **simultaneously** animate upward from below the screen into a **single stacked pile** at the **visual center** of the hero — roughly overlapping the "Hey," text.
- They arrive all at once (same `duration`, same `ease`), landing stacked on top of each other.
- `y`: from `120vh` → `0` (their final layout position)
- `opacity`: from `0` → `1`
- Ease: `power3.out` or `expo.out`

### Phase 2 — Shuffle / spread (overlaps Phase 1, ~0.4s → ~1.4s)
- Immediately after (or staggered slightly), images **fly out** from the stack to their pre-defined **absolute positions** scattered around the "Hey," text.
- Each image has a unique `x` / `y` target.
- A **small stagger** (`stagger: 0.06` – `0.1`) is used so they don't all land simultaneously — giving a "card being dealt" feel.
- Rotation: each image gets a **slight random tilt** (`rotation: -4` to `+4` degrees) for organic feel.
- Ease: `power2.out` or `back.out(1.2)` — slight overshoot on some cards.

### Phase 3 — Final state (after ~1.5s)
- All 6 images are **grayscale** (`filter: grayscale(100%)`), placed in their fixed grid-like positions.
- The "Hey," text transitions to **full black** (`color: #000` or `#111`).
- The nav items and "Portfolio 2022" label fade in or were always visible.

---

## 2. Layout — Image Positions (relative to the hero container)

The hero section is full-viewport-height. Images are **absolutely positioned** relative to it.
┌─────────────────────────────────────────────────────┐
│  [img-1: phone mockup]      [img-2: desktop mockup] │
│  top-left quarter            top-right quarter       │
│                                                      │
│        [ img-3: tall card ]      [ img-5: ring ]     │
│        center-left               right-center        │
│                                                      │
│              H e y ,                                 │
│                                                      │
│  [img-4: poster]    [img-6: 181]    [img-7: person]  │
│  bottom-left        bottom-center   bottom-right     │
└─────────────────────────────────────────────────────┘

Approximate CSS positions (as % of container):

| Image | top     | left / right  | width   | notes             |
|-------|---------|---------------|---------|-------------------|
| img-1 | 15%     | left: 22%     | 12%     | portrait          |
| img-2 | 14%     | left: 56%     | 14%     | landscape         |
| img-3 | 38%     | left: 30%     | 10%     | tall/portrait     |
| img-4 | 60%     | left: 11%     | 10%     | square            |
| img-5 | 42%     | right: 8%     | 9%      | small square      |
| img-6 | 62%     | left: 47%     | 10%     | square            |
| img-7 | 60%     | left: 62%     | 10%     | portrait          |

> The "Hey," text is centered vertically (~45% from top) and starts at ~28% from left.

---

## 3. Tech Stack Details (from Godly tags)

- **Framework**: WordPress (but we'll use Next.js)
- **Animation**: GSAP
- **Font**: Tiempos Headline (serif, for "Hey,") + Neue Montreal (sans-serif, UI)
- **Style tags**: Animation, Scrolling Animation, Transitions, Light, Minimal

---

## 4. File Structure (Next.js App Router)
src/
├── app/
│   └── page.tsx              # Main page
├── components/
│   └── HeroIntro/
│       ├── HeroIntro.tsx     # Main component
│       ├── HeroIntro.module.css
│       └── imageData.ts      # Image positions config
└── lib/
└── animations/
└── heroIntro.ts      # GSAP timeline factory

---

## 5. Image Data Config (`imageData.ts`)

```ts
// src/components/HeroIntro/imageData.ts

export interface HeroImage {
  id: string
  src: string
  alt: string
  style: React.CSSProperties
  rotation: number   // degrees
}

export const heroImages: HeroImage[] = [
  {
    id: "img-1",
    src: "/images/project-phone.jpg",
    alt: "Phone mockup",
    style: { top: "15%", left: "22%", width: "12%" },
    rotation: -2,
  },
  {
    id: "img-2",
    src: "/images/project-desktop.jpg",
    alt: "Desktop mockup",
    style: { top: "14%", left: "56%", width: "14%" },
    rotation: 1.5,
  },
  {
    id: "img-3",
    src: "/images/project-card.jpg",
    alt: "Project card",
    style: { top: "38%", left: "30%", width: "10%" },
    rotation: -3,
  },
  {
    id: "img-4",
    src: "/images/project-poster.jpg",
    alt: "Poster",
    style: { top: "62%", left: "11%", width: "10%" },
    rotation: 2,
  },
  {
    id: "img-5",
    src: "/images/project-ring.jpg",
    alt: "Ring product",
    style: { top: "42%", right: "8%", width: "9%" },
    rotation: -1,
  },
  {
    id: "img-6",
    src: "/images/project-181.jpg",
    alt: "181 project",
    style: { top: "63%", left: "47%", width: "10%" },
    rotation: 1,
  },
  {
    id: "img-7",
    src: "/images/project-portrait.jpg",
    alt: "Portrait",
    style: { top: "61%", left: "62%", width: "10%" },
    rotation: -2.5,
  },
]
```

---

## 6. GSAP Animation Factory (`heroIntro.ts`)

```ts
// src/lib/animations/heroIntro.ts
import gsap from "gsap"

/**
 * Runs the hero intro: stack-from-bottom → shuffle-to-position
 * @param images  - array of DOM elements (the img wrappers)
 * @param heading - the "Hey," heading element
 */
export function runHeroIntroAnimation(
  images: HTMLElement[],
  heading: HTMLElement
) {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

  // ─── Set initial state ────────────────────────────────────────────────────
  // All images start stacked at center, below viewport
  gsap.set(images, {
    // Position them all at a center point (override CSS absolute pos temporarily)
    position: "absolute",
    xPercent: -50,
    yPercent: -50,
    left: "50%",
    top: "50%",
    y: "120vh",        // below the fold
    opacity: 0,
    scale: 0.9,
    filter: "grayscale(100%)",
    rotation: 0,       // start with no rotation
  })

  // Heading starts grey
  gsap.set(heading, { color: "#888" })

  // ─── Phase 1: All images rise into center stack ───────────────────────────
  tl.to(images, {
    y: 0,
    opacity: 1,
    scale: 1,
    duration: 0.65,
    ease: "power3.out",
    stagger: 0,         // ALL at same time — they land as one stack
  })

  // ─── Phase 2: Images shuffle out to their absolute positions ─────────────
  // We clear the temporary centering overrides and animate to final CSS layout
  tl.to(
    images,
    {
      duration: 0.75,
      ease: "power2.out",
      stagger: {
        each: 0.07,          // small stagger — "dealt like cards"
        from: "center",      // spread from center outward
      },
      // Return to their own CSS-defined positions
      // GSAP will clear xPercent/yPercent/left/top overrides
      clearProps: "left,top,xPercent,yPercent",
      // Apply the rotation from data
      rotation: (_i: number, el: HTMLElement) =>
        parseFloat(el.dataset.rotation ?? "0"),
    },
    "-=0.2"  // slight overlap with Phase 1
  )

  // ─── Phase 3: Heading transitions to black ────────────────────────────────
  tl.to(
    heading,
    {
      color: "#111",
      duration: 0.5,
      ease: "power2.out",
    },
    "-=0.4"
  )

  return tl
}
```

---

## 7. Hero Component (`HeroIntro.tsx`)

```tsx
// src/components/HeroIntro/HeroIntro.tsx
"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import styles from "./HeroIntro.module.css"
import { heroImages } from "./imageData"
import { runHeroIntroAnimation } from "@/lib/animations/heroIntro"

export default function HeroIntro() {
  const containerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const imageRefs = useRef<HTMLDivElement[]>([])

  // Collect image refs
  const setImageRef = (el: HTMLDivElement | null, i: number) => {
    if (el) imageRefs.current[i] = el
  }

  useEffect(() => {
    const images = imageRefs.current.filter(Boolean)
    const heading = headingRef.current
    if (!images.length || !heading) return

    // Small delay so layout is fully painted before GSAP reads positions
    const timeout = setTimeout(() => {
      runHeroIntroAnimation(images, heading)
    }, 100)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <section className={styles.hero} ref={containerRef}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <span className={styles.navName}>Ingmar Coenen</span>
        <span className={styles.navRole}>Digital Design &amp; Direction</span>
        <span className={styles.navLinks}>Work, Archive</span>
      </nav>

      {/* Floating images — absolutely positioned */}
      {heroImages.map((img, i) => (
        <div
          key={img.id}
          ref={(el) => setImageRef(el, i)}
          className={styles.imageWrapper}
          style={img.style}
          data-rotation={img.rotation}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            style={{ objectFit: "cover" }}
            priority={i < 3}
          />
        </div>
      ))}

      {/* "Hey," heading */}
      <h1 className={styles.heading} ref={headingRef}>
        Hey,
      </h1>

      {/* Bottom left label */}
      <div className={styles.meta}>
        <span>Portfolio</span>
        <span>2022</span>
      </div>
    </section>
  )
}
```

---

## 8. CSS Module (`HeroIntro.module.css`)

```css
/* src/components/HeroIntro/HeroIntro.module.css */

.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
  /* Subtle warm off-white tint like the original */
  /* background: #faf9f7; */
}

/* Navigation */
.nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  font-family: "Neue Montreal", sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.01em;
  color: #111;
  z-index: 10;
}

/* Image wrappers — absolutely positioned by inline style from imageData */
.imageWrapper {
  position: absolute;
  aspect-ratio: 3 / 4;   /* default portrait; override per-image if needed */
  overflow: hidden;
  border-radius: 2px;
  filter: grayscale(100%);
  /* z-index lower than heading so "Hey," reads on top */
  z-index: 1;
  will-change: transform, opacity;
}

/* "Hey," headline */
.heading {
  position: absolute;
  top: 45%;
  left: 28%;
  transform: translateY(-50%);
  font-family: "Tiempos Headline", Georgia, serif;
  font-size: clamp(5rem, 10vw, 10rem);
  font-weight: 400;        /* regular weight for elegance */
  line-height: 0.95;
  letter-spacing: -0.03em;
  color: #888;             /* GSAP will animate this to #111 */
  z-index: 2;              /* above images */
  margin: 0;
  will-change: color;
}

/* Bottom-left meta label */
.meta {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  font-family: "Neue Montreal", sans-serif;
  font-size: 0.75rem;
  color: #888;
  line-height: 1.4;
}
```

---

## 9. Page Usage (`page.tsx`)

```tsx
// src/app/page.tsx
import HeroIntro from "@/components/HeroIntro/HeroIntro"

export default function Home() {
  return (
    <main>
      <HeroIntro />
      {/* rest of page content */}
    </main>
  )
}
```

---

## 10. Dependencies

```bash
npm install gsap
# Optional: GSAP registered plugins
```

In `layout.tsx` or a global setup file, optionally register GSAP plugins:

```ts
import { gsap } from "gsap"
// import { ScrollTrigger } from "gsap/ScrollTrigger"
// gsap.registerPlugin(ScrollTrigger)
```

---

## 11. Fonts Setup (Next.js `layout.tsx`)

```tsx
// src/app/layout.tsx
import localFont from "next/font/local"

const tiempos = localFont({
  src: "../fonts/TiemposHeadline-Regular.woff2",
  variable: "--font-tiempos",
})

const neueMontreal = localFont({
  src: "../fonts/NueMontreal-Regular.woff2",
  variable: "--font-neue",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${tiempos.variable} ${neueMontreal.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

Then in CSS:
```css
:root {
  --font-heading: var(--font-tiempos), Georgia, serif;
  --font-body: var(--font-neue), system-ui, sans-serif;
}
```

---

## 12. Key Animation Parameters — Quick Reference

| Property         | Phase 1 (rise to stack) | Phase 2 (shuffle spread) |
|------------------|-------------------------|--------------------------|
| `duration`       | `0.65s`                 | `0.75s`                  |
| `ease`           | `power3.out`            | `power2.out`             |
| `stagger`        | `0` (simultaneous)      | `0.07` from center       |
| `y` from         | `120vh`                 | already at 0             |
| `opacity` from   | `0 → 1`                 | stays 1                  |
| `rotation`       | `0`                     | per-image (-4 to +4 deg) |
| `scale` from     | `0.9 → 1`               | stays 1                  |
| `overlap`        | —                       | `-=0.2` (starts 0.2s early) |

---

## 13. Animation Timing Diagram
0s    0.2s   0.4s   0.6s   0.8s   1.0s   1.2s   1.4s
│──────────────────────────────────────────────────────
│
│  [Phase 1 — Rise]
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░
│  (all images, simultaneous, y:120vh→0, opacity:0→1)
│
│               [Phase 2 — Shuffle spread]
│               ░░░░░████████████████████████░░░░░
│               (stagger 0.07s, spreads out to CSS positions + rotation)
│
│                             [Phase 3 — Heading color]
│                             ░░░░░░░░███████████████
│                             (color #888 → #111)
│

---

## 14. Notes & Tips

- **`will-change: transform, opacity`** on image wrappers ensures GPU compositing.
- Use **`gsap.set()`** immediately (not in a `useEffect`) to avoid a flash of the pre-animation layout. Or set the initial CSS values directly in the stylesheet and let GSAP `from()` animate from there.
- If images flicker on first paint, add `visibility: hidden` in CSS and use `gsap.set(el, { visibility: "visible" })` at the start of the timeline.
- The **grayscale filter** can be animated off on hover per image for a nice interaction effect using `gsap.to(el, { filter: "grayscale(0%)", duration: 0.3 })`.
- For a pixel-perfect match: the original uses **6–7 images**, all displayed at roughly **10–14% of the viewport width** in size.
- The `stagger: { from: "center" }` option in GSAP makes cards that are visually closer to center fly out first, giving that organic "explosion from a single point" feel.

That's the full breakdown. Here's a quick summary of what the animation actually does:
The animation has 3 phases:

Stack rise — all images start hidden below the viewport and rise simultaneously as a single pile to the center of the screen, stacked on top of each other over the "Hey," text (~0.65s, power3.out)
Shuffle spread — the stacked pile explodes outward with a small stagger (0.07s each, from: "center") as each image flies to its predefined absolute position with a slight random rotation — like dealing cards (~0.75s, power2.out)
Heading color shift — the "Hey," text transitions from grey to black as the images settle (~0.5s)

The key GSAP insight is: set all images to the same center position initially with gsap.set(), then in Phase 2 use clearProps to remove those overrides so each image snaps to its own CSS-defined absolute position, driven by a stagger. That single pattern creates the entire "stack to shuffle" illusion.