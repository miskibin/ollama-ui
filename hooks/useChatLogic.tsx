"use client";
import { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Model = {
  name: string;
};

type ChatOptions = {
  temperature: number;
  topP: number;
  topK: number;
  repeatPenalty: number;
};

export const useChatLogic = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("Ogólny");
  const [customTemplate, setCustomTemplate] = useState<string>("");
  const [options, setOptions] = useState<ChatOptions>({
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    repeatPenalty: 1.1,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedModel) return;

    // Convert newline characters to \n
    const formattedInput = input.replace(/\n/g, "\\n");

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: formattedInput },
    ];
    setMessages(newMessages);
    setInput("");
    await getResponse(newMessages);
  };

  const getResponse = async (messageHistory: Message[]) => {
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: messageHistory.map((m) => m.content).join("\n"),
          template:
            selectedTemplate === "Custom" ? customTemplate : selectedTemplate,
          options,
        }),
        signal: abortControllerRef.current.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        accumulatedResponse += chunk;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: accumulatedResponse },
        ]);
      }
    } catch (error) {
      if ((error as any).name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Wystąpił błąd podczas pobierania odpowiedzi.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };
  const regenerateResponse = async () => {
    if (messages.length < 2) return;
    const newMessages = messages.slice(0, -1);
    setMessages(newMessages);
    await getResponse(newMessages);
  };

  const clearChat = () => {
    setMessages([]);
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
    setSelectedModel,
    selectedTemplate,
    setSelectedTemplate,
    customTemplate,
    setCustomTemplate,
    options,
    setOptions,
    handleSubmit,
    regenerateResponse,
    clearChat,
    stopGenerating,
  };
};
