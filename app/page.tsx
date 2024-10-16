"use client";
import React, { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatCard } from "@/components/chatCard";
import { ChatProvider } from "./ChatContext";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ChatHeader from "@/components/header";

export default function Home() {
  const { user, error, isLoading } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev) {
    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium">Ładowanie...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-screen items-center justify-center p-4">
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
        <div className="flex h-screen items-center justify-center p-4">
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
      <div className="flex flex-col h-screen">
        <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
          <div
            className={`absolute md:relative z-20 h-full md:h-auto transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 md:w-80 md:flex-shrink-0`}
          >
            <Sidebar
              isMobile={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
          <div className="flex-1 flex flex-col w-full md:w-auto">
            <ChatHeader
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <div className="flex-1 overflow-hidden">
              <ChatCard />
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
