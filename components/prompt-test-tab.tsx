"use client";
import React from "react";
import { useChatContext } from "@/app/ChatContext";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { PlusCircle, Edit, Trash2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Test } from "@/lib/types";

export const TestsTab = () => {
  const {
    promptTests,
    addTest,
    setIsPromptDialogOpen,
    removeTest,
    runTest,
    setCurrentTest,
    updateTest,
    messages,
  } = useChatContext();

  const handleToggleTest = (id: string, enabled: boolean) => {
    updateTest(id, { enabled });
  };

  const handleRunTest = async (test: Test) => {
    const lastAssistantMessage = messages
      .slice()
      .reverse()
      .find((message) => message.role === "assistant");
    const lastUserMessage =
      messages
        .slice()
        .reverse()
        .find((message) => message.role === "user")?.content || "";
    const lastModelResponse = lastAssistantMessage?.content || "";
    runTest(test, lastUserMessage, lastModelResponse);
  };

  const getBorderColor = (result?: "pass" | "fail" | "error") => {
    switch (result) {
      case "pass":
        return "border-green-500";
      case "fail":
        return "border-red-500";
      case "error":
        return "border-yellow-500";
      default:
        return "border-gray-200";
    }
  };
  return (
    <CardContent className="space-y-6 relative pb-16">
      <div className="space-y-4">
        {promptTests.map((test) => (
          <Card
            key={test.id}
            className={cn(
              "p-4 shadow-sm border-2",
              getBorderColor(test.result)
            )}
          >
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{test.condition}</h4>
                <Switch
                  checked={test.enabled}
                  onCheckedChange={(checked) =>
                    handleToggleTest(test.id, checked)
                  }
                />
              </div>
              <p className="text-sm">
                <span className="font-semibold">Model:</span> {test.model}
              </p>
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTest(test.id)}
                  className="text-red-500 hover:text-red-700 p-0"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRunTest(test)}
                    title="Run Test"
                  >
                    <Play className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setCurrentTest(test);
                      setIsPromptDialogOpen(true);
                    }}
                    title="Edit Test"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Button
        onClick={() => setIsPromptDialogOpen(true)}
        className="absolute bottom-4 left-4 right-4 text-white"
        variant="default"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Create Criteria evaluation
      </Button>
    </CardContent>
  );
};
