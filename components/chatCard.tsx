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
    const e = new Event("submit");
    handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const handlePdfFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileChange(e);
      setTimeout(adjustTextareaHeight, 0);
    }
  };

  useEffect(() => {
    if (input === "") {
      if (textareaRef.current) {
        textareaRef.current.style.height = "56px";
      }
    }
  }, [input]);
  return (
    <Card className="h-full flex flex-col items-center border-t-0 shadow-none rounded-t-none">
      <CardContent className="flex-grow w-full max-w-6xl overflow-y-auto px-2 sm:px-4">
        {isClient ? (
          messages.length === 0 ? (
            <InitialChatContent onStarterClick={handleStarterClick} />
          ) : (
            messages
              .filter((message) => message.content !== "")
              .map((message) => (
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
                          onChange={adjustTextareaHeight}
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
                    )}
                  </div>
                </div>
              ))
          )
        ) : null}
        <div ref={messagesEndRef} />
        {isLoading && messages[messages.length - 1].content === "" && (
          <div className="flex flex-col items-center mt-4">
            <LoadingDots />
            <p className="text-sm text-gray-500 italic mt-2">
              {messages[messages.length - 1]?.pluginData &&
              (messages[messages.length - 1]?.pluginData?.length ?? 0) < 100
                ? messages[messages.length - 1]?.pluginData
                : "Myślę..."}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="w-full mt-1 items-center justify-center sticky bottom-0 ">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="flex flex-col space-y-2 w-full max-w-3xl"
        >
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Wpisz wiadomość..."
              disabled={isLoading || isPdfParsing}
              className="pr-24 pl-4 py-3 resize-none min-h-[56px] max-h-[200px] w-full rounded-2xl border-2 focus:ring-2 focus:ring-primary/50 transition-all overflow-y-auto scrollbar-hide hover:scrollbar-default"
              rows={1}
            />
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              <div className="relative">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isPdfParsing}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-muted transition-colors"
                >
                  {isPdfParsing ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>

              {isLoading ? (
                <Button
                  type="button"
                  onClick={stopGenerating}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-red-100 transition-colors"
                >
                  <StopCircle className="h-5 w-5 text-red-500" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || isPdfParsing}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-primary/10 transition-colors"
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
