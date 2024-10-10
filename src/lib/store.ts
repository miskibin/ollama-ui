import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Message, Model } from "./types";

interface ChatState {
  messages: Message[];
  models: Model[];
  selectedModel: string;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
  setModels: (models: Model[]) => void;
  setSelectedModel: (model: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      models: [],
      selectedModel: "",
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content } : msg
          ),
        })),
      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        })),
      clearMessages: () => set({ messages: [] }),
      setModels: (models) => set({ models }),
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: "chat-storage",
    }
  )
);
