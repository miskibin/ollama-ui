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
  User,
  LogOut,
} from "lucide-react";

import MarkdownResponse from "@/components/markdownResponse";
import InitialChatContent from "@/components/initial-page";
import { useChatContext } from "@/app/ChatContext";
import Link from "next/link";
import LoadingDots from "./loadingDots";
import ModelSelector from "./model-selector";
import Image from "next/image";
import PluginDataDialog from "./plugin-data-dialog";
import SummarableTextDialog from "./SummarableTextDialog";
import { SummarableText } from "@/lib/types";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  const copyToClipboard = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
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
  const { user } = useUser();

  return (
    <Card className="h-full overflow-hidden flex flex-col items-center">
      <CardHeader className="flex-shrink-0 w-full">
        <div className="flex justify-between items-center w-full">
          <ModelSelector />
          <h2 className="text-lg text-red-500">wersja beta</h2>
          <div className="w-[200px] flex justify-end">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open user menu</span>
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/profile-client" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/api/auth/logout" className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow container container-fluid overflow-auto 2xl:w-3/4 w-full">
        {messages.length === 0 ? (
          <InitialChatContent onStarterClick={handleStarterClick} />
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mt-2 mb-0 flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <Image
                  src="/logo.svg"
                  alt="Assistant Avatar"
                  width={40}
                  height={40}
                  className="mr-2"
                />
              )}
              <div
                className={`inline-block pt-3 px-3 shadow-md rounded-md ${
                  message.role === "user"
                    ? "bg-primary/10"
                    : "border-0 shadow-none"
                } ${
                  editingMessageId === message.id
                    ? "w-full max-w-full"
                    : "max-w-[80%]"
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
                          <PluginDataDialog
                            pluginData={message.pluginData}
                          ></PluginDataDialog>
                          <SummarableTextDialog
                            onSummarize={function (item: SummarableText): void {
                              throw new Error("Function not implemented.");
                            }}
                            onAddToContext={function (
                              item: SummarableText
                            ): void {
                              throw new Error("Function not implemented.");
                            }}
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
        )}
        <div ref={messagesEndRef} />
        {isLoading && messages[messages.length - 1].content === "" && (
          <div className="flex flex-col items-center mt-4">
            <LoadingDots />
            <p className="text-sm text-gray-500 italic mt-2">
              {messages[messages.length - 1]?.pluginData}
            </p>
          </div>
        )}
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
              placeholder="Wpisz wiadomość... (Shift+Enter by dodać linię)"
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
