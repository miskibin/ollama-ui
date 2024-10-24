"use client";

import React, { useState, useEffect } from "react";
import { ChatCard } from "@/components/chatCard";
import { ChatProvider } from "./ChatContext";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { useRouter } from "next/navigation";

export default function Home() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const isDev = process.env.NODE_ENV === "development";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowHeight, setWindowHeight] = useState("100dvh");

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(`${window.innerHeight}px`);
    };

    setWindowHeight(`${window.innerHeight}px`);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (loading) {
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
          <Button onClick={handleSignIn}>Zaloguj się przez Google</Button>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <div className="flex flex-col h-screen overflow-hidden">
            <Navbar />
            <div className="flex-grow overflow-auto">
              <ChatCard />
            </div>
          </div>
        </main>
      </SidebarProvider>
    </ChatProvider>
  );
}
