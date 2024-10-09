import { useState, useEffect, useRef } from "react";
import { ChatOllama } from "@langchain/ollama";
import { useMessageHandling } from "./useMessageHandling";
import {
  ChatOptions,
  Message,
  ResponseMetadata,
  Model,
} from "@/lib/chat-store";
import { useLocalStorage } from "./useLocalStorage";
import { useToolChains } from "./useToolChains";
import { useModelManagement } from "./useModelManagement";

export const useChatLogic = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseMetadata, setResponseMetadata] =
    useState<ResponseMetadata | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [options, setOptions] = useState<ChatOptions>({
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    repeatPenalty: 1.1,
    seed: null,
    num_ctx: 4096,
  });
  const [customSystem, setCustomSystem] = useState<string>("");
  const [streamResponse, setStreamResponse] = useState<boolean>(true);
  const [isPdfParsing, setIsPdfParsing] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  const { saveMessages, loadMessages } = useLocalStorage();
  const { models, selectedModel, setSelectedModel, fetchModels } =
    useModelManagement();
  const { toolChains, initializeToolChains } = useToolChains();
  const {
    handleSubmit,
    handleFileChange,
    editMessage,
    regenerateMessage,
    setInput,
    input,
  } = useMessageHandling(
    messages,
    setMessages,
    toolChains,
    setIsLoading,
    setResponseMetadata
  );

  const chatModelRef = useRef<ChatOllama | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsClient(true);
    fetchModels();
    loadMessages().then(setMessages);
  }, []);

  useEffect(() => {
    if (isClient) {
      saveMessages(messages);
    }
  }, [messages, isClient]);

  useEffect(() => {
    if (selectedModel) {
      chatModelRef.current = new ChatOllama({
        model: selectedModel,
        temperature: options.temperature,
        topP: options.topP,
        topK: options.topK,
        repeatPenalty: options.repeatPenalty,
      });
      initializeToolChains(chatModelRef.current);
    }
  }, [selectedModel, options]);

  const clearChat = () => {
    setMessages([]);
    setResponseMetadata(null);
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  return {
    input,
    setInput,
    messages,
    setMessages,
    isLoading,
    models,
    selectedModel,
    setSelectedModel,
    customSystem,
    setCustomSystem,
    options,
    setOptions,
    handleSubmit,
    handleFileChange,
    responseMetadata,
    clearChat,
    stopGenerating,
    editMessage,
    editingMessageId,
    setEditingMessageId,
    regenerateMessage,
    streamResponse,
    setStreamResponse,
    isPdfParsing,
    fetchModels,
    isClient,
  };
};
