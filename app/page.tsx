"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Send,
  RefreshCw,
  Trash2,
  StopCircle,
  Settings,
  Zap,
  FileText,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
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
    isPdfParsing,
    handleFileChange,
    responseMetadata,
  } = useChatLogic();

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

  return (
    <div className="flex h-screen p-4 gap-4">
      <Card className="w-96 h-full overflow-auto backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Chat Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 rounded border"
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
              className="w-full p-2 rounded border"
            />
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
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Stream Responses</label>
            <Switch
              checked={options.stream}
              onCheckedChange={(stream) => setOptions({ ...options, stream })}
            />
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
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={75} minSize={30}>
          <Card className="h-full overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-6 h-6 mr-2 text-teal-500" />
                Ollama Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full overflow-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mt-2 mb-0 ${
                    message.role === "user" ? "flex justify-end" : ""
                  }`}
                >
                  <div
                    className={`inline-block p-3 shadow-md rounded-md max-w-[80%] ${
                      message.role === "user" ? "bg-blue-100" : "bg-green-100"
                    }`}
                  >
                    <div className="text-left">
                      <MarkdownResponse content={message.content} />
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
          </Card>
        </ResizablePanel>
        <ResizableHandle />

        <ResizablePanel defaultSize={25} minSize={15}>
          <Card className="h-full bg-white/80 backdrop-blur-sm">
            <CardContent className="h-full flex flex-col pt-6">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col space-y-2 h-full"
              >
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
                  {isLoading && (
                    <Button
                      onClick={stopGenerating}
                      variant="destructive"
                      className="flex-1"
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  )}
                  <Button
                    onClick={regenerateResponse}
                    disabled={isLoading || messages.length < 2}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
