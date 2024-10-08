"use client";
import {
  ChatOptions,
  Model,
  Message,
  ResponseMetadata,
} from "@/lib/chat-store";
import { useState, useEffect, useRef } from "react";

export const useChatLogic = () => {
  const [isPdfParsing, setIsPdfParsing] = useState(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamResponse, setStreamResponse] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [customSystem, setCustomSystem] = useState<string>("");
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

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  }, [messages, isClient]);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/ollama");
      const data = await response.json();
      setModels(data.models);
      if (data.models.length > 0) {
        setSelectedModel(data.models[0].name);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsPdfParsing(true);
      const formData = new FormData();
      formData.append("pdf", file);

      try {
        const response = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to parse PDF");
        }

        const { markdown } = await response.json();
        setInput(markdown);
      } catch (error) {
        console.error("Error parsing PDF:", error);
        alert("Failed to parse PDF. Please try again.");
      } finally {
        setIsPdfParsing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedModel) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    const newMessages: Message[] = [...messages, newMessage];
    setMessages(newMessages);
    setInput("");
    await getResponse(newMessages);
  };

  const getResponse = async (messageHistory: Message[]) => {
    setIsLoading(true);
    setResponseMetadata(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: messageHistory.map((m) => m.content).join("\n"),
          system: customSystem,
          stream: streamResponse,
          options,
        }),
        signal: abortControllerRef.current.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      const newMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, newMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);

        if (/^\d+$/.test(chunk.trim())) {
          accumulatedResponse += chunk;
          updateAssistantMessage(accumulatedResponse);
        } else {
          try {
            const jsonChunk = JSON.parse(chunk);

            if (jsonChunk.done) {
              setResponseMetadata({
                total_duration: jsonChunk.total_duration,
                load_duration: jsonChunk.load_duration,
                prompt_eval_count: jsonChunk.prompt_eval_count,
                prompt_eval_duration: jsonChunk.prompt_eval_duration,
                eval_count: jsonChunk.eval_count,
                eval_duration: jsonChunk.eval_duration,
              });
            } else {
              accumulatedResponse += jsonChunk.response;
              updateAssistantMessage(accumulatedResponse);
            }
          } catch (error) {
            accumulatedResponse += chunk;
            updateAssistantMessage(accumulatedResponse);
          }
        }
      }
    } catch (error) {
      if ((error as any).name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error:", error);
        updateAssistantMessage(
          "An error occurred while fetching the response."
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const updateAssistantMessage = (content: string) => {
    setMessages((prev) => [
      ...prev.slice(0, -1),
      { ...prev[prev.length - 1], content },
    ]);
  };

  const editMessage = (id: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content: newContent } : msg))
    );
    setEditingMessageId(null);
  };

  const regenerateMessage = async (id: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === id);
    if (messageIndex === -1 || messages[messageIndex].role !== "assistant")
      return;

    const newMessages = messages.slice(0, messageIndex);
    setMessages(newMessages);
    await getResponse(newMessages);
  };

  const regenerateResponse = async () => {
    if (messages.length < 2) return;
    const newMessages = messages.slice(0, -1);
    setMessages(newMessages);
    await getResponse(newMessages);
  };

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
    isLoading,
    models,
    selectedModel,
    fetchModels,
    setSelectedModel,
    customSystem,
    streamResponse,
    setStreamResponse,
    setCustomSystem,
    options,
    setOptions,
    handleSubmit,
    handleFileChange,
    regenerateResponse,
    isPdfParsing,
    responseMetadata,
    clearChat,
    stopGenerating,
    editMessage,
    editingMessageId,
    setEditingMessageId,
    regenerateMessage,
    isClient,
  };
};
