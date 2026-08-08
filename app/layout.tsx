import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import PageLoaderProvider from "@/components/PageLoaderProvider";
import NavBar from "@/components/NavBar";

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
        <NavBar />
        <PageLoaderProvider>{children}</PageLoaderProvider>
      </body>
    </html>
  );
}