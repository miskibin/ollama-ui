"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  X,
  Trash2,
  Settings,
  Database,
  ChevronRight,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold text-primary">
              Ustawienia
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                aria-label="Toggle theme"
                className="text-muted-foreground hover:text-primary"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <SidebarGroup>
            <div className="space-y-4 p-4">
              {plugins.map((plugin) => (
                <div
                  key={plugin.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
                >
                  <span className="text-sm font-medium flex items-center">
                    <Database className="w-4 h-4 mr-2 text-primary" />
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
          <Separator className="my-4" />
          <SidebarGroup>
            <div className="p-4">
              {!isPatron && (
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-4">
                  <p className="text-sm text-primary font-medium">
                    <Link
                      href="https://patronite.pl/sejm-stats"
                      className="text-primary font-semibold hover:underline"
                    >
                      Zostań patronem
                    </Link>
                    , aby korzystać z płatnych modeli.
                  </p>
                </div>
              )}
              <ChatSettings />
            </div>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button
          onClick={clearMessages}
          className="w-full text-sm"
          variant="destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Usuń historię
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
