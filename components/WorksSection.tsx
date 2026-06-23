export default function WorksSection() {
    return (
        <section
            style={{
                width: "100vw",
                minHeight: "100vh",
                height: "100vh",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                padding: "80px clamp(20px, 10vw, 10vw)",
                background: "#1a1a1a",
                boxSizing: "border-box",
            }}
        >
            <div style={{ maxWidth: 700, width: "100%" }}>
                <p
                    style={{
                        fontFamily: "var(--font-geist-sans)",
                        fontSize: "clamp(0.7rem, 1.5vw, 1.2rem)",
                        color: "#555",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        marginBottom: "1.5rem",
                    }}
                >
                    Work
                </p>
                <h2
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(2rem, 5vw, 4.5rem)",
                        lineHeight: 1.05,
                        letterSpacing: "-0.02em",
                        color: "#F8F3F4",
                        marginBottom: "3rem",
                    }}
                >
                    Selected projects.
                </h2>

                {/* Placeholder project list */}
                {["Project One", "Project Two", "Project Three"].map((title, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            borderTop: "1px solid #333",
                            padding: "1.25rem 0",
                            gap: "1rem",
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(1rem, 2vw, 1.5rem)",
                                color: "#F8F3F4",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {title}
                        </span>
                        <span
                            style={{
                                fontFamily: "var(--font-geist-sans)",
                                fontSize: "11px",
                                color: "#555",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                flexShrink: 0,
                            }}
                        >
                            2026
                        </span>
                    </div>
                ))}
                <div style={{ borderTop: "1px solid #333" }} />
            </div>
        </section>
    );
}