import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rabia Zulfiqar — Portfolio",
  description:
    "Portfolio of Rabia Zulfiqar, CS student & full-stack developer. Browse projects, leave comments, and like your favorites — powered by a FastAPI + Next.js stack.",
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
