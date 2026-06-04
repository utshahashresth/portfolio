"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// ─── config ───────────────────────────────────────────────────────────────────
const PHOTOS = [
    "1.jpg",
    "2.jpg",
    "3.jpg",
    "4.jpg",
    "5.jpg",
    "6.jpg",
    "7.jpg",
    "8.jpg",
];

const DEAL_INTERVAL = 480;
const DEAL_DELAY = 400;
const CARD_W = 170;
const CARD_H = 170;
const PHOTO_OPACITY = 0.72;

// ─── scatter system ───────────────────────────────────────────────────────────
// viewport is split into a wide grid of cells
// cards land anywhere in that grid with randomness within each cell
// result: always fully scattered, never clustered

const GRID_COLS = 4;
const GRID_ROWS = 3;
// how far the grid spreads from center (px) — covers full screen generously
const SPREAD_X = 780;
const SPREAD_Y = 340;
// how much random offset within each cell
const JITTER_X = 25;
const JITTER_Y = 18;
const MAX_ROTATE = 12;

function buildGrid() {
    const cells: { cx: number; cy: number }[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            cells.push({
                cx: -SPREAD_X + (col / (GRID_COLS - 1)) * SPREAD_X * 2,
                cy: -SPREAD_Y + (row / (GRID_ROWS - 1)) * SPREAD_Y * 2,
            });
        }
    }
    return cells;
}

function generatePositions(count: number) {
    const grid = buildGrid();
    // shuffle grid cells so every reload is different
    const shuffled = [...grid].sort(() => Math.random() - 0.5);
    // if more photos than cells, wrap around
    return Array.from({ length: count }, (_, i) => {
        const cell = shuffled[i % shuffled.length];
        return {
            x: cell.cx + (Math.random() - 0.5) * JITTER_X * 2,
            y: cell.cy + (Math.random() - 0.5) * JITTER_Y * 2,
            rotate: (Math.random() - 0.5) * MAX_ROTATE * 2,
        };
    });
}

interface CardShuffleProps {
    className?: string;
}

export default function CardShuffle({ className = "" }: CardShuffleProps) {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [dealt, setDealt] = useState<boolean[]>(Array(PHOTOS.length).fill(false));
    const positions = useRef(generatePositions(PHOTOS.length));

    useEffect(() => {
        const cards = cardRefs.current;
        if (!cards.length) return;

        cards.forEach((card, i) => {
            if (!card) return;
            gsap.set(card, {
                x: 0,
                y: 0,
                rotate: (i - Math.floor(PHOTOS.length / 2)) * 0.8,
                scale: 1 - i * 0.008,
                zIndex: PHOTOS.length - i,
                opacity: 1,
            });
        });

        const timers: ReturnType<typeof setTimeout>[] = [];

        PHOTOS.forEach((_, i) => {
            const t = setTimeout(() => {
                const card = cards[i];
                if (!card) return;

                const pos = positions.current[i];

                gsap.timeline()
                    .to(card, {
                        y: -14,
                        scale: 1.015,
                        duration: 0.35,
                        ease: "sine.out",
                    })
                    .to(card, {
                        x: pos.x,
                        y: pos.y,
                        rotate: pos.rotate,
                        scale: 1,
                        duration: 0.85,
                        ease: "power1.inOut",
                        zIndex: PHOTOS.length + i,
                    })
                    .to(card, {
                        y: pos.y + 5,
                        rotate: pos.rotate - 0.4,
                        duration: 0.4,
                        ease: "sine.inOut",
                    }, "-=0.25");

                setDealt(prev => {
                    const next = [...prev];
                    next[i] = true;
                    return next;
                });
            }, DEAL_DELAY + i * DEAL_INTERVAL);

            timers.push(t);
        });

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div
            className={className}
            style={{
                position: "relative",
                width: "100%",
                minHeight: "700px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "visible",
            }}
        >
            <div style={{ position: "relative", width: CARD_W, height: CARD_H }}>
                {PHOTOS.map((src, i) => (
                    <div
                        key={i}
                        ref={el => { cardRefs.current[i] = el; }}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: CARD_W,
                            height: CARD_H,
                            borderRadius: "0px",
                            overflow: "hidden",
                            boxShadow: dealt[i]
                                ? "0 16px 48px rgba(0,0,0,0.18), 0 2px 10px rgba(0,0,0,0.08)"
                                : "0 4px 16px rgba(0,0,0,0.14)",
                            cursor: "default",
                            willChange: "transform",
                            transition: "box-shadow 0.6s ease",
                        }}
                    >
                        <img
                            src={src}
                            alt={`Photo ${i + 1}`}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                opacity: PHOTO_OPACITY,
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