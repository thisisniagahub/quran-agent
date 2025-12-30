import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Amiri } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-jakarta',
  display: 'swap',
});

const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ["arabic"],
  variable: '--font-amiri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Quran Pulse | AI Tajweed Assistant",
  description: "Perfect your recitation with AI-powered analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${amiri.variable} antialiased bg-bg-ocean font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
