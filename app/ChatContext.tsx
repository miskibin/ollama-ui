"use client";
import React, { createContext, useContext, ReactNode, useState } from "react";
import { useChatLogic } from "@/hooks/useChatLogic";
import { useTestLogic } from "@/hooks/useTestLogic";
import { useFileHandling } from "@/hooks/useFileHandling";
import {
  ChatOptions,
  Model,
  Message,
  Test,
  ResponseMetadata,
  ChatPlugin,
} from "@/lib/types";
import { TestResult } from "@/hooks/useTestLogic";
import { useChatStore } from "@/lib/store";

interface ChatContextType {
  // From useChatStore
  messages: Message[];
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  editMessage: (id: string, content: string) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
  models: Model[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  options: ChatOptions;
  setOptions: (options: Partial<ChatOptions>) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  input: string;
  setInput: (input: string) => void;
  plugins: ChatPlugin[];
  // From useChatLogic
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  stopGenerating: () => void;
  responseMetadata: ResponseMetadata | null;
  editingMessageId: string | null;
  setEditingMessageId: React.Dispatch<React.SetStateAction<string | null>>;
  regenerateMessage: (id: string) => Promise<void>;
  fetchModels: () => Promise<void>;

  // From useTestLogic
  promptTests: Test[];
  addTest: (test: Test) => void;
  isRunningTest: boolean;
  testResult: TestResult | null;
  runTest: (test: Test, userPrompt: string, lastModelResponse: string) => void;
  updateTest: (id: string, updates: Partial<Test>) => void;
  removeTest: (id: string) => void;

  // From useFileHandling
  isPdfParsing: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;

  // Local state
  isPromptDialogOpen: boolean;
  setIsPromptDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentTest: Test | undefined;
  setCurrentTest: React.Dispatch<React.SetStateAction<Test | undefined>>;
  togglePlugin: any; // TODO fix type
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const chatStore = useChatStore();
  const chatLogic = useChatLogic();
  const testLogic = useTestLogic();
  const fileLogic = useFileHandling(chatStore.setInput);
  const [currentTest, setCurrentTest] = useState<Test>();
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  
  return (
    <ChatContext.Provider
      value={{
        ...chatStore,
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
