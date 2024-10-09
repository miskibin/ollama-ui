import { Message } from "@/lib/chat-store";
import { useState, useEffect } from "react";

export const useLocalStorage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const saveMessages = (messages: Message[]) => {
    if (isClient) {
      try {
        localStorage.setItem("messages", JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving messages to localStorage:", error);
      }
    }
  };

  const loadMessages = async (): Promise<Message[]> => {
    if (isClient) {
      try {
        const savedMessages = localStorage.getItem("messages");
        return savedMessages ? JSON.parse(savedMessages) : [];
      } catch (error) {
        console.error("Error loading messages from localStorage:", error);
        return [];
      }
    }
    return [];
  };

  return { saveMessages, loadMessages };
};
