"use client"
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Send,
  RefreshCw,
  StopCircle,
  Zap,
  FileText,
  Edit,
  Check,
  X,
  Copy,
} from "lucide-react";
import { useChatLogic } from "@/hooks/useChatLogic";
import MarkdownResponse from "@/components/markdownResponse";
import InitialChatContent from "@/components/initial-page";
import { Sidebar } from "@/components/sidebar";

export default function Home() {
  const {
    input,
    setInput,
    messages,
    isLoading,
    models,
    selectedModel,
    setSelectedModel,
    customSystem,
    setCustomSystem,
    options,
    setOptions,
    handleSubmit,
    regenerateResponse,
    clearChat,
    stopGenerating,
    isPdfParsing,
    handleFileChange,
    responseMetadata,
    editMessage,
    editingMessageId,
    setEditingMessageId,
    streamResponse,
    setStreamResponse,
    regenerateMessage,
    fetchModels,
  } = useChatLogic();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [editInput, setEditInput] = useState("");

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {});
  };

  const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEditStart = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditInput(content);
  };

  const handleEditSave = (id: string) => {
    editMessage(id, editInput);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditInput("");
  };

  const handleStarterClick = (text: string) => {
    setInput(text);
  };

  return (
    <div className="flex h-screen p-4 gap-4">
      <Sidebar
        models={models}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        customSystem={customSystem}
        setCustomSystem={setCustomSystem}
        options={options}
        setOptions={setOptions}
        streamResponse={streamResponse}
        setStreamResponse={setStreamResponse}
        clearChat={clearChat}
      />
      <div className="flex-1 max-h-full">
        <Card className="h-full overflow-hidden flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center">
              <Zap className="w-6 h-6 mr-2" />
              Ollama Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto">
            {messages.length === 0 ? (
              <InitialChatContent onStarterClick={handleStarterClick} />
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mt-2 mb-0 ${
                    message.role === "user" ? "flex justify-end" : ""
                  }`}
                >
                  <div
                    className={`inline-block pt-3 px-3 shadow-md rounded-md max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary/10"
                        : "border-0 shadow-none"
                    }`}
                  >
                    {editingMessageId === message.id ? (
                      <div className="min-w-[300px]">
                        <Textarea
                          value={editInput}
                          onChange={(e) => setEditInput(e.target.value)}
                          className="mb-2 min-w-[300px]"
                        />
                        <div className="flex justify-end space-x-2 p-0 m-0">
                          <Button
                            onClick={() => handleEditSave(message.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={handleEditCancel}
                            size="sm"
                            variant="ghost"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-left">
                        <MarkdownResponse content={message.content} />
                        <div className="flex justify-start mt-2 space-x-2">
                          <Button
                            variant="ghost"
                            onClick={() =>
                              handleEditStart(message.id, message.content)
                            }
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {message.role === "assistant" && (
                            <>
                              <Button
                                onClick={() => regenerateMessage(message.id)}
                                size="sm"
                                variant="ghost"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => copyToClipboard(message.content)}
                                size="sm"
                                variant="ghost"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="w-full mt-3 items-center justify-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="flex flex-col space-y-2 w-3/4  h-full "
            >
              <div className="relative flex-1 m-2">
                <Textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(
                      e.target.scrollHeight,
                      200
                    )}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  disabled={isLoading}
                  className="pr-20 resize-none  min-h-[56px] max-h-[350px]"
                  rows={1}
                />
                <div className="absolute bottom-2 right-2 flex space-x-2">
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
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                  {isLoading ? (
                    <Button
                      type="button"
                      onClick={stopGenerating}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <StopCircle className="h-5 w-5 text-red-500" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
