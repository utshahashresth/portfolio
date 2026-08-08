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

        // matchMedia auto-reverts/rebuilds the pinned scroll as the viewport
        // crosses 768px, so resizing or rotating a device doesn't leave the
        // GSAP transform fighting the mobile column layout.
        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            const scrollDist = () => track.scrollWidth - window.innerWidth;

            gsap.to(track, {
                x: () => -scrollDist(),
                ease: "none",
                scrollTrigger: {
                    id: "hscroll",
                    trigger: wrap,
                    start: "top top",
                    end: () => `+=${scrollDist()}`,
                    scrub: 1.2,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });

            ScrollTrigger.refresh();
        });

        return () => mm.revert();
    }, []);

    return (
        <div ref={wrapRef} className="h-scroll-wrap">
            <div ref={trackRef} className="h-scroll-track">
                {children}
            </div>
        </div>
    );
}