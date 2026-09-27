import type { Metadata } from "next";
import { Orbitron, Chakra_Petch, Press_Start_2P } from "next/font/google";
import "./globals.css";

const display = Orbitron({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SPARC — Robotics, Code & Arcade",
  description: "SPARC Student Club — robotics, programming, and a neon arcade of games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${pixel.variable}`}>
        {children}
      </body>
    </html>
  );
}
