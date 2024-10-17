import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import ChatSettings from "./chat-settings";
import { useChatStore } from "@/lib/store";
import { getPatrons } from "@/lib/get-patronite-users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

interface SidebarProps {
  isMobile: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobile, onClose }: SidebarProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { models, selectedModel, setSelectedModel, patrons, setPatrons } =
    useChatStore();
  const [isPatron, setIsPatron] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchPatrons = async () => {
      const patronList = await getPatrons();
      setPatrons(patronList);
      setIsPatron(user && user.email ? patronList.includes(user.email) : false);
    };

    fetchPatrons();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, onClose, setPatrons, user]);

  const handleModelChange = (value: string) => {
    if (isPatron) {
      setSelectedModel(value);
    }
  };

  return (
    <Card
      ref={sidebarRef}
      className={`h-full overflow-auto ${
        isMobile ? "w-[85vw] max-w-[400px]" : "w-96"
      } md:w-96`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2 ">
            <h2 className="text-lg font-semibold text-red-500">Wersja beta</h2>
          </div>
          <div className="flex items-center space-x-2">
            {mounted && (
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
            )}
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

      <div className="p-4 md:px-4 px-0 ">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Wybierz model</h3>
          <Select
            onValueChange={handleModelChange}
            value={selectedModel}
            disabled={!isPatron}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model.split("/")[1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isPatron && (
            <p className="text-sm text-muted-foreground mt-2">
              Zostań{" "}
              <Link
                href="https://patronite.pl/sejm-stats"
                className="text-primary hover:underline"
              >
                patronem
              </Link>
              , aby uzyskać dostęp do wyboru modelu
            </p>
          )}
        </div>
        <ChatSettings />
      </div>
    </Card>
  );
}
