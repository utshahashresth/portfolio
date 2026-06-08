"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
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
                    id: "hscroll",
                    trigger: wrap,
                    start: "top top",
                    end: () => `+=${scrollDist()}`,
                    scrub: 1.2,        // ← higher = smoother/lazier follow (was 1)
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });
        });

        return () => ctx.revert();
    }, []);

    // Re-measure after first paint; layout shifts from fonts/images can skew scrollWidth
    useEffect(() => {
        ScrollTrigger.refresh();
    }, []);

    return (
        <div ref={wrapRef} style={{ overflow: "hidden", height: "100vh" }}>
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