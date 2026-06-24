"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const VIDEOS = ["/videos/1.mp4", "/videos/2.mp4", "/videos/5.mp4", "/videos/4.mp4", "/videos/3.mp4", "/videos/6.mp4", "/videos/7.mp4"];

const CARD_W = 160;
const CARD_H = 200;
const MOBILE_CARD_W = 100;
const MOBILE_CARD_H = 125;
const PHOTO_OPACITY = 0.75;

const SCATTER_TARGETS = [
    { leftPct: 0.10, topPct: 0.08 },
    { leftPct: 0.60, topPct: 0.08 },
    { leftPct: 0.31, topPct: 0.40 },
    { leftPct: 0.09, topPct: 0.70 },
    { leftPct: 0.74, topPct: 0.70 },
    { leftPct: 0.84, topPct: 0.42 },
    { leftPct: 0.5, topPct: 0.70 },
];

const MOBILE_SCATTER_TARGETS = [
    { leftPct: 0.04, topPct: 0.05 },
    { leftPct: 0.60, topPct: 0.04 },
    { leftPct: 0.02, topPct: 0.36 },
    { leftPct: 0.64, topPct: 0.34 },
    { leftPct: 0.24, topPct: 0.58 },
    { leftPct: 0.60, topPct: 0.62 },
    { leftPct: 0.04, topPct: 0.68 },
];

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
    const scatteredRef = useRef(false);
    // Store the base y offset per card so hover lift adds on top
    const baseOffsetsRef = useRef<{ x: number; y: number }[]>([]);

    // Push cards below the screen on mount
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
        baseOffsetsRef.current = offsets;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Phase 1: rise to centre
        tl.to(cards, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
        });

        // Phase 2: scatter
        tl.to(
            cards,
            {
                x: (i: number) => offsets[i].x,
                y: (i: number) => offsets[i].y,
                duration: 0.75,
                ease: "power2.out",
                stagger: { each: 0.07, from: "center" },
                onComplete: () => { scatteredRef.current = true; },
            },
            "-=0.2"
        );

        // Phase 3: heading colour reveal
        if (headingRef?.current) {
            tl.to(
                headingRef.current,
                { color: "#1a1a1a", duration: 0.5, ease: "power2.out" },
                "-=0.4"
            );
        }

        return () => { tl.kill(); };
    }, [shouldAnimate]); // eslint-disable-line react-hooks/exhaustive-deps

    // Hover handlers — lift card up, reveal colour, restore on leave
    function handleEnter(i: number) {
        if (!scatteredRef.current) return;
        const card = cardRefs.current[i];
        if (!card) return;
        const base = baseOffsetsRef.current[i];
        gsap.to(card, {
            y: base.y - 10,
            scale: 1.04,
            filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.18))",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
        });
        // also de-greyscale on hover
        const video = videoRefs.current[i];
        if (video) gsap.to(video, { filter: "grayscale(0%)", opacity: 1, duration: 0.3, ease: "power2.out" });
    }

    function handleLeave(i: number) {
        if (!scatteredRef.current) return;
        const card = cardRefs.current[i];
        if (!card) return;
        const base = baseOffsetsRef.current[i];
        gsap.to(card, {
            y: base.y,
            scale: 1,
            filter: "drop-shadow(0 0px 0px rgba(0,0,0,0))",
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
        });
        const video = videoRefs.current[i];
        if (video) gsap.to(video, { filter: "grayscale(100%)", opacity: PHOTO_OPACITY, duration: 0.4, ease: "power3.out" });
    }

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
            <div style={{ position: "relative", width: CARD_W, height: CARD_H }}>
                {VIDEOS.map((src, i) => (
                    <div
                        key={i}
                        ref={(el) => { cardRefs.current[i] = el; }}
                        onMouseEnter={() => handleEnter(i)}
                        onMouseLeave={() => handleLeave(i)}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: CARD_W,
                            height: CARD_H,
                            overflow: "hidden",
                            opacity: 0,
                            willChange: "transform, opacity, filter",
                            cursor: "none",
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