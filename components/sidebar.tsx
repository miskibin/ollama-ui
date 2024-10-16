import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import ChatSettings from "./chat-settings";
interface SidebarProps {
  isMobile: boolean;
  onClose: () => void;
}
export function Sidebar({ isMobile, onClose }: SidebarProps) {
  const { setTheme, theme } = useTheme();

  return (
    <Card
      className={`h-full overflow-auto ${
        isMobile ? "w-full" : "w-96 md:max-w-80"
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/ollama.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <h2 className="text-lg font-semibold">Aststent RP</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <div className="p-4">
        <ChatSettings />
      </div>
    </Card>
  );
}
