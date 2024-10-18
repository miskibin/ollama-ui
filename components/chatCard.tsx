import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Send, StopCircle, FileText } from "lucide-react";
import InitialChatContent from "@/components/initial-page";
import { useChatContext } from "@/app/ChatContext";
import LoadingDots from "./loadingDots";
import { ChatMessage } from "./message";

export function ChatCard() {
  const {
    messages,
    isLoading,
    input,
    setInput,
    handleSubmit,
    isPdfParsing,
    stopGenerating,
    handleFileChange,
  } = useChatContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      if (textareaRef.current) {
        textareaRef.current.style.height = "56px";
      }
    }
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

  return (
    <Card className="h-full flex flex-col items-center border-t-0 shadow-none rounded-t-none">
      <CardContent className="flex-grow w-full max-w-6xl overflow-y-auto px-2 sm:px-4">
        {messages.length === 0 ? (
          <InitialChatContent
            onStarterClick={(text) =>
              handleSubmit(
                new Event("submit") as unknown as React.FormEvent,
                text
              )
            }
          />
        ) : (
          messages
            .filter((message) => message.content !== "")
            .map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLastMessage={index === messages.length - 1}
              />
            ))
        )}
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
      <CardFooter className="w-full mt-1 items-center justify-center sticky bottom-0">
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
                    <FileText className="h-5 w-5 " />
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
                  className="h-10 w-10 rounded-full hover:bg-primary/10 text-primary transition-colors"
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
