import { useEffect, useRef, useCallback, useState } from "react";
import { ChatPlugin, ResponseMetadata } from "@/lib/types";
import { ChatOllama } from "@langchain/ollama";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createWikipediaSearchChain } from "@/tools/wikipedia";
import { generateUniqueId } from "@/utils/common";
import { useInitialLoad } from "./useInitialLoad";
import { useChatStore } from "@/lib/store";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const useChatLogic = () => {
  const { fetchModels } = useInitialLoad();
  const {
    messages,
    addMessage,
    updateMessage,
    clearMessages,
    selectedModel,
    options,
    systemPrompt,
    setSystemPrompt,
    input,
    setInput,
    plugins,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promptStatus, setPromptStatus] = useState<string>("");
  const [responseMetadata, setResponseMetadata] =
    useState<ResponseMetadata | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatModelRef = useRef<ChatOllama | null>(null);
  const pluginChainsRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (selectedModel) {
      chatModelRef.current = new ChatOllama({
        model: selectedModel,
        ...options,
      });
      // Initialize plugin chains
      plugins.forEach((plugin) => {
        if (plugin.name === "Wikipedia") {
          pluginChainsRef.current.set(
            plugin.name,
            createWikipediaSearchChain(chatModelRef.current!)
          );
        }
        // Add other plugin initializations here
      });
    }
  }, [selectedModel, options, plugins]);

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
    if (!chatModelRef.current) return;

    setIsLoading(true);
    setResponseMetadata(null);
    abortControllerRef.current = new AbortController();

    try {
      const lastUserMessage = messageHistory[messageHistory.length - 1].content;
      const newMessageId = generateUniqueId();
      addMessage({
        id: newMessageId,
        role: "assistant",
        content: "Thinking...",
      });

      setPromptStatus("Analyzing the question");

      // Check relevance for each enabled plugin
      const relevantPlugins = await Promise.all(
        plugins
          .filter((plugin) => plugin.enabled)
          .map(async (plugin) => {
            const isRelevant = await checkPluginRelevance(
              plugin,
              lastUserMessage
            );
            return isRelevant ? plugin : null;
          })
      );

      let finalResponse = "";

      for (const plugin of relevantPlugins.filter(Boolean) as ChatPlugin[]) {
        setPromptStatus(`Gathering data from ${plugin.name}`);
        const pluginChain = pluginChainsRef.current.get(plugin.name);
        if (pluginChain) {
          const pluginResponse = await pluginChain.invoke(lastUserMessage);
          finalResponse += `${pluginResponse}\n\n`;
        }
      }

      setPromptStatus("Analyzing gathered data");

      if (!finalResponse) {
        // If no plugin was used, use the chat model directly
        const langChainMessages = messageHistory.map((msg) =>
          msg.role === "user"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
        );

        if (systemPrompt) {
          langChainMessages.unshift(new SystemMessage(systemPrompt));
        }

        setPromptStatus("Generating response");
        const response = await chatModelRef.current.invoke(langChainMessages, {
          callbacks: [
            {
              handleLLMNewToken(token: string) {
                finalResponse += token;
                updateMessage(newMessageId, finalResponse);
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
      } else {
        updateMessage(newMessageId, finalResponse.trim());
      }

      setPromptStatus("");
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const checkPluginRelevance = async (plugin: ChatPlugin, question: string) => {
    const prompt = PromptTemplate.fromTemplate(plugin.relevancePrompt);
    const chain = prompt
      .pipe(chatModelRef.current!)
      .pipe(new StringOutputParser());
    const response = await chain.invoke({ question });
    return response.toLowerCase().includes("yes");
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
      setPromptStatus("");
    }
  };

  return {
    isLoading,
    promptStatus,
    fetchModels,
    customSystem: systemPrompt,
    setCustomSystem: setSystemPrompt,
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
