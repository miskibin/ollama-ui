"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, RefreshCw, Trash2, StopCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
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
  } = useChatLogic();

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
    <div className="flex h-screen bg-gray-100 p-4 gap-4">
      {/* Settings Card */}
      <Card className="w-80 h-full overflow-auto">
        <CardHeader>
          <CardTitle>Ollama Chat Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 rounded border border-gray-300"
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
              className="w-full p-2 rounded border border-gray-300"
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
          <Button onClick={clearChat} variant="outline" className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <Card
                className={`inline-block p-3 ${
                  message.role === "user" ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <CardContent>
                  {message.role === "user" ? (
                    <p>{message.content}</p>
                  ) : (
                    <MarkdownResponse content={message.content} />
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardContent className="border-t pt-6">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              disabled={isLoading}
              className="flex-1 min-h-[100px]"
            />
            <div className="flex flex-col space-y-2">
              <Button type="submit" disabled={isLoading || !selectedModel}>
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? "Sending..." : "Send"}
              </Button>
              {isLoading && (
                <Button onClick={stopGenerating} variant="destructive">
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
