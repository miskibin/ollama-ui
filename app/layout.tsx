import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Asystent RP",
  description:
    "Inteligentny asystent do analizy polskiego prawa oraz danych Sejmu Rzeczypospolitej Polskiej",
  keywords: [
    "Asystent",
    "RP",
    "sejm-stats",
    "Sejm",
    "Polska",
    "AI",
    "Analiza danych",
    "Polityka",
    "Prawo",
    "Ustawy",
    "Akty prawne",
    "Polski parlament",
    "Sztuczna inteligencja",
    "Analiza prawa",
    "Legislacja",
    "Interpelacje poselskie",
    "Głosowania sejmowe",
    "Komisje parlamentarne",
  ],
  authors: [
    {
      name: "Michał Skibiński",
      url: "https://github.com/miskibin",
    },
  ],
  creator: "Michał Skibiński",
  publisher: "sejm-stats.pl",
  applicationName: "Asystent RP",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  category: "legal",
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://chat.sejm-stats.pl",
    siteName: "Asystent RP",
    title: "Asystent RP - Inteligentny asystent prawny",
    description:
      "Analizuj polskie prawo i dane Sejmu RP z pomocą sztucznej inteligencji",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asystent RP - Inteligentny asystent prawny",
    description:
      "Analizuj polskie prawo i dane Sejmu RP z pomocą sztucznej inteligencji",
    creator: "@sejm-stats",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://chat.sejm-stats.pl",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Asystent RP",
  },
  formatDetection: {
    telephone: false,
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-200 dark:bg-gray-800`}
      >
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  );
}
