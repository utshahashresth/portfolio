"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import gsap from "gsap";

// ─── THE ONLY NUMBER YOU NEED TO CHANGE ───────────────────────────────────────
const TARGET_MS = 2000; // total loader visible duration in milliseconds

// ─── words ────────────────────────────────────────────────────────────────────
const WORDS = ["Apps", "Portfolio", "Work"];
const LEFT = "Personal ";
const RIGHT = "Portfolio.";
const SLOT_H = "1.18em";

// ─── derived timings — don't touch these ─────────────────────────────────────
const TARGET_S = TARGET_MS / 1000;
const FADE_DURATION = 0.25;                              // overlay fade-out
const ANIM_BUDGET = TARGET_S - FADE_DURATION;          // 1.75s of actual animation
const ENTRANCE_S = 0.55;                              // GSAP stagger settle time
const SPIN_BUDGET = ANIM_BUDGET - ENTRANCE_S;          // 1.20s for all word spins
const SLOT_S = SPIN_BUDGET / WORDS.length;        // 0.40s per word slot
const WORD_IN_S = SLOT_S * 0.55;                     // 0.22s entrance
const WORD_OUT_S = SLOT_S * 0.45;                     // 0.18s exit
const SPIN_INTERVAL = SLOT_S * 1000;                     // ms between word changes
const ENTRANCE_DELAY = ENTRANCE_S * 1000;                 // ms before spin starts

interface PageLoaderProps {
  fontClassName?: string;
  onComplete?: () => void;
}

export default function PageLoader({ fontClassName = "", onComplete }: PageLoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => { setMounted(true); }, []);

  // ── Effect 1: GSAP — entrance, progress bar, fade-out ─────────────────────
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-loader-left]", { y: 36, opacity: 0 });
      gsap.set("[data-loader-slot]", { y: 36, opacity: 0 });
      gsap.set("[data-loader-right]", { y: 36, opacity: 0 });

      gsap.timeline()
        .to("[data-loader-left]", { y: 0, opacity: 0.28, duration: ENTRANCE_S, ease: "power4.out" }, 0.08)
        .to("[data-loader-slot]", { y: 0, opacity: 1, duration: ENTRANCE_S, ease: "power4.out" }, 0.16)
        .to("[data-loader-right]", { y: 0, opacity: 0.28, duration: ENTRANCE_S, ease: "power4.out" }, 0.24);

      // progress bar fills over the full visible duration
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: 1,
          duration: TARGET_S,
          ease: "none",
          transformOrigin: "0% 50%",
        });
      }

      // fade out exactly at TARGET_S
      gsap.to(overlay, {
        opacity: 0,
        duration: FADE_DURATION,
        ease: "power2.inOut",
        delay: ANIM_BUDGET,
        onComplete: () => {
          overlay.style.display = "none";
          onCompleteRef.current?.();
        },
      });
    }, overlay);

    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Effect 2: word spin ────────────────────────────────────────────────────
  useEffect(() => {
    let spinInterval: ReturnType<typeof setInterval> | null = null;

    const startTimer = setTimeout(() => {
      spinInterval = setInterval(() => {
        setWordIndex((prev) => (prev + 1) % WORDS.length);
      }, SPIN_INTERVAL);
    }, ENTRANCE_DELAY);

    // stop 200ms before fade so last word is fully visible
    const stopTimer = setTimeout(() => {
      if (spinInterval) clearInterval(spinInterval);
    }, TARGET_MS - 200);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stopTimer);
      if (spinInterval) clearInterval(spinInterval);
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#F8F3F4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className={fontClassName}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.28em",
          fontSize: "3rem",
          color: "#232323",
          letterSpacing: "-0.025em",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        <span data-loader-left="" style={{ fontWeight: 300 }}>
          {LEFT}
        </span>

        <div
          data-loader-slot=""
          style={{ position: "relative", height: SLOT_H, overflow: "hidden" }}
        >
          <span
            aria-hidden="true"
            style={{
              visibility: "hidden",
              display: "block",
              fontWeight: 700,
              whiteSpace: "nowrap",
              lineHeight: SLOT_H,
            }}
          >
            {WORDS[wordIndex]}
          </span>

          {mounted ? (
            <AnimatePresence mode="sync" initial={false}>
              <motion.span
                key={wordIndex}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-110%", opacity: 0 }}
                transition={{ duration: WORD_IN_S, ease: [0.2, 0, 0.2, 1] }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  display: "block",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  lineHeight: SLOT_H,
                }}
              >
                {WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          ) : (
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                display: "block",
                fontWeight: 700,
                whiteSpace: "nowrap",
                lineHeight: SLOT_H,
              }}
            >
              {WORDS[0]}
            </span>
          )}
        </div>

        <span data-loader-right="" style={{ fontWeight: 300 }}>
          {RIGHT}
        </span>
      </div>

      {/* ── progress bar ──────────────────────────────────────── */}



    </div>
  );
}