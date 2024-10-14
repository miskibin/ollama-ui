import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Sun, Moon, Cog, TestTube } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestsTab } from "./prompt-test-tab";
import ChatSettings from "./chat-settings";

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <Card className="w-96 h-full overflow-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/ollama.png"
              alt="Logo"
              width={42}
              height={426}
              className="rounded-md "
            />
            <h2 className="text-lg font-semibold">Aststent RP</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="h-6 w-6 text-gray-600" />
            ) : (
              <Sun className="h-6 w-6 text-yellow-400" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid mx-4 grid-cols-2">
          <TabsTrigger value="chat">
            <Cog className="h-4 w-4 mr-2 text-teal-400" />
            Ustawienia
          </TabsTrigger>
          <TabsTrigger value="tests">
            <TestTube className="h-4 w-4 mr-2 text-blue-400" />
            Testy
          </TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <ChatSettings />
        </TabsContent>
        <TabsContent value="tests">
          <TestsTab />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
