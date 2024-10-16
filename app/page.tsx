"use client";
import React from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatCard } from "@/components/chatCard";
import { ChatProvider } from "./ChatContext";
import { PromptTestDialog } from "@/components/createTestDialog";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { user, error, isLoading } = useUser();

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
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500 mb-4">
            Błąd: {error.message}
          </p>
          <Link href="/api/auth/login">Spróbuj ponownie</Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">
            Musisz być zalogowany, aby uzyskać dostęp do tej strony.
          </p>
          <Button>
            <Link href="/api/auth/login">Zaloguj się</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="flex h-screen gap-2">
        <Sidebar />
        <div className="flex-1 max-h-full flex flex-col">
          <ChatCard />
        </div>
      </div>
      <PromptTestDialog />
    </ChatProvider>
  );
}
