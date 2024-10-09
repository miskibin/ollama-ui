"use client";
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Send,
  RefreshCw,
  StopCircle,
  FileText,
  Edit,
  Check,
  X,
  Copy,
  Trash2,
} from "lucide-react";
import MarkdownResponse from "@/components/markdownResponse";
import InitialChatContent from "@/components/initial-page";
import { useChatContext } from "@/app/ChatContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingDots from "./loadingDots";

export function ChatCard() {
  const {
    messages,
    isLoading,
    input,
    setInput,
    handleSubmit,
    editingMessageId,
    editMessage,
    setEditingMessageId,
    regenerateMessage,
    handleFileChange,
    isPdfParsing,
    isClient,
    stopGenerating,
    setMessages,
    models,
    selectedModel,
    setSelectedModel,
  } = useChatContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editTextareaHeight, setEditTextareaHeight] = useState("auto");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editInput, setEditInput] = useState("");

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      if (textareaRef.current) {
        textareaRef.current.style.height = "56px";
      }
    }
  };
  const removeMessage = (id: string) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
  };
  const handleEditStart = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditInput(content);
    setEditTextareaHeight("auto"); // Reset height when starting edit
  };

  const handleEditSave = (id: string) => {
    editMessage(id, editInput);
    setEditingMessageId(null);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditInput("");
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {});
  };

  const handleStarterClick = (text: string) => {
    setInput(text);
  };
  const adjustEditTextareaHeight = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditInput(e.target.value);
    setEditTextareaHeight("auto");
    setEditTextareaHeight(`${e.target.scrollHeight}px`);
  };
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "56px"; // Reset to min height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(
        Math.max(scrollHeight, 56),
        350
      )}px`;
    }
  };

  const handlePdfFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    await handleFileChange(e);
    // Use a small delay to ensure the input has been updated with the PDF content
    setTimeout(adjustTextareaHeight, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };
  if (!isClient) return null;

  return (
    <Card className="h-full overflow-hidden flex flex-col items-center">
      <CardHeader className="flex-shrink-0 w-full">
        <div className="flex justify-between items-center w-full">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {models &&
                  models.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      {model.name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <h2 className="text-2xl font-bold">Ollama Prompt Engineer</h2>
          <div className="w-[200px]"></div> {/* Spacer for alignment */}
        </div>
      </CardHeader>
      <CardContent className="flex-grow container container-fluid overflow-auto 2xl:w-3/4 w-full">
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
                  <div className="min-w-[500px]">
                    <Textarea
                      value={editInput}
                      onChange={adjustEditTextareaHeight}
                      className="mb-2 min-w-[500px]  min-h-[300px] max-h-[500px] "
                      style={{ height: editTextareaHeight }}
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
                      <Button
                        onClick={() => removeMessage(message.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
        {isLoading 
        
        && <LoadingDots />}

      </CardContent>
      <CardFooter className="w-full mt-3 items-center justify-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="flex flex-col space-y-2 2xl:w-3/5 w-full h-full"
        >
          <div className="relative flex-1 m-2 rounded-full">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              disabled={isLoading}
              className="pr-20 pl-4 pt-4 pb-2 resize-none min-h-[56px] max-h-[350px] rounded-[1rem]"
              rows={1}
            />
            <div className="absolute bottom-2 right-2 flex space-x-2">
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
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfFileChange}
                ref={fileInputRef}
                className="hidden"
              />

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
  );
}
