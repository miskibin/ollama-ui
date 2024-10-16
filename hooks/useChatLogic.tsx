import { useEffect, useRef, useState } from "react";
import { Message, ResponseMetadata } from "@/lib/types";
import { generateUniqueId } from "@/utils/common";
import { useChatStore } from "@/lib/store";

export const useChatLogic = () => {
  const {
    messages,
    addMessage,
    updateMessage,
    clearMessages,
    options,
    systemPrompt,
    setSystemPrompt,
    input,
    setInput,
    getMemoryVariables,
    addToMemory,
    plugins,
    clearMemory,
  } = useChatStore();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pluginStatus, setPluginStatus] = useState<string | null>(null);
  const [responseMetadata, setResponseMetadata] =
    useState<ResponseMetadata | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: generateUniqueId(),
      role: "user",
      content: input,
    };
    addMessage(newMessage);
    setInput("");
    await getResponse([...messages, newMessage]);
  };

  const getResponse = async (messageHistory: Message[]) => {
    setIsLoading(true);
    setPluginStatus(null);
    abortControllerRef.current = new AbortController();

    try {
      const lastUserMessage = messageHistory[messageHistory.length - 1].content;
      const newMessageId = generateUniqueId();
      addMessage({ id: newMessageId, role: "assistant", content: "" });

      const memoryVariables = await getMemoryVariables();
      const isPluginEnabled = plugins.some((plugin) => plugin.enabled);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messageHistory,
          systemPrompt,
          memoryVariables,
          stream: options.streaming,
          isPluginEnabled: isPluginEnabled,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let finalResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.status) {
                  setPluginStatus(data.status);
                  if (
                    data.status === "plugin_data_fetched" &&
                    data.pluginData
                  ) {
                    updateMessage(
                      newMessageId,
                      finalResponse,
                      JSON.stringify(data.pluginData)
                    );
                  }
                } else if (data.response && typeof data.response === "string") {
                  finalResponse += data.response;
                  updateMessage(newMessageId, finalResponse);
                }
              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
            }
          }
        }

        const trimmedResponse = finalResponse.trim();
        updateMessage(newMessageId, trimmedResponse);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      setPluginStatus(null);
      abortControllerRef.current = null;
    }
  };

  const handleError = (error: any) => {
    console.error("An error occurred while fetching the response:", error);
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

  const clearChat = () => {
    clearMessages();
    clearMemory();
  };

  return {
    isLoading,
    pluginStatus,
    editMessage,
    customSystem: systemPrompt,
    setCustomSystem: setSystemPrompt,
    regenerateMessage,
    handleSubmit,
    responseMetadata,
    clearChat,
    stopGenerating,
    setEditingMessageId,
    editingMessageId,
  };
};
