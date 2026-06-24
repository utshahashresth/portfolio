"use client";

import { useState } from "react";

interface NavLinkProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
}

function NavLink({ children, style }: NavLinkProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <span
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: "relative",
                cursor: "pointer",
                pointerEvents: "auto",
                display: "inline-block",
                color: hovered ? "#1a1a1a" : undefined,
                transition: "color 0.25s ease",
                ...style,
            }}
        >
            {children}
            {/* sliding underline */}
            <span
                style={{
                    position: "absolute",
                    bottom: "-2px",
                    left: 0,
                    width: hovered ? "100%" : "0%",
                    height: "1px",
                    background: "currentColor",
                    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "block",
                }}
            />
        </span>
    );
}

function NavName() {
    const [hovered, setHovered] = useState(false);

    return (
        <span
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                fontWeight: 500,
                pointerEvents: "auto",
                cursor: "default",
                color: hovered ? "#555" : "#1a1a1a",
                transition: "color 0.25s ease",
            }}
        >
            Utshaha Shrestha
        </span>
    );
}

export default function NavBar() {
    return (
        <>
            <nav
                className="hero-nav"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    fontFamily: "var(--font-roboto-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.01em",
                    color: "#1a1a1a",
                    padding: "20px 20px",
                    pointerEvents: "none",
                }}
            >
                <NavName />
                <span
                    className="nav-role"
                    style={{ color: "#888", fontWeight: 400, pointerEvents: "none" }}
                >
                    Frontend Developer
                </span>
                <div style={{ display: "flex", gap: "1.5em", pointerEvents: "auto" }}>
                    <NavLink>Work</NavLink>
                    <NavLink>Archive</NavLink>
                </div>
            </nav>
            <style>{`
        @media (max-width: 480px) {
          .hero-nav {
            padding: 16px !important;
          }
          .nav-role {
            display: none;
          }
        }
      `}</style>
        </>
    );
}