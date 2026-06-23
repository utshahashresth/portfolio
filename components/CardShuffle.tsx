"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const VIDEOS = ["/videos/1.mp4", "/videos/2.mp4", "/videos/5.mp4", "/videos/4.mp4", "/videos/3.mp4", "/videos/6.mp4", "/videos/7.mp4"];

const CARD_W = 160;
const CARD_H = 200;
const MOBILE_CARD_W = 100;
const MOBILE_CARD_H = 125;
const PHOTO_OPACITY = 0.75;

// Final positions for each card: where the card's top-left corner sits in the viewport
const SCATTER_TARGETS = [
    { leftPct: 0.10, topPct: 0.08 }, // phone   — top left
    { leftPct: 0.60, topPct: 0.08 }, // laptop  — top right
    { leftPct: 0.31, topPct: 0.40 }, // portrait — centre left, overlaps "H"
    { leftPct: 0.09, topPct: 0.70 }, // poster  — bottom left
    { leftPct: 0.74, topPct: 0.70 }, // face    — bottom right
    { leftPct: 0.84, topPct: 0.42 }, // donut   — far-right mid
    { leftPct: 0.5, topPct: 0.70 }, // centre bottom
];

// Compact positions for mobile — verified safe down to 320×568 with 100×125 cards
const MOBILE_SCATTER_TARGETS = [
    { leftPct: 0.04, topPct: 0.05 }, // top-left
    { leftPct: 0.60, topPct: 0.04 }, // top-right
    { leftPct: 0.02, topPct: 0.36 }, // mid-left
    { leftPct: 0.64, topPct: 0.34 }, // mid-right
    { leftPct: 0.24, topPct: 0.58 }, // lower-centre-left
    { leftPct: 0.60, topPct: 0.62 }, // lower-right
    { leftPct: 0.04, topPct: 0.68 }, // bottom-left
];

// Compute GSAP x/y offsets from the stacked centre position.
// Formula uses the DOM stack-div size (CARD_W/CARD_H) as anchor — card rendered
// size is set separately via gsap.set and doesn't affect this calculation.
function buildOffsets() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 768;
    const targets = isMobile ? MOBILE_SCATTER_TARGETS : SCATTER_TARGETS;
    const cw = isMobile ? MOBILE_CARD_W : CARD_W;
    const ch = isMobile ? MOBILE_CARD_H : CARD_H;
    return targets.map((t) => ({
        x: (t.leftPct - 0.5) * vw + cw / 2,
        y: (t.topPct - 0.5) * vh + ch / 2,
    }));
}

interface CardShuffleProps {
    className?: string;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
    shouldAnimate?: boolean;
}

export default function CardShuffle({
    className = "",
    headingRef,
    shouldAnimate = false,
}: CardShuffleProps) {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    // Push cards below the screen on mount; resize to mobile dimensions if needed
    useEffect(() => {
        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        if (!cards.length) return;
        const isMobile = window.innerWidth < 768;
        const cw = isMobile ? MOBILE_CARD_W : CARD_W;
        const ch = isMobile ? MOBILE_CARD_H : CARD_H;
        cards.forEach((card, i) => gsap.set(card, { zIndex: VIDEOS.length - i }));
        gsap.set(cards, { width: cw, height: ch, x: 0, y: window.innerHeight * 1.1, rotate: 0, scale: 0.9, opacity: 0 });
    }, []);

    // 3-phase animation once the loader clears
    useEffect(() => {
        if (!shouldAnimate) return;
        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        if (!cards.length) return;

        const offsets = buildOffsets();
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Phase 1: all cards rise to centre simultaneously
        tl.to(cards, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
        });

        // Phase 2: scatter to viewport positions with stagger
        tl.to(
            cards,
            {
                x: (i: number) => offsets[i].x,
                y: (i: number) => offsets[i].y,
                duration: 0.75,
                ease: "power2.out",
                stagger: { each: 0.07, from: "center" },
            },
            "-=0.2"
        );

        // Phase 3: heading grey → near-black
        if (headingRef?.current) {
            tl.to(
                headingRef.current,
                { color: "#1a1a1a", duration: 0.5, ease: "power2.out" },
                "-=0.4"
            );
        }

        return () => { tl.kill(); };
    }, [shouldAnimate]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            className={`card-shuffle${className ? ` ${className}` : ""}`}
            style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "visible",
            }}
        >
            {/* All cards start stacked at centre; GSAP moves them to their scattered positions */}
            <div style={{ position: "relative", width: CARD_W, height: CARD_H }}>
                {VIDEOS.map((src, i) => (
                    <div
                        key={i}
                        ref={(el) => { cardRefs.current[i] = el; }}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: CARD_W,
                            height: CARD_H,
                            overflow: "hidden",
                            opacity: 0,
                            willChange: "transform, opacity",
                        }}
                    >
                        <video
                            ref={(el) => { videoRefs.current[i] = el; }}
                            autoPlay
                            loop
                            muted
                            playsInline
                            src={src}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                opacity: PHOTO_OPACITY,
                                filter: "grayscale(100%)",
                                pointerEvents: "none",
                                userSelect: "none",
                            }}
                            draggable={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}