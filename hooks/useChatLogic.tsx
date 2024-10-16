import { useEffect, useRef, useState } from "react";
import { Message, ResponseMetadata } from "@/lib/types";
import { generateUniqueId } from "@/utils/common";
import { useChatStore } from "@/lib/store";
import { checkEasterEggs } from "@/lib/utils";

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
    selectedModel,
    togglePlugin,
    plugins,
    clearMemory,
  } = useChatStore();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pluginStatus, setPluginStatus] = useState<string | null>(null);
  const [responseMetadata, setResponseMetadata] =
    useState<ResponseMetadata | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent, text?: string) => {
    e.preventDefault();
    const inputText = text || input;
    if (!inputText.trim()) return;
    const userMessage: Message = {
      id: generateUniqueId(),
      role: "user",
      content: inputText,
    };
    addMessage(userMessage);
    setInput("");

    const easterEgg = checkEasterEggs(inputText);
    if (easterEgg) {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const easterEggMessage: Message = {
        id: generateUniqueId(),
        role: "assistant",
        content: `![Easter Egg](${easterEgg})`,
      };
      addMessage(easterEggMessage);
      setIsLoading(false);
    } else {
      await getResponse([...messages, userMessage]);
    }
  };
  const getResponse = async (
    messageHistory: Message[],
    disableSejmStats?: boolean
  ) => {
    setIsLoading(true);
    setPluginStatus(null);
    abortControllerRef.current = new AbortController();

    try {
      const lastUserMessage = messageHistory[messageHistory.length - 1].content;
      const newMessageId = generateUniqueId();
      addMessage({ id: newMessageId, role: "assistant", content: "" });

      const memoryVariables = await getMemoryVariables();
      const isPluginEnabled = plugins.some((plugin) => plugin.enabled);
      console.log("selected model", selectedModel);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messageHistory,
          systemPrompt,
          memoryVariables,
          stream: options.streaming,
          isPluginEnabled:
            disableSejmStats !== undefined ? false : isPluginEnabled,
          modelName: selectedModel,
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

  const handleSummarize = async (pdfUrl: string) => {
    setIsLoading(true);
    setPluginStatus(null);

    try {
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error(
          `Failed to download PDF. HTTP status: ${pdfResponse.status}`
        );
      }
      const arrayBuffer = await pdfResponse.arrayBuffer();
      const formData = new FormData();
      formData.append(
        "pdf",
        new Blob([arrayBuffer], { type: "application/pdf" })
      );
      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const markdownContent = data.markdown;
      const summarizePrompt = `${markdownContent}\n\n  Write a concise summary of the text in polish, return your responses with 5 lines that cover the key points of the text.
`;
      const userMessage: Message = {
        id: generateUniqueId(),
        role: "user",
        content: summarizePrompt,
      };
      addMessage(userMessage);
      await getResponse([...messages, userMessage], true);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      setPluginStatus(null);
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
    handleSummarize,
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
