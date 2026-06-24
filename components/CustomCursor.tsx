"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch

        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return;

        // Start offscreen
        gsap.set([dot, ring], { x: -100, y: -100 });

        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;

        // Dot follows instantly; ring lerps behind
        const onMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.set(dot, { x: mouseX - 3, y: mouseY - 3 });
        };

        // Ring lerps on RAF for smooth lag
        let raf: number;
        const loop = () => {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            gsap.set(ring, { x: ringX - 18, y: ringY - 18 });
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        // Scale ring up when hovering a card
        const onEnterCard = () => {
            gsap.to(ring, { scale: 2.2, opacity: 0.5, duration: 0.3, ease: "power2.out" });
            gsap.to(dot, { scale: 0, duration: 0.2, ease: "power2.out" });
        };
        const onLeaveCard = () => {
            gsap.to(ring, { scale: 1, opacity: 1, duration: 0.35, ease: "power3.out" });
            gsap.to(dot, { scale: 1, duration: 0.25, ease: "power3.out" });
        };

        window.addEventListener("mousemove", onMove);

        // Delegate to card elements
        const attachCardListeners = () => {
            document.querySelectorAll(".card-shuffle div[style*='cursor: none'], .card-shuffle div[style*='cursor:none']").forEach((el) => {
                el.addEventListener("mouseenter", onEnterCard);
                el.addEventListener("mouseleave", onLeaveCard);
            });
        };

        // Attach after cards are rendered
        const observer = new MutationObserver(attachCardListeners);
        observer.observe(document.body, { childList: true, subtree: true });
        attachCardListeners();

        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(raf);
            observer.disconnect();
        };
    }, []);

    return (
        <>
            {/* Dot */}
            <div
                ref={dotRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#1a1a1a",
                    pointerEvents: "none",
                    zIndex: 99999,
                    willChange: "transform",
                }}
            />
            {/* Ring */}
            <div
                ref={ringRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid #1a1a1a",
                    pointerEvents: "none",
                    zIndex: 99998,
                    willChange: "transform",
                    opacity: 0.6,
                }}
            />
        </>
    );
}