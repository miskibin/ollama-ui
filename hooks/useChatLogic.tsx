"use client";
import { useEffect, useRef, useState } from "react";
import { ChatPlugin, Message, ResponseMetadata } from "@/lib/types";
import { ChatOllama } from "@langchain/ollama";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { generateUniqueId } from "@/utils/common";
import { useInitialLoad } from "./useInitialLoad";
import { useChatStore } from "@/lib/store";
import { PluginNames } from "@/lib/plugins";
import { createWikipediaSearchChain } from "@/tools/wikipedia";
import { createSejmStatsTool } from "@/tools/sejmstats";

// This part should be in a separate file, e.g., pluginChainCreators.ts
const pluginChainCreators = {
  [PluginNames.Wikipedia]: createWikipediaSearchChain,
  [PluginNames.SejmStats]: createSejmStatsTool,
};

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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseMetadata, setResponseMetadata] =
    useState<ResponseMetadata | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatModelRef = useRef<ChatOllama | null>(null);
  const pluginChainRef = useRef<any>(null);

  useEffect(() => {
    if (selectedModel) {
      chatModelRef.current = new ChatOllama({
        model: selectedModel,
        ...options,
      });

      const enabledPlugin = plugins.find((plugin) => plugin.enabled);
      if (enabledPlugin) {
        const createPluginChain =
          pluginChainCreators[enabledPlugin.name as PluginNames];
        if (createPluginChain) {
          pluginChainRef.current = createPluginChain(
            chatModelRef.current,
            (newMessageId: string, pluginData: string) =>
              updateMessage(newMessageId, "", pluginData)
          );
        }
      }
    }
  }, [selectedModel, options, plugins]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedModel) return;

    const newMessage: Message = {
      id: generateUniqueId(),
      role: "user",
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
      addMessage({ id: newMessageId, role: "assistant", content: "" });

      const enabledPlugin = plugins.find((plugin) => plugin.enabled);
      let finalResponse = "";

      if (enabledPlugin && pluginChainRef.current) {
        finalResponse = await pluginChainRef.current.invoke({
          question: lastUserMessage,
          newMessageId,
        });
      } else {
        finalResponse = await useDefaultModel(messageHistory, newMessageId);
      }

      updateMessage(newMessageId, finalResponse.trim());
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const useDefaultModel = async (
    messageHistory: typeof messages,
    newMessageId: string
  ) => {
    const langChainMessages = messageHistory.map((msg) =>
      msg.role === "user"
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );

    if (systemPrompt) {
      langChainMessages.unshift(new SystemMessage(systemPrompt));
    }

    let finalResponse = "";
    const response = await chatModelRef.current!.invoke(langChainMessages, {
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            finalResponse += token;
            updateMessage(newMessageId, finalResponse);
          },
        },
      ],
      signal: abortControllerRef.current!.signal,
    });

    setResponseMetadata({
      total_duration: response.response_metadata.total_duration,
      load_duration: response.response_metadata.load_duration,
      prompt_eval_count: response.response_metadata.prompt_eval_count,
      prompt_eval_duration: response.response_metadata.prompt_eval_duration,
    });

    return finalResponse;
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

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
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
    const newMessages = messages.slice(0, messageIndex);
    clearMessages();
    newMessages.forEach((msg) => addMessage(msg));
    await getResponse(newMessages);
  };
  return {
    isLoading,
    fetchModels,
    editMessage,
    customSystem: systemPrompt,
    setCustomSystem: setSystemPrompt,
    regenerateMessage,
    handleSubmit,
    responseMetadata,
    clearChat: clearMessages,
    stopGenerating,
    setEditingMessageId,
    editingMessageId,
  };
};
