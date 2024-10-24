"use client";

import React, { useState, useEffect } from "react";
import { ChatCard } from "@/components/chatCard";
import { ChatProvider } from "./ChatContext";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function Home() {
  const { user, error, isLoading } = useUser();
  const isDev = process.env.NODE_ENV === "development";
  const [windowHeight, setWindowHeight] = useState("100dvh");

  useEffect(() => {
    const handleResize = () => {

      setWindowHeight(`${window.innerHeight}px`);
    };

    setWindowHeight(`${window.innerHeight}px`);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isDev) {
    if (isLoading) {
      return (
        <div
          className="flex items-center justify-center"
          style={{ height: windowHeight }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium">Ładowanie...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className="flex items-center justify-center p-4"
          style={{ height: windowHeight }}
        >
          <div className="text-center">
            <p className="text-lg font-medium text-red-500 mb-4">
              Błąd: {error.message}
            </p>
            <Link href="/api/auth/login">
              <Button>Spróbuj ponownie</Button>
            </Link>
          </div>
        </div>
      );
    }

    if (!user && !isDev) {
      return (
        <div
          className="flex items-center justify-center p-4"
          style={{ height: windowHeight }}
        >
          <div className="text-center">
            <p className="mb-4">
              Musisz być zalogowany, aby uzyskać dostęp do tej strony.
            </p>
            <Link href="/api/auth/login">
              <Button>Zaloguj się</Button>
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <ChatProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex-grow overflow-auto">
          <ChatCard />
        </div>
      </div>
    </ChatProvider>
  );
}
