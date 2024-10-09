import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChatOptions,
  Model,
  Message,
  ResponseMetadata,
} from "@/lib/chat-store";
import { ChatOllama, Ollama } from "@langchain/ollama";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";

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
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatModelRef = useRef<ChatOllama | null>(null);
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  useEffect(() => {
    setIsClient(true);
    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    fetchModels();
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("messages", JSON.stringify(messages));
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
    }
  }, [selectedModel, options]);

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
      id: generateUniqueId(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    await getResponse([...messages, newMessage]);
  };

  const getResponse = async (messageHistory: Message[]) => {
    if (!chatModelRef.current) return;

    setIsLoading(true);
    setResponseMetadata(null);
    abortControllerRef.current = new AbortController();

    try {
      const langChainMessages = messageHistory.map((msg) =>
        msg.role === "user"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      );

      if (customSystem) {
        langChainMessages.unshift(new SystemMessage(customSystem));
      }

      const newMessageId = generateUniqueId();
      setMessages((prev) => [
        ...prev,
        { id: newMessageId, role: "assistant", content: "" },
      ]);

      let accumulatedResponse = "";
      const response = await chatModelRef.current.invoke(langChainMessages, {
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              accumulatedResponse += token;
              updateAssistantMessage(newMessageId, accumulatedResponse);
            },
          },
        ],
        signal: abortControllerRef.current.signal,
      });

      setResponseMetadata({
        total_duration: response.response_metadata.total_duration,
        load_duration: response.response_metadata.load_duration,
        prompt_eval_count: response.response_metadata.prompt_eval_count,
        prompt_eval_duration: response.response_metadata.prompt_eval_duration,
      });
    } catch (error) {
      if ((error as any).name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error:", error);
        updateAssistantMessage(
          generateUniqueId(),
          "An error occurred while fetching the response."
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const updateAssistantMessage = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content } : msg))
    );
  }, []);

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
    isPdfParsing,
    responseMetadata,
    clearChat,
    stopGenerating,
    editMessage,
    editingMessageId,
    setMessages,
    setEditingMessageId,
    regenerateMessage,
    isClient,
  };
};
