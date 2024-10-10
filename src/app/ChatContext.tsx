"use client";
import React, { createContext, useContext, ReactNode, useState } from "react";
import { useChatLogic } from "@/hooks/useChatLogic";
import {
  ChatOptions,
  Model,
  Message,
  Test,
  ResponseMetadata,
} from "@/lib/chat-store";
import { TestResult, useTestLogic } from "@/hooks/useTestLogic";
import { useFileHandling } from "@/hooks/useFileHandling";

interface ChatContextType {
  input: string;
  setInput: (input: string) => void;
  messages: Message[];
  isLoading: boolean;
  models: Model[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  customSystem: string;
  setCustomSystem: (system: string) => void;
  options: ChatOptions;
  setOptions: React.Dispatch<React.SetStateAction<ChatOptions>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearChat: () => void;
  stopGenerating: () => void;
  isPdfParsing: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  responseMetadata: ResponseMetadata | null;
  editMessage: (id: string, newContent: string) => void;
  editingMessageId: string | null;
  setEditingMessageId: React.Dispatch<React.SetStateAction<string | null>>;
  streamResponse: boolean;
  setStreamResponse: (stream: boolean) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  regenerateMessage: (id: string) => Promise<void>;
  fetchModels: () => Promise<void>;
  promptTests: Test[];
  addTest: (test: Test) => void;
  isRunningTest: boolean;
  testResult: TestResult | null;
  runTest: (test: Test, userPrompt: string, lastModelResponse: string) => void;
  updateTest: (id: string, updates: Partial<Test>) => void;
  removeTest: (id: string) => void;
  isClient: boolean;
  isPromptDialogOpen: boolean;
  setIsPromptDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentTest: Test | undefined;
  setCurrentTest: React.Dispatch<React.SetStateAction<Test | undefined>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const chatLogic = useChatLogic();
  const testLogic = useTestLogic();
  const fileLogic = useFileHandling(chatLogic.setInput);
  const [currentTest, setCurrentTest] = useState<Test>();
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        ...chatLogic,
        ...testLogic,
        ...fileLogic,
        isPromptDialogOpen,
        setIsPromptDialogOpen,
        currentTest,
        setCurrentTest,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
