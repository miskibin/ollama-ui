import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Sun, Moon } from "lucide-react";
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
          <div className="flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-500" />
            Sidebar
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat Settings</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
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
