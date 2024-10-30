import { useEffect, useRef, useState } from "react";
import { Artifact, Message } from "@/lib/types";
import { generateUniqueId } from "@/utils/common";
import { useChatStore } from "@/lib/store";
import { checkEasterEggs } from "@/lib/utils";
import { PROMPTS, SummarizePromptPlaceholder } from "@/lib/prompts";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "./use-toast";
import { useMessageLimits } from "@/lib/prompt-tracking";

type ProgressUpdate = {
  type: "status" | "tool_execution" | "response" | "error";
  messages: Message[];
};
const DAILY_CHAT_LIMIT = 50;

export const useChatLogic = () => {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
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
    setSelectedModel,
    plugins,
    clearMemory,
  } = useChatStore();

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { checkMessageLimits } = useMessageLimits(selectedModel);

  const handleSubmit = async (e: React.FormEvent, text?: string) => {
    e.preventDefault();
    const inputText = text || input;
    if (!inputText.trim()) return;

    const isPaidModel = !selectedModel.includes("free");
    const { canSendMessage, shouldSwitchModel, message } =
      await checkMessageLimits(isPaidModel);

    if (!canSendMessage) {
      toast({
        title: "Limit wiadomości",
        description: message,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    if (shouldSwitchModel) {
      setSelectedModel("meta-llama/Llama-Vision-Free");
      toast({
        title: "Limit wiadomości osiągnięty",
        description: message,
        duration: 5000,
      });
    }

    const userMessage: Message = {
      id: generateUniqueId(),
      role: "user",
      content: inputText,
      artifacts: [],
    };
    addMessage(userMessage);
    setInput("");

    try {
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
      } else {
        await getResponse([...messages, userMessage]);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      handleError(error);
    } finally {
      setIsLoading(false);
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
          systemPrompt: systemPrompt,
          enabledPluginIds:
            disableAllPlugins ||
            (messages[messages.length - 1]?.role === "user" &&
              messages[messages.length - 1]?.artifacts)
              ? []
              : plugins
                  .filter((plugin) => plugin.enabled)
                  .map((plugin) => plugin.name),
          modelName: selectedModel,
          options: options,
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

                // Ensure data and messages exist before processing
                if (
                  !data ||
                  !Array.isArray(data.messages) ||
                  data.messages.length === 0
                ) {
                  console.warn("Received invalid progress update:", data);
                  continue;
                }

                const firstMessage = data.messages[0];

                // Handle different types of updates
                switch (data.type) {
                  case "status":
                    if (firstMessage?.content) {
                      setStatus(firstMessage.content);
                    }
                    break;

                  case "tool_execution":
                    if (firstMessage?.content) {
                      setStatus(firstMessage.content);
                      if (firstMessage.artifacts?.length) {
                        currentArtifacts.push(...firstMessage.artifacts);
                      }
                    }
                    break;

                  case "response":
                    if (firstMessage?.content) {
                      currentContent += firstMessage.content;
                      // Update with accumulated content and artifacts
                      updateMessage(newMessageId, {
                        id: newMessageId,
                        role: "assistant",
                        content: currentContent,
                        artifacts: currentArtifacts,
                      });
                    }
                    break;

                  case "error":
                    if (firstMessage?.content) {
                      throw new Error(firstMessage.content);
                    }
                    break;

                  default:
                    console.warn("Unknown progress update type:", data.type);
                }
              } catch (error) {
                console.error("Error parsing SSE data:", error);
                if (error instanceof Error) {
                  handleError(error);
                }
              }
            }
          }
        }

        // Final update with trimmed content
        updateMessage(newMessageId, {
          id: newMessageId,
          role: "assistant",
          content: currentContent.trim(),
          artifacts: currentArtifacts,
        });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      setStatus(null);
      abortControllerRef.current = null;
    }
  };

  const handleError = (error: unknown) => {
    console.error("An error occurred:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const errorSource =
      error instanceof Error && error.stack
        ? error.stack.split("\n")[1]?.trim() || "Unknown location"
        : "Unknown location";

    if (error instanceof Error && error.name !== "AbortError") {
      toast({
        title: "Błąd podczas odpowiadania",
        description: `Location: ${errorSource}
  Error: ${error} - ${errorMessage}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  const handleSummarize = async (
    pdfUrl: string,
    context?: string,
    summary?: string
  ) => {
    setIsLoading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("url", pdfUrl);

      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Failed to process PDF. Status: ${response.status}. ${errorText}`
        );
      }

      const data = await response.json();

      const userMessage: Message = {
        id: generateUniqueId(),
        role: "user",
        content: context
          ? await PROMPTS.answerQuestion.format({
              question: context,
            })
          : SummarizePromptPlaceholder,
        artifacts: [
          {
            type: "Dokument PDF",
            question: "",
            searchQuery: "",
            data: data["markdown"],
          },
        ],
      };

      addMessage(userMessage);

      if (summary) {
        const userMessage: Message = {
          id: generateUniqueId(),
          role: "assistant",
          content: `${summary}`,
          artifacts: [],
        };
        addMessage(userMessage);
      } else {
        await getResponse([...messages, userMessage], true);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `PDF processing failed: ${error.message}`
          : "Failed to process PDF";
      handleError(new Error(errorMessage));
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
