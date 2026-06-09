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
      className={`${geistSans.variable} ${geistMono.variable} ${romanSerif.variable} antialiased`}
    >
      <body>
        <PageLoaderProvider>{children}</PageLoaderProvider>
      </body>
    </html>
  );
}
