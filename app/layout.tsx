import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { UserProvider } from "@auth0/nextjs-auth0/client";
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
    "Inteligentny asystent do analizy danych Sejmu Rzeczypospolitej Polskiej",
  keywords: [
    "Asystent",
    "RP",
    "sejm-stats",
    "Sejm",
    "Polska",
    "AI",
    "Analiza danych",
    "Polityka",
  ],
  authors: [{ name: "Michał Skibiński" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <UserProvider>
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
      </UserProvider>
    </html>
  );
}
