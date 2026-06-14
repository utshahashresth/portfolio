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
        if (window.innerWidth < 768) return;

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
                    scrub: 1.2,
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
        if (window.innerWidth >= 768) ScrollTrigger.refresh();
    }, []);

    return (
        <div ref={wrapRef} className="h-scroll-wrap">
            <div ref={trackRef} className="h-scroll-track">
                {children}
            </div>
        </div>
    );
}