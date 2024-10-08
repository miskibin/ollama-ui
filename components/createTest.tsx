import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ArrowRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { TestResult } from "@/hooks/useTestLogic";

const truncateText = (text: string, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

export function PromptTestDialog() {
  const { models, messages,isRunningTest, testResult, runTest } = useChatContext();
  const [condition, setCondition] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [open, setOpen] = useState(false);
  const [lastModelResponse, setLastModelResponse] = useState("");

  useEffect(() => {
    const updateLastResponse = () => {
      const lastAssistantMessage = messages
        .slice()
        .reverse()
        .find((message) => message.role === "assistant");

      setLastModelResponse(lastAssistantMessage?.content || "");
    };

    updateLastResponse();
    const intervalId = setInterval(updateLastResponse, 1000);

    return () => clearInterval(intervalId);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel || !condition) return;

    const newTest = {
      systemPrompt: "Respond with one word. True or False",
      condition,
      model: selectedModel,
      id: Date.now().toString(),
    };

    await runTest(newTest, lastModelResponse);
  };

  const getResultIcon = (result: TestResult | null) => {
    switch (result) {
      case "true":
        return <CheckCircle className="text-green-500" />;
      case "false":
        return <XCircle className="text-red-500" />;
      case "invalid":
      case "error":
        return <AlertCircle className="text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create New Test</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create New Prompt Test
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <form onSubmit={handleSubmit} className="space-y-4">
          
            <div>
              <Label htmlFor="condition" className="text-sm font-medium">
                Condition
              </Label>
              <Input
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g., Has positive attitude?"
                required
                className="mt-1"
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
                  {models.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isRunningTest}>
              {isRunningTest ? "Running Test..." : "Run Test"}
            </Button>
          </form>
          <Card>
            <CardHeader>
              <CardTitle>Test Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">System Prompt</h4>
                  <p className="text-sm text-gray-500">
                    Respond only with True or False
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium">Model Response</h4>
                  <p className="text-sm text-gray-500">
                    {truncateText(lastModelResponse, 150) || "No response yet"}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium">Condition</h4>
                  <p className="text-sm text-gray-500">
                    {condition || "No condition set"}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium">Expected Output</h4>
                  <p className="text-sm text-gray-500">True or False</p>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
