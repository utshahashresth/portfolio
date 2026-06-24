"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const CURSOR_COLOR = "#E8611A";

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const cursor = cursorRef.current;
        if (!cursor) return;

        gsap.set(cursor, { x: -100, y: -100, opacity: 0, scale: 1 });

        const setX = gsap.quickSetter(cursor, "x", "px");
        const setY = gsap.quickSetter(cursor, "y", "px");

        let targetX = -100;
        let targetY = -100;
        let currentX = -100;
        let currentY = -100;
        let visible = false;

        const onMove = (e: MouseEvent) => {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!visible) {
                gsap.to(cursor, { opacity: 1, duration: 0.3 });
                visible = true;
            }
        };

        const onLeave = () => {
            gsap.to(cursor, { opacity: 0, duration: 0.3 });
            visible = false;
        };

        const onEnter = () => {
            gsap.to(cursor, {
                scale: 3.5,
                opacity: 0.15,
                duration: 0.4,
                ease: "power3.out",
            });
        };

        const onLeaveEl = () => {
            gsap.to(cursor, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: "power3.out",
            });
        };

        const tick = () => {
            currentX += (targetX - currentX) * 0.1;
            currentY += (targetY - currentY) * 0.1;
            setX(currentX);
            setY(currentY);
        };

        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        window.addEventListener("mousemove", onMove);
        document.addEventListener("mouseleave", onLeave);

        const attach = () => {
            document.querySelectorAll("a, button, [data-cursor-hover], .card-shuffle div").forEach((el) => {
                el.addEventListener("mouseenter", onEnter);
                el.addEventListener("mouseleave", onLeaveEl);
            });
        };

        const observer = new MutationObserver(attach);
        observer.observe(document.body, { childList: true, subtree: true });
        attach();

        return () => {
            gsap.ticker.remove(tick);
            window.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseleave", onLeave);
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            style={{
                position: "fixed",
                top: -6,
                left: -6,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: CURSOR_COLOR,
                pointerEvents: "none",
                zIndex: 99999,
                willChange: "transform",
            }}
        />
    );
}