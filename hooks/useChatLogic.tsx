import { useEffect, useRef, useState } from "react";
import { Artifact, Message } from "@/lib/types";
import { generateUniqueId } from "@/utils/common";
import { useChatStore } from "@/lib/store";
import { checkEasterEggs } from "@/lib/utils";
import { stat } from "fs";

type ProgressUpdate = {
  type: "status" | "tool_execution" | "response" | "error";
  messages: Message[];
};

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
    selectedModel,
    plugins,
    clearMemory,
  } = useChatStore();

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent, text?: string) => {
    e.preventDefault();
    const inputText = text || input;
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: generateUniqueId(),
      role: "user",
      content: inputText,
      artifacts: [],
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
        artifacts: [],
      };
      addMessage(easterEggMessage);
      setIsLoading(false);
    } else {
      await getResponse([...messages, userMessage]);
    }
  };

  const getResponse = async (
    messageHistory: Message[],
    disableAllPlugins?: boolean
  ) => {
    setIsLoading(true);
    setStatus(null);
    abortControllerRef.current = new AbortController();

    try {
      const newMessageId = generateUniqueId();
      const initialMessage: Message = {
        id: newMessageId,
        role: "assistant",
        content: "",
        artifacts: [],
      };
      addMessage(initialMessage);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messageHistory,
          systemPrompt,
          enabledPluginIds:
            disableAllPlugins ||
            (messages[messages.length - 1]?.role == "user" &&
              messages[messages.length - 1]?.artifacts)
              ? []
              : plugins
                  .filter((plugin) => plugin.enabled)
                  .map((plugin) => plugin.name),
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
        let currentContent = "";
        let currentArtifacts: Artifact[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6)) as ProgressUpdate;

                // Handle different types of updates
                switch (data.type) {
                  case "status":
                    setStatus(data.messages[0].content);
                    break;

                  case "tool_execution":
                    setStatus(data.messages[0].content);
                    if (data.messages[0].artifacts?.length) {
                      currentArtifacts.push(...data.messages[0].artifacts);
                    }
                    break;

                  case "response":
                    currentContent += data.messages[0].content;
                    // Update with accumulated content and artifacts
                    const updatedMessage: Message = {
                      id: newMessageId,
                      role: "assistant",
                      content: currentContent,
                      artifacts: currentArtifacts,
                    };
                    updateMessage(newMessageId, updatedMessage);
                    break;

                  case "error":
                    throw new Error(data.messages[0].content);
                }
              } catch (error) {
                console.error("Error parsing SSE data:", error);
              }
            }
          }
        }

        // Final update with trimmed content
        const finalMessage: Message = {
          id: newMessageId,
          role: "assistant",
          content: currentContent.trim(),
          artifacts: currentArtifacts,
        };
        updateMessage(newMessageId, finalMessage);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      setStatus(null);
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
        artifacts: [],
      });
    }
  };

  const handleSummarize = async (pdfUrl: string) => {
    setIsLoading(true);
    setStatus(null);

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
      const summarizePrompt = `Write a concise summary of the text in polish, return your responses with 5 lines that cover the key points of the text.`;

      const userMessage: Message = {
        id: generateUniqueId(),
        role: "user",
        content: summarizePrompt,
        artifacts: [
          {
            type: "Dokument PDF",
            question: "",
            searchQuery: "",
            data: data,
          },
        ],
      };

      addMessage(userMessage);
      await getResponse([...messages, userMessage], true);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      setStatus(null);
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

    const oldMessage = messages[messageIndex];
    const updatedMessage: Message = {
      ...oldMessage,
      content: newContent,
    };

    if (oldMessage.role === "user") {
      const newMessages = messages
        .slice(0, messageIndex + 1)
        .map((msg) => (msg.id === id ? updatedMessage : msg));
      clearMessages();
      for (const msg of newMessages) {
        addMessage(msg);
      }
      await getResponse(newMessages);
    } else {
      updateMessage(id, updatedMessage);
    }

    setEditingMessageId(null);
  };

  const regenerateMessage = async (id: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === id);
    if (messageIndex === -1 || messages[messageIndex].role !== "assistant")
      return;
    const previousMessages = messages.slice(0, messageIndex);
    clearMessages();
    for (const msg of previousMessages) {
      addMessage(msg);
    }
    await getResponse(previousMessages);
  };

  const clearChat = () => {
    clearMessages();
    clearMemory();
  };

  return {
    isLoading,
    status,
    handleSummarize,
    editMessage,
    customSystem: systemPrompt,
    setCustomSystem: setSystemPrompt,
    regenerateMessage,
    handleSubmit,
    clearChat,
    stopGenerating,
    setEditingMessageId,
    editingMessageId,
  };
};
