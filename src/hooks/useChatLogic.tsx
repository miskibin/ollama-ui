import { useState, useEffect, useRef, useCallback } from "react";
import { ChatOptions, ResponseMetadata } from "@/lib/types";
import { ChatOllama } from "@langchain/ollama";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createWikipediaSearchChain } from "@/tools/is-wikipedia-relevant";
import { generateUniqueId } from "@/utils/common";
import { useInitialLoad } from "./useInitialLoad";
import { useChatStore } from "@/lib/store";

export const useChatLogic = () => {
  const { fetchModels } = useInitialLoad();
  const {
    messages,
    addMessage,
    updateMessage,
    clearMessages,
    models,
    selectedModel,
    setSelectedModel,
  } = useChatStore();

  const [input, setInput] = useState<string>("");
  const [streamResponse, setStreamResponse] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<string>(""); //will be set for every ChatPromptTemplate
  const wikipediaChainRef = useRef<ReturnType<
    typeof createWikipediaSearchChain
  > | null>(null);
  const [responseMetadata, setResponseMetadata] =
    useState<ResponseMetadata | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [options, setOptions] = useState<ChatOptions>({
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    repeatPenalty: 1.1,
    seed: null,
    num_predict: 4096,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatModelRef = useRef<ChatOllama | null>(null);

  useEffect(() => {
    if (selectedModel) {
      chatModelRef.current = new ChatOllama({
        model: selectedModel,
        seed: options.seed || undefined,  
        streaming: streamResponse,
        temperature: options.temperature,
        topP: options.topP,
        topK: options.topK,
        numPredict: options.num_predict,
        repeatPenalty: options.repeatPenalty,
      });
      wikipediaChainRef.current = createWikipediaSearchChain(
        chatModelRef.current
      );
    }
  }, [selectedModel, options]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedModel) return;

    const newMessage = {
      id: generateUniqueId(),
      role: "user" as const,
      content: input,
    };
    addMessage(newMessage);
    setInput("");
    await getResponse([...messages, newMessage]);
  };

  const getResponse = async (messageHistory: typeof messages) => {
    if (!chatModelRef.current || !wikipediaChainRef.current) return;

    setIsLoading(true);
    setResponseMetadata(null);
    abortControllerRef.current = new AbortController();
    try {
      const lastUserMessage = messageHistory[messageHistory.length - 1].content;

      // Use the Wikipedia chain
      const wikipediaResult = await wikipediaChainRef.current.invoke(
        lastUserMessage
      );

      const newMessageId = generateUniqueId();
      addMessage({
        id: newMessageId,
        role: "assistant",
        content: wikipediaResult,
      });
      // If Wikipedia search was not needed, use the chat model
      if (wikipediaResult === "Wikipedia search not needed.") {
        const langChainMessages = messageHistory.map((msg) =>
          msg.role === "user"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
        );

        if (systemPrompt) {
          langChainMessages.unshift(new SystemMessage(systemPrompt));
        }

        let accumulatedResponse = "";
        const response = await chatModelRef.current.invoke(langChainMessages, {
          callbacks: [
            {
              handleLLMNewToken(token: string) {
                accumulatedResponse += token;
                updateMessage(newMessageId, accumulatedResponse);
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
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleError = (error: any) => {
    if (error.name !== "AbortError") {
      addMessage({
        id: generateUniqueId(),
        role: "assistant",
        content: "An error occurred while fetching the response.",
      });
    }
  };

  const editMessage = (id: string, newContent: string) => {
    updateMessage(id, newContent);
    setEditingMessageId(null);
  };

  const regenerateMessage = async (id: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === id);
    if (messageIndex === -1 || messages[messageIndex].role !== "assistant")
      return;

    const newMessages = messages.slice(0, messageIndex);
    await getResponse(newMessages);
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
    customSystem: systemPrompt,
    streamResponse,
    setStreamResponse,
    setCustomSystem: setSystemPrompt,
    options,
    setOptions,
    handleSubmit,
    responseMetadata,
    clearChat: clearMessages,
    stopGenerating,
    editMessage,
    editingMessageId,
    setEditingMessageId,
    regenerateMessage,
  };
};
