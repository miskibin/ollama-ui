"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";

export default function ProfileClient() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Wystąpił nieznany błąd"));
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Błąd</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    user && (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center">Profil Użytkownika</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={
                  user.user_metadata.avatar_url || user.user_metadata.picture
                }
                alt={user.user_metadata.full_name || "Użytkownik"}
              />
              <AvatarFallback>
                {user.user_metadata.full_name
                  ? user.user_metadata.full_name[0].toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">
              {user.user_metadata.full_name || user.email?.split("@")[0]}
            </h2>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <p>{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/" passHref>
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Powrót do Czatu
                </Button>
              </Link>
              <Button
                variant="outline"
                className="mt-4"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Wyloguj się
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  );
}
