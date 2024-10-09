import { Message, ResponseMetadata } from "@/lib/chat-store";
import { generateUniqueId } from "@/utils/generateUUID";
import { useState } from "react";

export const useMessageHandling = (
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  toolChains: Record<string, any>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setResponseMetadata: React.Dispatch<
    React.SetStateAction<ResponseMetadata | null>
  >
) => {
  const [isPdfParsing, setIsPdfParsing] = useState(false);
  const [input, setInput] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const inputElement = target.querySelector(
      "textarea"
    ) as HTMLTextAreaElement;
    if (!inputElement) return;
    const input = inputElement.value.trim();
    if (!input) return;

    const newMessage: Message = {
      id: generateUniqueId(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, newMessage]);
    inputElement.value = ""; // Clear the input
    await getResponse([...messages, newMessage]);
  };
  const getResponse = async (messageHistory: Message[]) => {
    setIsLoading(true);
    setResponseMetadata(null);

    try {
      const lastUserMessage = messageHistory[messageHistory.length - 1].content;
      const newMessageId = generateUniqueId();

      // Use tool chains
      for (const [toolName, toolChain] of Object.entries(toolChains)) {
        const result = await toolChain.invoke(lastUserMessage);
        if (result !== "Tool not needed.") {
          setMessages((prev) => [
            ...messageHistory,
            { id: newMessageId, role: "assistant", content: result },
          ]);
          break;
        }
      }

      // If no tool was used, use the default chat model (implement this part)
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          role: "assistant",
          content: "An error occurred while fetching the response.",
        },
      ]);
    } finally {
      setIsLoading(false);
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
  const editMessage = (id: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content: newContent } : msg))
    );
  };

  const regenerateMessage = async (id: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === id);
    if (messageIndex === -1 || messages[messageIndex].role !== "assistant")
      return;

    const newMessages = messages.slice(0, messageIndex);
    setMessages(newMessages);
    await getResponse(newMessages);
  };

  return {
    handleSubmit,
    handleFileChange,
    editMessage,
    regenerateMessage,
    isPdfParsing,
    input,
    setInput,
  };
};
