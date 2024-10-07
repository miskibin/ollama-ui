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
  stream: boolean;
};

type ResponseMetadata = {
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
};

export const useChatLogic = () => {
  const [isPdfParsing, setIsPdfParsing] = useState(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("Ogólny");
  const [customTemplate, setCustomTemplate] = useState<string>("");
  const [responseMetadata, setResponseMetadata] =
    useState<ResponseMetadata | null>(null);
  const [options, setOptions] = useState<ChatOptions>({
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    repeatPenalty: 1.1,
    stream: true,
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

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];
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

        // Check if the chunk is only digits
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
            // If JSON parsing fails, treat the chunk as plain text
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
        updateAssistantMessage("Wystąpił błąd podczas pobierania odpowiedzi.");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };
  const updateAssistantMessage = (content: string) => {
    setMessages((prev) => [
      ...prev.slice(0, -1),
      { role: "assistant", content },
    ]);
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
    setSelectedModel,
    selectedTemplate,
    setSelectedTemplate,
    customTemplate,
    setCustomTemplate,
    options,
    setOptions,
    handleSubmit,
    handleFileChange,
    regenerateResponse,
    isPdfParsing,
    responseMetadata,
    clearChat,
    stopGenerating,
  };
};
