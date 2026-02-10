import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rabia Zulfiqar | Portfolio",
  description:
    "Portfolio of Rabia Zulfiqar — 3rd-year Computer Science student passionate about software engineering, web development, and AI/ML.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
