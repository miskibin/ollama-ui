"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useChatContext } from "@/app/ChatContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { TestResult } from "@/hooks/useTestLogic";
import { Textarea } from "./ui/textarea";

const SYSTEM_PROMPT = `You are a binary decision-making assistant. Your task is to answer given question with 'Yes' or 'No', nothing else.`;

const TEST_PROMPT_STRUCTURE = `User question: {userPrompt}\n\n
Model answer: {modelResponse}\n\n
{condition}`;

const truncateText = (text: string, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

export function PromptTestDialog() {
  const {
    models,
    messages,
    isRunningTest,
    testResult,
    setIsPromptDialogOpen,
    runTest,
    currentTest,
    addTest,
    updateTest,
    isPromptDialogOpen,
    setCurrentTest,
  } = useChatContext();

  const [condition, setCondition] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [lastUserPrompt, setLastUserPrompt] = useState("");
  const [lastModelResponse, setLastModelResponse] = useState("");

  useEffect(() => {
    if (currentTest) {
      setCondition(currentTest.condition);
      setSelectedModel(currentTest.model);
    } else {
      setCondition("");
      setSelectedModel("");
    }
  }, [currentTest]);

  useEffect(() => {
    const updateLastMessages = () => {
      const lastUserMessage = messages
        .slice()
        .reverse()
        .find((message) => message.role === "user");
      const lastAssistantMessage = messages
        .slice()
        .reverse()
        .find((message) => message.role === "assistant");

      setLastUserPrompt(lastUserMessage?.content || "");
      setLastModelResponse(lastAssistantMessage?.content || "");
    };

    updateLastMessages();
    const intervalId = setInterval(updateLastMessages, 1000);

    return () => clearInterval(intervalId);
  }, [messages]);

  const handleCreateOrUpdateTest = () => {
    if (currentTest) {
      updateTest(currentTest.id, {
        condition,
        model: selectedModel,
      });
    } else {
      addTest({
        systemPrompt: SYSTEM_PROMPT,
        condition,
        model: selectedModel,
        enabled: true,
        id: Date.now().toString(),
      });
    }
    setIsPromptDialogOpen(false);
    setCurrentTest(undefined);
  };

  const handleTestPrompt = async () => {
    if (!selectedModel || !condition) return;

    const testToRun = currentTest || {
      systemPrompt: SYSTEM_PROMPT,
      condition,
      model: selectedModel,
      enabled: true,
      id: Date.now().toString(),
    };

    await runTest(testToRun, lastUserPrompt, lastModelResponse);
  };

  const getResultIcon = (result: TestResult | null) => {
    switch (result) {
      case "pass":
        return <CheckCircle className="text-green-500" />;
      case "fail":
        return <XCircle className="text-red-500" />;
      case "error":
        return <AlertCircle className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const fullPrompt = TEST_PROMPT_STRUCTURE.replace(
    "{userPrompt}",
    lastUserPrompt
  )
    .replace("{modelResponse}", lastModelResponse)
    .replace("{condition}", condition);

  return (
    <Dialog
      open={isPromptDialogOpen}
      onOpenChange={(open) => {
        if (!open) setCurrentTest(undefined);
        setIsPromptDialogOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {currentTest ? "Edit Test" : "Create New Test"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition" className="text-sm font-medium">
                Condition
              </Label>
              <Textarea
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g., Determine if the given text contains exactly 4 sentences. Count complete thoughts ending with '.', '?', or '!'."
                required
                className="mt-1 h-32"
              />
            </div>
            <div>
              <Label htmlFor="model" className="text-sm font-medium">
                Model
              </Label>
              <Select
                value={selectedModel}
                onValueChange={setSelectedModel}
                required
              >
                <SelectTrigger id="model" className="mt-1">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models &&
                    models.map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Test Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">System Prompt</h4>
                  <p className="text-sm text-gray-500">{SYSTEM_PROMPT}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium">Full Prompt</h4>
                  <p className="text-sm text-gray-500 whitespace-pre-wrap">
                    {truncateText(fullPrompt, 300)}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium">Expected Output</h4>
                  <p className="text-sm text-gray-500">Yes or No</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium">Test Result</h4>
                  <div className="flex items-center space-x-2">
                    {getResultIcon(testResult)}
                    <p className="text-sm text-gray-500 capitalize">
                      {testResult || "Not run yet"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleTestPrompt}
                  className="w-full"
                  disabled={isRunningTest}
                >
                  {isRunningTest ? "Running Test..." : "Test Prompt"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Button
          onClick={handleCreateOrUpdateTest}
          className="w-full mt-4"
          disabled={isRunningTest || !selectedModel || !condition}
        >
          {currentTest ? "Update Test" : "Create Criteria evaluation"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export { TEST_PROMPT_STRUCTURE, SYSTEM_PROMPT };
