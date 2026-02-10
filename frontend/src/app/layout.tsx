import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RZ Social — by Rabia Zulfiqar",
  description: "A full-stack social media platform built by Rabia Zulfiqar — showcasing FastAPI backend with Next.js frontend",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
