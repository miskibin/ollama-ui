import React, { useState, useEffect } from "react";
import { ChatCard } from "@/components/chatCard";
import { ChatProvider } from "./ChatContext";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Mail, Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const handleOAuthSignIn = async (provider: "google" | "discord") => {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  if (loading) {
    return (
      <div
        className="grid place-items-center w-full"
        style={{ height: windowHeight }}
      >
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Ładowanie...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="grid place-items-center w-full px-4"
        style={{ height: windowHeight }}
      >
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Zaloguj się</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => handleOAuthSignIn("google")}
              variant="outline"
              className="w-full"
            >
              <Mail className="mr-2 h-5 w-5" />
              Zaloguj się przez Google
            </Button>
            <Button
              onClick={() => handleOAuthSignIn("discord")}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
            >
              <Lock className="mr-2 h-5 w-5" />
              Zaloguj się przez Discord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ChatProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <div className="flex flex-col h-[100dvh] overflow-hidden">
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
