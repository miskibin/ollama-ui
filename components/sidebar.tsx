import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Moon, Sun, X, Trash2, Settings, Database } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import ChatSettings from "./chat-settings";
import { useChatStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isMobile: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobile, onClose }: SidebarProps) {
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
    <Card
      className={`h-full flex flex-col ${
        isMobile ? "w-[85vw] max-w-[400px]" : "w-96"
      }`}
    >
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="flex items-center justify-between">
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
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close sidebar"
                className="text-muted-foreground hover:text-primary"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-auto space-y-6 pt-8">
        <div className="space-y-12">
          {plugins.map((plugin) => (
            <div
              key={plugin.name}
              className={`flex items-center justify-between 
              ${plugin.enabled ? "bg-primary/10" : "bg-secondary/50"}
               p-3 rounded-lg`}
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
          {!isPatron && (
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <p className="text-sm text-primary font-medium">
                <Link
                  href="https://patronite.pl/sejm-stats"
                  className="text-primary font-semibold hover:underline"
                >
                  Zostań patronem
                </Link>
                , aby korzystać z płatnych modeli i dodatkowych funkcji.
              </p>
            </div>
          )}
        </div>

        <ChatSettings />
      </CardContent>

      <CardFooter className="flex-shrink-0 pt-4">
        <Button
          onClick={clearMessages}
          className="w-full text-sm"
          variant="destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Usuń historię
        </Button>
      </CardFooter>
    </Card>
  );
}
