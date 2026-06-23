"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function IntroSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const labelRef = useRef<HTMLParagraphElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const bodyRef = useRef<HTMLParagraphElement>(null);

    useLayoutEffect(() => {
        const section = sectionRef.current;
        const els = [labelRef.current, headingRef.current, bodyRef.current].filter(Boolean) as HTMLElement[];
        if (!section || !els.length) return;

        const timeout = setTimeout(() => {
            const hscroll = ScrollTrigger.getById("hscroll");

            const ctx = gsap.context(() => {
                if (hscroll) {
                    // Desktop: animate as panel scrolls into view horizontally
                    gsap.fromTo(
                        els,
                        { x: 60, opacity: 0 },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 1,
                            ease: "power3.out",
                            stagger: 0.15,
                            scrollTrigger: {
                                containerAnimation: hscroll.animation ?? undefined,
                                trigger: section,
                                start: "left 75%",
                                end: "left 25%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                } else {
                    // Mobile: animate as panel scrolls into view vertically
                    gsap.fromTo(
                        els,
                        { y: 40, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.9,
                            ease: "power3.out",
                            stagger: 0.15,
                            scrollTrigger: {
                                trigger: section,
                                start: "top 80%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                }
            });

            return () => ctx.revert();
        }, 100);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                width: "100vw",
                minHeight: "100vh",
                height: "100vh",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                padding: "80px clamp(20px, 10vw, 10vw)",
                background: "#F8F3F4",
                boxSizing: "border-box",
            }}
        >
            <div style={{ maxWidth: 600, width: "100%" }}>
                <p
                    ref={labelRef}
                    style={{
                        fontFamily: "var(--font-geist-sans)",
                        fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
                        color: "#888",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        marginBottom: "1.5rem",
                        opacity: 0,
                    }}
                >
                    About
                </p>
                <h2
                    ref={headingRef}
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                        lineHeight: 1.05,
                        letterSpacing: "-0.02em",
                        color: "#1a1a1a",
                        marginBottom: "2rem",
                        opacity: 0,
                    }}
                >
                    Frontend developer crafting thoughtful digital experiences.
                </h2>
                <p
                    ref={bodyRef}
                    style={{
                        fontFamily: "var(--font-geist-sans)",
                        fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)",
                        color: "#555",
                        lineHeight: 1.7,
                        maxWidth: 480,
                        opacity: 0,
                    }}
                >
                    Based in Kathmandu. I build interfaces that balance craft with function —
                    clean code, considered motion, and details that matter.
                </p>
            </div>
        </section>
    );
}