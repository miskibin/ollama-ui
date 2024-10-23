"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  Trash2,
  Settings,
  Database,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Crown,
  Star,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import ChatSettings from "./chat-settings";
import { useChatStore } from "@/lib/store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function AppSidebar() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { clearMessages, patrons, plugins, togglePlugin } = useChatStore();
  const [isPatron, setIsPatron] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsPatron(user?.email ? patrons.includes(user.email) : false);
  }, [user, patrons]);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-3 md:px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Ustawienia</span>
          </div>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-8 w-8"
              aria-label="Przełącz motyw"
            >
              {theme === "light" ? (
                <Moon className="h-6 w-6" />
              ) : (
                <Sun className="h-6 w-6" />
              )}
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <SidebarGroup>
            <div className="space-y-2 p-3 md:p-4">
              {plugins.map((plugin) => (
                <div
                  key={plugin.name}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    {plugin.name}
                  </span>
                  <Switch
                    checked={plugin.enabled}
                    onCheckedChange={() => togglePlugin(plugin.name)}
                  />
                </div>
              ))}
            </div>
          </SidebarGroup>
          <Separator />
          <SidebarGroup>
            <div className="p-3 md:p-4 space-y-4">
              {!isPatron ? (
                <>
                  <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Każde zapytanie do AI wiąże się z kosztami, które ponoszę.
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          Zostań patronem i zyskaj:
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          • Dostęp do zaawansowanych modeli AI
                        </li>
                        <li className="flex items-center gap-2">
                          • Nielimitowane zapytania
                        </li>
                      </ul>
                      <Link
                        target="_blank"
                        href="https://patronite.pl/sejm-stats"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/90 text-sm font-medium"
                      >
                        Wesprzyj projekt
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Crown className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        Status Patrona
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        Zaawansowane modele
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        Brak limitów zapytań
                      </li>
                    </ul>
                    <div className="text-sm text-muted-foreground">
                      Dziękuję za wsparcie projektu!
                    </div>
                  </CardContent>
                </Card>
              )}
              <ChatSettings />
            </div>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-3 md:p-4 border-t">
        <Button
          onClick={clearMessages}
          variant="destructive"
          className="w-full text-sm"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Wyczyść historię
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
