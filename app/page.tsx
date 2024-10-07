"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Send,
  RefreshCw,
  Trash2,
  StopCircle,
  HelpCircle,
  Settings,
  Zap,
  FileText,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatLogic } from "@/hooks/useChatLogic";
import MarkdownResponse from "@/components/markdownResponse";

export default function Home() {
  const {
    input,
    setInput,
    messages,
    isLoading,
    models,
    selectedModel,
    setSelectedModel,
    customTemplate,
    setCustomTemplate,
    options,
    setOptions,
    handleSubmit,
    regenerateResponse,
    clearChat,
    stopGenerating,
    responseMetadata,
  } = useChatLogic();

  const [isPdfParsing, setIsPdfParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsPdfParsing(true);
      const formData = new FormData();
      formData.append("pdf", file);

      try {
        const response = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to parse PDF");
        }

        const { markdown } = await response.json();
        setInput(markdown);
      } catch (error) {
        console.error("Error parsing PDF:", error);
        alert("Failed to parse PDF. Please try again.");
      } finally {
        setIsPdfParsing(false);
      }
    }
  };
  return (
    <div className="flex h-screen p-4 gap-4">
      <Card className="w-96 h-full overflow-auto backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-6 h-6 mr-2 " />
            Ollama Chat Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 rounded border "
            >
              {models.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Custom Template
            </label>
            <Textarea
              placeholder="Enter custom template..."
              value={customTemplate}
              onChange={(e) => setCustomTemplate(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 "
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-gray-500 inline-block ml-2" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Custom template to use for prompts. Overrides the template
                    defined in the Modelfile.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Temperature: {options.temperature.toFixed(1)}
            </label>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[options.temperature]}
              onValueChange={([temperature]) =>
                setOptions({ ...options, temperature })
              }
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-gray-500 inline-block ml-2" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Controls randomness in generation. Higher values make output
                    more random, lower values more deterministic.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Top P: {options.topP.toFixed(1)}
            </label>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[options.topP]}
              onValueChange={([topP]) => setOptions({ ...options, topP })}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-gray-500 inline-block ml-2" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Limits token selection to a subset of most probable tokens.
                    Lower values lead to more focused output.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Stream Responses
            </label>
            <Switch
              checked={options.stream}
              onCheckedChange={(stream) => setOptions({ ...options, stream })}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-gray-500 inline-block ml-2" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    If enabled, responses will be streamed in real-time. If
                    disabled, the full response will be returned at once.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            onClick={clearChat}
            variant="outline"
            className="w-full bg-red-100 hover:bg-red-200 text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-6 h-6 mr-2 text-teal-500" />
            Ollama Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mt-2 mb-0 ${
                message.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 shadow-md rounded-md max-w-[80%] ${
                  message.role === "user" ? "bg-blue-100" : "bg-green-100"
                }`}
              >
                <MarkdownResponse content={message.content} />
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardContent className="border-t pt-6">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <div className="flex-1 flex flex-col space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                disabled={isLoading}
                className="flex-1 min-h-[100px] bg-white"
              />
              <div className="flex space-x-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isPdfParsing}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isPdfParsing ? "Parsing PDF..." : "Upload PDF"}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !selectedModel}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              {isLoading && (
                <Button
                  onClick={stopGenerating}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
              <Button
                onClick={regenerateResponse}
                disabled={isLoading || messages.length < 2}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
