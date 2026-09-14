import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompta aut perire — AI at work, properly taught",
  description:
    "A 2–4 week program that turns ChatGPT, Claude and Gemini into a system that runs your actual work. Lessons, comprehension checks, homework on your own tasks, and personal review. 500+ graduates.",
  openGraph: {
    title: "Prompta aut perire — AI at work, properly taught",
    description:
      "Not a folder of videos. Lessons, checks, homework on your real tasks and personal review — in 2–4 weeks.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#070b18",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
