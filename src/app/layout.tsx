import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import { SiteHeader } from "@/features/shell/site-header";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Uplift",
    template: "%s · Uplift",
  },
  description: "Plan npm dependency upgrades with real registry data.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#16171d" },
  ],
};

export default function RootLayout({ children, drawer }: { children: ReactNode; drawer: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh">
        <Providers>
          <SiteHeader />
          {children}
          <Suspense fallback={null}>{drawer}</Suspense>
        </Providers>
      </body>
    </html>
  );
}
