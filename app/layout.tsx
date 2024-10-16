import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { UserProvider } from "@auth0/nextjs-auth0/client";

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
  title: "Sejm stats assistant",
  description:
    "A simple and powerful UI for interacting with the Ollama API, enabling seamless AI-powered conversations and tasks.",
  keywords: [
    "Ollama",
    "AI",
    "chatbot",
    "natural language processing",
    "machine learning",
  ],
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
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
          </ThemeProvider>
          <Analytics />
          <Toaster />
        </body>
      </UserProvider>
    </html>
  );
}
