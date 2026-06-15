import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import PageLoaderProvider from "@/components/PageLoaderProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const romanSerif = localFont({
  src: [
    { path: "../public/fonts/RomanSerif.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/RomanSerif-Oblique.ttf", weight: "400", style: "oblique" },
  ],
  variable: "--font-display",
});

const robotoMono = localFont({
  src: "../public/fonts/RobotoMono-VariableFont_wght.ttf",
  variable: "--font-roboto-mono",
  weight: "100 700",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${romanSerif.variable} ${robotoMono.variable} antialiased`}
    >
      <body>
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
            padding: "28px 32px",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontWeight: 500, pointerEvents: "auto" }}>Utshaha Shrestha</span>
          <span style={{ color: "#888", fontWeight: 400, pointerEvents: "auto" }}>Frontend Developer</span>
          <span style={{ fontWeight: 400, pointerEvents: "auto" }}>Work, Archive</span>
        </nav>
        <PageLoaderProvider>{children}</PageLoaderProvider>
      </body>
    </html>
  );
}
