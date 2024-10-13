"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { ChatPlugin, Message, ResponseMetadata } from "@/lib/types";
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
import { PluginNames } from "@/lib/plugins";
import { createSejmStatsTool } from "@/tools/sejmstats";
import { plugin } from "postcss";

export const useChatLogic = () => {
  const { fetchModels } = useInitialLoad();
  const {
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    selectedModel,
    options,
    systemPrompt,
    setSystemPrompt,
    input,
    setInput,
    pluginData,
    setPluginData,
    plugins,
    promptStatus,
    setPromptStatus,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseMetadata, setResponseMetadata] =
    useState<ResponseMetadata | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatModelRef = useRef<ChatOllama | null>(null);
  const pluginChainsRef = useRef<Map<string, any>>(new Map());

  const pluginChainCreators: {
    [key in PluginNames]: (
      model: ChatOllama,
      setPluginData: (data: string) => void,
      setPromptStatus: (status: string) => void
    ) => any;
  } = {
    [PluginNames.Wikipedia]: createWikipediaSearchChain,
    [PluginNames.SejmStats]: createSejmStatsTool,
  };

  useEffect(() => {
    if (selectedModel) {
      chatModelRef.current = new ChatOllama({
        model: selectedModel,
        ...options,
      });
      // Initialize plugin chains
      plugins.forEach((plugin) => {
        const createChain = pluginChainCreators[plugin.name as PluginNames];
        if (createChain) {
          pluginChainsRef.current.set(
            plugin.name,
            createChain(chatModelRef.current!, setPluginData, setPromptStatus)
          );
        }
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
      const newMessage: Message = {
        id: newMessageId,
        role: "assistant",
        content: "",
        plugins: [],
      };
      addMessage(newMessage);

      setPromptStatus("Analizowanie wiadomości...");

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
      if (relevantPlugins.filter(Boolean).length === 0) {
        setPluginData("");
        setPromptStatus("Zdecydowałem, że nie użyję zewnętrznych danych.");
      }
      for (const plugin of relevantPlugins.filter(Boolean) as ChatPlugin[]) {
        setPromptStatus(`Gathering data from ${plugin.name}`);
        const pluginChain = pluginChainsRef.current.get(plugin.name);
        if (pluginChain) {
          const pluginResponse = await pluginChain.invoke(lastUserMessage);
          finalResponse += `${pluginResponse}\n\n`;
          newMessage.plugins = [...(newMessage.plugins || []), plugin.name];
        }
      }

      setPromptStatus("Analizowanie zebranych danych...");

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

        setPromptStatus("Przygotowywanie odpowiedzi...");
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

      // Update the message with the final content and plugins used
      updateMessage(
        newMessageId,
        finalResponse.trim(),
        newMessage.plugins,
        pluginData
      );
      console.log("Final response", pluginData);
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
    return (
      response.toLowerCase().includes("yes") ||
      response.toLowerCase().includes("tak")
    );
  };

  const handleError = (error: any) => {
    if (error.name !== "AbortError") {
      addMessage({
        id: generateUniqueId(),
        role: "assistant",
        content: `An error occurred while fetching the response. ${error.message}`,
      });
    }
  };

  const editMessage = async (id: string, newContent: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === id);
    console.log("Editing message", id, messages[messageIndex]);
    if (messageIndex === -1) return;
    updateMessage(id, newContent);
    setEditingMessageId(null);
    if (messages[messageIndex].role === "user") {
      const newMessages = messages.slice(0, messageIndex + 1);
      clearMessages();
      newMessages.forEach((msg) => addMessage(msg));
      updateMessage(id, newContent);

      await getResponse(newMessages);
    }
  };

  const regenerateMessage = async (id: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === id);
    if (messageIndex === -1 || messages[messageIndex].role !== "assistant")
      return;

    // Remove all subsequent messages
    const newMessages = messages.slice(0, messageIndex);
    clearMessages();
    newMessages.forEach((msg) => addMessage(msg));

    // Generate a new assistant message
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
