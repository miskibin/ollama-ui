import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import Image from "next/image";
import PluginDataDialog from "./plugin-data-dialog";
import SummarableTextDialog from "./SummarableTextDialog";
import { useUser } from "@auth0/nextjs-auth0/client";

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
    stopGenerating,
    deleteMessage,
  } = useChatContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editTextareaHeight, setEditTextareaHeight] = useState("auto");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editInput, setEditInput] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const copyToClipboard = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      if (textareaRef.current) {
        textareaRef.current.style.height = "56px";
      }
    }
  };

  const handleEditStart = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditInput(content);
    setEditTextareaHeight("auto");
  };

  const handleEditSave = (id: string) => {
    editMessage(id, editInput);
    setEditingMessageId(null);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditInput("");
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
      textareaRef.current.style.height = "56px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(
        Math.max(scrollHeight, 56),
        200
      )}px`;
    }
  };

  const handlePdfFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    await handleFileChange(e);
    setTimeout(adjustTextareaHeight, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  return (
    <Card className="h-full flex flex-col items-center border-t-0 shadow-none rounded-t-none">
      <CardContent className="flex-grow w-full max-w-6xl overflow-y-auto px-2 sm:px-4">
        {isClient ? (
          messages.length === 0 ? (
            <InitialChatContent onStarterClick={handleStarterClick} />
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mt-2 mb-1 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Image
                    src="/logo.svg"
                    alt="Assistant Avatar"
                    width={24}
                    height={24}
                    className="mr-1 mt-1"
                  />
                )}
                <div
                  className={`inline-block py-2 px-3 shadow-md rounded-md ${
                    message.role === "user"
                      ? "bg-primary/10"
                      : "border-0 shadow-none"
                  } ${
                    editingMessageId === message.id ? "w-full" : "max-w-[95%]"
                  }`}
                >
                  {editingMessageId === message.id ? (
                    <div className="w-full">
                      <Textarea
                        value={editInput}
                        onChange={adjustEditTextareaHeight}
                        className="w-full mb-2 min-h-[100px] max-h-[300px] resize-vertical"
                        style={{ height: editTextareaHeight }}
                      />
                      <div className="flex justify-end space-x-2">
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
                    message.content !== "" && (
                      <div className="text-left">
                        <MarkdownResponse content={message.content} />
                        {message.pluginData && (
                          <div className="flex justify-start mt-2 space-x-2">
                            <PluginDataDialog pluginData={message.pluginData} />
                            <SummarableTextDialog
                              onSummarize={() => {}}
                              message={message}
                            />
                          </div>
                        )}
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
                                onClick={() =>
                                  copyToClipboard(message.id, message.content)
                                }
                                size="sm"
                                variant="ghost"
                                className="relative"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="w-4 h-4 text-green-500 absolute animate-scale-check" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </>
                          )}
                          <Button
                            onClick={() => deleteMessage(message.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))
          )
        ) : null}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="w-full mt-1 items-center justify-center sticky bottom-0 ">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="flex flex-col space-y-2 w-full max-w-3xl"
        >
          <div className="relative flex-1 rounded-full">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Wpisz wiadomość..."
              disabled={isLoading}
              className="pr-20 pl-4 pt-4 pb-2 resize-none min-h-[56px] max-h-[200px] rounded-[1rem]"
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
